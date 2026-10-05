import { ActivityIndicator, StyleSheet, View } from 'react-native'
import IconAlertCircle from '@tabler/icons-react-native/IconAlertCircle'
import IconChevronLeft from '@tabler/icons-react-native/IconChevronLeft'
import IconRoute from '@tabler/icons-react-native/IconRoute'
import IconStar from '@tabler/icons-react-native/IconStar'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { ToggleGroup } from '@/components/ui/ToggleGroup'
import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import type { HistorySession } from '@/modules/history/lib/sessions'
import { MessageCard } from '@/components/ui/MessageCard'
import { CoverTabView } from '@/screens/main/CoverTabView'
import type { RideListMode } from '@/screens/main/profile/ProfileRides'
import { SessionRideRow } from '@/screens/main/profile/SessionRideRow'
import type { ProfileRidesData } from '@/screens/main/profile/useProfileRides'

interface ProfileRideListProps {
  visible: boolean
  mode: RideListMode
  onModeChange: (mode: RideListMode) => void
  rides: ProfileRidesData
  onBack: () => void
  onOpenRide: (session: HistorySession) => void
  onOpenFavorite: (favoriteId: string, session: HistorySession) => void
}

/**
 * Every ride, or every Favorite, as a full view over the Profile tab. Older rides page in on
 * demand; opening one hands off to the map's History view.
 */
export function ProfileRideList({
  visible,
  mode,
  onModeChange,
  rides,
  onBack,
  onOpenRide,
  onOpenFavorite,
}: ProfileRideListProps) {
  const mutedColor = useResolvedColor(theme.ui.mutedForeground)
  const favoritesMode = mode === 'favorites'

  return (
    <CoverTabView visible={visible} testID="profile-ride-list">
      <View style={styles.header}>
        <Button
          icon={IconChevronLeft}
          variant="ghost"
          accessibilityLabel="Back to profile"
          onPress={onBack}
          testID="profile-ride-list-back"
        />
        <Text style={styles.title}>{favoritesMode ? 'Favorites' : 'Rides'}</Text>
      </View>

      <ToggleGroup<RideListMode>
        activeKey={mode}
        options={[
          { key: 'rides', label: 'Rides' },
          { key: 'favorites', label: 'Favorites' },
        ]}
        onSelect={onModeChange}
      />

      {favoritesMode ? (
        rides.favorites.length === 0 ? (
          rides.favoritesError ? (
            <MessageCard
              icon={IconAlertCircle}
              tone="error"
              title="Could not load favorites"
              description="Restart the app to try again"
            />
          ) : (
            <MessageCard
              icon={IconStar}
              title="No favorites yet"
              description="Star a stretch of a ride in History to keep it here"
            />
          )
        ) : (
          <View style={styles.list}>
            {rides.favorites.map(({ favorite, session }) => (
              <SessionRideRow
                key={favorite.id}
                session={session}
                favorite={favorite}
                onPress={() => onOpenFavorite(favorite.id, session)}
              />
            ))}
          </View>
        )
      ) : rides.sessions.length === 0 ? (
        rides.ridesError ? (
          <MessageCard
            icon={IconAlertCircle}
            tone="error"
            title="Could not load rides"
            description="Restart the app to try again"
          />
        ) : (
          <MessageCard
            icon={IconRoute}
            title="No rides yet"
            description="Record a ride and it shows up here"
          />
        )
      ) : (
        <View style={styles.list}>
          {rides.sessions.map((session) => (
            <SessionRideRow
              key={session.id}
              testID={`profile-ride-row-${session.id}`}
              session={session}
              onPress={() => onOpenRide(session)}
            />
          ))}
          {rides.hasMoreRides ? (
            rides.ridesLoading ? (
              <ActivityIndicator size="small" color={mutedColor} style={styles.loadingMore} />
            ) : (
              <Button
                label="Load older rides"
                variant="outline"
                onPress={rides.loadMoreRides}
                testID="profile-load-more-rides"
              />
            )
          ) : null}
        </View>
      )}
    </CoverTabView>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: -8,
  },
  title: {
    flex: 1,
    color: theme.ui.foreground,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  list: {
    gap: 8,
  },
  loadingMore: {
    paddingVertical: 16,
  },
})
