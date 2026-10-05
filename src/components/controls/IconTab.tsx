import type { ComponentType } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { interaction, theme, type ThemeColor } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

/** A Tabler icon, or any glyph drawn to the same props. */
type TabIcon = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>

interface IconTabProps {
  icon: TabIcon
  label: string
  active?: boolean
  /** A presence dot on the icon's corner, e.g. the Board tab while the board has trouble. */
  dotColor?: ThemeColor
  onPress: () => void
  testID?: string
}

/** A single icon-over-label tab, such as one slot in a bottom tab bar. */
export function IconTab({
  icon: IconComponent,
  label,
  active = false,
  dotColor,
  onPress,
  testID,
}: IconTabProps) {
  const color = useResolvedColor(active ? theme.ui.foreground : theme.ui.mutedForeground)
  return (
    <Pressable
      style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      onPress={onPress}
      testID={testID}
    >
      <View>
        <IconComponent size={24} color={color} strokeWidth={active ? 2.5 : 2} />
        {dotColor ? (
          <View
            style={[styles.dot, { backgroundColor: dotColor }]}
            testID={testID ? `${testID}-dot` : undefined}
          />
        ) : null}
      </View>
      <Text style={[styles.label, { color }, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.ui.background,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: {
    fontWeight: '800',
  },
})
