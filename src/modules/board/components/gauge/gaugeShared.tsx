import { useMemo } from 'react'
import { interpolateColor, type DerivedValue, type SharedValue } from 'react-native-reanimated'
import {
  Group,
  Path,
  RadialGradient,
  Skia,
  StrokeCap,
  Text as SkiaText,
  vec,
  type SkFont,
} from '@shopify/react-native-skia'

import { MonoText, TEXT_LINE_RATIO } from '@/components/base/MonoValue'
import { alertBandFractions, type DualGaugeAlert } from '@/components/charts/gaugeAlert'
import { theme, type AlphaLevel } from '@/constants/theme'
import { useResolvedAccentColors, useResolvedUiColors } from '@/hooks/useTheme'
import { useSkiaFont } from '@/hooks/useSkiaFont'
import type { MetricHotRange } from '@/modules/history/lib/metricColorScale'
import {
  arcPath,
  arcSegmentPath,
  clamp01,
  normalizeFraction,
  polar,
  radialTickPath,
  rangeWedgePath,
  STROKE,
  type Arc,
} from '@/modules/board/components/gauge/arcGeometry'
import { textAdvanceWidth } from '../../../../helpers/skiaText'

/** Ramp the gauge color toward the hot color across the metric's hot range. */
export function gaugeRampColor(
  current: number | null,
  baseColor: string,
  hotRange: MetricHotRange | null | undefined,
  hotColor: string,
) {
  'worklet'
  if (current == null || hotRange == null) return baseColor
  const start = Math.min(hotRange.start, hotRange.end)
  const end = Math.max(hotRange.start, hotRange.end)
  const span = end - start
  const fraction = span <= 0 ? 0 : clamp01((current - start) / span)
  return interpolateColor(fraction, [0, 1], [baseColor, hotColor])
}

// ── Gradients ────────────────────────────────────────────────────────────────

const ALERT_STOPS = [0, 0.82, 0.965, 0.99, 1]
const ALERT_OPACITIES: AlphaLevel[] = [0, 0, 0.12, 0.12, 0]

// ── Alert markers ────────────────────────────────────────────────────────────

const TICK_LENGHT = 2
const TICK_WIDTH = 0.35

function AlertTick({
  arc,
  fraction,
  stroke,
  tickWidth,
  crossesArc,
  color,
}: {
  arc: Arc
  fraction: number
  stroke: number
  tickWidth: number
  crossesArc: boolean
  color: string
}) {
  const path = useMemo(
    () =>
      radialTickPath(
        arc,
        fraction,
        stroke / 2 + TICK_LENGHT - 0.5,
        crossesArc ? stroke / 2 : -stroke / 2,
      ),
    [arc, fraction, stroke, crossesArc],
  )
  return <Path path={path} color={color} style="stroke" strokeWidth={tickWidth} strokeCap="butt" />
}

// Numeric marker labels sit just inside the arc, centered on the tick.
const LABEL_INSET = 9
export const LABEL_FONT_SIZE = 6

function AlertLabel({
  arc,
  fraction,
  text,
  font,
  inset,
  fontSize,
  color,
}: {
  arc: Arc
  fraction: number
  text: string
  font: SkFont
  inset: number
  fontSize: number
  color: string
}) {
  const p = polar(arc, arc.r - inset, fraction)
  const width = textAdvanceWidth(font, text)
  // Anchored by side, not centred: a wide label centred on a point near the arc's end would run
  // back over the tick and the arc. cos is 1 at the right end (text ends at the point) and -1 at
  // the left end (text starts at it).
  const angle = arc.from + (arc.to - arc.from) * fraction
  return (
    <SkiaText
      x={p.x - (width * (1 + Math.cos(angle))) / 2}
      y={p.y + fontSize / 2}
      text={text}
      font={font}
      color={color}
    />
  )
}

interface AlertMarkerProps {
  arc: Arc
  alert: DualGaugeAlert
  min?: number
  max: number
  /** Null on gauges too small to carry readable numeric labels. */
  labelFont?: SkFont | null
  /** Arc stroke the markers sit against; defaults to the thin shared gauge stroke. */
  stroke?: number
  tickWidth?: number
  /** Markers sit on a thick arc: ticks cross its stroke and bands tint it, with no glow. */
  onArc?: boolean
  /** Distance of the numeric labels inside the arc's centre line. */
  labelInset?: number
  labelFontSize?: number
  /** Marker colour; defaults to the yellow accent. */
  color?: string
}

