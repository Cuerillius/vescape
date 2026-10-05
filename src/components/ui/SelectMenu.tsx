import { useCallback, useRef, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import IconCheck from '@tabler/icons-react-native/IconCheck'
import IconChevronDown from '@tabler/icons-react-native/IconChevronDown'

import { Text } from '@/components/base/Text'
import { Dropdown } from '@/components/forms/Dropdown'
import { interaction, theme } from '@/constants/theme'

const MAX_MENU_HEIGHT = 280
const MENU_MIN_WIDTH = 220

export interface SelectMenuOption<Value extends string> {
  value: Value
  label: string
}

interface SelectMenuProps<Value extends string> {
  options: readonly SelectMenuOption<Value>[]
  value: Value
  onChange: (value: Value) => void
  /** Caption on the left; without it the trigger stands alone. */
  label?: string
  /** Names the trigger for screen readers when there is no `label`. */
  accessibilityLabel?: string
  /** Shortens the chosen option for the trigger; the menu still lists full labels. */
  triggerText?: (option: SelectMenuOption<Value>) => string
  /** Ids the trigger; each option is `${testID}-option-${value}`. */
  testID?: string
  /** Drops the trigger's own border and fills the width, to sit inside a bordered bar. */
  flat?: boolean
}

/** Outlined trigger that opens a menu of options; the chosen one carries a check. */
export function SelectMenu<Value extends string>({
  options,
  value,
  onChange,
  label,
  accessibilityLabel,
  triggerText,
  testID,
  flat,
}: SelectMenuProps<Value>) {
  const triggerRef = useRef<View>(null)
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value)

  const handleSelect = useCallback(
    (next: Value) => {
      onChange(next)
      setOpen(false)
    },
    [onChange],
  )

  return (
    <View style={[styles.row, flat && styles.flatRow]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        ref={triggerRef}
        accessibilityRole="button"
        accessibilityLabel={`${label ?? accessibilityLabel ?? 'Select'}: ${selected?.label ?? 'none'}`}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        testID={testID}
        style={({ pressed }) => [
          styles.trigger,
          flat && styles.flatTrigger,
          pressed && { opacity: interaction.pressedOpacity },
        ]}
      >
        <Text style={styles.value} numberOfLines={1}>
          {selected ? (triggerText?.(selected) ?? selected.label) : 'Select…'}
        </Text>
        <IconChevronDown size={14} color={theme.ui.mutedForeground} />
      </Pressable>
      <Dropdown
        visible={open}
        triggerRef={triggerRef}
        onClose={() => setOpen(false)}
        maxHeight={MAX_MENU_HEIGHT}
        matchTriggerWidth={false}
        minWidth={MENU_MIN_WIDTH}
        panelStyle={styles.panel}
      >
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <Pressable
                key={option.value}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: isSelected }}
                onPress={() => handleSelect(option.value)}
                testID={testID ? `${testID}-option-${option.value}` : undefined}
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
              >
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {option.label}
                </Text>
                {isSelected ? <IconCheck size={16} color={theme.ui.foreground} /> : null}
              </Pressable>
            )
          })}
        </ScrollView>
      </Dropdown>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  label: { color: theme.ui.mutedForeground, fontSize: 13 },
  trigger: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
  },
  flatRow: { flex: 1 },
  flatTrigger: {
    flex: 1,
    justifyContent: 'center',
    height: 44,
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  value: { flexShrink: 1, color: theme.ui.foreground, fontSize: 13, fontWeight: '500' },
  panel: {
    padding: 4,
    borderRadius: theme.radius.lg,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
  },
  optionPressed: { backgroundColor: theme.ui.muted },
  optionText: { flexShrink: 1, color: theme.ui.foreground, fontSize: 14 },
  optionTextSelected: { fontWeight: '600' },
})
