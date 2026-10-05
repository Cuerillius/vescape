import IconCurrentLocationOff from '@tabler/icons-react-native/IconCurrentLocationOff'
import IconGps from '@tabler/icons-react-native/IconGps'
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'

import { Text } from '@/components/base/Text'
import { theme } from '@/constants/theme'
import { useResolvedUiColors } from '@/hooks/useTheme'
import type { GpsStatusBadge } from '@/modules/location/lib/gpsStatusBadge'

/**
 * Why the position on screen cannot be trusted, in the fewest possible pixels. It only ever renders
 * for a GPS that is missing, arming, or delivering something weak — a healthy receiver gets no
 * badge at all, so the pill showing up is itself the signal.
 *
 * Bare muted icon and text, no capsule, in every state: it explains a reading the rider can already
 * see is off, and a red or amber badge would outrank the alerts and warnings that mean something is
 * wrong with the board.
 */
export function GpsStatusPill({
  badge,
  style,
  onPress,
}: {
  badge: GpsStatusBadge
  style?: StyleProp<ViewStyle>
  /** Given a handler the pill becomes the way in to whatever explains the state it is reporting. */
  onPress?: () => void
}) {
  // Resolved strings, not adaptive tokens: the pill can be mounted across a theme switch, and a
  // native adaptive color only re-resolves when the prop is set again.
  const ui = useResolvedUiColors()
  const Icon = badge.kind === 'off' || badge.kind === 'blocked' ? IconCurrentLocationOff : IconGps
  const content = (
    <>
      <Icon size={16} color={ui.mutedForeground} />
      <Text style={[styles.label, { color: ui.mutedForeground }]} numberOfLines={1}>
        {badge.label}
      </Text>
    </>
  )

  if (!onPress) {
    return (
      <View pointerEvents="none" style={[styles.row, style]}>
        <View style={styles.pill}>{content}</View>
      </View>
    )
  }

  return (
    <View pointerEvents="box-none" style={[styles.row, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={badge.label}
        hitSlop={8}
        onPress={onPress}
        style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
      >
        {content}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pillPressed: {
    opacity: 0.6,
  },
  label: {
    fontFamily: theme.font('500'),
    fontSize: 15,
  },
})
