import { StyleSheet, View } from 'react-native'
import type { Icon as TablerIcon } from '@tabler/icons-react-native'

import { Text } from '@/components/base/Text'
import { theme, type ThemeColor } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

export type BadgeVariant = 'secondary' | 'outline'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  /** Leading status dot. */
  dot?: ThemeColor
  icon?: TablerIcon
  /** Tints label and icon, e.g. a destructive state. Neutral when omitted. */
  color?: ThemeColor
  testID?: string
}

/** Compact pill for a state or tag. */
export function Badge({
  label,
  variant = 'secondary',
  dot,
  icon: IconComponent,
  color,
  testID,
}: BadgeProps) {
  const contentColor = color ?? theme.ui.foreground
  const iconColor = useResolvedColor(contentColor)
  return (
    <View style={[styles.badge, styles[variant]]} testID={testID}>
      {dot ? <View style={[styles.dot, { backgroundColor: dot }]} /> : null}
      {IconComponent ? <IconComponent size={14} color={iconColor} strokeWidth={2.5} /> : null}
      <Text style={[styles.label, { color: contentColor }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  secondary: {
    backgroundColor: theme.ui.muted,
    borderColor: theme.ui.muted,
  },
  outline: {
    borderColor: theme.ui.border,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
})
