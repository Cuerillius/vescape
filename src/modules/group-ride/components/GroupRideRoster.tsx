import { StyleSheet, View } from 'react-native'
import IconBatteryVertical from '@tabler/icons-react-native/IconBatteryVertical'
import IconDeviceMobile from '@tabler/icons-react-native/IconDeviceMobile'
import IconGauge from '@tabler/icons-react-native/IconGauge'
import IconTemperature from '@tabler/icons-react-native/IconTemperature'
import type { Icon as TablerIcon } from '@tabler/icons-react-native'

import { Text } from '@/components/base/Text'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import { theme } from '@/constants/theme'
import {
  TELEMETRY_LEVEL_COLOR,
  type TelemetryLevel,
} from '@/modules/board/constants/telemetryThresholds'
import { useRiderStats } from '@/modules/group-ride/hooks/useRiderStats'
import type { NearbyRide } from '@/modules/group-ride/lib/nearby'
import type { RosterRider } from '@/modules/group-ride/lib/roster'
import { DASH } from '@/helpers/format'
import { useFormat } from '@/hooks/useFormat'
import { useResolvedColor } from '@/hooks/useTheme'

/** The riders of the active ride: one flat row each, hairlines between. */
export function RosterList({ rows, connected }: { rows: RosterRider[]; connected: boolean }) {
  return (
    <View>
      {rows.map((rider, index) => (
        <View key={rider.id}>
          {index > 0 ? <Separator /> : null}
          <RiderRow rider={rider} connected={connected} />
        </View>
      ))}
    </View>
  )
}

/** One stat of a rider: its icon, then the value or a dash. A warning or critical `level` tints both. */
function Stat({
  icon: StatIcon,
  value,
  level = 'normal',
}: {
  icon: TablerIcon
  value?: string
  level?: TelemetryLevel
}) {
  const alert = level !== 'normal'
  const color = alert ? TELEMETRY_LEVEL_COLOR[level] : theme.ui.mutedForeground
  const iconColor = useResolvedColor(color)
  return (
    <View style={styles.stat}>
      <StatIcon size={14} color={iconColor} />
      <Text style={[styles.statValue, alert && { color }]} numberOfLines={1}>
        {value ?? DASH}
      </Text>
    </View>
  )
}

function RiderRow({ rider, connected }: { rider: RosterRider; connected: boolean }) {
  const boardName = rider.presence?.boardName?.trim() || 'Board not connected'
  // Only claim a rider is "Live" when our own relay link is up; otherwise the roster is just the
  // last snapshot we received and we can't know it's current.
  const fresh = !rider.stale && connected
  const s = useRiderStats(rider.presence)

  return (
    <View style={styles.rider}>
      <View style={styles.riderHead}>
        <View
          style={[styles.riderDot, { backgroundColor: rider.color || theme.ui.mutedForeground }]}
        />
        <View style={styles.riderText}>
          <Text style={styles.riderName} numberOfLines={1}>
            {rider.name}
            {rider.isSelf ? <Text style={styles.selfTag}> · You</Text> : null}
          </Text>
          <Text style={styles.riderBoard} numberOfLines={1}>
            {boardName}
          </Text>
        </View>
        <Badge
          label={fresh ? 'Live' : 'Stale'}
          variant="outline"
          dot={fresh ? theme.palette.groupRide.color : theme.ui.mutedForeground}
        />
      </View>
      <View style={styles.statRow}>
        <Stat icon={IconGauge} value={s.speed.value} level={s.speed.level} />
        <Stat icon={IconBatteryVertical} value={s.soc.value} level={s.soc.level} />
        <Stat icon={IconTemperature} value={s.motor.value} level={s.motor.level} />
        <Stat icon={IconDeviceMobile} value={s.phone.value} level={s.phone.level} />
      </View>
    </View>
  )
}

/** The nearest ride to join: its name, size and distance, and how many more are around. */
export function NearbyRideBody({ nearby }: { nearby: NearbyRide[] }) {
  const { formatDistance } = useFormat()
  const nearest = nearby[0]
  const ride = nearest.ride
  const name = ride.name?.trim() || `${ride.creator.name || 'Rider'}'s ride`
  const extra = nearby.length - 1

  return (
    <View style={styles.nearby}>
      <Text style={styles.rideName} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.rideMeta} numberOfLines={1}>
        {ride.riderCount} {ride.riderCount === 1 ? 'rider' : 'riders'} ·{' '}
        {formatDistance(nearest.distanceM)} away
        {extra > 0 ? ` · +${extra} more nearby` : ''}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  nearby: {
    gap: 2,
  },
  rideName: {
    color: theme.ui.foreground,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  rideMeta: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '500',
  },
  rider: {
    gap: 10,
    paddingVertical: 12,
  },
  riderHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  riderDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  riderText: {
    flex: 1,
    minWidth: 0,
  },
  riderName: {
    color: theme.ui.foreground,
    fontSize: 15,
    fontWeight: '700',
  },
  selfTag: {
    color: theme.ui.mutedForeground,
    fontWeight: '500',
  },
  riderBoard: {
    color: theme.ui.mutedForeground,
    fontSize: 12,
  },
  statRow: {
    flexDirection: 'row',
    paddingLeft: 22,
  },
  stat: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statValue: {
    flexShrink: 1,
    color: theme.ui.mutedForeground,
    fontSize: 12,
    fontWeight: '600',
  },
})
