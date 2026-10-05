import { memo, useCallback, type ReactNode, useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CHART_CHANGE_FADE_MS, ChartStack } from '@/components/charts/line/ChartStack'
import { stackChromeHeight } from '@/components/charts/line/chartLayout'
import type { ChartTimeRange } from '@/components/charts/line/types'
import { theme } from '@/constants/theme'
import { useRenderRateWarning } from '@/hooks/useRenderRateWarning'
import {
  isHistoryMetricKey,
  PANEL_CHART_METRICS,
  toggleOptionalChartMetric,
  topActiveChartMetric,
  type ChartToggleMetric,
} from '@/modules/history/components/historyChartMetrics'
import { HistoryMetricLegend } from '@/modules/history/components/HistoryMetricLegend'
import { HistoryMetricTabs } from '@/modules/history/components/HistoryMetricTabs'
import {
  useChartExclusionBands,
  useChartRanges,
  useChartTimeline,
  useChartSeries,
  useHistoryChartStack,
  useFavoriteBands,
  useGpsGapBands,
  useMetricRamps,
  useVisibleRideSamples,
} from '@/modules/history/hooks/useHistoryChartData'
import { scrubHeadMs, zoomWindowMs } from '@/modules/history/lib/chartFocus'
import type { HistoryMetricKey } from '@/modules/history/lib/metricColorScale'
import {
  useHistoryStore,
  type HistorySession,
  type TelemetrySample,
} from '@/modules/history/store/historyStore'

/** Stable identity, so a loading ride does not rebuild the stack on every render. */
const EMPTY_SAMPLES: TelemetrySample[] = []
const CHART_HEIGHT_DURATION_MS = 180
/** The panel's charts, taller than the stack's defaults now the stats no longer sit above them. */
const SPEED_CHART_HEIGHT = 76
const METRIC_CHART_HEIGHT = 60
const CHART_MIN_HEIGHT = 104

interface HistoryTelemetryPanelProps {
  /** The ride being replayed; its figures sit in the panel's expandable stats. */
  session: HistorySession
  /** The button before the chart toggles. */
  leadingTool?: ReactNode
  /** The button after the chart toggles. */
  tool?: ReactNode
  /** Full-density samples retained for recording-continuity and GPS-gap detection. */
  gpsGapSamples: TelemetrySample[]
  /** Decimated samples used to draw the compact chart lines. */
  samples: TelemetrySample[]
  favoriteRanges: { startMs: number; endMs: number }[]
  onMetricInteraction?: (metric: HistoryMetricKey) => void
  onHeightChange?: (height: number) => void
  /** When set, the stack becomes a Favorite range trimmer and scrubbing is suspended. */
  trim?: HistoryTrimConfig
}

/** A Favorite being cut out of the ride: the seed range, and where the rider drags it to. */
export interface HistoryTrimConfig {
  startMs: number
  endMs: number
  onChange: (startMs: number, endMs: number) => void
  onCommit: (startMs: number, endMs: number) => void
}

/**
 * Memoized: it rebuilds every chart series, range and path for the ride it is handed, so a render
 * of the screen around it is not a reason to do that work again.
 */
