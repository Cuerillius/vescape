import { Pressable, StyleSheet, View } from 'react-native'
import type { RefloatConfigField } from 'vescape-core'

import { Text } from '@/components/base/Text'
import { interaction, theme } from '@/constants/theme'
import { TuneTileFill } from '@/modules/tune/components/TuneTileFill'
import { formatTuneValue, tuneDisplayValue } from '@/modules/tune/lib/fields'

interface TuneConfigCellProps {
  field: RefloatConfigField
  onPress: () => void
}

/** One raw field as a flat tile: its name, its value, and where that sits in the range. */
export function TuneConfigCell({ field, onPress }: TuneConfigCellProps) {
  const shownValue = formatTuneValue(tuneDisplayValue(field.id, field.value))
  const fraction =
    typeof field.value === 'number' &&
    Number.isFinite(field.value) &&
    field.min != null &&
    field.max != null &&
    Number.isFinite(field.min) &&
    Number.isFinite(field.max) &&
    field.max > field.min
      ? (field.value - field.min) / (field.max - field.min)
      : null

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${field.label}, ${shownValue}`}
      onPress={onPress}
      android_ripple={interaction.ripple}
      style={({ pressed }) => [styles.cell, pressed ? styles.pressed : null]}
    >
      <View style={styles.header}>
        <Text style={styles.label} numberOfLines={2}>
          {field.label}
        </Text>
      </View>
      <View>
        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit selectable>
          {shownValue}
        </Text>
      </View>
      <TuneTileFill fraction={fraction} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    minHeight: 92,
    justifyContent: 'space-between',
    gap: 8,
    padding: 12,
    paddingBottom: 14,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
    overflow: 'hidden',
  },
  pressed: { backgroundColor: theme.ui.muted },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  label: { flex: 1, color: theme.ui.mutedForeground, fontSize: 13, fontWeight: '600' },
  value: {
    color: theme.ui.foreground,
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
})
