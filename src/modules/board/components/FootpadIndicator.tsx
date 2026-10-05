import { useMemo } from 'react'
import { View, type ViewStyle } from 'react-native'
import { Canvas, Group, Path, Skia, type SkPath } from '@shopify/react-native-skia'
import { useDerivedValue, type SharedValue } from 'react-native-reanimated'

import { MonoText } from '@/components/base/MonoValue'
import { theme } from '@/constants/theme'
import { useResolvedUiColors } from '@/hooks/useTheme'
import { FOOTPAD_FALLBACK_THRESHOLD_V } from '@/modules/board/store/boardConfigValuesStore'

/** Outline stroke of each zone, in points: the line weight of the IMU icons beside it. */
const OUTLINE_WIDTH = 2.6
/** How far the pad dims while the board isn't sending, matching the IMU board. */
const IDLE_OPACITY = 0.35

const VALUE_COLOR = theme.ui.faintForeground
const VALUE_SIZE = 13
/** Gutter as a multiple of the glyph size — `0.00V` plus a little air on each side. */
const VALUE_GUTTER_CHARS = 3.6
const VALUE_PAD = 8

/** A real Onewheel pad is 25cm × 22cm; the drawing keeps that ratio so it reads as the same object. */
const FOOTPAD_ASPECT = 22 / 25
/** Share of the pad's width the outer top corner rounds over: the generous curve of the tune preview's board. */
const CORNER_RATIO = 0.3
/** The outer bottom corner and the seam's corners round far less, like the board's blunt deck ends. */
const BASE_CORNER_RATIO = 0.08
const SEAM_CORNER_RATIO = 0.04
/** The seam between the two zones, as a share of the pad's width. */
const SEAM_RATIO = 0.08
/** Control-point reach of a cubic that draws a quarter circle. */
const ARC_KAPPA = 0.5523

interface FootpadGeometry {
  left: SkPath
  right: SkPath
  /** Posi's single zone: the pad without a seam. */
  merged: SkPath
  width: number
  height: number
}

/**
 * One zone as a solid shape, drawn like the silhouette in the tune preview: a filled board with a
 * wide round outer shoulder and blunt corners everywhere else. `side` is the pad edge it sits on.
 */
function buildZone(width: number, height: number, side: -1 | 1): SkPath {
  const cx = width / 2
  const outer = side < 0 ? 0 : width
  const inner = cx + side * ((width * SEAM_RATIO) / 2)
  const shoulder = width * CORNER_RATIO
  const base = width * BASE_CORNER_RATIO
  const seam = width * SEAM_CORNER_RATIO
  const k = 1 - ARC_KAPPA
  // From the outer edge the zone runs toward the seam; from the seam it runs back out, toward `side`.
  const toSeam = -side
  const path = Skia.Path.Make()
  path.moveTo(outer, height - base)
  path.lineTo(outer, shoulder)
  path.cubicTo(outer, shoulder * k, outer + toSeam * shoulder * k, 0, outer + toSeam * shoulder, 0)
  path.lineTo(inner + side * seam, 0)
  path.cubicTo(inner + side * seam * k, 0, inner, seam * k, inner, seam)
  path.lineTo(inner, height - seam)
  path.cubicTo(
    inner,
    height - seam * k,
    inner + side * seam * k,
    height,
    inner + side * seam,
    height,
  )
  path.lineTo(outer + toSeam * base, height)
  path.cubicTo(outer + toSeam * base * k, height, outer, height - base * k, outer, height - base)
  path.close()
  return path
}

