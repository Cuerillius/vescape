import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import IconChevronRight from '@tabler/icons-react-native/IconChevronRight'
import type { Icon as TablerIcon } from '@tabler/icons-react-native'

import { Text } from '@/components/base/Text'
import { interaction, theme, type ThemeColor } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

/** One tappable line of a card: icon, label, an optional value or badge, and a chevron. */
export function NavRow({
  icon: IconComponent,
  label,
  value,
  accent,
  badge,
  onPress,
  testID,
}: {
  icon: TablerIcon
  label: string
  value?: string
  /** Calls the row out, e.g. orange while something is wrong: tinted row, bold label. */
  accent?: ThemeColor
  badge?: ReactNode
  onPress: () => void
  testID?: string
}) {
  const mutedColor = useResolvedColor(theme.ui.mutedForeground)
  const accentColor = useResolvedColor(accent ?? theme.ui.mutedForeground)
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      onPress={onPress}
      android_ripple={interaction.ripple}
      style={({ pressed }) => [
        styles.row,
        accent && { backgroundColor: theme.alpha(accentColor, 0.12) },
        pressed && styles.pressed,
      ]}
      testID={testID}
    >
      <IconComponent size={22} color={accentColor} />
      <Text
        style={[styles.label, accent && { color: accentColor, fontWeight: '800' }]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {value ? (
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {badge ? <View style={styles.badge}>{badge}</View> : null}
      <IconChevronRight size={18} color={mutedColor} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  // Badges pin themselves to the top of their parent; the row centres its contents.
  badge: {
    alignSelf: 'center',
  },
  pressed: {
    backgroundColor: theme.ui.muted,
  },
  label: {
    flexShrink: 1,
    flexGrow: 1,
    color: theme.ui.foreground,
    fontSize: 16,
    fontWeight: '600',
  },
  value: {
    flexShrink: 1,
    color: theme.ui.mutedForeground,
    fontSize: 14,
    fontWeight: '500',
  },
})
