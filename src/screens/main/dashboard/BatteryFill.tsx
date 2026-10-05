import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated'
import Svg, { Path } from 'react-native-svg'

import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

const WAVE_AMPLITUDE = 5
const WAVE_PERIOD = 40
const WAVE_PERIODS = 5
const WAVE_WIDTH = WAVE_AMPLITUDE * 2
const WAVE_HEIGHT = WAVE_PERIOD * WAVE_PERIODS
const WAVE_CYCLE_MS = 2600
const FILL_OPACITY = 0.3
const FILL_TIMING = { duration: 400 } as const

/** Right edge of the fill as a vertical sine. Built once; only its translation animates. */
const WAVE_PATH = (() => {
  let d = 'M0 0'
  for (let y = 0; y <= WAVE_HEIGHT; y += 2) {
    const x = WAVE_AMPLITUDE + WAVE_AMPLITUDE * Math.sin((2 * Math.PI * y) / WAVE_PERIOD)
    d += ` L${x.toFixed(2)} ${y}`
  }
  return `${d} L0 ${WAVE_HEIGHT} Z`
})()

/**
 * Charge level filling its parent from the left. The parent must clip (`overflow: 'hidden'`).
 * While charging, the leading edge becomes a wave flowing upward.
 */
export function BatteryFill({
  percent,
  charging,
}: {
  percent: SharedValue<number | null>
  charging: boolean
}) {
  const color = charging ? theme.status.success.color : theme.ui.primary
  const waveColor = useResolvedColor(color)
  const flow = useSharedValue(0)

  useEffect(() => {
    if (!charging) return
    flow.value = 0
    flow.value = withRepeat(
      withTiming(1, { duration: WAVE_CYCLE_MS, easing: Easing.linear }),
      -1,
      false,
    )
    return () => cancelAnimation(flow)
  }, [charging, flow])

  const fraction = useDerivedValue(() =>
    withTiming(Math.min(1, Math.max(0, (percent.value ?? 0) / 100)), FILL_TIMING),
  )
  const fillStyle = useAnimatedStyle(() => ({ width: `${fraction.value * 100}%` }))
  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -flow.value * WAVE_PERIOD }],
  }))

  return (
    <View pointerEvents="none" needsOffscreenAlphaCompositing style={styles.root}>
      <Animated.View style={[styles.fill, { backgroundColor: color }, fillStyle]}>
        {charging ? (
          <Animated.View style={[styles.wave, waveStyle]}>
            <Svg width={WAVE_WIDTH} height={WAVE_HEIGHT}>
              <Path d={WAVE_PATH} fill={waveColor} />
            </Svg>
          </Animated.View>
        ) : null}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    // Solid fill + wave composited as one layer, so their 1px overlap doesn't double the alpha.
    opacity: FILL_OPACITY,
  },
  fill: {
    height: '100%',
  },
  wave: {
    position: 'absolute',
    left: '100%',
    marginLeft: -1,
    top: 0,
    width: WAVE_WIDTH,
    height: WAVE_HEIGHT,
  },
})
