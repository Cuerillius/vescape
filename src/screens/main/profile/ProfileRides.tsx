import { useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import IconAlertCircle from '@tabler/icons-react-native/IconAlertCircle'
import IconChevronRight from '@tabler/icons-react-native/IconChevronRight'
import IconRoute from '@tabler/icons-react-native/IconRoute'
import IconStar from '@tabler/icons-react-native/IconStar'

import { Button } from '@/components/ui/Button'
import { ToggleGroup } from '@/components/ui/ToggleGroup'
import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import type { HistorySession } from '@/modules/history/lib/sessions'
import { MessageCard } from '@/components/ui/MessageCard'
import { SessionRideRow } from '@/screens/main/profile/SessionRideRow'
import type { ProfileRidesData } from '@/screens/main/profile/useProfileRides'

export type RideListMode = 'rides' | 'favorites'

const LAST_RIDES_SHOWN = 3
const FAVORITES_SHOWN = 3

interface ProfileRidesProps {
  rides: ProfileRidesData
  onOpenRide: (session: HistorySession) => void
  onOpenFavorite: (favoriteId: string, session: HistorySession) => void
  onShowAll: (mode: RideListMode) => void
}

/**
 * The Profile tab's Last rides and Favorites, switched like the stats above. Opening one hands off to the map's History view;
 * "All rides" and "See all" open the full list.
 */
export function ProfileRides({ rides, onOpenRide, onOpenFavorite, onShowAll }: ProfileRidesProps) {
  const mutedColor = useResolvedColor(theme.ui.mutedForeground)
  const [mode, setMode] = useState<RideListMode>('rides')
  const { sessions, favorites } = rides
  const ridesBusy = !rides.ridesLoaded || rides.ridesLoading

  return (
    <View style={styles.section} testID="profile-last-rides">
      <View style={styles.sectionHead}>
        <ToggleGroup<RideListMode>
          options={[
            { key: 'rides', label: 'Last rides' },
            { key: 'favorites', label: 'Favorites' },
          ]}
          activeKey={mode}
          onSelect={setMode}
        />
        {mode === 'rides' ? (
          <Button
            label="All rides"
            icon={IconChevronRight}
            variant="outline"
            disabled={ridesBusy || sessions.length === 0}
            onPress={() => onShowAll('rides')}
            testID="profile-all-rides"
          />
        ) : (
          <Button
            label="See all"
            icon={IconChevronRight}
            variant="outline"
            disabled={!rides.favoritesLoaded || rides.favoritesLoading || favorites.length === 0}
            onPress={() => onShowAll('favorites')}
            testID="profile-all-favorites"
          />
        )}
      </View>
      {mode === 'rides' ? (
        ridesBusy ? (
          <RideListSkeleton />
        ) : sessions.length === 0 && rides.ridesError ? (
          <MessageCard
            icon={IconAlertCircle}
            tone="error"
            title="Could not load rides"
            description="Restart the app to try again"
          />
        ) : sessions.length === 0 ? (
          <MessageCard
            icon={IconRoute}
            title="No rides yet"
            description="Record a ride and it shows up here"
          />
        ) : (
          <View style={styles.rideList}>
            {sessions.slice(0, LAST_RIDES_SHOWN).map((session, index) => (
              <SessionRideRow
                key={session.id}
                testID={index === 0 ? 'history-latest-ride' : undefined}
                session={session}
                onPress={() => onOpenRide(session)}
              />
            ))}
          </View>
        )
      ) : favorites.length === 0 && (!rides.favoritesLoaded || rides.favoritesLoading) ? (
        <ActivityIndicator size="small" color={mutedColor} style={styles.loading} />
      ) : favorites.length === 0 && rides.favoritesError ? (
        <MessageCard
          icon={IconAlertCircle}
          tone="error"
          title="Could not load favorites"
          description="Restart the app to try again"
        />
      ) : favorites.length === 0 ? (
        <MessageCard
          icon={IconStar}
          title="No favorites yet"
          description="Star a stretch of a ride in History to keep it here"
        />
      ) : (
        <View style={styles.rideList} testID="profile-favorites">
          {favorites.slice(0, FAVORITES_SHOWN).map(({ favorite, session }) => (
            <SessionRideRow
              key={favorite.id}
              session={session}
              favorite={favorite}
              onPress={() => onOpenFavorite(favorite.id, session)}
            />
          ))}
        </View>
      )}
    </View>
  )
}

function RideListSkeleton() {
  return (
    <View style={styles.rideList} accessibilityLabel="Loading recent rides">
      {[0, 1, 2].map((index) => (
        <View key={index} style={styles.rideSkeleton} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  section: {
    gap: 8,
  },
  rideList: {
    gap: 8,
  },
  rideSkeleton: {
    height: 74,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
    opacity: 0.55,
  },
  loading: {
    marginVertical: 48,
  },
})