export function AlertMarker({
  arc,
  alert,
  min = 0,
  max,
  labelFont = null,
  stroke = STROKE,
  tickWidth = TICK_WIDTH,
  onArc = false,
  labelInset = LABEL_INSET,
  labelFontSize = LABEL_FONT_SIZE,
  color,
}: AlertMarkerProps) {
  const accents = useResolvedAccentColors()
  const markerColor = color ?? accents.yellow.color
  const thresholdFraction = normalizeFraction(alert.threshold, min, max)
  const maxFraction =
    alert.thresholdMax == null ? null : normalizeFraction(alert.thresholdMax, min, max)
  // The band runs to the end of the scale, not to `thresholdMax`: a range rule sustains its tone
  // above the max and a repeating rule never stops, so the arc past it is anything but quiet.
  const bandPath = useMemo(() => {
    const band = alertBandFractions(alert, (value) => normalizeFraction(value, min, max))
    if (!band) return null
    const d = onArc
      ? arcSegmentPath(
          arc,
          band.from,
          band.to,
          band.to >= 1 ? stroke / 2 / arc.r / Math.abs(arc.to - arc.from) : 0,
        )
      : rangeWedgePath(arc, band.from, band.to, stroke)
    return d ? Skia.Path.MakeFromSVGString(d) : null
  }, [arc, alert, min, max, stroke, onArc])

  // The band is cut to the track's own rounded outline, so it never squares off the track's ends.
  const trackOutline = useMemo(
    () =>
      onArc
        ? (Skia.Path.MakeFromSVGString(arcPath(arc, 1))?.stroke({
            width: stroke,
            cap: StrokeCap.Round,
          }) ?? null)
        : null,
    [arc, stroke, onArc],
  )

  return (
    <>
      {bandPath && trackOutline ? (
        <Group clip={trackOutline}>
          <Path
            path={bandPath}
            color={theme.alpha(markerColor, 0.4)}
            style="stroke"
            strokeWidth={stroke}
            strokeCap="butt"
          />
        </Group>
      ) : null}
      {bandPath && !onArc ? (
        <Path path={bandPath}>
          <RadialGradient
            c={vec(arc.cx, arc.cy)}
            r={arc.r}
            colors={ALERT_OPACITIES.map((o) => theme.alpha(markerColor, o))}
            positions={ALERT_STOPS}
          />
        </Path>
      ) : null}
      <AlertTick
        arc={arc}
        fraction={thresholdFraction}
        stroke={stroke}
        tickWidth={tickWidth}
        crossesArc={onArc}
        color={markerColor}
      />
      {maxFraction != null ? (
        <AlertTick
          arc={arc}
          fraction={maxFraction}
          stroke={stroke}
          tickWidth={tickWidth}
          crossesArc={onArc}
          color={markerColor}
        />
      ) : null}
      {labelFont && alert.label ? (
        <AlertLabel
          arc={arc}
          fraction={thresholdFraction}
          text={alert.label}
          font={labelFont}
          inset={labelInset}
          fontSize={labelFontSize}
          color={markerColor}
        />
      ) : null}
      {labelFont && alert.labelMax && maxFraction != null ? (
        <AlertLabel
          arc={arc}
          fraction={maxFraction}
          text={alert.labelMax}
          font={labelFont}
          inset={labelInset}
          fontSize={labelFontSize}
          color={markerColor}
        />
      ) : null}
    </>
  )
}

// ── Numeric readout ──────────────────────────────────────────────────────────

/** Gap between the value line and the unit caption under it. */
const UNIT_GAP = 2

export interface GaugeReadoutBox {
  x: number
  y: number
  width: number
  height: number
}

interface GaugeReadoutProps {
  text: DerivedValue<string>
  color: SharedValue<string> | string
  unit: string
  /** Bowl the value + unit stack is centered in, in canvas pixels. */
  box: GaugeReadoutBox
  valueSize: number
  valueLineHeight: number
  unitSize: number
}

/**
 * Value + unit drawn inside the gauge's own canvas. Both used to be RN views
 * layered over the arc, which cost a second native surface per gauge.
 */
export function GaugeReadout({
  text,
  color,
  unit,
  box,
  valueSize,
  valueLineHeight,
  unitSize,
}: GaugeReadoutProps) {
  const ui = useResolvedUiColors()
  const unitFont = useSkiaFont('500', unitSize)
  const unitLineHeight = Math.ceil(unitSize * TEXT_LINE_RATIO)
  const top = box.y + (box.height - (valueLineHeight + UNIT_GAP + unitLineHeight)) / 2

  const unitOrigin = useMemo(() => {
    if (!unitFont) return null
    const { ascent, descent } = unitFont.getMetrics()
    return {
      x: box.x + (box.width - textAdvanceWidth(unitFont, unit)) / 2,
      y: top + valueLineHeight + UNIT_GAP + unitLineHeight / 2 - (ascent + descent) / 2,
    }
  }, [unitFont, unit, box.x, box.width, top, valueLineHeight, unitLineHeight])

  return (
    <>
      <MonoText
        text={text}
        size={valueSize}
        color={color}
        align="center"
        x={box.x}
        y={top}
        width={box.width}
        height={valueLineHeight}
      />
      {unitOrigin && unitFont ? (
        <SkiaText
          x={unitOrigin.x}
          y={unitOrigin.y}
          text={unit}
          font={unitFont}
          color={ui.mutedForeground}
        />
      ) : null}
    </>
  )
}
