import type { ComponentType } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native'

import { Text } from '@/components/base/Text'
import { interaction, theme, type ThemeColor } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

/**
 * `floating` is an outline button on the card surface, for controls that sit over a map. `primary`
 * is the one filled button of a view: the action the rider most likely wants.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'floating'

interface ButtonProps {
  onPress: () => void
  /** Visible label. Icon-only buttons omit it and must pass `accessibilityLabel`. */
  label?: string
  icon?: ComponentType<{ size: number; color: string }>
  variant?: ButtonVariant
  /**
   * `lg` is 44 high, the height of a text field, for controls that sit beside one. `xl` is 52 high,
   * for a map's primary action.
   */
  size?: 'default' | 'lg' | 'xl'
  /** Tints icon and label, e.g. an active warning state. Neutral when omitted. */
  color?: ThemeColor
  disabled?: boolean
  /** Swaps the icon for a spinner and ignores presses while work is running. */
  loading?: boolean
  accessibilityLabel?: string
  style?: StyleProp<ViewStyle>
  testID?: string
}

/** shadcn-style button. Square when it carries only an icon. */
export function Button({
  onPress,
  label,
  icon: IconComponent,
  variant = 'outline',
  size = 'default',
  color,
  disabled,
  loading,
  accessibilityLabel,
  style,
  testID,
}: ButtonProps) {
  const contentColor =
    color ?? (variant === 'primary' ? theme.ui.primaryForeground : theme.ui.foreground)
  const iconColor = useResolvedColor(contentColor)
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled, busy: loading }}
      disabled={disabled || loading}
      hitSlop={4}
      onPress={onPress}
      android_ripple={interaction.ripple}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        label ? styles.withLabel : styles.iconOnly,
        size === 'lg' && (label ? styles.heightLg : styles.iconOnlyLg),
        size === 'xl' && (label ? styles.heightXl : styles.iconOnlyXl),
        pressed ? (variant === 'primary' ? styles.pressedPrimary : styles.pressed) : null,
        disabled ? styles.disabled : null,
        style,
      ]}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : IconComponent ? (
        <IconComponent size={size === 'xl' ? 26 : size === 'lg' ? 22 : 18} color={iconColor} />
      ) : null}
      {label ? (
        <Text style={[styles.label, { color: contentColor }]} numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  primary: {
    backgroundColor: theme.ui.primary,
    borderColor: theme.ui.primary,
  },
  secondary: {
    backgroundColor: theme.ui.muted,
    borderColor: theme.ui.muted,
  },
  outline: {
    borderColor: theme.ui.border,
  },
  floating: {
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
  },
  ghost: {},
  withLabel: {
    paddingHorizontal: 14,
  },
  iconOnly: {
    width: 36,
  },
  heightLg: {
    height: 44,
  },
  iconOnlyLg: {
    width: 44,
    height: 44,
  },
  heightXl: {
    height: 52,
  },
  iconOnlyXl: {
    width: 52,
    height: 52,
  },
  pressed: {
    backgroundColor: theme.ui.muted,
  },
  pressedPrimary: {
    opacity: interaction.pressedOpacity,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
})
