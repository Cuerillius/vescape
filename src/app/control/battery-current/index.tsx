import { useMemo } from 'react'

import { computeAutoRangeFromValues } from '@/components/charts/chartMath'
import { theme } from '@/constants/theme'
import { useResolvedUiColors } from '@/hooks/useTheme'
import { MetricDetailScreen } from '@/modules/board/components/MetricDetailScreen'
import { toChartSeries, toLiveChart } from '@/modules/board/components/metricDetailData'
import { BATTERY_CURRENT_MOTOR_CONFIG_ROWS } from '@/modules/board/constants/motorConfigRows'
import { telemetry } from '@/modules/board/constants/telemetry'
import { liveSelectors, useLiveMetric } from '@/modules/board/hooks/useLiveMetric'
import { useBatteryCurrentLimit } from '@/modules/board/hooks/useMetricLimits'
import { liveTelemetryRuntime } from '@/modules/board/lib/liveTelemetryRuntime'
import { useLiveWindowMs } from '@/modules/settings/store/settingsStore'

const cfg = telemetry.battCurrent
const voltageCfg = telemetry.battVoltage
const CHART_HEIGHT = 140

export default function BatteryCurrentScreen() {
  const ui = useResolvedUiColors()
  const batteryCurrent = useLiveMetric(liveSelectors.batteryCurrent)
  const batteryVoltage = useLiveMetric(liveSelectors.batteryVoltage)
  const windowMs = useLiveWindowMs()
  const limit = useBatteryCurrentLimit()

  const currentSeries = useMemo(
    () => toChartSeries(batteryCurrent, windowMs),
    [batteryCurrent, windowMs],
  )
  const voltageSeries = useMemo(
    () => toChartSeries(batteryVoltage, windowMs),
    [batteryVoltage, windowMs],
  )

  // Pack voltage under the current: the dip that follows each pull is the pack's sag.
  const charts = useMemo(
    () => [
      toLiveChart({
        key: 'batteryCurrent',
        metric: cfg,
        data: currentSeries,
        range: computeAutoRangeFromValues(currentSeries.vs, { baseline: cfg.chartRange }),
        height: CHART_HEIGHT,
        secondary: {
          key: 'batteryVoltage',
          data: voltageSeries,
          range: computeAutoRangeFromValues(voltageSeries.vs, {
            includeZero: false,
            minSpan: voltageCfg.minSpan,
            paddingRatio: 0.1,
            fallbackMin: 30,
            fallbackMax: 60,
          }),
          color: theme.alpha(ui.faintForeground, 0.6),
          unit: voltageCfg.unit,
          decimals: voltageCfg.decimals,
        },
      }),
    ],
    [currentSeries, ui.faintForeground, voltageSeries],
  )

  return (
    <MetricDetailScreen
      metric={cfg}
      value={liveTelemetryRuntime.values.batteryCurrent}
      limit={limit}
      series={currentSeries}
      charts={charts}
      motorConfigRows={BATTERY_CURRENT_MOTOR_CONFIG_ROWS}
    />
  )
}
