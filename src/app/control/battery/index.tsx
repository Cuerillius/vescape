import { useEffect, useMemo } from 'react'
import { useSharedValue } from 'react-native-reanimated'

import { MetricDetailScreen } from '@/modules/board/components/MetricDetailScreen'
import { BATTERY_CONFIG_ROWS } from '@/modules/board/constants/boardConfigRows'
import { toChartSeries, toLiveChart } from '@/modules/board/components/metricDetailData'
import { computeAutoRangeFromValues } from '@/components/charts/chartMath'
import { BATTERY_MOTOR_CONFIG_ROWS } from '@/modules/board/constants/motorConfigRows'
import { telemetry } from '@/modules/board/constants/telemetry'
import { theme } from '@/constants/theme'
import { useResolvedUiColors } from '@/hooks/useTheme'
import { useLiveMetric, liveSelectors } from '@/modules/board/hooks/useLiveMetric'
import { deriveBatteryConfig } from '@/modules/battery/lib'
import { useRenderRateWarning } from '@/hooks/useRenderRateWarning'
import { useBoardStore } from '@/modules/board/store/boardStore'
import { useLiveWindowMs } from '@/modules/settings/store/settingsStore'

const battVoltageCfg = telemetry.battVoltage
const battCurrentCfg = telemetry.battCurrent
const battPercentCfg = { ...battVoltageCfg, label: 'Battery', unit: '%', decimals: 0 }

const PERCENT_RANGE = { min: 0, max: 100 }

export default function BatteryScreen() {
  const ui = useResolvedUiColors()
  useRenderRateWarning('BatteryScreen')
  const batteryPercent = useLiveMetric(liveSelectors.batteryPercent)
  const batteryVoltage = useLiveMetric(liveSelectors.batteryVoltage)
  const batteryCurrent = useLiveMetric(liveSelectors.batteryCurrent)
  const windowMs = useLiveWindowMs()

  // One cursor shared by every chart on this screen — scrubbing any chart moves all of them.
  const scrubTimeMs = useSharedValue<number | null>(null)

  const percentSeries = useMemo(
    () => toChartSeries(batteryPercent, windowMs),
    [batteryPercent, windowMs],
  )
  const voltageSeries = useMemo(
    () => toChartSeries(batteryVoltage, windowMs),
    [batteryVoltage, windowMs],
  )
  const currentSeries = useMemo(
    () => toChartSeries(batteryCurrent, windowMs),
    [batteryCurrent, windowMs],
  )

  const board = useBoardStore((s) => s.boards.find((b) => b.id === s.activeBoardId))
  const battery = useMemo(
    () => deriveBatteryConfig(board?.batteryConfig ?? null),
    [board?.batteryConfig],
  )

  // Pin the V axis to the pack's 0%..100% span so the V line plots at the same height as the
  // % line and only sag under load separates them. Auto-ranging stretches noise to full height.
  const voltageRange = useMemo(() => {
    if (battery.warning == null) {
      return { min: battery.minVoltage, max: battery.maxVoltage }
    }
    return computeAutoRangeFromValues(voltageSeries.vs, {
      includeZero: false,
      minSpan: 5,
      paddingRatio: 0.1,
      fallbackMin: 30,
      fallbackMax: 60,
    })
  }, [battery, voltageSeries])

  // Pack percent with voltage riding on the right axis, then pack current — one stack, so
  // scrubbing either moves the other.
  const charts = useMemo(
    () => [
      toLiveChart({
        key: 'batteryPercent',
        metric: battPercentCfg,
        data: percentSeries,
        range: PERCENT_RANGE,
        secondary: {
          key: 'batteryVoltage',
          data: voltageSeries,
          range: voltageRange,
          color: theme.alpha(ui.faintForeground, 0.6),
          unit: battVoltageCfg.unit,
          decimals: battVoltageCfg.decimals,
        },
      }),
      toLiveChart({
        key: 'batteryCurrent',
        metric: battCurrentCfg,
        data: currentSeries,
        range: computeAutoRangeFromValues(currentSeries.vs, {
          baseline: battCurrentCfg.chartRange,
        }),
      }),
    ],
    [currentSeries, ui.faintForeground, percentSeries, voltageRange, voltageSeries],
  )

  // Gauge reads the latest of the calm ~1Hz decimated series — the same SoC source/cadence the
  // center BatteryIndicator uses. The per-frame `liveTelemetryRuntime` tick carries the identical
  // smoothed estimate but updates every BLE frame, which made the big % readout jitter.
  const latestPercent = batteryPercent.at(-1)?.value ?? null
  const percentValue = useSharedValue<number | null>(latestPercent)
  useEffect(() => {
    percentValue.value = latestPercent
  }, [latestPercent, percentValue])

  // Peak means little for a charge level; what a rider reads off a pack is how much of it the
  // window used.
  const chartSummary = useMemo(() => {
    if (percentSeries.vs.length === 0) return undefined
    const used = percentSeries.vs[0] - percentSeries.vs[percentSeries.vs.length - 1]
    return `Used ${Math.round(Math.max(0, used))}%`
  }, [percentSeries])

  return (
    <MetricDetailScreen
      metric={battPercentCfg}
      value={percentValue}
      series={percentSeries}
      chartSummary={chartSummary}
      charts={charts}
      scrubTimeMs={scrubTimeMs}
      boardConfigRows={BATTERY_CONFIG_ROWS}
      motorConfigRows={BATTERY_MOTOR_CONFIG_ROWS}
      limitsSummary="Voltage pushback and cutoff"
    />
  )
}
