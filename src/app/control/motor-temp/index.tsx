import { useMemo } from 'react'

import { computeAutoRangeFromValues } from '@/components/charts/chartMath'
import { theme } from '@/constants/theme'
import { useResolvedUiColors } from '@/hooks/useTheme'
import { MetricDetailScreen } from '@/modules/board/components/MetricDetailScreen'
import { toChartSeries, toLiveChart } from '@/modules/board/components/metricDetailData'
import { MOTOR_TEMP_CONFIG_ROWS } from '@/modules/board/constants/motorConfigRows'
import { telemetry } from '@/modules/board/constants/telemetry'
import { liveSelectors, useLiveMetric } from '@/modules/board/hooks/useLiveMetric'
import { useMotorTempLimit } from '@/modules/board/hooks/useMetricLimits'
import { liveTelemetryRuntime } from '@/modules/board/lib/liveTelemetryRuntime'
import { useLiveWindowMs } from '@/modules/settings/store/settingsStore'

const cfg = telemetry.motorTemp
const controllerCfg = telemetry.controllerTemp
const CHART_HEIGHT = 140

export default function MotorTempScreen() {
  const ui = useResolvedUiColors()
  const motorTemp = useLiveMetric(liveSelectors.motorTemp)
  const controllerTemp = useLiveMetric(liveSelectors.controllerTemp)
  const windowMs = useLiveWindowMs()
  const limit = useMotorTempLimit()

  const motorSeries = useMemo(() => toChartSeries(motorTemp, windowMs), [motorTemp, windowMs])
  const controllerSeries = useMemo(
    () => toChartSeries(controllerTemp, windowMs),
    [controllerTemp, windowMs],
  )

  // Both temperatures share one scale, so the controller riding hotter or cooler than the motor
  // reads straight off the plot.
  const charts = useMemo(() => {
    const range = computeAutoRangeFromValues([...motorSeries.vs, ...controllerSeries.vs], {
      baseline: cfg.chartRange,
    })
    return [
      toLiveChart({
        key: 'motorTemp',
        metric: cfg,
        data: motorSeries,
        range,
        height: CHART_HEIGHT,
        secondary: {
          key: 'controllerTemp',
          data: controllerSeries,
          range,
          color: theme.alpha(ui.faintForeground, 0.6),
          unit: controllerCfg.unit,
          decimals: controllerCfg.decimals,
        },
      }),
    ]
  }, [controllerSeries, motorSeries, ui.faintForeground])

  return (
    <MetricDetailScreen
      metric={cfg}
      title="Motor Temperature"
      value={liveTelemetryRuntime.values.motorTemp}
      limit={limit}
      series={motorSeries}
      charts={charts}
      motorConfigRows={MOTOR_TEMP_CONFIG_ROWS}
    />
  )
}
