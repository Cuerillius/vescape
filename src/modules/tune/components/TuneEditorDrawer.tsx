import { useMemo, useState } from 'react'
import { Keyboard, StyleSheet, View } from 'react-native'
import IconKeyboard from '@tabler/icons-react-native/IconKeyboard'
import IconRuler2 from '@tabler/icons-react-native/IconRuler2'

import { Text } from '@/components/base/Text'
import { Accordion, type AccordionItem } from '@/components/ui/Accordion'
import { Drawer } from '@/components/ui/Drawer'
import { Input } from '@/components/ui/Input'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { theme } from '@/constants/theme'
import { TuneDial } from '@/modules/tune/components/TuneDial'
import { formatTuneValue } from '@/modules/tune/lib/fields'
import { parseManualTuneValue } from '@/modules/tune/lib/manualTuneValue'
import { snapValue, type LinkedFieldPreview } from '@/modules/tune/lib/sliderDefinitions'

export interface FieldEditorTarget {
  label: string
  description?: string
  fieldId: string
  value: number
  min: number
  max: number
  step: number
  manualDecimals?: number
  unit: string | null
  help: string
  linkedFields?: LinkedFieldPreview[]
}

type EditorMode = 'ruler' | 'manual'

const MODE_OPTIONS = [
  { key: 'ruler', label: 'Ruler', icon: IconRuler2 },
  { key: 'manual', label: 'Type the value', icon: IconKeyboard },
] as const

/**
 * Bottom drawer that edits one value. There is no Apply: the value is committed, and so saved,
 * when the drawer closes, whichever way it closes.
 */
export function TuneEditorDrawer({
  target,
  onCommit,
  onClose,
}: {
  target: FieldEditorTarget | null
  onCommit: (value: number, linkedFieldValues?: Record<string, number>) => void
  onClose: () => void
}) {
  // The last target stays rendered while the drawer slides away, and each new one starts fresh.
  const [held, setHeld] = useState(target)
  const [session, setSession] = useState(0)
  if (target && target !== held) {
    setHeld(target)
    setSession((current) => current + 1)
  }
  if (!held) return null

  return (
    <EditorSession
      key={session}
      target={held}
      visible={target != null}
      onCommit={onCommit}
      onClose={onClose}
    />
  )
}

