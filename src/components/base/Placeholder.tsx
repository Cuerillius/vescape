import type { ComponentType, ReactNode } from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import { Text } from '@/components/base/Text'
import { theme, type ThemeColor } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

interface PlaceholderProps {
  icon: ComponentType<{ size: number; color: string; strokeWidth?: number }>
  title?: string
  description: string
  iconColor?: ThemeColor
  action?: ReactNode
  /** Sized for an empty section inside a list or drawer rather than a whole empty screen. */
  compact?: boolean
  style?: ViewStyle
}

/** Empty state: a bordered icon tile over a title and a muted description. */
export function Placeholder({
  icon: IconComponent,
  title,
  description,
  iconColor = theme.ui.mutedForeground,
  action,
  compact = false,
  style,
}: PlaceholderProps) {
  const resolvedIconColor = useResolvedColor(iconColor)
  return (
    <View style={[styles.container, compact && styles.containerCompact, style]}>
      <View style={[styles.tile, compact && styles.tileCompact]}>
        <IconComponent size={compact ? 20 : 26} color={resolvedIconColor} strokeWidth={2} />
      </View>
      <View style={styles.textBlock}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <Text style={styles.description}>{description}</Text>
      </View>
      {action}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    gap: 16,
  },
  containerCompact: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 12,
  },
  tile: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.muted,
  },
  tileCompact: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
  },
  textBlock: {
    alignItems: 'center',
    gap: 4,
  },
  title: {
    color: theme.ui.foreground,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    color: theme.ui.mutedForeground,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
})
