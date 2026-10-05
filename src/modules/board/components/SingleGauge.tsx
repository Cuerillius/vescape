import type { ReactNode } from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { useDerivedValue, type SharedValue } from 'react-native-reanimated'
import { Canvas, Group, Path } from '@shopify/react-native-skia'

import { Text } from '@/components/base/Text'
import type { DualGaugeAlert } from '@/components/charts/gaugeAlert'
import { theme } from '@/constants/theme'
import { useSkiaMonoFont } from '@/hooks/useSkiaFont'
import { useResolvedColor } from '@/hooks/useTheme'
import type { MetricHotRange } from '@/modules/history/lib/metricColorScale'
import {
  arcPath,
  normalizeFraction,
  svgPath,
  type Arc,
} from '@/modules/board/components/gauge/arcGeometry'
import {
  AlertMarker,
  gaugeRampColor,
  GaugeReadout,
} from '@/modules/board/components/gauge/gaugeShared'
import { useCanvasSize } from '@/hooks/useCanvasSize'
import { DASH } from '@/helpers/format'

interface SingleGaugeProps {
  value: SharedValue<number | null>
  min?: number
  max: number
  unit: string
  decimals?: number
  /** Numeric readout only; arc, color ramp, markers and max stay canonical. */
  displayScale?: number
  label?: string
  /** Optional action aligned with the gauge label in the chart's top-right corner. */
  headerRight?: ReactNode
  alerts?: DualGaugeAlert[]
  hotRange?: MetricHotRange | null
  containerStyle?: StyleProp<ViewStyle>
}

// Half-arc geometry: sweeps π (f=0) → 0 (f=1) around a center near the bottom.
const HALF_ARC: Arc = { cx: 100, cy: 100, r: 88, from: Math.PI, to: 0 }
const HALF_VB_W = 200
const HALF_VB_H = 112
// A thick track with a round-capped fill, like the dashboard's speed ring: the arc is the
// reading, so there is no glow or needle on top of it.
const ARC_STROKE = 9
const TICK_WIDTH = 1.4
const MARKER_LABEL_FONT_SIZE = 8
const MARKER_LABEL_INSET = ARC_STROKE / 2 + 7

const BG_ARC = svgPath(arcPath(HALF_ARC, 1))

// Readout box: explicit line height keeps the drawn value at the vertical
// footprint the readout view used to reserve.
const HALF_VALUE_FONT_SIZE = 52
const HALF_VALUE_LINE_HEIGHT = 58
const HALF_UNIT_FONT_SIZE = 12

function HalfArc({
  value,
  min,
  max,
  unit,
  decimals = 0,
  displayScale = 1,
  alerts = [],
  hotRange,
}: Required<Pick<SingleGaugeProps, 'value' | 'min' | 'max' | 'unit'>> &
  Pick<SingleGaugeProps, 'decimals' | 'displayScale' | 'alerts' | 'hotRange'>) {
  'use no memo'
  const hotColor = useResolvedColor(theme.status.error.color)
  const trackColor = useResolvedColor(theme.ui.muted)
  const fillColor = useResolvedColor(theme.ui.foreground)
  const markerColor = useResolvedColor(theme.status.warning.color)
  const { size, onLayout } = useCanvasSize()
  const scale = size.w > 0 ? size.w / HALF_VB_W : 0
  // Tabular digits: the label is tiny in canvas units and scaled up, and a proportional font's
  // rounded advances spaced the digits unevenly ("8 5°").
  const labelFont = useSkiaMonoFont('700', MARKER_LABEL_FONT_SIZE)

  const valueText = useDerivedValue(() => {
    const current = value.value
    if (current == null) return DASH
    const displayed = current * displayScale
    return decimals === 0 ? Math.round(displayed).toString() : displayed.toFixed(decimals)
  })

  const arc = useDerivedValue(() =>
    svgPath(arcPath(HALF_ARC, normalizeFraction(value.value ?? min, min, max))),
  )
  const arcColor = useDerivedValue(() =>
    gaugeRampColor(value.value ?? min, fillColor, hotRange, hotColor),
  )
  // A round cap on a zero-length arc would paint a dot at the start.
  const fillOpacity = useDerivedValue(() => ((value.value ?? min) > min ? 1 : 0))
  const valueColor = useDerivedValue(() =>
    gaugeRampColor(value.value, fillColor, hotRange, hotColor),
  )

  return (
    <View style={styles.halfWrap}>
      <View style={styles.svg} onLayout={onLayout}>
        {scale > 0 ? (
          <Canvas style={styles.svg}>
            <Group transform={[{ scale }]}>
              <Path
                path={BG_ARC}
                color={trackColor}
                style="stroke"
                strokeWidth={ARC_STROKE}
                strokeCap="round"
              />
              <Path
                opacity={fillOpacity}
                path={arc}
                color={arcColor}
                style="stroke"
                strokeWidth={ARC_STROKE}
                strokeCap="round"
              />
              {alerts.map((alert) => (
                <AlertMarker
                  key={alert.id}
                  arc={HALF_ARC}
                  alert={alert}
                  min={min}
                  max={max}
                  labelFont={labelFont}
                  stroke={ARC_STROKE}
                  tickWidth={TICK_WIDTH}
                  onArc
                  labelInset={MARKER_LABEL_INSET}
                  labelFontSize={MARKER_LABEL_FONT_SIZE}
                  color={markerColor}
                />
              ))}
            </Group>
            <GaugeReadout
              text={valueText}
              color={valueColor}
              unit={unit}
              box={{
                x: size.w * 0.18,
                y: size.h * 0.36,
                width: size.w * 0.64,
                height: size.h * 0.6,
              }}
              valueSize={HALF_VALUE_FONT_SIZE}
              valueLineHeight={HALF_VALUE_LINE_HEIGHT}
              unitSize={HALF_UNIT_FONT_SIZE}
            />
          </Canvas>
        ) : null}
      </View>
    </View>
  )
}

export function SingleGauge({
  value,
  min = 0,
  max,
  unit,
  decimals,
  displayScale,
  label,
  headerRight,
  alerts = [],
  hotRange,
  containerStyle,
}: SingleGaugeProps) {
  return (
    <View style={[styles.singleWrap, containerStyle]}>
      {label || headerRight ? (
        <View style={styles.singleHeader}>
          {label ? <Text style={styles.singleLabel}>{label}</Text> : <View />}
          {headerRight}
        </View>
      ) : null}
      <HalfArc
        value={value}
        min={min}
        max={max}
        unit={unit}
        decimals={decimals}
        displayScale={displayScale}
        alerts={alerts}
        hotRange={hotRange}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  halfWrap: {
    width: '100%',
    aspectRatio: HALF_VB_W / HALF_VB_H,
    position: 'relative',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
  singleWrap: {
    backgroundColor: theme.alpha(theme.palette.mono.black, 0),
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 6,
    overflow: 'hidden',
  },
  singleLabel: {
    color: theme.ui.mutedForeground,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  singleHeader: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
})
