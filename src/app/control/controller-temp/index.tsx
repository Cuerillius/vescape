import { useMemo } from 'react'

import { computeAutoRangeFromValues } from '@/components/charts/chartMath'
import { theme } from '@/constants/theme'
import { useResolvedUiColors } from '@/hooks/useTheme'
import { MetricDetailScreen } from '@/modules/board/components/MetricDetailScreen'
import { toChartSeries, toLiveChart } from '@/modules/board/components/metricDetailData'
import { CONTROLLER_TEMP_CONFIG_ROWS } from '@/modules/board/constants/motorConfigRows'
import { telemetry } from '@/modules/board/constants/telemetry'
import { liveSelectors, useLiveMetric } from '@/modules/board/hooks/useLiveMetric'
import { useControllerTempLimit } from '@/modules/board/hooks/useMetricLimits'
import { liveTelemetryRuntime } from '@/modules/board/lib/liveTelemetryRuntime'
import { useLiveWindowMs } from '@/modules/settings/store/settingsStore'

const cfg = telemetry.controllerTemp
const motorCfg = telemetry.motorTemp
const CHART_HEIGHT = 140

export default function ControllerTempScreen() {
  const ui = useResolvedUiColors()
  const controllerTemp = useLiveMetric(liveSelectors.controllerTemp)
  const motorTemp = useLiveMetric(liveSelectors.motorTemp)
  const windowMs = useLiveWindowMs()
  const limit = useControllerTempLimit()

  const controllerSeries = useMemo(
    () => toChartSeries(controllerTemp, windowMs),
    [controllerTemp, windowMs],
  )
  const motorSeries = useMemo(() => toChartSeries(motorTemp, windowMs), [motorTemp, windowMs])

  // Both temperatures share one scale, so the motor riding hotter or cooler than the controller
  // reads straight off the plot.
  const charts = useMemo(() => {
    const range = computeAutoRangeFromValues([...controllerSeries.vs, ...motorSeries.vs], {
      baseline: cfg.chartRange,
    })
    return [
      toLiveChart({
        key: 'controllerTemp',
        metric: cfg,
        data: controllerSeries,
        range,
        height: CHART_HEIGHT,
        secondary: {
          key: 'motorTemp',
          data: motorSeries,
          range,
          color: theme.alpha(ui.faintForeground, 0.6),
          unit: motorCfg.unit,
          decimals: motorCfg.decimals,
        },
      }),
    ]
  }, [controllerSeries, motorSeries, ui.faintForeground])

  return (
    <MetricDetailScreen
      metric={cfg}
      title="Controller Temperature"
      value={liveTelemetryRuntime.values.controllerTemp}
      limit={limit}
      series={controllerSeries}
      charts={charts}
      motorConfigRows={CONTROLLER_TEMP_CONFIG_ROWS}
    />
  )
}
