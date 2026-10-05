import { Pressable, StyleSheet, View } from 'react-native'
import type { ComponentType } from 'react'

import { interaction, theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

export interface SegmentedControlOption<Key extends string> {
  key: Key
  label: string
  icon: ComponentType<{ size: number; color: string }>
}

export type SegmentedControlSize = 'default' | 'lg' | 'xl'

interface SegmentedControlProps<Key extends string> {
  activeKey: Key
  options: readonly SegmentedControlOption<Key>[]
  /** `lg` and `xl` match the 44 and 52 high floating buttons beside it. */
  size?: SegmentedControlSize
  onSelect: (key: Key) => void
}

function SegmentedControlItem({
  label,
  icon: IconComponent,
  active,
  size,
  onPress,
}: {
  label: string
  icon: SegmentedControlOption<string>['icon']
  active: boolean
  size: SegmentedControlSize
  onPress: () => void
}) {
  const color = useResolvedColor(active ? theme.ui.primaryForeground : theme.ui.mutedForeground)
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        size === 'lg' && styles.optionLg,
        size === 'xl' && styles.optionXl,
        active && styles.optionActive,
        pressed && styles.pressed,
      ]}
    >
      <IconComponent size={size === 'xl' ? 26 : size === 'lg' ? 22 : 18} color={color} />
    </Pressable>
  )
}

/** Icon-only choice between a few options. The active option inverts to the primary pair. */
export function SegmentedControl<Key extends string>({
  activeKey,
  options,
  size = 'default',
  onSelect,
}: SegmentedControlProps<Key>) {
  return (
    <View style={styles.container}>
      {options.map((option) => (
        <SegmentedControlItem
          key={option.key}
          label={option.label}
          icon={option.icon}
          active={option.key === activeKey}
          size={size}
          onPress={() => onSelect(option.key)}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 3,
    gap: 2,
    borderRadius: theme.radius.md + 3,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
  },
  option: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
  },
  optionLg: { width: 40, height: 36 },
  optionXl: { width: 46, height: 44 },
  optionActive: { backgroundColor: theme.ui.primary },
  pressed: { opacity: interaction.pressedOpacity },
})
