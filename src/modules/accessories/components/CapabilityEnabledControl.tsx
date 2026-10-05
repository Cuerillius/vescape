import { useState } from 'react'
import type { Icon } from '@tabler/icons-react-native'
import { setAccessoryCapabilityEnabled, type AccessoryCapability } from 'vescape-core'

import { Text } from '@/components/base/Text'
import { Switch } from '@/components/ui/Switch'
import { SettingsGroup, SettingsLink } from '@/modules/settings/components/SettingsGroup'
import { capabilityPresentation } from '../constants/accessoryCapabilities'
import { theme } from '@/constants/theme'

/** The one switch that decides whether a capability runs at all — always the top of its screen. */
export function CapabilityEnabledControl({
  accessoryId,
  capability,
}: {
  accessoryId: string
  capability: AccessoryCapability
}) {
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState(false)
  const change = async (enabled: boolean) => {
    setSaving(true)
    setFailed(false)
    try {
      setFailed(!(await setAccessoryCapabilityEnabled(accessoryId, capability.id, enabled)))
    } catch {
      setFailed(true)
    } finally {
      setSaving(false)
    }
  }
  const { title, icon } = capabilityPresentation(capability)
  return (
    <CapabilityEnabledSetting
      icon={icon}
      label={`Use ${title.toLowerCase()}`}
      enabled={capability.enabled !== false}
      pending={saving}
      disabled={!capability.supported}
      failed={failed}
      onChange={(enabled) => {
        void change(enabled)
      }}
    />
  )
}

export function CapabilityEnabledSetting({
  icon,
  label,
  enabled,
  disabled,
  pending,
  failed,
  onChange,
}: {
  icon: Icon
  label: string
  enabled: boolean
  disabled?: boolean
  /** The write is in flight — the switch locks instead of pretending it already landed. */
  pending?: boolean
  failed?: boolean
  onChange: (enabled: boolean) => void
}) {
  return (
    <>
      <SettingsGroup>
        <SettingsLink
          icon={icon}
          label={label}
          right={
            <Switch
              value={enabled}
              onValueChange={onChange}
              disabled={disabled || pending}
              accessibilityLabel={label}
            />
          }
        />
      </SettingsGroup>
      {failed ? (
        <Text style={{ color: theme.status.caution.text }}>Could not save. Try again.</Text>
      ) : null}
    </>
  )
}
