import { useEffect, useRef, useState } from 'react'
import { AppState, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconBulb from '@tabler/icons-react-native/IconBulb'
import IconMoon from '@tabler/icons-react-native/IconMoon'
import {
  saveBrakeLightSettings,
  setBrakeLightPreview,
  type BrakeLightSettings,
  type BrakeLightMode,
} from 'vescape-core'

import { Text } from '@/components/base/Text'
import { Stepper } from '@/components/ui/Stepper'
import { ToggleGroup } from '@/components/ui/ToggleGroup'
import {
  SettingsDescription,
  SettingsGroup,
  SettingsLink,
} from '@/modules/settings/components/SettingsGroup'
import { BrakeLightStates } from '@/modules/accessories/components/BrakeLightStates'
import { CapabilityEnabledControl } from '@/modules/accessories/components/CapabilityEnabledControl'
import { useSavedAccessory } from '@/modules/accessories/store/accessoryStore'
import { theme } from '@/constants/theme'

/**
 * How long a tapped state stays on the light before it is handed back to the Board.
 *
 * Long enough to step behind the board and look at the lamp, short enough that a rider who walked
 * away does not leave the light pinned — native only drops a preview once the board starts moving.
 */
const PREVIEW_SECONDS = 10

const PARKED_OPTIONS = [
  { key: 'off', label: 'Off' },
  { key: 'glow', label: 'Glow' },
] as const

export function BrakeLightScreen({
  accessoryId,
  capabilityId,
}: {
  accessoryId: string
  capabilityId: string
}) {
  const accessory = useSavedAccessory(accessoryId)
  const capability = accessory?.capabilities.find(
    (entry) => entry.id === capabilityId && entry.type === 'brake_light',
  )
  const [draft, setDraft] = useState<BrakeLightSettings | null>(null)
  const [problem, setProblem] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const latest = useRef<BrakeLightSettings | null>(null)
  const revision = useRef(0)
  const saved = capability?.brakeLight
  useEffect(() => {
    if (!saved || latest.current) return
    latest.current = saved
    setDraft(saved)
  }, [saved])

  useEffect(() => {
    const release = () => {
      void setBrakeLightPreview(accessoryId, capabilityId, null)
    }
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') release()
    })
    return () => {
      subscription.remove()
      release()
    }
  }, [accessoryId, capabilityId])

  // Native owns whether a preview is up — riding ends one without asking this screen. The countdown
  // follows that fact rather than the tap that started it, so a preview native dropped stops
  // counting down here too.
  const held = capability?.lightPreview ?? null
  useEffect(() => {
    if (!held) {
      setSecondsLeft(null)
      return
    }
    setSecondsLeft(PREVIEW_SECONDS)
    const timer = setInterval(() => {
      setSecondsLeft((current) => {
        if (current == null) return null
        if (current > 1) return current - 1
        void setBrakeLightPreview(accessoryId, capabilityId, null)
        return null
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [held, accessoryId, capabilityId])

  const edit = (patch: Partial<BrakeLightSettings>) => {
    if (!latest.current) return
    const next = { ...latest.current, ...patch }
    latest.current = next
    setDraft(next)
    const mutation = ++revision.current
    void saveBrakeLightSettings(accessoryId, capabilityId, next)
      .then((ok) => {
        if (revision.current === mutation)
          setProblem(ok ? null : 'Could not save. Change the setting again to retry.')
      })
      .catch(() => {
        if (revision.current === mutation)
          setProblem('Could not save. Change the setting again to retry.')
      })
  }
  const preview = (mode: BrakeLightMode | null) => {
    void setBrakeLightPreview(accessoryId, capabilityId, mode)
      .then((accepted) => {
        setProblem(accepted ? null : 'Park the Board before starting a preview.')
      })
      .catch(() => setProblem('Preview could not start.'))
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <SettingsDescription>
          Drives the light from the Board’s own telemetry, on whichever Board you are riding.
        </SettingsDescription>
        {!accessory || !capability || !draft ? (
          <Text style={styles.hint}>Brake light not available.</Text>
        ) : (
          <>
            <CapabilityEnabledControl accessoryId={accessoryId} capability={capability} />

            <SettingsGroup title="Light states">
              <View style={styles.states}>
                <BrakeLightStates
                  activeMode={capability.lightPreview ?? capability.lightMode ?? null}
                  previewMode={capability.lightPreview ?? null}
                  parked={draft.parked}
                  previewSecondsLeft={secondsLeft}
                  disabled={accessory.phase !== 'connected' || capability.enabled === false}
                  onPreview={preview}
                />
              </View>
            </SettingsGroup>

            <SettingsGroup title="Behaviour">
              <SettingsLink
                icon={IconBulb}
                label="Sensitivity"
                hint="Higher reacts to gentler slowing, in either direction."
                right={
                  <Stepper
                    label="sensitivity"
                    value={draft.sensitivity}
                    unit="%"
                    min={1}
                    max={100}
                    step={5}
                    onChange={(sensitivity) => edit({ sensitivity })}
                    testIDPrefix="brake-light-sensitivity"
                  />
                }
              />
              <SettingsLink
                icon={IconMoon}
                label="While parked"
                hint="What the light does once the Board stops."
                right={
                  <ToggleGroup
                    options={PARKED_OPTIONS}
                    activeKey={draft.parked}
                    onSelect={(parked) => edit({ parked })}
                    testID="brake-light-parked"
                  />
                }
              />
            </SettingsGroup>

            {problem ? <Text style={styles.problem}>{problem}</Text> : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 16, gap: 24, paddingBottom: 32 },
  states: { padding: 12 },
  hint: { color: theme.ui.mutedForeground, fontSize: 13, lineHeight: 18 },
  problem: { color: theme.status.error.text, fontSize: 13 },
})
