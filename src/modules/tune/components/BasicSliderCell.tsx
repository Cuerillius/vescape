import { Pressable, StyleSheet, View } from 'react-native'
import type { Icon } from '@tabler/icons-react-native'

import { Text } from '@/components/base/Text'
import { interaction, theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import { TuneTileFill } from '@/modules/tune/components/TuneTileFill'
import type { BasicSliderItem } from '@/modules/tune/lib/sliderDefinitions'
import { clamp, formatSliderValue } from '@/modules/tune/lib/sliderDefinitions'

interface BasicSliderCellProps {
  item: BasicSliderItem
  icon: Icon
  editable: boolean
  onPress: () => void
}

/** One basic slider as a flat tile: its name, its value, and where that sits in the range. */
export function BasicSliderCell({
  item,
  icon: IconComponent,
  editable,
  onPress,
}: BasicSliderCellProps) {
  const iconColor = useResolvedColor(theme.ui.mutedForeground)
  const fraction =
    item.value == null ? 0 : clamp((item.value - item.min) / (item.max - item.min), 0, 1)

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.label}, ${formatSliderValue(item)}`}
      disabled={!editable}
      onPress={onPress}
      android_ripple={interaction.ripple}
      style={({ pressed }) => [
        styles.cell,
        pressed ? styles.pressed : null,
        item.value == null ? styles.missing : null,
        !editable ? styles.readOnly : null,
      ]}
    >
      <View style={styles.header}>
        <IconComponent size={16} color={iconColor} />
        <Text style={styles.label} numberOfLines={1}>
          {item.label}
        </Text>
      </View>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {formatSliderValue(item)}
      </Text>
      <TuneTileFill fraction={fraction} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    minHeight: 92,
    justifyContent: 'space-between',
    padding: 12,
    paddingBottom: 14,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
    overflow: 'hidden',
  },
  pressed: { backgroundColor: theme.ui.muted },
  missing: { borderStyle: 'dashed' },
  readOnly: { opacity: 0.6 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { flex: 1, color: theme.ui.mutedForeground, fontSize: 13, fontWeight: '600' },
  value: {
    color: theme.ui.foreground,
    fontSize: 26,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
})
