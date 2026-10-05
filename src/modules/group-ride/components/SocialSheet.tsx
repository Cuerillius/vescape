import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import IconAlertTriangle from '@tabler/icons-react-native/IconAlertTriangle'
import IconBroadcast from '@tabler/icons-react-native/IconBroadcast'
import IconCurrentLocation from '@tabler/icons-react-native/IconCurrentLocation'
import IconLogout from '@tabler/icons-react-native/IconLogout'
import IconPlus from '@tabler/icons-react-native/IconPlus'
import IconUsers from '@tabler/icons-react-native/IconUsers'
import IconWifiOff from '@tabler/icons-react-native/IconWifiOff'
import type { Icon as TablerIcon } from '@tabler/icons-react-native'

import { Text } from '@/components/base/Text'
import { ColorPicker } from '@/components/forms/ColorPicker'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardDescription } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { MessageCard } from '@/components/ui/MessageCard'
import { Switch } from '@/components/ui/Switch'
import { theme } from '@/constants/theme'
import { useRenderRateWarning } from '@/hooks/useRenderRateWarning'
import { NearbyRideBody, RosterList } from '@/modules/group-ride/components/GroupRideRoster'
import { riderColorOptions } from '@/modules/group-ride/constants/riderColors'
import { useGroupRideStore } from '@/modules/group-ride/store/groupRideStore'
import { useRiderStore } from '@/modules/group-ride/store/riderStore'

/** The Group Ride drawer's content: who you ride as, then starting, joining or leaving a ride. */
export function SocialSheet() {
  return (
    <View testID="social-sheet" style={styles.sheet}>
      <RiderIdentity />
      <GroupRide />
    </View>
  )
}

/** Connection pill for the drawer header: Live while the relay socket is up, Offline when presence
 *  can't reach the server (e.g. no internet). Absent outside a ride. */
export function GroupRideStatusBadge() {
  const active = useGroupRideStore((s) => s.activeRideId !== null)
  const connected = useGroupRideStore((s) => s.connection === 'connected')
  if (!active) return null
  return (
    <Badge
      label={connected ? 'Live' : 'Offline'}
      variant="outline"
      dot={connected ? theme.palette.groupRide.color : theme.palette.amber.color}
    />
  )
}

function RiderIdentity() {
  const riderName = useRiderStore((s) => s.riderName)
  const setName = useRiderStore((s) => s.setName)
  const riderColor = useRiderStore((s) => s.riderColor)
  const setColor = useRiderStore((s) => s.setColor)
  const error = useRiderStore((s) => s.error)
  // The text being typed; null while the field just shows the stored name.
  const [draft, setDraft] = useState<string | null>(null)

  const commit = () => {
    if (draft === null) return
    setDraft(null)
    if (draft.trim() === (riderName ?? '').trim()) return
    // intentional-suppression: Rider store error is rendered below
    void setName(draft).catch(() => undefined) // The store exposes this failure below.
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>You</Text>
      <Input
        value={draft ?? riderName ?? ''}
        placeholder="Add a display name"
        maxLength={32}
        returnKeyType="done"
        autoCorrect={false}
        onChangeText={setDraft}
        onBlur={commit}
        onSubmitEditing={commit}
        accessibilityLabel="Rider display name"
      />
      <ColorPicker
        value={riderColor}
        colors={riderColorOptions}
        onChange={(color) => {
          // intentional-suppression: Rider store error is rendered below
          void setColor(color).catch(() => undefined) // The store exposes this failure below.
        }}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  )
}

function GroupRide() {
  useRenderRateWarning('GroupRideWidget')
  const activeRideId = useGroupRideStore((s) => s.activeRideId)
  const rides = useGroupRideStore((s) => s.rides)
  const nearby = useGroupRideStore((s) => s.nearby)
  const rosterRows = useGroupRideStore((s) => s.rosterRows)
  const connection = useGroupRideStore((s) => s.connection)
  const hasLocation = useGroupRideStore((s) => s.ownLocation !== null)
  const createRide = useGroupRideStore((s) => s.createRide)
  const leaveRide = useGroupRideStore((s) => s.leaveRide)
  const joinRide = useGroupRideStore((s) => s.joinRide)
  const publicRiding = useGroupRideStore((s) => s.publicRiding)
  const setPublicRiding = useGroupRideStore((s) => s.setPublicRiding)

  const active = activeRideId != null
  const connected = connection === 'connected'

  // Native gates the relay socket when the installed version is Online/App Blocked and reports it
  // as `blocked`; Group Ride is unusable until the app updates, so replace the live UI entirely.
  if (connection === 'blocked') {
    return (
      <MessageCard
        icon={IconAlertTriangle}
        title="Group Ride is unavailable"
        description="Update the app to use it."
      />
    )
  }

  const rideName = rides.find((r) => r.id === activeRideId)?.name?.trim() || 'Your group ride'

  if (active) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{rideName}</Text>
        {rosterRows.length > 0 ? (
          <RosterList rows={rosterRows} connected={connected} />
        ) : (
          <Empty icon={IconUsers} text="Waiting for other riders to join." />
        )}
        <Button
          label="Leave ride"
          icon={IconLogout}
          variant="outline"
          color={theme.status.error.text}
          onPress={leaveRide}
          accessibilityLabel="Leave group ride"
        />
      </View>
    )
  }

  const nearbyRide = nearby.length > 0

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Group ride</Text>
      {publicRiding ? (
        <Empty
          icon={IconBroadcast}
          text="Auto is on. When your board connects, you join the nearest ride or start one."
        />
      ) : nearbyRide ? (
        <NearbyRideBody nearby={nearby} />
      ) : !connected ? (
        <Empty icon={IconWifiOff} text="Connecting to server…" />
      ) : !hasLocation ? (
        <Empty icon={IconCurrentLocation} text="Finding your location…" />
      ) : (
        <Empty icon={IconBroadcast} text="No group rides near you right now." />
      )}
      {nearbyRide ? (
        <Button
          label="Join nearest ride"
          variant="primary"
          disabled={!connected}
          onPress={() => joinRide(nearby[0].ride.id)}
          accessibilityLabel="Join nearest group ride"
        />
      ) : (
        <Button
          label="Start a ride"
          icon={IconPlus}
          variant="primary"
          disabled={!hasLocation || !connected}
          onPress={() => createRide('')}
          accessibilityLabel="Create group ride"
        />
      )}
      <Card style={styles.autoCard}>
        <View style={styles.autoText}>
          <Text style={styles.autoTitle}>Join automatically</Text>
          <CardDescription numberOfLines={2}>
            Join the nearest ride, or start one, when your board connects.
          </CardDescription>
        </View>
        <Switch
          value={publicRiding}
          onValueChange={setPublicRiding}
          accessibilityLabel="Ride publicly"
        />
      </Card>
    </View>
  )
}

/** A quiet one-line state: what the panel is waiting on, or why there is nothing to show. */
function Empty({ icon: StateIcon, text }: { icon: TablerIcon; text: string }) {
  return (
    <View style={styles.empty}>
      <StateIcon size={18} color={theme.ui.mutedForeground} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  sheet: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: theme.ui.foreground,
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    color: theme.status.error.text,
    fontSize: 12,
  },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    flex: 1,
    color: theme.ui.mutedForeground,
    fontSize: 14,
  },
  autoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  autoText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  autoTitle: {
    color: theme.ui.foreground,
    fontSize: 14,
    fontWeight: '700',
  },
})
