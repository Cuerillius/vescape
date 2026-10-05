import { useMemo } from 'react'

import { computeAutoRangeFromValues } from '@/components/charts/chartMath'
import { theme } from '@/constants/theme'
import { useResolvedUiColors } from '@/hooks/useTheme'
import { MetricDetailScreen } from '@/modules/board/components/MetricDetailScreen'
import { toChartSeries, toLiveChart } from '@/modules/board/components/metricDetailData'
import { MOTOR_CURRENT_CONFIG_ROWS } from '@/modules/board/constants/boardConfigRows'
import { MOTOR_CURRENT_MOTOR_CONFIG_ROWS } from '@/modules/board/constants/motorConfigRows'
import { telemetry } from '@/modules/board/constants/telemetry'
import { liveSelectors, useLiveMetric } from '@/modules/board/hooks/useLiveMetric'
import { useMotorCurrentLimit } from '@/modules/board/hooks/useMetricLimits'
import { liveTelemetryRuntime } from '@/modules/board/lib/liveTelemetryRuntime'
import { useLiveWindowMs } from '@/modules/settings/store/settingsStore'

const cfg = telemetry.motorCurrent
const battCfg = telemetry.battCurrent
const CHART_HEIGHT = 140

export default function MotorCurrentScreen() {
  const ui = useResolvedUiColors()
  const motorCurrent = useLiveMetric(liveSelectors.motorCurrent)
  const batteryCurrent = useLiveMetric(liveSelectors.batteryCurrent)
  const windowMs = useLiveWindowMs()
  const limit = useMotorCurrentLimit()

  const motorSeries = useMemo(() => toChartSeries(motorCurrent, windowMs), [motorCurrent, windowMs])
  const batterySeries = useMemo(
    () => toChartSeries(batteryCurrent, windowMs),
    [batteryCurrent, windowMs],
  )

  // Both currents share one scale so the gap between the lines is the conversion, readable by eye.
  const charts = useMemo(() => {
    const range = computeAutoRangeFromValues([...motorSeries.vs, ...batterySeries.vs], {
      baseline: cfg.chartRange,
    })
    return [
      toLiveChart({
        key: 'motorCurrent',
        metric: cfg,
        data: motorSeries,
        range,
        height: CHART_HEIGHT,
        secondary: {
          key: 'batteryCurrent',
          data: batterySeries,
          range,
          color: theme.alpha(ui.faintForeground, 0.6),
          unit: battCfg.unit,
          decimals: battCfg.decimals,
        },
      }),
    ]
  }, [batterySeries, motorSeries, ui.faintForeground])

  return (
    <MetricDetailScreen
      metric={cfg}
      value={liveTelemetryRuntime.values.motorCurrent}
      limit={limit}
      series={motorSeries}
      charts={charts}
      boardConfigRows={MOTOR_CURRENT_CONFIG_ROWS}
      motorConfigRows={MOTOR_CURRENT_MOTOR_CONFIG_ROWS}
    />
  )
}
