import { useMemo } from 'react'

import { theme } from '@/constants/theme'
import { useResolvedUiColors } from '@/hooks/useTheme'
import { MetricDetailScreen } from '@/modules/board/components/MetricDetailScreen'
import {
  toChartBands,
  toChartSeries,
  toLiveChart,
} from '@/modules/board/components/metricDetailData'
import { DUTY_CONFIG_ROWS } from '@/modules/board/constants/boardConfigRows'
import { DUTY_MOTOR_CONFIG_ROWS } from '@/modules/board/constants/motorConfigRows'
import { telemetry } from '@/modules/board/constants/telemetry'
import {
  useLiveMetric,
  useLiveExcludedRanges,
  liveSelectors,
} from '@/modules/board/hooks/useLiveMetric'
import { useDutyLimit } from '@/modules/board/hooks/useMetricLimits'
import { liveTelemetryRuntime } from '@/modules/board/lib/liveTelemetryRuntime'
import { useLiveWindowMs } from '@/modules/settings/store/settingsStore'

const cfg = telemetry.duty
const speedCfg = telemetry.speed
const CHART_HEIGHT = 140

export default function DutyScreen() {
  const ui = useResolvedUiColors()
  const duty = useLiveMetric(liveSelectors.duty)
  const speed = useLiveMetric(liveSelectors.speed)
  const windowMs = useLiveWindowMs()
  const excludedRanges = useLiveExcludedRanges('max_duty')
  const limit = useDutyLimit()

  const dutySeries = useMemo(() => toChartSeries(duty, windowMs), [duty, windowMs])
  const speedSeries = useMemo(() => toChartSeries(speed, windowMs), [speed, windowMs])

  // Speed rides faint on the right axis: duty climbing ahead of it is the board working harder
  // per km/h — a climb, a headwind, or a sagging pack.
  const charts = useMemo(
    () => [
      toLiveChart({
        key: 'duty',
        metric: cfg,
        data: dutySeries,
        range: cfg.chartRange,
        height: CHART_HEIGHT,
        bands: toChartBands(excludedRanges),
        secondary: {
          key: 'speed',
          data: speedSeries,
          range: speedCfg.chartRange,
          color: theme.alpha(ui.faintForeground, 0.6),
          unit: speedCfg.unit,
          decimals: speedCfg.decimals,
        },
      }),
    ],
    [dutySeries, excludedRanges, ui.faintForeground, speedSeries],
  )

  return (
    <MetricDetailScreen
      metric={cfg}
      value={liveTelemetryRuntime.values.dutyPercent}
      limit={limit}
      series={dutySeries}
      charts={charts}
      boardConfigRows={DUTY_CONFIG_ROWS}
      motorConfigRows={DUTY_MOTOR_CONFIG_ROWS}
    />
  )
}
