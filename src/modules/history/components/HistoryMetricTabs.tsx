import { Pressable, StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { theme } from '@/constants/theme'
import {
  OPTIONAL_CHART_METRICS,
  type ChartTabMetricDef,
  type ChartToggleMetric,
} from '@/modules/history/components/historyChartMetrics'

interface HistoryMetricTabsProps {
  activeCharts: ReadonlySet<ChartToggleMetric>
  onToggle: (metric: ChartToggleMetric) => void
  /** Which metrics to offer. Defaults to the map-colourable ones the ride panel shows. */
  metrics?: readonly ChartTabMetricDef[]
}

export function HistoryMetricTabs({
  activeCharts,
  onToggle,
  metrics = OPTIONAL_CHART_METRICS,
}: HistoryMetricTabsProps) {
  return (
    <View style={styles.metricTabs}>
      {metrics.map((metric, index) => {
        const active = activeCharts.has(metric.key)
        return (
          <Pressable
            key={metric.key}
            testID={`history-metric-tab-${metric.key}`}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[
              styles.metricTab,
              styles.metricTabFlex,
              index < metrics.length - 1 && styles.metricTabDivider,
              active && styles.metricTabActive,
            ]}
            onPress={() => onToggle(metric.key)}
          >
            <View
              style={[
                styles.metricTabLine,
                { backgroundColor: active ? metric.color : theme.ui.faintForeground },
              ]}
            />
            {metric.tabLabel ? (
              <Text
                style={[styles.metricTabText, active && styles.metricTabTextActive]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {metric.tabLabel}
              </Text>
            ) : metric.multilineLabel ? (
              <View style={styles.metricTabTextStack}>
                <Text
                  style={[styles.metricTabText, active && styles.metricTabTextActive]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {metric.multilineLabel[0]}
                </Text>
                <Text
                  style={[styles.metricTabText, active && styles.metricTabTextActive]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {metric.multilineLabel[1]}
                </Text>
              </View>
            ) : (
              <Text
                style={[styles.metricTabText, active && styles.metricTabTextActive]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {metric.label}
              </Text>
            )}
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  metricTabs: {
    flexDirection: 'row',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
    overflow: 'hidden',
  },
  metricTabFlex: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  metricTab: {
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.ui.card,
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 10,
  },
  metricTabDivider: {
    borderRightWidth: 1,
    borderRightColor: theme.ui.border,
  },
  metricTabActive: {
    backgroundColor: theme.ui.muted,
  },
  metricTabLine: {
    width: '60%',
    height: 3,
    borderRadius: 2,
    marginBottom: 6,
  },
  metricTabTextStack: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  metricTabText: {
    color: theme.ui.mutedForeground,
    fontSize: 10,
    fontWeight: '700',
    width: '100%',
    textAlign: 'center',
    lineHeight: 12,
  },
  metricTabTextActive: {
    color: theme.ui.foreground,
  },
})
