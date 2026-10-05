'use no memo'

import { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated'
import {
  Canvas,
  Group,
  LinearGradient,
  Path,
  Skia,
  useClock,
  vec,
} from '@shopify/react-native-skia'

import { scheduleOnRN } from 'react-native-worklets'

import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

/** Flame size at the threshold, as a share of full size; it grows to 1 at 100% duty. */
const MIN_INTENSITY = 0.4
const INTENSITY_TIMING = { duration: 450 } as const
const GROW_TIMING = { duration: 800, easing: Easing.out(Easing.cubic) } as const
const SHRINK_TIMING = { duration: 500, easing: Easing.in(Easing.quad) } as const
/** Room around the ring for the tallest tip, as a share of the ring's size. */
export const FLAME_PAD_RATIO = 0.5
const MAX_TIP_RATIO = 0.42
/** Outline resolution: points around the whole silhouette. */
const POINTS = 160
const TWO_PI = Math.PI * 2
const FLICKER_SPEED = 0.0045
/** Sideways lean of a tip, as a share of its height. */
const LEAN_RATIO = 0.22

/**
 * Tongues of one flame, as angular offsets from straight up (radians). Each rises vertically from
 * the ring. The main tip is tall and slightly off-centre; shorter licks step down beside it.
 */
const TONGUES = [
  { offset: -0.12, width: 0.55, height: 1, phase: 0 },
  { offset: 0.72, width: 0.5, height: 0.64, phase: 4.1 },
  { offset: -0.88, width: 0.45, height: 0.42, phase: 1.9 },
  { offset: 1.22, width: 0.4, height: 0.3, phase: 5.2 },
  { offset: -1.3, width: 0.4, height: 0.24, phase: 3.3 },
] as const

/** Layers back to front: how tall each is relative to the one behind, and how far it sits in. */
const LAYERS = [
  { heightScale: 1, inset: 0.3, timeShift: 0 },
  { heightScale: 0.72, inset: 0.1, timeShift: 700 },
  { heightScale: 0.44, inset: -0.15, timeShift: 1500 },
] as const

/**
 * Silhouette of one flame layer: a disc covering the ring and its readout, with tongues rising
 * straight up from its top. Tongues lean and flicker over time; only the tallest one counts at
 * each angle, so they stay distinct with valleys between them.
 */
function flamePath(
  size: number,
  pad: number,
  outerStroke: number,
  layer: (typeof LAYERS)[number],
  intensity: number,
  timeMs: number,
) {
  'worklet'
  const path = Skia.Path.Make()
  const center = pad + size / 2
  const t = (timeMs + layer.timeShift) * FLICKER_SPEED
  const baseRadius = size / 2 + outerStroke * layer.inset + size * 0.025 * intensity
  const tip = size * MAX_TIP_RATIO * intensity * layer.heightScale
  const up = -Math.PI / 2

  // Per-tongue flicker and lean, resolved once per frame.
  const heights: number[] = []
  const centers: number[] = []
  for (const tongue of TONGUES) {
    const flicker =
      0.78 + 0.22 * Math.sin(t * 2.1 + tongue.phase) * Math.sin(t * 1.3 + 2 * tongue.phase)
    heights.push(tongue.height * flicker)
    centers.push(up + tongue.offset + 0.12 * Math.sin(t * 1.6 + tongue.phase))
  }

  for (let i = 0; i <= POINTS; i++) {
    const angle = (i / POINTS) * TWO_PI
    let lift = 0
    let lean = 0
    for (let k = 0; k < TONGUES.length; k++) {
      let diff = Math.abs(angle - centers[k]) % TWO_PI
      if (diff > Math.PI) diff = TWO_PI - diff
      const falloff = 1 - diff / TONGUES[k].width
      if (falloff <= 0) continue
      const height = heights[k] * Math.pow(falloff, 1.8)
      if (height > lift) {
        lift = height
        lean = Math.sin(t * 1.4 + TONGUES[k].phase) + (centers[k] - up) * 0.6
      }
    }
    const wobble = 1 + 0.012 * Math.sin(angle * 7 + t * 3)
    const x = center + Math.cos(angle) * baseRadius * wobble + lean * LEAN_RATIO * tip * lift
    const y = center + Math.sin(angle) * baseRadius * wobble - tip * lift
    if (i === 0) path.moveTo(x, y)
    else path.lineTo(x, y)
  }
  path.close()
  return path
}

/**
 * One big flame burning behind the ring. Draws on its own canvas padded beyond the ring, so the
 * parent must not clip. Mount it only while it is needed: it repaints every frame.
 */
export function SpeedRingFlames({
  size,
  outerStroke,
  dutyPercent,
  thresholdPercent,
  active,
  onExited,
}: {
  size: number
  outerStroke: number
  dutyPercent: SharedValue<number | null>
  /** Duty at which the flame starts; it reaches full size at 100%. */
  thresholdPercent: SharedValue<number>
  /** Grows the flame while true; shrinks it while false and calls `onExited` once it is gone. */
  active: boolean
  onExited: () => void
}) {
  const red = useResolvedColor(theme.palette.red.color)
  const orange = useResolvedColor(theme.palette.orange.color)
  const amber = useResolvedColor(theme.palette.amber.color)
  const clock = useClock()
  const pad = Math.round(size * FLAME_PAD_RATIO)
  const extent = size + pad * 2

  // 0 → 1 as the fire catches, back to 0 as it dies out; it scales the flame from the ring outwards.
  const presence = useSharedValue(0)
  useEffect(() => {
    presence.set(
      active
        ? withTiming(1, GROW_TIMING)
        : withTiming(0, SHRINK_TIMING, (finished) => {
            if (finished) scheduleOnRN(onExited)
          }),
    )
  }, [active, onExited, presence])

  const level = useDerivedValue(() => {
    const duty = dutyPercent.value ?? 0
    const target =
      MIN_INTENSITY +
      (1 - MIN_INTENSITY) *
        Math.min(
          1,
          Math.max(0, (duty - thresholdPercent.value) / Math.max(1, 100 - thresholdPercent.value)),
        )
    return withTiming(target, INTENSITY_TIMING)
  })
  const intensity = useDerivedValue(() => level.value * presence.value)
  const opacity = useDerivedValue(() => Math.min(1, presence.value * 2))
  const backPath = useDerivedValue(() =>
    flamePath(size, pad, outerStroke, LAYERS[0], intensity.value, clock.value),
  )
  const midPath = useDerivedValue(() =>
    flamePath(size, pad, outerStroke, LAYERS[1], intensity.value, clock.value),
  )
  const frontPath = useDerivedValue(() =>
    flamePath(size, pad, outerStroke, LAYERS[2], intensity.value, clock.value),
  )

  // Hot at the base, cooling to red at the tip. Fixed to the canvas, so the shaders are built once.
  const top = vec(0, pad - size * MAX_TIP_RATIO)
  const bottom = vec(0, pad + size)

  return (
    <Canvas
      pointerEvents="none"
      style={[styles.canvas, { top: -pad, left: -pad, width: extent, height: extent }]}
    >
      <Group opacity={opacity}>
        <Path path={backPath}>
          <LinearGradient start={top} end={bottom} colors={[red, orange]} />
        </Path>
        <Path path={midPath}>
          <LinearGradient start={top} end={bottom} colors={[orange, amber]} />
        </Path>
        <Path path={frontPath}>
          <LinearGradient start={top} end={bottom} colors={[amber, orange]} />
        </Path>
      </Group>
    </Canvas>
  )
}

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
  },
})
