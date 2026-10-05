import type { Favorite } from 'vescape-core'

import { useFormat } from '@/hooks/useFormat'
import { useRideFormat } from '@/modules/history/hooks/useRideFormat'
import { formatFavoriteName, formatRideListDateTime } from '@/modules/history/lib/rideFormat'
import { isLiveRide, rideMovingWindow, type HistorySession } from '@/modules/history/lib/sessions'
import { RideRow } from '@/screens/main/profile/RideRow'

interface SessionRideRowProps {
  session: HistorySession
  /** Set when the row is a Favorite: it leads with the Favorite's name, the ride's time under it. */
  favorite?: Favorite
  selected?: boolean
  onPress: () => void
  testID?: string
}

/** A ride (or a Favorite cut from one) as a `RideRow`, so every list of rides words it the same way. */
export function SessionRideRow({
  session,
  favorite,
  selected,
  onPress,
  testID,
}: SessionRideRowProps) {
  const { formatSpeedWithUnit } = useFormat()
  const { formatRideDetails } = useRideFormat()
  const window = rideMovingWindow(session) ?? { startMs: session.startAtMs, endMs: session.endAtMs }
  const when = formatRideListDateTime(
    window.startMs,
    window.endMs,
    !favorite && isLiveRide(session, Date.now()),
  )
  const figures = [
    formatRideDetails(window.endMs - window.startMs, session.distanceM, null),
    formatSpeedWithUnit(session.maxSpeedKmh),
  ].join(' · ')

  return (
    <RideRow
      testID={testID}
      title={favorite ? formatFavoriteName(favorite.name, favorite.startMs, favorite.endMs) : when}
      subtitle={favorite ? when : figures}
      details={favorite ? figures : (session.boardName ?? undefined)}
      routePoints={session.routePoints}
      selected={selected}
      onPress={onPress}
    />
  )
}