export const HistoryTelemetryPanel = memo(function HistoryTelemetryPanel({
  session,
  leadingTool,
  tool,
  gpsGapSamples,
  samples,
  favoriteRanges,
  onMetricInteraction,
  onHeightChange,
  trim,
}: HistoryTelemetryPanelProps) {
  useRenderRateWarning('HistoryTelemetryPanel')
  const insets = useSafeAreaInsets()
  // Speed is on by default and closable like any other line — the rider who wants the map back
  // should not have to keep a chart they are not reading.
  const [activeCharts, setActiveCharts] = useState<Set<ChartToggleMetric>>(
    () => new Set<ChartToggleMetric>(['speed']),
  )
  const [displayedCharts, setDisplayedCharts] = useState(activeCharts)
  const chartHeightAnimatingRef = useRef(false)
  const pendingPanelHeightRef = useRef<number | null>(null)
  const selection = useSharedValue<ChartTimeRange | null>(null)
  const trimRef = useRef(trim)
  trimRef.current = trim
  const trimming = trim != null
  const { startAtMs, movingStartAtMs, movingEndAtMs } = session

  // No lines while a ride is loading, whatever the store still holds. Samples and the ride they
  // belong to have to be drawn as a pair: feeding the previous ride's samples through the new
  // ride's bounds rebuilds every series, timeline, range and path for a result that is thrown
  // away the moment the real samples land — which is what made switching rides crawl.
  const loadingSession = useHistoryStore((s) => s.loadingSession)

  // Derived in render, not through state: an effect would run a commit late and the old ride's
  // lines would survive the press that started the next one.
  const rideSamples = loadingSession ? EMPTY_SAMPLES : samples
  const rideGpsGapSamples = loadingSession ? EMPTY_SAMPLES : gpsGapSamples

  // The lines are cleared in the same commit as the press, so the fade out is only the chrome
  // going; the fade in is the whole stack arriving at once, once its samples have landed.
  const fade = useSharedValue(1)
  useEffect(() => {
    fade.value = withTiming(loadingSession ? 0 : 1, { duration: loadingSession ? 90 : 260 })
  }, [fade, loadingSession])
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }))

  const visibleSamples = useVisibleRideSamples(rideSamples, movingStartAtMs, movingEndAtMs)
  const visibleGpsGapSamples = useVisibleRideSamples(
    rideGpsGapSamples,
    movingStartAtMs,
    movingEndAtMs,
  )
  useEffect(() => {
    setDisplayedCharts((current) => new Set([...current, ...activeCharts]))
    const timeout = setTimeout(() => setDisplayedCharts(activeCharts), CHART_CHANGE_FADE_MS)
    return () => clearTimeout(timeout)
  }, [activeCharts])

  const series = useChartSeries(visibleSamples, displayedCharts)
  const timeline = useChartTimeline(visibleSamples)
  const ranges = useChartRanges(series, displayedCharts)
  const ramps = useMetricRamps()
  const exclusionBands = useChartExclusionBands()
  const favoriteBands = useFavoriteBands(favoriteRanges)
  const gpsGapBands = useGpsGapBands(visibleGpsGapSamples)

  const charts = useHistoryChartStack({
    series,
    ranges,
    ramps,
    exclusionBands,
    activeMetrics: displayedCharts,
    speedOptional: true,
    speedHeight: SPEED_CHART_HEIGHT,
    metricHeight: METRIC_CHART_HEIGHT,
    gpsGapBands,
  })
  const chartViewportTargetHeight =
    charts.length === 0
      ? 0
      : Math.max(
          CHART_MIN_HEIGHT,
          charts.reduce((height, chart) => height + chart.height, 0) +
            stackChromeHeight(charts.length),
        )
  const chartViewportHeight = useSharedValue(chartViewportTargetHeight)
  useEffect(() => {
    chartHeightAnimatingRef.current = true
    chartViewportHeight.value = withTiming(chartViewportTargetHeight, {
      duration: CHART_HEIGHT_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    })
    const timeout = setTimeout(() => {
      chartHeightAnimatingRef.current = false
      const height = pendingPanelHeightRef.current
      if (height != null) onHeightChange?.(height)
    }, CHART_HEIGHT_DURATION_MS)
    return () => clearTimeout(timeout)
  }, [chartViewportHeight, chartViewportTargetHeight, onHeightChange])
  const chartViewportStyle = useAnimatedStyle(() => ({ height: chartViewportHeight.value }))

  const handlePanelLayout = useCallback(
    (height: number) => {
      const roundedHeight = Math.round(height)
      pendingPanelHeightRef.current = roundedHeight
      if (!chartHeightAnimatingRef.current) onHeightChange?.(roundedHeight)
    },
    [onHeightChange],
  )

  const bottomInset = Math.max(insets.bottom, 8) + 4

  // The scrub head and the zoom window outlive this component (the map reads both), so a ride
  // switch has to clear them — otherwise the map keeps marking a moment from the previous ride.
  useEffect(() => {
    scrubHeadMs.value = null
    zoomWindowMs.value = null
    return () => {
      scrubHeadMs.value = null
      zoomWindowMs.value = null
    }
  }, [startAtMs])

  // The seed range enters the canvas as a shared value, so dragging a handle never renders the
  // panel; the trimmer hears about it through the throttled callbacks below.
  const trimStartMs = trim?.startMs
  const trimEndMs = trim?.endMs
  useEffect(() => {
    selection.value =
      trimStartMs == null || trimEndMs == null ? null : { startMs: trimStartMs, endMs: trimEndMs }
  }, [selection, trimEndMs, trimStartMs])

  // Trimming a Favorite is the rider saying which part of the ride they mean, so the map follows
  // the handles rather than the chart's own zoom: same dim, same camera fit, same settle.
  useAnimatedReaction(
    () => (trimming ? selection.value : null),
    (range) => {
      zoomWindowMs.value = range == null ? null : { startMs: range.startMs, endMs: range.endMs }
    },
    [trimming],
  )

  // Leaving the trimmer hands the window back to the chart's camera, which only reports on its
  // next change — so the selection has to be cleared here or the map stays framed on it.
  useEffect(() => {
    if (!trimming) zoomWindowMs.value = null
  }, [trimming])

  const handleSelectionPreview = useCallback((range: ChartTimeRange) => {
    trimRef.current?.onChange(range.startMs, range.endMs)
  }, [])

  const handleSelectionCommit = useCallback((range: ChartTimeRange) => {
    trimRef.current?.onCommit(range.startMs, range.endMs)
  }, [])

  // Touching a chart is what says "colour the route by this": the stack keys its charts by metric,
  // and the map reads the same hot ranges the lines do, so the two always agree.
  const handleChartTouch = useCallback(
    (key: string) => {
      if (isHistoryMetricKey(key)) onMetricInteraction?.(key)
    },
    [onMetricInteraction],
  )

  const handleToggleMetric = useCallback(
    (metric: ChartToggleMetric) => {
      const next = toggleOptionalChartMetric(activeCharts, metric)
      setActiveCharts(next)
      // Opening a chart colours the route by it; closing one hands the colour straight to the top
      // chart left, so the map never keeps a colour whose line is gone.
      const colourBy = next.has(metric) ? metric : topActiveChartMetric(next)
      if (colourBy != null && isHistoryMetricKey(colourBy)) onMetricInteraction?.(colourBy)
    },
    [activeCharts, onMetricInteraction],
  )

  return (
    <View
      style={[styles.panel, { paddingBottom: bottomInset }]}
      onLayout={(e) => handlePanelLayout(e.nativeEvent.layout.height)}
    >
      {/* Drawn whether or not the samples have landed, so the empty frames hold the panel's height
          and a ride switch fills lines into a stack that never moved. Every metric closed means
          the rider wants the map: the tabs below stay, to bring one back. */}
      <Animated.View style={[styles.chartViewport, chartViewportStyle, fadeStyle]}>
        {displayedCharts.size > 0 ? (
          <View style={styles.chartContent}>
            <ChartStack
              charts={charts}
              bands={favoriteBands}
              timeline={timeline}
              dataKey={`${startAtMs}`}
              timeMode="clock"
              containerStyle={styles.chart}
              scrubTimeMs={scrubHeadMs}
              zoomWindowMs={trimming ? undefined : zoomWindowMs}
              selection={trim ? selection : undefined}
              onSelectionPreview={handleSelectionPreview}
              onSelectionChange={handleSelectionCommit}
              onChartTouch={trim ? undefined : handleChartTouch}
              showHead
              animateChartChanges
              visibleChartKeys={activeCharts}
            />
          </View>
        ) : null}
      </Animated.View>

      <HistoryMetricLegend />
      <View style={styles.tabsRow}>
        {leadingTool}
        <View style={styles.tabs}>
          <HistoryMetricTabs
            activeCharts={activeCharts}
            onToggle={handleToggleMetric}
            metrics={PANEL_CHART_METRICS}
          />
        </View>
        {tool}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  // A bottom bar like the main tab bar: edge to edge on the app surface, so the nav, the charts and
  // the tabs read as one panel instead of loose controls floating over the map.
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    gap: 8,
    paddingTop: 12,
    paddingHorizontal: 12,
    borderTopLeftRadius: theme.radius.lg + 4,
    borderTopRightRadius: theme.radius.lg + 4,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.background,
  },
  chart: {
    minHeight: CHART_MIN_HEIGHT,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
  },
  tabs: {
    flex: 1,
    minWidth: 0,
  },
  chartViewport: {
    overflow: 'hidden',
  },
  chartContent: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
  },
})