/** The whole pad as one zone, for Posi: both round shoulders, no seam. */
function buildMergedZone(width: number, height: number): SkPath {
  const shoulder = width * CORNER_RATIO
  const base = width * BASE_CORNER_RATIO
  const k = 1 - ARC_KAPPA
  const path = Skia.Path.Make()
  path.moveTo(0, height - base)
  path.lineTo(0, shoulder)
  path.cubicTo(0, shoulder * k, shoulder * k, 0, shoulder, 0)
  path.lineTo(width - shoulder, 0)
  path.cubicTo(width - shoulder * k, 0, width, shoulder * k, width, shoulder)
  path.lineTo(width, height - base)
  path.cubicTo(width, height - base * k, width - base * k, height, width - base, height)
  path.lineTo(base, height)
  path.cubicTo(base * k, height, 0, height - base * k, 0, height - base)
  path.close()
  return path
}

/** Built inside the canvas, inset by half the outline so the stroke is never cut at the edge. */
function buildGeometry(canvasWidth: number): FootpadGeometry {
  const width = canvasWidth - OUTLINE_WIDTH
  const height = width * FOOTPAD_ASPECT
  const left = buildZone(width, height, -1)
  const right = buildZone(width, height, 1)
  return { left, right, merged: buildMergedZone(width, height), width, height }
}

interface ZoneDrive {
  /** Share of the zone filled, `0…1`, rising from the bottom. Reaching `1` is exactly the zone engaging. */
  level: SharedValue<number>
  disabled: boolean
}

/**
 * Drive one zone's zone from its live ADC reading against its own configured engagement voltage.
 * The zones can be configured differently, so neither may borrow the other's number.
 *
 * The threshold is a plain number captured into the worklets. These run on the UI thread on every
 * telemetry frame (~31Hz); reading a store inside them would put a subscription in the hot path.
 */
function useZoneDrive(value: SharedValue<number | null>, threshold: number | null): ZoneDrive {
  'use no memo'
  // No config yet (first connection, read not landed, no cache) falls back silently — the gap is
  // seconds, and a loading state on an indicator this small would be worse than a slightly wrong
  // scale.
  const engageAt = threshold ?? FOOTPAD_FALLBACK_THRESHOLD_V
  // `fault_adc = 0` disables that zone's switch outright: it can never engage, so the zone stays
  // empty for the whole session. The `footpad-disabled` Board Warning carries the explanation.
  const disabled = engageAt <= 0
  const level = useDerivedValue(() => {
    if (disabled) return 0
    const adc = value.value
    if (adc == null || adc <= 0) return 0
    return Math.min(1, adc / engageAt)
  })
  return { level, disabled }
}

/** One zone's live voltage as text, off the UI thread — a dash until the board is sending. */
function useVoltsText(value: SharedValue<number | null>) {
  'use no memo'
  return useDerivedValue(() => {
    const adc = value.value
    return adc == null ? '—' : `${adc.toFixed(2)}V`
  })
}

interface FootpadZoneProps {
  path: SkPath
  geometry: FootpadGeometry
  drive: ZoneDrive
  fillColor: string
}

function FootpadZone({ path, geometry, drive, fillColor }: FootpadZoneProps) {
  const outline = useResolvedUiColors().foreground
  // The fill is a clip over the zone's own shape, growing up from the bottom edge.
  const fillClip = useDerivedValue(() => {
    const filled = geometry.height * drive.level.value
    return Skia.XYWHRect(0, geometry.height - filled, geometry.width, filled)
  })
  return (
    <>
      {/* The clip is geometry per frame, which the canvas rules normally forbid, but it is one
          rectangle, and no transform can reveal a shape without squashing it. */}
      <Group clip={fillClip}>
        <Path path={path} color={fillColor} />
      </Group>
      {/* The white outline is the board icon's look: a light line round the shape. */}
      <Path
        path={path}
        style="stroke"
        strokeWidth={OUTLINE_WIDTH}
        color={outline}
        opacity={drive.disabled ? 0.4 : 1}
      />
    </>
  )
}

