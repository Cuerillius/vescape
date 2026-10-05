import { useMemo } from 'react'
import { View } from 'react-native'
import { useDerivedValue, useSharedValue, type SharedValue } from 'react-native-reanimated'
import { Canvas, Rect, RoundedRect, Text as SkiaText } from '@shopify/react-native-skia'

import { theme } from '@/constants/theme'
import { textAdvanceWidth } from '@/helpers/skiaText'
import { useSkiaMonoFont } from '@/hooks/useSkiaFont'
import { useResolvedColor } from '@/hooks/useTheme'
import { useUnitSystem } from '@/hooks/useUnitSystem'
import {
  presentTelemetryMetric,
  type TelemetryMetricConfig,
} from '@/modules/board/constants/telemetry'

/** How far a metric may go before the board or the controller pushes back. */
export interface MetricHeroLimit {
  /** Magnitude limit in the metric's canonical unit. */
  max: number
  /** Limit on the negative side (braking, regen), when it differs from `max`. Signed, e.g. -40. */
  min?: number
  /**
   * Full-scale of the bar. Omit to make the bar end at the limit; set it (duty: 100) when the
   * limit sits inside the scale and should be drawn as a tick.
   */
  barMax?: number
  /** Right-hand caption under the bar — "Pushback at 90%". */
  label: string
}

interface MetricHeroProps {
  metric: TelemetryMetricConfig
  value: SharedValue<number | null>
  /** Show magnitude only — speed has no direction worth reading. */
  absolute?: boolean
  limit?: MetricHeroLimit | null
}

const VALUE_SIZE = 56
const UNIT_SIZE = 20
const CAPTION_SIZE = 13
const VALUE_ROW = 64
const BAR_Y = 78
const BAR_HEIGHT = 4
const CAPTION_Y = 92
const CAPTION_ROW = 18
const NEAR_LIMIT = 0.8

/**
 * The live value of a metric, large (the screen's header already names it), with how much room is left before its limit. One canvas for
 * the number, the bar and both captions, so a tick repaints one surface and nothing re-renders.
 */
export function MetricHero({ metric, value, absolute = false, limit = null }: MetricHeroProps) {
  const units = useUnitSystem()
  const {
    unit,
    displayScale: scale,
    decimals,
  } = useMemo(() => presentTelemetryMetric(metric, units), [metric, units])
  const valueFont = useSkiaMonoFont('600', VALUE_SIZE)
  const unitFont = useSkiaMonoFont('600', UNIT_SIZE)
  const captionFont = useSkiaMonoFont('500', CAPTION_SIZE)

  const foreground = useResolvedColor(theme.ui.foreground)
  const muted = useResolvedColor(theme.ui.mutedForeground)
  const track = useResolvedColor(theme.ui.muted)
  const metricColor = useResolvedColor(metric.color)
  const warningColor = useResolvedColor(theme.status.warning.color)
  const errorColor = useResolvedColor(theme.status.error.color)

  const height = limit ? CAPTION_Y + CAPTION_ROW : VALUE_ROW
  const size = useSharedValue({ width: 0, height })
  const width = useDerivedValue(() => size.value.width)

  const max = limit?.max ?? 0
  const minLimit = limit?.min ?? null
  const barMax = limit?.barMax ?? null
  const unitGap = unit === '%' || unit === '°' || unit === '°C' ? 2 : 6
  const headroomSeparator = unit === '%' ? '' : ' '

  const valueText = useDerivedValue(() => {
    const v = value.value ?? 0
    const shown = (absolute ? Math.abs(v) : v) * scale
    // A tiny negative rounds to "-0", which reads as a sign flip that never happened.
    return shown.toFixed(decimals).replace(/^-(0(\.0*)?)$/, '$1')
  })
  const unitX = useDerivedValue(() =>
    valueFont ? textAdvanceWidth(valueFont, valueText.value) + unitGap : 0,
  )

  // Share of the limit in use, on whichever side of zero the value sits.
  const usage = useDerivedValue(() => {
    const v = value.value
    if (v == null || max <= 0) return 0
    const side = v < 0 && minLimit != null ? Math.abs(minLimit) : max
    return Math.abs(v) / side
  })
  const fillFraction = useDerivedValue(() => {
    const v = value.value
    if (v == null) return 0
    const fraction = barMax != null ? Math.abs(v) / barMax : usage.value
    return Math.min(1, fraction)
  })
  const fillWidth = useDerivedValue(() => width.value * fillFraction.value)
  const fillColor = useDerivedValue(() =>
    usage.value >= 1 ? errorColor : usage.value >= NEAR_LIMIT ? warningColor : metricColor,
  )
  const tickX = useDerivedValue(() => (barMax != null ? width.value * (max / barMax) - 1 : 0))
  const headroom = useDerivedValue(() => {
    const v = value.value
    if (v == null || max <= 0) return ''
    const side = v < 0 && minLimit != null ? Math.abs(minLimit) : max
    const left = (side - Math.abs(v)) * scale
    if (left <= 0) return 'At limit'
    return `Headroom ${left.toFixed(decimals)}${headroomSeparator}${unit}`
  })
  const limitX = useDerivedValue(() =>
    captionFont && limit ? width.value - textAdvanceWidth(captionFont, limit.label) : 0,
  )

  if (!valueFont || !unitFont || !captionFont) return <View style={{ height }} />

  return (
    <Canvas style={{ height }} onSize={size} pointerEvents="none">
      <SkiaText x={0} y={VALUE_ROW - 12} text={valueText} font={valueFont} color={foreground} />
      {metric.unit ? (
        <SkiaText x={unitX} y={VALUE_ROW - 12} text={unit} font={unitFont} color={muted} />
      ) : null}
      {limit ? (
        <>
          <RoundedRect
            x={0}
            y={BAR_Y}
            width={width}
            height={BAR_HEIGHT}
            r={BAR_HEIGHT / 2}
            color={track}
          />
          <RoundedRect
            x={0}
            y={BAR_Y}
            width={fillWidth}
            height={BAR_HEIGHT}
            r={BAR_HEIGHT / 2}
            color={fillColor}
          />
          {barMax != null ? (
            <Rect x={tickX} y={BAR_Y - 4} width={2} height={BAR_HEIGHT + 8} color={foreground} />
          ) : null}
          <SkiaText x={0} y={CAPTION_Y + 13} text={headroom} font={captionFont} color={muted} />
          <SkiaText
            x={limitX}
            y={CAPTION_Y + 13}
            text={limit.label}
            font={captionFont}
            color={muted}
          />
        </>
      ) : null}
    </Canvas>
  )
}
