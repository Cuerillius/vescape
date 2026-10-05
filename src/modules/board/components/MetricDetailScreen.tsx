import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import type { SharedValue } from 'react-native-reanimated'
import IconAdjustments from '@tabler/icons-react-native/IconAdjustments'
import IconChartLine from '@tabler/icons-react-native/IconChartLine'

import { Text } from '@/components/base/Text'
import type { ChartSeriesData } from '@/components/charts/line/types'
import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import type { AccordionItem } from '@/components/ui/Accordion'
import { useUnitSystem } from '@/hooks/useUnitSystem'
import {
  BoardConfigSection,
  type BoardConfigRow,
  type MotorConfigRow,
} from '@/modules/board/components/BoardConfigSection'
import { ControlDetailLayout } from '@/modules/board/components/ControlDetailLayout'
import { LiveChartStack } from '@/modules/board/components/LiveChartStack'
import { MetricHero, type MetricHeroLimit } from '@/modules/board/components/MetricHero'
import type { LiveChartSpec } from '@/modules/board/components/metricDetailData'
import { MotorConfigSection } from '@/modules/board/components/MotorConfigSection'
import {
  presentTelemetryMetric,
  type TelemetryMetricConfig,
} from '@/modules/board/constants/telemetry'
import { formatFocusedSeriesSpan } from '@/modules/board/lib/focusedSeriesHeader'
import { computeWindowStats } from '@/modules/board/lib/metricWindowStats'
import { useFocusedSeriesStore } from '@/modules/board/store/focusedSeriesStore'
import { useSettingsStore } from '@/modules/settings/store/settingsStore'

interface MetricDetailScreenProps {
  metric: TelemetryMetricConfig
  /** Screen title, when it should read fuller than the metric's label. */
  title?: string
  /** Live value for the hero; the same shared value the center screen reads. */
  value: SharedValue<number | null>
  /** Show magnitude only — speed has no direction worth reading. */
  absolute?: boolean
  /** Limit the hero draws a headroom bar against; omit when the metric has none worth showing. */
  limit?: MetricHeroLimit | null
  /** The metric's own series — what the chart row's Peak summary is computed over. */
  series: ChartSeriesData
  /** What the chart row says while closed, for metrics where "Peak" does not suit. */
  chartSummary?: string
  charts: LiveChartSpec[]
  scrubTimeMs?: SharedValue<number | null>
  boardConfigRows?: BoardConfigRow[]
  motorConfigRows?: MotorConfigRow[]
  /** What the Limits row says while closed. Defaults to the hero's limit label. */
  limitsSummary?: string
}

/**
 * A `/control/<metric>` detail screen: the live value with its headroom, and under it one
 * accordion — the live window's chart, alerts, limits — with a single row open at a time. Every
 * metric that has a number to watch and limits to watch it against composes this and supplies
 * only its data.
 */
export function MetricDetailScreen({
  metric,
  title,
  value,
  absolute = false,
  limit = null,
  series,
  chartSummary,
  charts,
  scrubTimeMs,
  boardConfigRows,
  motorConfigRows,
  limitsSummary,
}: MetricDetailScreenProps) {
  const units = useUnitSystem()

  const peakSummary = useMemo(() => {
    const window = computeWindowStats(series)
    if (!window) return undefined
    return `Peak ${presentTelemetryMetric(metric, units).format(window.peak)}`
  }, [metric, series, units])

  const summary = chartSummary ?? peakSummary

  const sections = useLimitsSections({
    boardConfigRows,
    motorConfigRows,
    summary: limitsSummary ?? limit?.label,
  })

  return (
    <ControlDetailLayout
      title={title ?? metric.label}
      controlId={metric.controlId}
      hero={<MetricHero metric={metric} value={value} absolute={absolute} limit={limit} />}
      chart={<MetricChartPanel charts={charts} summary={summary} scrubTimeMs={scrubTimeMs} />}
      sections={sections}
    />
  )
}

interface MetricChartPanelProps {
  charts: LiveChartSpec[]
  /** Right-hand caption in the header — "Peak 42 km/h". */
  summary?: string
  scrubTimeMs?: SharedValue<number | null>
}

/** The live window's header and chart stack — the block every detail screen shows under its hero. */
export function MetricChartPanel({ charts, summary, scrubTimeMs }: MetricChartPanelProps) {
  const iconColor = useResolvedColor(theme.ui.foreground)
  const spanMs = useFocusedSeriesStore((s) => s.spanMs)
  const configuredMinutes = useSettingsStore((s) => s.liveHistoryLimit)

  return (
    <View style={styles.chart} testID="control-chart">
      <View style={styles.chartHeader}>
        <IconChartLine size={18} color={iconColor} strokeWidth={2} />
        <Text style={styles.chartTitle} numberOfLines={1}>
          {formatFocusedSeriesSpan(spanMs, configuredMinutes)}
        </Text>
        {summary ? (
          <Text style={styles.chartSummary} numberOfLines={1}>
            {summary}
          </Text>
        ) : null}
      </View>
      <LiveChartStack charts={charts} scrubTimeMs={scrubTimeMs} />
    </View>
  )
}

interface LimitsSectionsArgs {
  boardConfigRows?: BoardConfigRow[]
  motorConfigRows?: MotorConfigRow[]
  /** What the Limits row says while closed. */
  summary?: string
}

/** The collapsed "Limits" accordion row over a screen's board and motor config rows, if any. */
export function useLimitsSections({
  boardConfigRows,
  motorConfigRows,
  summary,
}: LimitsSectionsArgs): AccordionItem[] {
  const hasConfig = (boardConfigRows?.length ?? 0) > 0 || (motorConfigRows?.length ?? 0) > 0
  return useMemo<AccordionItem[]>(
    () =>
      hasConfig
        ? [
            {
              key: 'limits',
              title: 'Limits',
              summary,
              icon: IconAdjustments,
              testID: 'control-limits-accordion',
              content: (
                <>
                  {boardConfigRows?.length ? (
                    <BoardConfigSection bare rows={boardConfigRows} />
                  ) : null}
                  {motorConfigRows?.length ? (
                    <MotorConfigSection bare rows={motorConfigRows} />
                  ) : null}
                </>
              ),
            },
          ]
        : [],
    [boardConfigRows, hasConfig, motorConfigRows, summary],
  )
}

const styles = StyleSheet.create({
  chart: {
    gap: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chartTitle: {
    flex: 1,
    color: theme.ui.foreground,
    fontSize: 15,
    fontWeight: '600',
  },
  chartSummary: {
    flexShrink: 1,
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '500',
  },
})