export interface FootpadIndicatorProps {
  /** Live ADC volts for each sensor zone, straight off the telemetry tick. */
  adc1: SharedValue<number | null>
  adc2: SharedValue<number | null>
  /** `fault_adc1` / `fault_adc2` in volts; `null` when no board config is available, `0` disabled. */
  threshold1: number | null
  threshold2: number | null
  /** Pad width in points; height follows the footpad's own proportions. */
  width?: number
  /** Draw each zone's live voltage beside its zone. Only legible at detail size. */
  showValues?: boolean
  /**
   * `fault_is_dual_switch` — Refloat's "Treat Both Sensors as One (Posi)". The firmware reads the
   * two sensors as one zone, so either one engaging engages the pad. The pad is drawn as one zone
   * without a seam, filled to the higher of the two readings.
   * Per-sensor voltages stay beside it, because the sensors still read differently.
   */
  posi?: boolean
  style?: ViewStyle
  testID?: string
}

/**
 * The footpad as a footpad, drawn as outlined shapes like the board icon, empty until a zone is loaded:
 * one Onewheel-shaped pad of two zones, each filling from the bottom with its ADC reading and full
 * exactly when that zone engages.
 *
 * It replaces two dots, which suggested two independent switches placed side by side. There is one
 * pad, read by two sensors under its edges, and a rider standing badly loads one edge — the shape
 * has to show that.
 */
export function FootpadIndicator({
  adc1,
  adc2,
  threshold1,
  threshold2,
  width = 26,
  showValues = false,
  posi = false,
  style,
  testID,
}: FootpadIndicatorProps) {
  'use no memo'
  const fillColor = useResolvedUiColors().foreground
  const geometry = useMemo(() => buildGeometry(width), [width])
  // Dim the whole pad, like the IMU board, until the board is sending.
  const idleOpacity = useDerivedValue(() =>
    adc1.value == null && adc2.value == null ? IDLE_OPACITY : 1,
  )
  // Zone 2 sits under the left edge of the pad and zone 1 under the right, the opposite of reading
  // order. The pad is drawn the way the rider looks down at it, so the zones follow the hardware.
  const left = useZoneDrive(adc2, threshold2)
  const right = useZoneDrive(adc1, threshold1)
  const merged: ZoneDrive = {
    level: useDerivedValue(() => Math.max(left.level.value, right.level.value)),
    disabled: left.disabled && right.disabled,
  }
  const gutter = showValues ? VALUE_SIZE * VALUE_GUTTER_CHARS : 0
  const leftText = useVoltsText(adc2)
  const rightText = useVoltsText(adc1)

  return (
    <View style={style} testID={testID}>
      <Canvas
        style={{
          width: geometry.width + OUTLINE_WIDTH + gutter * 2,
          height: geometry.height + OUTLINE_WIDTH,
        }}
      >
        {/* Clip nested inside the transform, never on it: a clip on a transformed node is evaluated
            in the transformed space. */}
        <Group
          opacity={idleOpacity}
          transform={[
            { translateX: gutter + OUTLINE_WIDTH / 2 },
            { translateY: OUTLINE_WIDTH / 2 },
          ]}
        >
          {posi ? (
            <FootpadZone
              path={geometry.merged}
              geometry={geometry}
              drive={merged}
              fillColor={fillColor}
            />
          ) : (
            <>
              <FootpadZone
                path={geometry.left}
                geometry={geometry}
                drive={left}
                fillColor={fillColor}
              />
              <FootpadZone
                path={geometry.right}
                geometry={geometry}
                drive={right}
                fillColor={fillColor}
              />
            </>
          )}
        </Group>
        {showValues ? (
          <>
            <MonoText
              text={leftText}
              size={VALUE_SIZE}
              color={VALUE_COLOR}
              align="right"
              x={0}
              width={gutter - VALUE_PAD}
              height={geometry.height}
            />
            <MonoText
              text={rightText}
              size={VALUE_SIZE}
              color={VALUE_COLOR}
              x={gutter + geometry.width + OUTLINE_WIDTH + VALUE_PAD}
              width={gutter}
              height={geometry.height}
            />
          </>
        ) : null}
      </Canvas>
    </View>
  )
}
