import { Pressable, StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { interaction, theme } from '@/constants/theme'
import type {
  ChartTabMetricDef,
  ChartToggleMetric,
} from '@/modules/history/components/historyChartMetrics'

interface HistoryMetricChipsProps {
  activeCharts: ReadonlySet<ChartToggleMetric>
  onToggle: (metric: ChartToggleMetric) => void
  metrics: readonly ChartTabMetricDef[]
  /** Buttons per row; the rest wrap onto the next one. */
  columns: number
}

/**
 * Chart toggles as a grid of separate buttons: each is its own bordered, raised key rather than a
 * cell of one strip, so it reads as something to press. The line on top is the chart's colour and
 * lights up while it is on, which also makes the grid the chart legend.
 */
export function HistoryMetricChips({
  activeCharts,
  onToggle,
  metrics,
  columns,
}: HistoryMetricChipsProps) {
  const rows: ChartTabMetricDef[][] = []
  for (let i = 0; i < metrics.length; i += columns) rows.push(metrics.slice(i, i + columns))

  return (
    <View style={styles.grid}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((metric) => {
            const active = activeCharts.has(metric.key)
            const label = metric.tabLabel ?? metric.label
            const lines = metric.tabLabel ? null : metric.multilineLabel
            return (
              <Pressable
                key={metric.key}
                testID={`history-metric-tab-${metric.key}`}
                accessibilityRole="button"
                accessibilityLabel={metric.label}
                accessibilityState={{ selected: active }}
                android_ripple={interaction.ripple}
                style={({ pressed }) => [
                  styles.chip,
                  active && styles.chipActive,
                  pressed && styles.chipPressed,
                ]}
                onPress={() => onToggle(metric.key)}
              >
                <View
                  style={[
                    styles.line,
                    { backgroundColor: active ? metric.color : theme.ui.faintForeground },
                  ]}
                />
                {lines ? (
                  <View style={styles.labelStack}>
                    <ChipLabel text={lines[0]} active={active} />
                    <ChipLabel text={lines[1]} active={active} />
                  </View>
                ) : (
                  <ChipLabel text={label} active={active} />
                )}
              </Pressable>
            )
          })}
        </View>
      ))}
    </View>
  )
}

function ChipLabel({ text, active }: { text: string; active: boolean }) {
  return (
    <Text
      style={[styles.label, active && styles.labelActive]}
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {text}
    </Text>
  )
}

const styles = StyleSheet.create({
  grid: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    paddingVertical: 6,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
    overflow: 'hidden',
  },
  chipActive: {
    backgroundColor: theme.ui.muted,
  },
  chipPressed: {
    opacity: 0.7,
  },
  line: {
    width: '60%',
    height: 3,
    borderRadius: 2,
    marginBottom: 5,
  },
  labelStack: {
    width: '100%',
    gap: 1,
  },
  label: {
    width: '100%',
    textAlign: 'center',
    color: theme.ui.mutedForeground,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  labelActive: {
    color: theme.ui.foreground,
  },
})
