import { useCallback, useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconTrash from '@tabler/icons-react-native/IconTrash'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { MessageCard } from '@/components/ui/MessageCard'
import { SettingsGroup, SettingsValue } from '@/modules/settings/components/SettingsGroup'
import { AccessoryCapabilityRow } from '@/modules/accessories/components/AccessoryCapabilityRow'
import { AccessoryCompatibilityNotice } from '@/modules/accessories/components/AccessoryCompatibilityNotice'
import { AccessoryIcon } from '@/modules/accessories/constants/accessoryIcon'
import { accessoryStatusCopy, linkErrorCopy } from '@/modules/accessories/lib/accessoryStatus'
import { useAccessoryStore, useSavedAccessory } from '@/modules/accessories/store/accessoryStore'
import { fmtTimeAgo } from '@/helpers/format'
import { theme } from '@/constants/theme'

/**
 * One Accessory's configuration screen: who it says it is, whether Vescape can drive it, what it
 * offers, and where its link stands right now.
 *
 * Identity first, because everything saved about an Accessory keys on it. Per-capability setup —
 * clearance calibration, brake-light behaviour — lives behind each capability in its own slice;
 * this screen is the place they hang off, and the place that says plainly when they cannot. A
 * capability row is a way in only when this build has a screen for that type: ground clearance
 * opens calibration, brake light opens controls and parked preview.
 *
 * Every fact here is native's. The link phase is the one a native session is actually in, which is
 * running whether or not this screen was ever opened.
 */
export function AccessoryDetailScreen({
  accessoryId,
  onForgotten,
  onConfigureCapability,
}: {
  accessoryId: string
  /** Called once the Accessory is gone, so the route that opened this can leave. */
  onForgotten?: () => void
  /** Open one capability's own configuration. Only offered for types this build can configure. */
  onConfigureCapability?: (capabilityId: string, type: string) => void
}) {
  const accessory = useSavedAccessory(accessoryId)
  const forget = useAccessoryStore((s) => s.forget)
  const [forgetting, setForgetting] = useState(false)
  const [forgetFailed, setForgetFailed] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const onForget = useCallback(async () => {
    setForgetting(true)
    setForgetFailed(false)
    try {
      // Native answers false when the saved identity is still there — a storage failure means the
      // Accessory is still enrolled and still connecting, so leaving the screen would claim
      // something that did not happen.
      if (await forget(accessoryId)) {
        onForgotten?.()
        return
      }
      setForgetFailed(true)
    } finally {
      setForgetting(false)
      setConfirming(false)
    }
  }, [accessoryId, forget, onForgotten])

  if (!accessory) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <MessageCard
          icon={AccessoryIcon}
          title="Accessory not found"
          description="This accessory is not saved on this phone. Add it again from the Board selector."
        />
      </SafeAreaView>
    )
  }

  const status = accessoryStatusCopy(accessory.phase)

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.name}>{accessory.name}</Text>

        {accessory.compatibility ? (
          <AccessoryCompatibilityNotice
            compatibility={accessory.compatibility}
            supportedVersions={[]}
          />
        ) : null}

        {accessory.capabilitiesChanged ? (
          <Text style={styles.warning}>
            This accessory now declares different limits than when it was added. Anything calibrated
            against the old ones needs checking before it drives the board again.
          </Text>
        ) : null}

        <SettingsGroup title="Connection">
          <SettingsValue label="Status" value={status.label} />
          {accessory.error ? (
            <SettingsValue label="Last problem" value={linkErrorCopy(accessory.error)} />
          ) : null}
          <SettingsValue
            label="Last connected"
            value={
              accessory.lastConnectedAt == null ? 'Not yet' : fmtTimeAgo(accessory.lastConnectedAt)
            }
          />
        </SettingsGroup>

        <SettingsGroup title="Identity">
          <SettingsValue label="Accessory ID" value={accessory.accessoryId} mono />
          <SettingsValue label="Firmware" value={accessory.firmwareVersion} />
          <SettingsValue
            label="Protocol"
            value={
              accessory.protocolVersion == null
                ? 'No common version'
                : `v${accessory.protocolVersion}`
            }
          />
          <SettingsValue label="Added" value={fmtTimeAgo(accessory.enrolledAt)} />
        </SettingsGroup>

        <SettingsGroup title="Capabilities">
          {accessory.capabilities.length === 0 ? (
            <Text style={styles.empty}>This accessory declared no capabilities.</Text>
          ) : (
            accessory.capabilities.map((capability) => (
              <AccessoryCapabilityRow
                key={capability.id}
                capability={capability}
                phase={accessory.phase}
                {...(capability.supported &&
                (capability.type === 'ground_clearance' || capability.type === 'brake_light')
                  ? { onPress: () => onConfigureCapability?.(capability.id, capability.type) }
                  : {})}
              />
            ))
          )}
        </SettingsGroup>

        <Button
          label="Forget accessory"
          variant="outline"
          color={theme.status.error.color}
          icon={IconTrash}
          onPress={() => setConfirming(true)}
          loading={forgetting}
          testID="accessory-forget"
        />

        {forgetFailed ? (
          <Text style={styles.warning}>
            This accessory could not be removed. It is still saved and still connecting; try again.
          </Text>
        ) : null}
      </ScrollView>
      <ConfirmDialog
        visible={confirming}
        title="Forget accessory"
        message={`Vescape stops connecting to ${accessory.name} and everything saved about it — calibration, behaviour, capability switches — is removed from this phone.`}
        confirmLabel="Forget"
        destructive
        loading={forgetting}
        onConfirm={() => void onForget()}
        cancelLabel="Cancel"
        onDismiss={() => setConfirming(false)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 16, gap: 24, paddingBottom: 32 },
  name: { color: theme.ui.foreground, fontSize: 20, fontWeight: '700', marginBottom: -8 },
  warning: {
    color: theme.status.caution.text,
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  empty: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
})
