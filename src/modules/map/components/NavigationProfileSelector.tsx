import IconBike from '@tabler/icons-react-native/IconBike'
import IconCar from '@tabler/icons-react-native/IconCar'
import IconWalk from '@tabler/icons-react-native/IconWalk'
import type { ComponentType } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import type { NavigationProfile } from 'vescape-core'

import { Text } from '@/components/base/Text'
import { interaction, theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

/**
 * Which kind of ways the path may follow, switched inline while looking at it. Deliberately not a
 * settings screen entry: the rider decides a path went the wrong kind of way and fixes it there.
 *
 * It shows the profile that produced the drawn path, not the one stored for next time — a switch
 * whose recompute found nothing leaves the old path, and this snaps back with it. All choices are
 * laid out at once: the rider is already deciding, and a collapsed menu would make them tap twice.
 */
export function NavigationProfileSelector({
  activeProfile,
  onSelect,
}: {
  activeProfile: NavigationProfile
  onSelect: (profile: NavigationProfile) => void
}) {
  return (
    <View style={styles.track} accessibilityRole="radiogroup">
      {NAVIGATION_PROFILE_OPTIONS.map(({ key, label, Icon }) => (
        <ProfileSegment
          key={key}
          label={label}
          Icon={Icon}
          active={activeProfile === key}
          onPress={() => onSelect(key)}
        />
      ))}
    </View>
  )
}

function ProfileSegment({
  label,
  Icon,
  active,
  onPress,
}: {
  label: string
  Icon: ComponentType<{ size: number; color: string }>
  active: boolean
  onPress: () => void
}) {
  const color = useResolvedColor(active ? theme.ui.primaryForeground : theme.ui.mutedForeground)
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`Path follows ${label}`}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.segment,
        active && styles.segmentActive,
        pressed && !active && styles.pressed,
      ]}
    >
      <Icon size={16} color={color} />
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  )
}

/**
 * Rider-facing names for the profiles. They say what the path follows rather than how the rider
 * travels: an EUC is none of walking, cycling or driving, but the ways are exactly the difference.
 */
const NAVIGATION_PROFILE_OPTIONS: {
  key: NavigationProfile
  label: string
  Icon: ComponentType<{ size: number; color: string }>
}[] = [
  { key: 'walking', label: 'Paths', Icon: IconWalk },
  { key: 'cycling', label: 'Cycleways', Icon: IconBike },
  { key: 'driving', label: 'Roads', Icon: IconCar },
]

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: 3,
    gap: 2,
    borderRadius: theme.radius.md + 3,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
  },
  segment: {
    flex: 1,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 6,
    borderRadius: theme.radius.md,
  },
  segmentActive: {
    backgroundColor: theme.ui.primary,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
})
