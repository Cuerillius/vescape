import type { ReactNode } from 'react'
import { Pressable, StyleSheet, type StyleProp, type TextProps, type ViewStyle } from 'react-native'

import { Text } from '@/components/base/Text'
import { interaction, theme } from '@/constants/theme'

interface CardProps {
  children: ReactNode
  /** Makes the whole card a button. */
  onPress?: () => void
  accessibilityLabel?: string
  style?: StyleProp<ViewStyle>
  testID?: string
}

/** Bordered surface that groups related content. Pressable when `onPress` is given. */
export function Card({ children, onPress, accessibilityLabel, style, testID }: CardProps) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      android_ripple={onPress ? interaction.ripple : undefined}
      style={({ pressed }) => [styles.card, style, pressed && onPress ? styles.pressed : null]}
      testID={testID}
    >
      {children}
    </Pressable>
  )
}

/** Card heading: semibold, tight. */
export function CardTitle({ style, ...rest }: TextProps) {
  return <Text numberOfLines={1} style={[styles.title, style]} {...rest} />
}

/** Small muted caption, used above a value or under a title. */
export function CardDescription({ style, ...rest }: TextProps) {
  return <Text numberOfLines={1} style={[styles.description, style]} {...rest} />
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.ui.card,
    borderColor: theme.ui.border,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  pressed: {
    backgroundColor: theme.ui.muted,
  },
  title: {
    color: theme.ui.foreground,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  description: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '500',
  },
})
