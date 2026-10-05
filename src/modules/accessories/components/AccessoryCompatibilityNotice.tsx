import { StyleSheet, View } from 'react-native'
import IconAlertCircle from '@tabler/icons-react-native/IconAlertCircle'
import IconCircleCheck from '@tabler/icons-react-native/IconCircleCheck'
import IconCircleX from '@tabler/icons-react-native/IconCircleX'
import type { AccessoryCompatibility } from 'vescape-core'

import { Text } from '@/components/base/Text'
import { compatibilityCopy } from '@/modules/accessories/lib/accessoryStatus'
import { theme } from '@/constants/theme'

const TONE = {
  success: { color: theme.status.success.color, icon: IconCircleCheck },
  caution: { color: theme.status.caution.color, icon: IconAlertCircle },
  error: { color: theme.status.error.color, icon: IconCircleX },
} as const

/**
 * Native's compatibility verdict, stated plainly. It is the one place a rider learns that an
 * accessory was found and understood but still cannot be used, and why — an unsupported protocol
 * version and an unrecognized capability type fail in very different ways.
 */
export function AccessoryCompatibilityNotice({
  compatibility,
  supportedVersions,
}: {
  compatibility: AccessoryCompatibility
  /** Versions the accessory offered instead, shown only when no version was agreed. */
  supportedVersions?: number[]
}) {
  const copy = compatibilityCopy(compatibility)
  const { color, icon: ToneIcon } = TONE[copy.tone]
  const offered =
    compatibility === 'unsupported-version' && supportedVersions && supportedVersions.length > 0
      ? `It speaks version ${supportedVersions.join(', ')}.`
      : null

  return (
    <View style={[styles.card, { borderColor: theme.alpha(color, 0.4) }]}>
      <ToneIcon size={20} color={color} />
      <View style={styles.body}>
        <Text style={[styles.title, { color }]}>{copy.title}</Text>
        <Text style={styles.detail}>
          {copy.detail}
          {offered ? ` ${offered}` : ''}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: 14,
  },
  body: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  detail: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    lineHeight: 18,
  },
})
