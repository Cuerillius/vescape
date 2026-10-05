import { useCallback, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Text } from '@/components/base/Text'
import { ChartStack } from '@/components/charts/line/ChartStack'
import { stackChromeHeight } from '@/components/charts/line/chartLayout'
import { theme } from '@/constants/theme'
import { HistoryChartsHeader } from '@/modules/history/components/HistoryChartsHeader'
import { HistoryMetricChips } from '@/modules/history/components/HistoryMetricChips'
import {
  ALL_CHART_METRICS,
  toggleOptionalChartMetric,
  type ChartToggleMetric,
} from '@/modules/history/components/historyChartMetrics'
import {
  useChartExclusionBands,
  useChartRanges,
  useChartSeries,
  useChartTimeline,
  useExtraChartRanges,
  useExtraChartSeries,
  useFavoriteBands,
  useGpsGapBands,
  useHistoryChartStack,
  useMetricRamps,
  useVisibleRideSamples,
} from '@/modules/history/hooks/useHistoryChartData'
import { zoomWindowMs } from '@/modules/history/lib/chartFocus'
import { formatRideMeta, formatRideTime } from '@/modules/history/lib/rideFormat'
import { useFavoriteStore } from '@/modules/history/store/favoriteStore'
import { useHistoryStore } from '@/modules/history/store/historyStore'
import { useRenderRateWarning } from '@/hooks/useRenderRateWarning'

/**
 * Floor under a plot, below which a line is a smear rather than a reading.
 *
 * Low on purpose: this page opens with every metric on, and a rider who wants one of them taller
 * switches the others off. Shrinking to fit is what keeps that first screen honest — a taller
 * floor would push the last charts off the bottom instead.
 */
const MIN_METRIC_HEIGHT = 24
/** Buttons per row: the fourteen metrics wrap into two even rows. */
const TAB_COLUMNS = 7

/**
 * A ride's charts with the map out of the way.
 *
 * Same stack and same data as the ride panel, opened on the same stretch: {@link zoomWindowMs} is
 * a module singleton, so whatever the rider pinched into over the map is what this page opens on.
 * It is read and never written — the panel's camera keeps owning the window the map is framed to,
 * so zooming here cannot leave the map showing a stretch the panel is no longer on.
 * What changes is the room: every chart gets a share of the whole screen rather than a strip over
 * a map, and metrics the map could never be coloured by (attitude, footpad voltage, the GPS fix)
 * are offered here because here they cost nothing.
 */
export function HistoryChartsScreen() {
  useRenderRateWarning('HistoryChartsScreen')
  const insets = useSafeAreaInsets()
  const session = useHistoryStore((s) => s.selectedSession)
  const samples = useHistoryStore((s) => s.sessionSamples)
  const gpsSamples = useHistoryStore((s) => s.sessionGpsSamples)
  const favorites = useFavoriteStore((s) => s.favorites)
  // Opens with everything on: the page exists to show the whole ride at once, and the tabs are
  // there to take metrics away rather than to hunt for them.
  const [activeCharts, setActiveCharts] = useState<Set<ChartToggleMetric>>(
    () => new Set(ALL_CHART_METRICS.map((metric) => metric.key)),
  )
  const [stackHeight, setStackHeight] = useState(0)
  // The window the ride panel was showing when the rider opened this page. Read once: from here
  // on the two stacks share the same shared value, and re-reading it would fight their gestures.
  const [initialZoom] = useState(() => zoomWindowMs.value)

  const visibleSamples = useVisibleRideSamples(
    samples,
    session?.movingStartAtMs ?? null,
    session?.movingEndAtMs ?? null,
  )
  const series = useChartSeries(visibleSamples, activeCharts)
  const extraSeries = useExtraChartSeries(visibleSamples, gpsSamples)
  const timeline = useChartTimeline(visibleSamples)
  const ranges = useChartRanges(series, activeCharts)
  const extraRanges = useExtraChartRanges(extraSeries)
  const ramps = useMetricRamps()
  const exclusionBands = useChartExclusionBands()
  const favoriteBands = useFavoriteBands(favorites)
  const gpsGapBands = useGpsGapBands(visibleSamples)

  // Charts are sized to fill the screen rather than to a fixed strip, so the plot heights come
  // from what the stack was actually given: the canvas spends the rest on labels and the time axis.
  const chartCount = Math.max(1, activeCharts.size)
  // Every chart gets the same plot height, speed included: the stack reads as one grid, and a
  // taller speed plot only made the metrics under it harder to compare against each other.
  const chartHeight = useMemo(() => {
    const plotSpace = Math.max(0, stackHeight - stackChromeHeight(chartCount))
    return Math.max(MIN_METRIC_HEIGHT, plotSpace / chartCount)
  }, [chartCount, stackHeight])

  const charts = useHistoryChartStack({
    series,
    ranges,
    ramps,
    exclusionBands,
    activeMetrics: activeCharts,
    speedOptional: true,
    extraSeries,
    extraRanges,
    gpsGapBands,
    speedHeight: chartHeight,
    metricHeight: chartHeight,
  })

  const handleToggleMetric = useCallback((metric: ChartToggleMetric) => {
    setActiveCharts((prev) => toggleOptionalChartMetric(prev, metric))
  }, [])

  const hasChartData = visibleSamples.length >= 2

  return (
    <View style={styles.root}>
      <HistoryChartsHeader
        title={session ? formatRideTime(session.startAtMs, session.endAtMs) : undefined}
        subtitle={
          session
            ? formatRideMeta(session.startAtMs, session.endAtMs, session.boardName)
            : undefined
        }
      />
      <View style={styles.screen}>
        <View
          style={styles.stack}
          onLayout={(e) => setStackHeight(e.nativeEvent.layout.height)}
          testID="history-charts-stack"
        >
          {hasChartData && stackHeight > 0 ? (
            <ChartStack
              charts={charts}
              bands={favoriteBands}
              timeline={timeline}
              dataKey={`${session?.startAtMs ?? 0}`}
              timeMode="clock"
              initialZoomMs={initialZoom}
              showHead
            />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.subtitle}>No telemetry for this ride.</Text>
            </View>
          )}
        </View>

        <View style={[styles.toggles, { paddingBottom: Math.max(insets.bottom, 8) + 4 }]}>
          <HistoryMetricChips
            activeCharts={activeCharts}
            onToggle={handleToggleMetric}
            metrics={ALL_CHART_METRICS}
            columns={TAB_COLUMNS}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.ui.background,
  },
  // The charts run edge to edge; only the toggle panel keeps a gutter.
  screen: {
    flex: 1,
  },
  // A bottom panel like the ride screen's: rounded top edge on the app surface.
  toggles: {
    paddingTop: 12,
    paddingHorizontal: 12,
    borderTopLeftRadius: theme.radius.lg + 4,
    borderTopRightRadius: theme.radius.lg + 4,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.background,
  },
  subtitle: {
    color: theme.ui.mutedForeground,
    fontSize: 11,
  },
  stack: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
