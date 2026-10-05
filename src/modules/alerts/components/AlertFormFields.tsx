import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import { type AlertSound, previewAlertSound } from 'vescape-core'

import { Text } from '@/components/base/Text'
import { CardDescription } from '@/components/ui/Card'
import { ToggleGroup } from '@/components/ui/ToggleGroup'
import { theme } from '@/constants/theme'

/**
 * Repeat cadences offered to the rider, with `Off` as the one-shot choice. Deliberately coarse: the
 * difference between 12s and 15s is not a choice anyone can make meaningfully in a settings screen,
 * and native floors the value regardless.
 */
const REPEAT_INTERVAL_CHOICES = [5, 10, 30, 60] as const

const REPEAT_OPTIONS = [
  { key: 'off', label: 'Off' },
  ...REPEAT_INTERVAL_CHOICES.map((seconds) => ({ key: String(seconds), label: `${seconds}s` })),
]

/** A caption above one control of the alert form, with an optional hint below it. */
export function AlertField({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <View style={styles.field}>
      <CardDescription>{label}</CardDescription>
      {children}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  )
}

/** Repeat cadence for a single-threshold rule; `Off` is the one-shot choice. */
export function RepeatField({
  value,
  onChange,
}: {
  value: number | null
  onChange: (next: number | null) => void
}) {
  return (
    <AlertField
      label="Repeat"
      hint={
        value == null
          ? 'Announces once, then again only after it drops back down'
          : `Keeps announcing every ${value}s while past the threshold`
      }
    >
      <View style={styles.toggle}>
        <ToggleGroup
          activeKey={value == null ? 'off' : String(value)}
          options={REPEAT_OPTIONS}
          onSelect={(key) => onChange(key === 'off' ? null : Number(key))}
        />
      </View>
    </AlertField>
  )
}

/** Picks one preset sound and plays it as a preview. */
export function SoundField({
  presets,
  selected,
  onSelect,
}: {
  presets: AlertSound[]
  selected: string
  onSelect: (uri: string) => void
}) {
  return (
    <AlertField label="Sound">
      <View style={styles.toggle}>
        <ToggleGroup
          activeKey={selected}
          options={presets.map((preset) => ({ key: preset.uri, label: preset.name }))}
          onSelect={(uri) => {
            onSelect(uri)
            previewAlertSound(uri)
          }}
        />
      </View>
    </AlertField>
  )
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  toggle: { flexDirection: 'row' },
  hint: { color: theme.ui.mutedForeground, fontSize: 12, fontWeight: '500' },
})
