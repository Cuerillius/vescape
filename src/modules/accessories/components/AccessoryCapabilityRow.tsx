import { Pressable, StyleSheet, View } from 'react-native'
import IconChevronRight from '@tabler/icons-react-native/IconChevronRight'
import type { AccessoryCapability, AccessoryLinkPhase } from 'vescape-core'

import { Text } from '@/components/base/Text'
import { Badge } from '@/components/ui/Badge'
import { capabilityPresentation } from '@/modules/accessories/constants/accessoryCapabilities'
import { capabilityStateCopy } from '@/modules/accessories/lib/capabilityStateCopy'
import { interaction, theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

/**
 * One capability an Accessory declares, with what the app can do about it.
 *
 * An unsupported capability is shown rather than filtered out: a rider holding hardware Vescape
 * half-understands should be told which half, not handed a shorter list.
 *
 * A capability the rider switched off says so here too. Otherwise the list reads identically
 * whether or not the thing is actually doing anything, and the only way to find out is to open
 * every row.
 *
 * A row is only a way in when this build has a configuration screen for that capability type. An
 * unsupported capability, or a recognized one whose slice has not shipped, stays a flat row rather
 * than a tap that leads somewhere empty — [onPress] is simply absent.
 */
export function AccessoryCapabilityRow({
  capability,
  phase,
  onPress,
}: {
  capability: AccessoryCapability
  /** The link this capability lives on. Given, the row also says what it is doing right now. */
  phase?: AccessoryLinkPhase
  /** Omit when this capability has nothing to open. */
  onPress?: () => void
}) {
  const { title, description, icon: CapabilityIcon } = capabilityPresentation(capability)
  const iconColor = useResolvedColor(theme.ui.mutedForeground)
  const chevronColor = useResolvedColor(theme.ui.faintForeground)
  const off = capability.supported && capability.enabled === false
  const badge = !capability.supported
    ? { label: 'Unsupported', color: undefined }
    : off
      ? { label: 'Off', color: theme.status.caution.color }
      : null
  // "Off" is already the badge's job, and the link phase is the screen header's — the state line is
  // for the half-second answer the list otherwise makes the rider open a row to get.
  const state =
    phase === 'connected' && capability.supported && !off
      ? capabilityStateCopy(capability, phase)
      : null

  const body = (
    <>
      <CapabilityIcon size={20} color={iconColor} />
      <View style={styles.body}>
        <View style={styles.titleLine}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {badge ? <Badge label={badge.label} variant="outline" color={badge.color} /> : null}
        </View>
        <Text style={styles.description}>{description}</Text>
        {state ? <Text style={styles.state}>{state}</Text> : null}
      </View>
      {onPress ? <IconChevronRight size={18} color={chevronColor} /> : null}
    </>
  )

  if (!onPress) return <View style={styles.row}>{body}</View>

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      android_ripple={interaction.ripple}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Configure ${title}`}
      testID={`accessory-capability-${capability.id}`}
    >
      {body}
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
  rowPressed: { backgroundColor: theme.ui.muted },
  body: {
    flex: 1,
    gap: 3,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flexShrink: 1,
    color: theme.ui.foreground,
    fontSize: 15,
    fontWeight: '600',
  },
  description: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '500',
  },
  state: {
    color: theme.ui.foreground,
    fontSize: 12,
    fontWeight: '600',
  },
})
