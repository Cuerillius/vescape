import { useMemo } from 'react'

import { theme } from '@/constants/theme'
import { useResolvedUiColors } from '@/hooks/useTheme'
import { MetricDetailScreen } from '@/modules/board/components/MetricDetailScreen'
import {
  toChartBands,
  toChartSeries,
  toLiveChart,
} from '@/modules/board/components/metricDetailData'
import { SPEED_CONFIG_ROWS } from '@/modules/board/constants/boardConfigRows'
import { SPEED_MOTOR_CONFIG_ROWS } from '@/modules/board/constants/motorConfigRows'
import { telemetry } from '@/modules/board/constants/telemetry'
import {
  useLiveMetric,
  useLiveExcludedRanges,
  liveSelectors,
} from '@/modules/board/hooks/useLiveMetric'
import { liveTelemetryRuntime } from '@/modules/board/lib/liveTelemetryRuntime'
import { useLiveWindowMs } from '@/modules/settings/store/settingsStore'

const cfg = telemetry.speed
const dutyCfg = telemetry.duty
const CHART_HEIGHT = 140

export default function SpeedScreen() {
  const ui = useResolvedUiColors()
  const speed = useLiveMetric(liveSelectors.speed)
  const duty = useLiveMetric(liveSelectors.duty)
  const windowMs = useLiveWindowMs()
  const excludedRanges = useLiveExcludedRanges('avg_speed', 'max_speed')

  const speedSeries = useMemo(() => toChartSeries(speed, windowMs), [speed, windowMs])
  const dutySeries = useMemo(() => toChartSeries(duty, windowMs), [duty, windowMs])

  const charts = useMemo(
    () => [
      toLiveChart({
        key: 'speed',
        metric: cfg,
        data: speedSeries,
        range: cfg.chartRange,
        height: CHART_HEIGHT,
        bands: toChartBands(excludedRanges),
        secondary: {
          key: 'duty',
          data: dutySeries,
          range: dutyCfg.chartRange,
          color: theme.alpha(ui.faintForeground, 0.6),
          unit: dutyCfg.unit,
          decimals: dutyCfg.decimals,
        },
      }),
    ],
    [dutySeries, excludedRanges, ui.faintForeground, speedSeries],
  )

  return (
    <MetricDetailScreen
      metric={cfg}
      value={liveTelemetryRuntime.values.speedKmh}
      absolute
      series={speedSeries}
      charts={charts}
      boardConfigRows={SPEED_CONFIG_ROWS}
      motorConfigRows={SPEED_MOTOR_CONFIG_ROWS}
      limitsSummary="Tiltback and ERPM"
    />
  )
}
