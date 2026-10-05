import { useMemo } from 'react'
import type { Icon } from '@tabler/icons-react-native'
import IconActivity from '@tabler/icons-react-native/IconActivity'
import IconBatteryCharging from '@tabler/icons-react-native/IconBatteryCharging'
import IconBolt from '@tabler/icons-react-native/IconBolt'
import IconClock from '@tabler/icons-react-native/IconClock'
import IconGauge from '@tabler/icons-react-native/IconGauge'
import IconRoad from '@tabler/icons-react-native/IconRoad'
import IconRoute from '@tabler/icons-react-native/IconRoute'
import IconTrophy from '@tabler/icons-react-native/IconTrophy'
import type { ProfileStats } from 'vescape-core'

import { useFormat } from '@/hooks/useFormat'
import { useUnitSystem } from '@/hooks/useUnitSystem'
import { formatDistance, formatDuration, formatEnergy } from '@/modules/profile/lib/profileStats'

export type ProfileStatKey =
  | 'distance'
  | 'rides'
  | 'rideTime'
  | 'topSpeed'
  | 'avgSpeed'
  | 'longestRide'
  | 'used'
  | 'regen'

export interface ProfileStatItem {
  key: ProfileStatKey
  label: string
  value: string
  icon: Icon
}

/** Every riding total as a labelled, formatted figure — one definition for every surface
 *  that shows profile stats, so a number never carries two different labels. */
export function useProfileStatItems(
  stats: ProfileStats,
  keys?: ProfileStatKey[],
): ProfileStatItem[] {
  const units = useUnitSystem()
  const { formatSpeedWithUnit } = useFormat()
  const items = useMemo<ProfileStatItem[]>(
    () => [
      {
        key: 'distance',
        label: 'Distance',
        value: formatDistance(stats.distanceM, units),
        icon: IconRoad,
      },
      { key: 'rides', label: 'Rides', value: String(stats.rideCount), icon: IconRoute },
      {
        key: 'rideTime',
        label: 'Ride time',
        value: formatDuration(stats.rideTimeMs),
        icon: IconClock,
      },
      {
        key: 'topSpeed',
        label: 'Top speed',
        value: formatSpeedWithUnit(stats.topSpeedKmh),
        icon: IconGauge,
      },
      {
        key: 'avgSpeed',
        label: 'Avg speed',
        value: formatSpeedWithUnit(stats.avgSpeedKmh),
        icon: IconActivity,
      },
      {
        key: 'longestRide',
        label: 'Longest ride',
        value: formatDistance(stats.longestRideM, units),
        icon: IconTrophy,
      },
      {
        key: 'used',
        label: 'Battery used',
        value: formatEnergy(stats.batteryUsedWh),
        icon: IconBolt,
      },
      {
        key: 'regen',
        label: 'Regen',
        value: formatEnergy(stats.batteryRegenWh),
        icon: IconBatteryCharging,
      },
    ],
    [stats, units, formatSpeedWithUnit],
  )
  return keys ? keys.flatMap((key) => items.filter((item) => item.key === key)) : items
}
