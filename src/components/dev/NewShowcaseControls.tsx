import { Pressable, StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { theme } from '@/constants/theme'

interface NewChipRowProps {
  label: string
  options: string[]
  selected: string
  onSelect: (v: string) => void
}

/** `ChipRow`, restyled on the zinc `theme.ui` tokens for the rebuilt-kit showcase. */
export function NewChipRow({ label, options, selected, onSelect }: NewChipRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chips}>
        {options.map((o) => (
          <Pressable
            key={o}
            style={[styles.chip, o === selected && styles.chipActive]}
            onPress={() => onSelect(o)}
          >
            <Text style={[styles.chipText, o === selected && styles.chipTextActive]}>{o}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 28,
    gap: 8,
  },
  label: {
    color: theme.ui.mutedForeground,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  chips: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 4,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.md,
    backgroundColor: theme.ui.muted,
    borderWidth: 1,
    borderColor: theme.ui.border,
  },
  chipActive: {
    backgroundColor: theme.ui.primary,
    borderColor: theme.ui.primary,
  },
  chipText: {
    color: theme.ui.mutedForeground,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  chipTextActive: {
    color: theme.ui.primaryForeground,
  },
})

/** An on/off switch as a two-chip row, so a boolean control reads like every other control. */
export function NewToggleRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <NewChipRow
      label={label}
      options={['On', 'Off']}
      selected={value ? 'On' : 'Off'}
      onSelect={(option) => onChange(option === 'On')}
    />
  )
}
