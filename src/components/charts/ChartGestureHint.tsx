import IconArrowsHorizontal from '@tabler/icons-react-native/IconArrowsHorizontal'
import IconArrowsMaximize from '@tabler/icons-react-native/IconArrowsMaximize'
import IconHandFinger from '@tabler/icons-react-native/IconHandFinger'
import type { Icon } from '@tabler/icons-react-native'
import { StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

const HINTS: { icon: Icon; label: string }[] = [
  { icon: IconArrowsMaximize, label: 'Pinch to zoom' },
  { icon: IconArrowsHorizontal, label: 'Two fingers to pan' },
  { icon: IconHandFinger, label: 'Drag to read' },
]

/**
 * Says what the fingers can do to a chart stack. `compact` shrinks it onto the history panel's
 * legend row. The gestures themselves are discoverable only by
 * trying them — see {@link useChartGestures} — so the stack says it once, quietly, underneath.
 */
export function ChartGestureHint({ compact = false }: { compact?: boolean }) {
  const iconColor = useResolvedColor(theme.ui.faintForeground)
  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      {HINTS.map(({ icon: HintIcon, label }) => (
        <View key={label} style={styles.hint}>
          <HintIcon size={compact ? 9 : 12} color={iconColor} strokeWidth={2.5} />
          <Text style={[styles.label, compact && styles.labelCompact]}>{label}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    paddingTop: 2,
  },
  rowCompact: {
    gap: 8,
    paddingTop: 0,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    color: theme.ui.faintForeground,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  /** Sized to sit on the legend row of the history panel, whose type runs smaller. */
  labelCompact: {
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 0,
  },
})
