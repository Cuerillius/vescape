import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '@/components/base/Text'
import type { SharedValue } from 'react-native-reanimated'

import { computeAutoRangeFromValues } from '@/components/charts/chartMath'
import { ImuBackIndicator } from '@/modules/board/components/ImuBackIndicator'
import { ImuIndicator } from '@/modules/board/components/ImuIndicator'
import { ControlDetailLayout } from '@/modules/board/components/ControlDetailLayout'
import { IMU_CONFIG_ROWS } from '@/modules/board/constants/boardConfigRows'
import { MetricChartPanel, useLimitsSections } from '@/modules/board/components/MetricDetailScreen'
import { toChartSeries, toLiveChart } from '@/modules/board/components/metricDetailData'
import { TickText } from '@/components/base/TickText'
import { telemetry } from '@/modules/board/constants/telemetry'
import { useLiveMetric, liveSelectors } from '@/modules/board/hooks/useLiveMetric'
import { useLiveWindowMs } from '@/modules/settings/store/settingsStore'
import { theme, type ThemeColor } from '@/constants/theme'
import { liveTelemetryRuntime } from '@/modules/board/lib/liveTelemetryRuntime'

const LIVE_FONT_SIZE = 24
const BOARD_SIZE = 144
/** The side view's canvas is wider than the back view's: its level marks sit further apart. */
const PITCH_WIDTH_RATIO = 1.1

const pitchCfg = telemetry.pitch
const rollCfg = telemetry.roll
const balanceCfg = telemetry.balancePitch

interface LiveMetricReadoutProps {
  label: string
  value: SharedValue<number | null>
  decimals: number
  unit: string
  color: ThemeColor
}

function LiveMetricReadout({ label, value, decimals, unit, color }: LiveMetricReadoutProps) {
  return (
    <View style={styles.liveCell}>
      <Text style={styles.liveLabel}>{label.toUpperCase()}</Text>
      <TickText
        value={value}
        decimals={decimals}
        unit={unit}
        size={LIVE_FONT_SIZE}
        weight="800"
        color={color}
        align="center"
        style={styles.liveValue}
      />
    </View>
  )
}

export default function ImuScreen() {
  const pitch = useLiveMetric(liveSelectors.pitch)
  const roll = useLiveMetric(liveSelectors.roll)
  const balancePitch = useLiveMetric(liveSelectors.balancePitch)
  const windowMs = useLiveWindowMs()
  const hot = liveTelemetryRuntime.values

  // Pitch, roll and balance in one stack: they are read against each other, and one gesture over
  // the column puts the same moment under the finger on all three.
  const charts = useMemo(() => {
    const series = [
      { key: 'pitch', metric: pitchCfg, data: toChartSeries(pitch, windowMs) },
      { key: 'roll', metric: rollCfg, data: toChartSeries(roll, windowMs) },
      { key: 'balancePitch', metric: balanceCfg, data: toChartSeries(balancePitch, windowMs) },
    ]
    return series.map(({ key, metric, data }) =>
      toLiveChart({
        key,
        metric,
        data,
        range: computeAutoRangeFromValues(data.vs, { baseline: metric.chartRange }),
      }),
    )
  }, [balancePitch, pitch, roll, windowMs])

  const sections = useLimitsSections({ boardConfigRows: IMU_CONFIG_ROWS })

  return (
    <ControlDetailLayout
      title="IMU"
      hero={
        <View style={styles.hero}>
          <View style={styles.balance}>
            <LiveMetricReadout
              label="Balance"
              value={hot.balancePitch}
              decimals={balanceCfg.decimals}
              unit={balanceCfg.unit}
              color={theme.ui.foreground}
            />
          </View>
          <View style={styles.attitudeRow}>
            <View style={styles.sideColumn}>
              <LiveMetricReadout
                label={pitchCfg.label}
                value={hot.pitch}
                decimals={pitchCfg.decimals}
                unit={pitchCfg.unit}
                color={theme.ui.foreground}
              />
              <ImuIndicator
                pitch={hot.pitch}
                size={BOARD_SIZE}
                width={BOARD_SIZE * PITCH_WIDTH_RATIO}
                showLevelTicks
              />
            </View>
            <View style={styles.sideColumn}>
              <LiveMetricReadout
                label={rollCfg.label}
                value={hot.roll}
                decimals={rollCfg.decimals}
                unit={rollCfg.unit}
                color={theme.ui.foreground}
              />
              <ImuBackIndicator roll={hot.roll} size={BOARD_SIZE} showLevelTicks />
            </View>
          </View>
        </View>
      }
      chart={<MetricChartPanel charts={charts} />}
      sections={sections}
    />
  )
}

const styles = StyleSheet.create({
  attitudeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  sideColumn: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  hero: {
    gap: 16,
  },
  balance: {
    alignItems: 'center',
  },
  liveCell: {
    alignSelf: 'stretch',
    gap: 4,
    alignItems: 'center',
  },
  liveLabel: {
    color: theme.ui.mutedForeground,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  liveValue: {
    alignSelf: 'stretch',
  },
})