function EditorSession({
  target,
  visible,
  onCommit,
  onClose,
}: {
  target: FieldEditorTarget
  visible: boolean
  onCommit: (value: number, linkedFieldValues?: Record<string, number>) => void
  onClose: () => void
}) {
  const [draftValue, setDraftValue] = useState(target.value)
  const [mode, setMode] = useState<EditorMode>('ruler')
  const [manualText, setManualText] = useState(String(target.value))
  const [editedLinked, setEditedLinked] = useState<Record<string, true>>({})
  const [linkedDrafts, setLinkedDrafts] = useState<Record<string, string>>({})
  const decimals = target.manualDecimals ?? 3
  const manual = parseManualTuneValue(manualText, decimals)
  const manualError = mode === 'manual' ? manual.error : null
  const outsideRange = draftValue < target.min || draftValue > target.max
  const range = `${formatTuneValue(target.min)} to ${formatTuneValue(target.max)}${
    target.unit ? ` ${target.unit}` : ''
  }`

  const linkedFields = useMemo(() => target.linkedFields ?? [], [target.linkedFields])
  const computedLinked = useMemo(
    () =>
      Object.fromEntries(
        linkedFields.map((field) => [
          field.id,
          draftValue === target.value
            ? (field.currentValue ?? field.computeValue(draftValue))
            : field.computeValue(draftValue),
        ]),
      ) as Record<string, number>,
    [draftValue, linkedFields, target.value],
  )
  const linkedText = (id: string) =>
    editedLinked[id] ? (linkedDrafts[id] ?? '') : formatTuneValue(computedLinked[id])
  const linkedValue = (id: string, min: number, max: number, step: number) => {
    const parsed = Number.parseFloat(linkedText(id))
    return Number.isFinite(parsed) ? snapValue(parsed, min, max, step) : computedLinked[id]
  }

  const changeMode = (next: EditorMode) => {
    if (next === mode) return
    if (next === 'manual') {
      setManualText(String(draftValue))
    } else {
      // An invalid typed value has to be fixed before leaving manual entry.
      if (manual.error) return
      Keyboard.dismiss()
    }
    setMode(next)
  }
  const changeManualText = (text: string) => {
    setManualText(text)
    const parsed = parseManualTuneValue(text, decimals)
    if (parsed.error === null) setDraftValue(parsed.value)
  }

  const close = () => {
    Keyboard.dismiss()
    const changed = draftValue !== target.value || Object.keys(editedLinked).length > 0
    if (manualError || !changed) {
      onClose()
      return
    }
    const linkedValues = Object.fromEntries(
      linkedFields.flatMap((field) =>
        editedLinked[field.id]
          ? [[field.id, linkedValue(field.id, field.min, field.max, field.step)]]
          : [],
      ),
    )
    onCommit(draftValue, Object.keys(linkedValues).length > 0 ? linkedValues : undefined)
  }

  const sections: AccordionItem[] = [
    ...(linkedFields.length > 0
      ? [
          {
            key: 'linked',
            title: 'Linked fields',
            content: (
              <View style={styles.linkedGrid}>
                {linkedFields.map((field) => (
                  <View key={field.id} style={styles.linkedCell}>
                    <Text style={styles.linkedLabel} numberOfLines={2}>
                      {field.label}
                      {field.unit ? ` (${field.unit})` : ''}
                    </Text>
                    <Input
                      style={styles.linkedInput}
                      value={linkedText(field.id)}
                      keyboardType="decimal-pad"
                      selectTextOnFocus
                      onChangeText={(text) => {
                        setEditedLinked((current) => ({ ...current, [field.id]: true }))
                        setLinkedDrafts((current) => ({ ...current, [field.id]: text }))
                      }}
                      onBlur={() =>
                        setLinkedDrafts((current) => ({
                          ...current,
                          [field.id]: formatTuneValue(
                            linkedValue(field.id, field.min, field.max, field.step),
                          ),
                        }))
                      }
                    />
                  </View>
                ))}
              </View>
            ),
          },
        ]
      : []),
    {
      key: 'details',
      title: 'Setting details',
      content: (
        <View style={styles.details}>
          <Text style={styles.help}>{target.help}</Text>
          <DetailRow label="Field" value={target.fieldId} />
          <DetailRow label="Range" value={range} />
        </View>
      ),
    },
  ]

  return (
    <Drawer
      visible={visible}
      title={target.label}
      description={target.description}
      headerRight={
        <SegmentedControl activeKey={mode} options={MODE_OPTIONS} onSelect={changeMode} />
      }
      onClose={close}
    >
      <View style={styles.body}>
        {mode === 'manual' ? (
          <View style={styles.manual}>
            <View style={styles.manualRow}>
              <Input
                testID="tune-manual-value"
                accessibilityLabel="Tune value"
                value={manualText}
                onChangeText={changeManualText}
                selectTextOnFocus
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                style={styles.manualInput}
              />
              {target.unit ? <Text style={styles.unit}>{target.unit}</Text> : null}
            </View>
            <Text style={styles.help}>Range: {range}</Text>
            {manualError ? (
              <Text accessibilityLiveRegion="polite" style={styles.error}>
                {manualError}
              </Text>
            ) : null}
          </View>
        ) : (
          <TuneDial
            value={draftValue}
            previousValue={target.value}
            min={target.min}
            max={target.max}
            step={target.step}
            unit={target.unit}
            color={theme.ui.foreground}
            displayDecimals={Math.max(decimals, String(draftValue).split('.')[1]?.length ?? 0)}
            onValueChange={setDraftValue}
          />
        )}
        {!manualError && outsideRange ? (
          <Text accessibilityLiveRegion="polite" style={styles.warning}>
            Outside the usual range ({range}). Check this value before closing.
          </Text>
        ) : null}
        <Accordion items={sections} defaultOpenKey="" />
      </View>
    </Drawer>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  body: { gap: 16, paddingHorizontal: 16, paddingBottom: 8 },
  manual: { gap: 10, minHeight: 105 },
  manualRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  manualInput: {
    flex: 1,
    height: 56,
    fontSize: 28,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  unit: { color: theme.ui.mutedForeground, fontSize: 15, fontWeight: '600' },
  help: { color: theme.ui.mutedForeground, fontSize: 13, lineHeight: 18 },
  warning: { color: theme.status.warning.text, fontSize: 13 },
  error: { color: theme.status.error.text, fontSize: 13 },
  details: { gap: 10, paddingBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  detailLabel: { color: theme.ui.mutedForeground, fontSize: 13 },
  detailValue: {
    color: theme.ui.foreground,
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  linkedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 12 },
  linkedCell: { width: '31%', minWidth: 90, gap: 4 },
  linkedLabel: { color: theme.ui.mutedForeground, fontSize: 11, lineHeight: 14 },
  linkedInput: {
    height: 38,
    paddingHorizontal: 8,
    fontSize: 13,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
})
