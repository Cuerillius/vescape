import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Svg, { Polyline } from 'react-native-svg'

import { Text } from '@/components/base/Text'
import { theme } from '@/constants/theme'
import { DASH } from '@/helpers/format'
import { useResolvedColor } from '@/hooks/useTheme'

export interface SpringTraceSample {
  t: number
  position: number
  target: number
}

interface SpringTraceChartProps {
  label: string
  samples: SpringTraceSample[]
  windowMs: number
  height?: number
  format?: (value: number) => string
}

const DEFAULT_HEIGHT = 72
const INSET = 3
const MIN_SPAN = 1e-6

/**
 * Two-series scope: spring position against its target over a rolling window.
 * `Sparkline` only draws a single series, so tuning needs its own chart.
 */
export function SpringTraceChart({
  label,
  samples,
  windowMs,
  height = DEFAULT_HEIGHT,
  format = (v) => v.toFixed(4),
}: SpringTraceChartProps) {
  const [width, setWidth] = useState(0)
  // Svg strokes take plain strings, so the adaptive tokens are resolved first.
  const positionStroke = useResolvedColor(theme.ui.foreground)
  const targetStroke = useResolvedColor(theme.ui.faintForeground)
  const last = samples[samples.length - 1]

  let points = ''
  let targets = ''
  if (width > 0 && samples.length > 1 && last) {
    const tMax = last.t
    const tMin = tMax - windowMs
    let lo = Number.POSITIVE_INFINITY
    let hi = Number.NEGATIVE_INFINITY
    for (const s of samples) {
      lo = Math.min(lo, s.position, s.target)
      hi = Math.max(hi, s.position, s.target)
    }
    if (hi - lo < MIN_SPAN) {
      const mid = (hi + lo) / 2
      lo = mid - MIN_SPAN
      hi = mid + MIN_SPAN
    }
    const x = (t: number) => ((t - tMin) / windowMs) * width
    const y = (v: number) => height - INSET - ((v - lo) / (hi - lo)) * (height - INSET * 2)
    for (const s of samples) {
      points += `${x(s.t).toFixed(1)},${y(s.position).toFixed(1)} `
      targets += `${x(s.t).toFixed(1)},${y(s.target).toFixed(1)} `
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.readout}>
          <Text style={styles.position}>{last ? format(last.position) : DASH}</Text>
          <Text style={styles.separator}> / </Text>
          <Text style={styles.target}>{last ? format(last.target) : DASH}</Text>
        </Text>
      </View>
      <View
        style={[styles.plot, { height }]}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      >
        <Svg width={width} height={height}>
          <Polyline
            points={targets.trim()}
            fill="none"
            stroke={targetStroke}
            strokeWidth={1}
            strokeDasharray="3,3"
          />
          <Polyline points={points.trim()} fill="none" stroke={positionStroke} strokeWidth={1.5} />
        </Svg>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '500',
  },
  readout: { fontSize: 12, fontFamily: theme.mono('500') },
  position: { color: theme.ui.foreground },
  separator: { color: theme.ui.faintForeground },
  target: { color: theme.ui.mutedForeground },
  plot: {
    backgroundColor: theme.ui.muted,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.ui.border,
    overflow: 'hidden',
  },
})
