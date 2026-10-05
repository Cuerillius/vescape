import { Pressable, StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { interaction, theme } from '@/constants/theme'

export interface ToggleGroupOption<Key extends string> {
  key: Key
  label: string
  testID?: string
}

interface ToggleGroupProps<Key extends string> {
  activeKey: Key
  options: readonly ToggleGroupOption<Key>[]
  onSelect: (key: Key) => void
  testID?: string
}

/** Text choice between a few options, e.g. All time / This month. The active one inverts to the primary pair. */
export function ToggleGroup<Key extends string>({
  activeKey,
  options,
  onSelect,
  testID,
}: ToggleGroupProps<Key>) {
  return (
    <View style={styles.container} accessibilityRole="tablist" testID={testID}>
      {options.map((option) => {
        const active = option.key === activeKey
        return (
          <Pressable
            key={option.key}
            testID={option.testID}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(option.key)}
            style={({ pressed }) => [
              styles.option,
              active && styles.optionActive,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
    flexDirection: 'row',
    padding: 3,
    gap: 2,
    borderRadius: theme.radius.md + 3,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
  },
  option: {
    flexShrink: 1,
    height: 30,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
  },
  optionActive: { backgroundColor: theme.ui.primary },
  pressed: { opacity: interaction.pressedOpacity },
  label: { color: theme.ui.mutedForeground, fontSize: 13, fontWeight: '600' },
  labelActive: { color: theme.ui.primaryForeground },
})
