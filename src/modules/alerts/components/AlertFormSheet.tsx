import { useUnitSystem } from '@/hooks/useUnitSystem'
import { speedFromKmh, speedInputToKmh, speedUnit } from '@/helpers/units'
import { useCallback, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { ALERT_BEEP_COUNT_DEFAULT, ALERT_BEEP_COUNT_RANGE, type AlertSoundType } from 'vescape-core'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Stepper } from '@/components/ui/Stepper'
import { theme } from '@/constants/theme'
import { AlertMessageField } from '@/modules/alerts/components/AlertMessageField'
import { AlertField, RepeatField, SoundField } from '@/modules/alerts/components/AlertFormFields'
import {
  getAlertDialConfig,
  getDefaultMessageTemplate,
  getEditFormDefaults,
  getNewFormDefaults,
  getPresetsForCategory,
} from '@/modules/alerts/lib/alertFormDefaults'
import type { AlertRuleDraft } from '@/modules/alerts/store/alertsStore'
import type { DraftAlertRule } from '@/modules/alerts/lib/customAlertRules'
import type { DerivedBatteryConfig } from '@/modules/battery/lib/types'
import type { TelemetryAlertTab as AlertTab } from '@/modules/board/constants/telemetryThresholds'
import { TuneDial } from '@/modules/tune/components/TuneDial'
import IconActivity from '@tabler/icons-react-native/IconActivity'
import IconCheck from '@tabler/icons-react-native/IconCheck'
import IconMessage from '@tabler/icons-react-native/IconMessage'
import IconPlus from '@tabler/icons-react-native/IconPlus'
import IconRadioactive from '@tabler/icons-react-native/IconRadioactive'

interface AlertFormSheetProps {
  visible: boolean
  controlId: string
  unit: string
  editRule: DraftAlertRule | null
  batteryConfig: DerivedBatteryConfig | null
  error: string | null
  onClose(): void
  onSave(draft: AlertRuleDraft): Promise<void>
}

