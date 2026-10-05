import { useCallback, useEffect, useRef, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconArrowBarDown from '@tabler/icons-react-native/IconArrowBarDown'
import IconArrowBarUp from '@tabler/icons-react-native/IconArrowBarUp'
import IconCompass from '@tabler/icons-react-native/IconCompass'
import IconAdjustments from '@tabler/icons-react-native/IconAdjustments'
import IconActivity from '@tabler/icons-react-native/IconActivity'
import {
  saveGroundClearanceCalibration,
  setAccessorySamplingRate,
  type GroundClearanceDirection,
} from 'vescape-core'

import { MessageCard } from '@/components/ui/MessageCard'
import { Stepper } from '@/components/ui/Stepper'
import { ToggleGroup } from '@/components/ui/ToggleGroup'
import { Text } from '@/components/base/Text'
import {
  SettingsDescription,
  SettingsGroup,
  SettingsLink,
} from '@/modules/settings/components/SettingsGroup'
import { GroundClearanceTelemetry } from '@/modules/accessories/components/GroundClearanceTelemetry'
import { CapabilityEnabledControl } from '../components/CapabilityEnabledControl'
import {
  calibrationProblemCopy,
  directionCopy,
} from '@/modules/accessories/lib/groundClearanceCopy'
import { AccessoryIcon } from '@/modules/accessories/constants/accessoryIcon'
import { useSavedAccessory } from '@/modules/accessories/store/accessoryStore'
import { theme } from '@/constants/theme'

/** Starting point for a rider who has never calibrated this sensor. Deliberately conservative. */
const DEFAULT_NEAR_CM = 5
const DEFAULT_FAR_CM = 20
const DEFAULT_STRENGTH_PERCENT = 50

/** How long the rider has to stop moving a stepper before the calibration is offered to native. */
const SAVE_DEBOUNCE_MS = 400

interface Draft {
  nearCm: number
  farCm: number
  direction: GroundClearanceDirection
  strengthPercent: number
}

/**
 * Live ground clearance for one capability, and the calibration that turns it into a tilt binding.
 *
 * Two halves, both of them native's. The reading is one sample native accepted, range-checked
 * against what the accessory declares and carrying an explicit status — never a blank filled in
 * with the last good number. The calibration is offered as the rider edits it and native decides
 * whether it is complete; there is no Save button, and what comes back is either "saved" or the
 * rule it broke.
 *
 * Opening this screen is what makes the sensor measure. The demand is released on unmount and on
 * backgrounding, and the accessory stops its continuous measurement while its BLE session stays up
 * — so a rider who wandered off this screen is not quietly draining an accessory battery.
 */
export function GroundClearanceScreen({
  accessoryId,
  capabilityId,
}: {
  accessoryId: string
  capabilityId: string
}) {
  const accessory = useSavedAccessory(accessoryId)
  const capability = accessory?.capabilities.find((entry) => entry.id === capabilityId)
  const saved = capability?.calibration ?? null

  const [draft, setDraft] = useState<Draft | null>(null)
  const [problem, setProblem] = useState<string | null>(null)
  const [savingRate, setSavingRate] = useState(false)
  const [rateFailed, setRateFailed] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** The edit the debounce has not offered to native yet. Flushed rather than dropped on exit. */
  const pending = useRef<Draft | null>(null)

  // Native's saved calibration seeds the editor once, and only once native has actually said what
  // this capability is. Seeding before the first snapshot lands would fill the steppers with
  // defaults and then refuse the rider's real calibration a frame later, because `current` is set.
  //
  // After the first seed the rider owns the fields: taking every push would yank a stepper back
  // under their thumb the moment a save round-trips.
  const known = capability != null
  useEffect(() => {
    if (!known) return
    setDraft((current) => {
      if (current) return current
      if (!saved) {
        return {
          nearCm: DEFAULT_NEAR_CM,
          farCm: DEFAULT_FAR_CM,
          direction: 'nose',
          strengthPercent: DEFAULT_STRENGTH_PERCENT,
        }
      }
      return {
        nearCm: saved.nearCm,
        farCm: saved.farCm,
        direction: saved.direction === 'tail' ? 'tail' : 'nose',
        strengthPercent: saved.strengthPercent,
      }
    })
  }, [known, saved])

  // Leaving flushes, it does not cancel. A screen that saves on its own must not silently throw away
  // the rider's last change because they navigated back inside the debounce window — they were told
  // it saves, and nothing on the way out says otherwise.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
      const unsaved = pending.current
      pending.current = null
      if (unsaved) {
        void saveGroundClearanceCalibration(accessoryId, capabilityId, unsaved)
      }
    },
    [accessoryId, capabilityId],
  )

  const edit = useCallback(
    (patch: Partial<Draft>) => {
      setDraft((current) => {
        if (!current) return current
        const next = { ...current, ...patch }
        pending.current = next
        if (timer.current) clearTimeout(timer.current)
        // Debounced, because a stepper held down would otherwise write a row per tap. Native still
        // decides validity — this only decides how often it is asked, and native applies whatever
        // arrives in the order it arrives.
        timer.current = setTimeout(() => {
          timer.current = null
          pending.current = null
          void saveGroundClearanceCalibration(accessoryId, capabilityId, next).then((result) => {
            setProblem(result.saved ? null : (result.problem ?? null))
          })
        }, SAVE_DEBOUNCE_MS)
        return next
      })
    },
    [accessoryId, capabilityId],
  )

  const changeRate = async (rateHz: number) => {
    setSavingRate(true)
    setRateFailed(false)
    try {
      setRateFailed(!(await setAccessorySamplingRate(accessoryId, capabilityId, rateHz)))
    } catch {
      setRateFailed(true)
    } finally {
      setSavingRate(false)
    }
  }

  if (!accessory || !capability) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <MessageCard
          icon={AccessoryIcon}
          title="Sensor not found"
          description="This accessory no longer offers a ground-clearance sensor on this phone. Open it from the Board selector to see what it does offer."
        />
      </SafeAreaView>
    )
  }

  // The saved calibration's own verdict, re-decided natively against the live manifest, outranks
  // the last save's answer: a firmware that narrowed its range invalidates a calibration nobody
  // touched, and the rider needs to hear that before they hear nothing at all.
  const blocking = saved?.problem ?? problem
  const configured = saved != null && saved.problem == null

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <SettingsDescription>
          Measures how far the board sits above the ground and turns that into Remote Tilt while you
          ride.
        </SettingsDescription>
        <CapabilityEnabledControl accessoryId={accessoryId} capability={capability} />
        <SettingsGroup title="Sampling rate">
          <SettingsLink
            icon={IconActivity}
            label="Rate"
            hint="How often the sensor reports a distance."
            right={
              <Choice
                options={capability.ratesHz.map((rateHz) => ({
                  value: String(rateHz),
                  label: `${rateHz} Hz`,
                }))}
                value={String(capability.selectedRateHz ?? capability.ratesHz[0] ?? '')}
                onChange={(rate) => {
                  void changeRate(Number(rate))
                }}
                disabled={savingRate || !capability.supported}
                testID="ground-clearance-rate"
              />
            }
          />
        </SettingsGroup>
        {rateFailed ? (
          <Text style={styles.warning}>Could not save sampling rate. Try again.</Text>
        ) : null}
        {capability.enabled !== false ? (
          <GroundClearanceTelemetry
            accessoryId={accessoryId}
            capabilityId={capabilityId}
            range={{ min: capability.rangeMin ?? 3, max: capability.rangeMax ?? 100 }}
          />
        ) : (
          <Text style={styles.hint}>
            Sensor disabled. Measurements and automatic tilt are stopped.
          </Text>
        )}

        {!configured ? (
          <Text style={styles.explainer}>
            Not set up yet. Watch the live distance above, then set the far and near distances
            below.
          </Text>
        ) : null}

        {blocking ? (
          <Text style={styles.warning} testID="ground-clearance-problem">
            {calibrationProblemCopy(blocking)}
          </Text>
        ) : null}

        {draft ? (
          <>
            <SettingsGroup title="Distances">
              <SettingsLink
                icon={IconArrowBarUp}
                label="Far"
                hint="Correction starts here."
                right={
                  <Stepper
                    label="far distance"
                    value={draft.farCm}
                    unit="cm"
                    min={capability.rangeMin ?? 0}
                    max={capability.rangeMax ?? 100}
                    step={1}
                    onChange={(farCm) => edit({ farCm })}
                    testIDPrefix="ground-clearance-far"
                  />
                }
              />
              <SettingsLink
                icon={IconArrowBarDown}
                label="Near"
                hint="Full strength here. Always below the far distance."
                right={
                  <Stepper
                    label="near distance"
                    value={draft.nearCm}
                    unit="cm"
                    min={capability.rangeMin ?? 0}
                    max={capability.rangeMax ?? 100}
                    step={1}
                    onChange={(nearCm) => edit({ nearCm })}
                    testIDPrefix="ground-clearance-near"
                  />
                }
              />
            </SettingsGroup>

            <SettingsGroup title="Mounting">
              <SettingsLink
                icon={IconCompass}
                label="Mounted at"
                hint={directionCopy(draft.direction)}
                right={
                  <Choice
                    options={[
                      { value: 'nose', label: 'Nose' },
                      { value: 'tail', label: 'Tail' },
                    ]}
                    value={draft.direction}
                    onChange={(direction) => edit({ direction })}
                    testID="ground-clearance-direction"
                  />
                }
              />
              <SettingsLink
                icon={IconAdjustments}
                label="Strength"
                hint="The most Remote Tilt this sensor may command."
                right={
                  <Stepper
                    label="strength"
                    value={draft.strengthPercent}
                    unit="%"
                    min={1}
                    max={100}
                    step={5}
                    onChange={(strengthPercent) => edit({ strengthPercent })}
                    testIDPrefix="ground-clearance-strength"
                  />
                }
              />
            </SettingsGroup>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

/**
 * A `ToggleGroup` on a settings row's trailing edge.
 *
 * The group has no disabled state of its own — a control that still answers taps while a save is
 * in flight would let the rider queue two rates native has to pick between.
 */
function Choice<T extends string>({
  options,
  value,
  onChange,
  disabled,
  testID,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  disabled?: boolean
  testID: string
}) {
  return (
    <View pointerEvents={disabled ? 'none' : 'auto'} style={disabled ? styles.inert : undefined}>
      <ToggleGroup
        options={options.map((option) => ({ key: option.value, label: option.label }))}
        activeKey={value}
        onSelect={onChange}
        testID={testID}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  inert: { opacity: 0.45 },
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 16, gap: 24, paddingBottom: 32 },
  hint: { color: theme.ui.mutedForeground, fontSize: 13, lineHeight: 18 },
  explainer: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  warning: {
    color: theme.status.caution.text,
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
})
