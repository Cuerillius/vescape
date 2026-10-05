import { Pressable, StyleSheet, View } from 'react-native'
import IconChevronRight from '@tabler/icons-react-native/IconChevronRight'

import { Text } from '@/components/base/Text'
import { AccessoryIcon } from '@/modules/accessories/constants/accessoryIcon'
import { accessoryStatusCopy } from '@/modules/accessories/lib/accessoryStatus'
import type { AccessoryLinkPhase } from 'vescape-core'
import { interaction, theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

const TONE = {
  success: theme.status.success.color,
  neutral: theme.ui.faintForeground,
  caution: theme.status.caution.color,
} as const

export interface AccessoryRowProps {
  name: string
  /** Firmware version, or whatever secondary fact best identifies this unit. */
  detail?: string | undefined
  /** Native's link phase. Never derived here — this row phrases it and nothing else. */
  phase: AccessoryLinkPhase
  /** True when saved settings can no longer be trusted: changed limits, or nothing usable left. */
  needsSetup?: boolean
  onPress: () => void
}

/**
 * One Accessory in a list: what it is, whether the app is hearing it, and a way into its
 * configuration.
 *
 * Deliberately dumb — it takes strings and a status, never a store or a manifest, so the same row
 * serves the Accessories screen, the showcase, and whatever screen lists Accessories next.
 */
export function AccessoryRow({ name, detail, phase, needsSetup, onPress }: AccessoryRowProps) {
  const copy = accessoryStatusCopy(phase)
  const label = needsSetup ? 'Setup required' : copy.label
  const tone = needsSetup ? TONE.caution : TONE[copy.tone]
  const iconColor = useResolvedColor(theme.ui.mutedForeground)
  const chevronColor = useResolvedColor(theme.ui.faintForeground)
  // Only a link that is actually answering fills the dot. A hollow dot is the honest shape for
  // "trying", and a filled one must never promise a connection there isn't.
  const live = phase === 'connected' && !needsSetup

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      android_ripple={interaction.ripple}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${label}`}
      testID={`accessory-row-${name}`}
    >
      <AccessoryIcon size={20} color={iconColor} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.metaLine}>
          <View
            style={[
              styles.dot,
              { borderColor: tone, backgroundColor: live ? tone : 'transparent' },
            ]}
          />
          <Text style={styles.meta}>{label}</Text>
          {detail ? (
            <>
              <Text style={styles.meta}>·</Text>
              <Text style={styles.meta} numberOfLines={1}>
                {detail}
              </Text>
            </>
          ) : null}
        </View>
      </View>
      <IconChevronRight size={18} color={chevronColor} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowPressed: {
    backgroundColor: theme.ui.muted,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: theme.ui.foreground,
    fontSize: 15,
    fontWeight: '600',
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  meta: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '500',
  },
})