/** Writes one alert rule: its threshold, how it sounds, and how often it repeats. */
export function AlertFormSheet({
  visible,
  controlId,
  unit,
  editRule,
  batteryConfig,
  error,
  onClose,
  onSave,
}: AlertFormSheetProps) {
  const units = useUnitSystem()
  const isSpeed = controlId === 'speed'
  const toDisplay = (value: number) => (isSpeed ? speedFromKmh(value, units) : value)
  const isEditing = editRule != null
  const dialConfig = useMemo(
    () => getAlertDialConfig(controlId, batteryConfig),
    [controlId, batteryConfig],
  )

  const singlePresets = useMemo(() => getPresetsForCategory('single'), [])
  const geigerPresets = useMemo(() => getPresetsForCategory('geiger'), [])
  const defaultSoundType: AlertSoundType = singlePresets[0]?.uri ?? 'preset:beep'
  const geigerDefaultSoundType: AlertSoundType = geigerPresets[0]?.uri ?? 'preset:beep'

  const [tab, setTab] = useState<AlertTab>('single')
  const [threshold, setThreshold] = useState(dialConfig.min)
  const [thresholdMax, setThresholdMax] = useState(dialConfig.max)
  const [soundType, setSoundType] = useState<AlertSoundType>(defaultSoundType)
  const [messageTemplate, setMessageTemplate] = useState(
    getDefaultMessageTemplate(controlId, batteryConfig),
  )
  const [repeatEverySeconds, setRepeatEverySeconds] = useState<number | null>(null)
  const [beepCount, setBeepCount] = useState(ALERT_BEEP_COUNT_DEFAULT)
  const [prevVisible, setPrevVisible] = useState(visible)
  const [saving, setSaving] = useState(false)

  if (visible && !prevVisible) {
    const defaults = editRule
      ? getEditFormDefaults(editRule, dialConfig, batteryConfig)
      : getNewFormDefaults(
          dialConfig,
          defaultSoundType,
          geigerDefaultSoundType,
          controlId,
          batteryConfig,
          units,
        )
    setTab(defaults.tab)
    setThreshold(defaults.threshold)
    setThresholdMax(defaults.thresholdMax)
    setSoundType(defaults.soundType)
    setMessageTemplate(defaults.messageTemplate)
    setRepeatEverySeconds(defaults.repeatEverySeconds)
    setBeepCount(defaults.beepCount)
  }
  if (visible !== prevVisible) {
    setPrevVisible(visible)
  }

  const handleTabSwitch = useCallback(
    (next: AlertTab) => {
      setTab(next)
      if (next === 'message') {
        setMessageTemplate(getDefaultMessageTemplate(controlId, batteryConfig))
      } else {
        const presets = next === 'single' ? singlePresets : geigerPresets
        setSoundType(presets[0]?.uri ?? 'preset:beep')
      }
    },
    [singlePresets, geigerPresets, controlId, batteryConfig],
  )

  const handleSave = useCallback(() => {
    if (saving) return
    const isRange = tab === 'geiger'
    setSaving(true)
    // intentional-suppression: Alerts store error is rendered by the active form or list
    void onSave({
      threshold,
      thresholdMax: isRange ? thresholdMax : null,
      soundType: tab === 'message' ? `tts:${messageTemplate}` : soundType,
      // A range rule's cadence follows range depth, and text-to-speech speaks once per
      // announcement — neither has a beep count or a repeat interval to honor.
      repeatEverySeconds: isRange ? null : repeatEverySeconds,
      beepCount,
    })
      .catch(() => undefined) // The alerts store owns the error rendered below.
      .finally(() => setSaving(false))
  }, [
    tab,
    threshold,
    thresholdMax,
    soundType,
    messageTemplate,
    repeatEverySeconds,
    beepCount,
    onSave,
    saving,
  ])

  return (
    <Drawer
      visible={visible}
      title={isEditing ? 'Edit alert' : 'Add alert'}
      headerRight={
        <SegmentedControl activeKey={tab} options={TYPE_OPTIONS} onSelect={handleTabSwitch} />
      }
      onClose={onClose}
    >
      <View style={styles.body}>
        <AlertField label={tab === 'geiger' ? 'Threshold min' : 'Threshold'}>
          <TuneDial
            key={units}
            value={toDisplay(threshold)}
            previousValue={editRule ? toDisplay(editRule.threshold) : undefined}
            min={toDisplay(dialConfig.min)}
            max={toDisplay(dialConfig.max)}
            step={dialConfig.step}
            unit={isSpeed ? speedUnit(units) : dialConfig.unit}
            displayDecimals={isSpeed ? 1 : undefined}
            indicatorGlow={tab === 'geiger' ? 'right' : undefined}
            color={theme.ui.foreground}
            valueChangeMode="commit"
            onValueChange={(next) =>
              setThreshold(
                isSpeed
                  ? speedInputToKmh(next, threshold, units, dialConfig.min, dialConfig.max)
                  : next,
              )
            }
          />
        </AlertField>

        {tab === 'geiger' && (
          <AlertField label="Threshold max">
            <TuneDial
              key={units}
              value={toDisplay(thresholdMax)}
              previousValue={
                editRule?.thresholdMax != null ? toDisplay(editRule.thresholdMax) : undefined
              }
              min={toDisplay(dialConfig.min)}
              max={toDisplay(dialConfig.max)}
              step={dialConfig.step}
              unit={isSpeed ? speedUnit(units) : dialConfig.unit}
              displayDecimals={isSpeed ? 1 : undefined}
              indicatorGlow="left"
              color={theme.ui.foreground}
              valueChangeMode="commit"
              onValueChange={(next) =>
                setThresholdMax(
                  isSpeed
                    ? speedInputToKmh(next, thresholdMax, units, dialConfig.min, dialConfig.max)
                    : next,
                )
              }
            />
          </AlertField>
        )}

        {tab !== 'geiger' && (
          <RepeatField value={repeatEverySeconds} onChange={setRepeatEverySeconds} />
        )}

        {tab === 'single' && (
          <AlertField label="Beeps">
            <View style={styles.stepper}>
              <Stepper
                value={beepCount}
                min={ALERT_BEEP_COUNT_RANGE.min}
                max={ALERT_BEEP_COUNT_RANGE.max}
                step={1}
                label="beeps"
                onChange={setBeepCount}
              />
            </View>
          </AlertField>
        )}

        {tab === 'message' ? (
          <AlertMessageField
            controlId={controlId}
            unit={unit}
            threshold={threshold}
            dialConfig={dialConfig}
            batteryConfig={batteryConfig}
            messageTemplate={messageTemplate}
            onChangeTemplate={setMessageTemplate}
          />
        ) : (
          <SoundField
            presets={tab === 'single' ? singlePresets : geigerPresets}
            selected={soundType}
            onSelect={setSoundType}
          />
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actions}>
          <Button label="Cancel" variant="outline" onPress={onClose} style={styles.actionButton} />
          <Button
            label={isEditing ? 'Save' : 'Add alert'}
            icon={isEditing ? IconCheck : IconPlus}
            variant="primary"
            onPress={handleSave}
            loading={saving}
            style={styles.actionButton}
          />
        </View>
      </View>
    </Drawer>
  )
}

const TYPE_OPTIONS = [
  { key: 'single', label: 'Alert', icon: IconActivity },
  { key: 'geiger', label: 'Geiger', icon: IconRadioactive },
  { key: 'message', label: 'Message', icon: IconMessage },
] as const

const styles = StyleSheet.create({
  body: { gap: 20, paddingHorizontal: 16, paddingBottom: 8 },
  stepper: { alignItems: 'flex-start' },
  actions: { flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1 },
  error: { color: theme.status.error.text, fontSize: 13 },
})
