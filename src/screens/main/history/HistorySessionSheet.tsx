import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import IconRoute from '@tabler/icons-react-native/IconRoute'
import IconStar from '@tabler/icons-react-native/IconStar'
import type { Favorite } from 'vescape-core'

import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { MessageCard } from '@/components/ui/MessageCard'
import { ToggleGroup } from '@/components/ui/ToggleGroup'
import { favoriteSessionId } from '@/modules/history/lib/favorites'
import type { HistorySession } from '@/modules/history/store/historyStore'
import type { HistoryTab } from '@/screens/main/mainScreenStore'
import { SessionRideRow } from '@/screens/main/profile/SessionRideRow'

interface HistorySessionSheetProps {
  visible: boolean
  favoriteMode: boolean
  sessions: HistorySession[]
  favorites: Favorite[]
  selectedSessionId: string | null
  hasMore: boolean
  loadingMore: boolean
  tab: HistoryTab
  onSelectTab: (tab: HistoryTab) => void
  onClose: () => void
  onSelectSession: (session: HistorySession) => void
  onLoadMore: () => void
}

/** The rides (or Favorites) to jump between while replaying one; the open one is outlined. The
 * History/Favorites switch lives here, since the replay itself has no room for it. */
export function HistorySessionSheet({
  visible,
  favoriteMode,
  sessions,
  favorites,
  selectedSessionId,
  hasMore,
  loadingMore,
  tab,
  onSelectTab,
  onClose,
  onSelectSession,
  onLoadMore,
}: HistorySessionSheetProps) {
  const favoritesBySessionId = useMemo(
    () => new Map(favorites.map((favorite) => [favoriteSessionId(favorite.id), favorite])),
    [favorites],
  )

  return (
    <Drawer
      visible={visible}
      title={favoriteMode ? 'Favorites' : 'Rides'}
      headerRight={
        <ToggleGroup<HistoryTab>
          activeKey={tab}
          options={[
            { key: 'history', label: 'History', testID: 'history-tab-history' },
            { key: 'favorites', label: 'Favorites', testID: 'history-tab-favorites' },
          ]}
          onSelect={onSelectTab}
        />
      }
      onClose={onClose}
      testID="history-session-sheet"
    >
      <View style={styles.list}>
        {sessions.length === 0 ? (
          <MessageCard
            icon={favoriteMode ? IconStar : IconRoute}
            title={favoriteMode ? 'No favorites yet' : 'No rides yet'}
            description={
              favoriteMode
                ? 'Open a ride in History, tap the star, adjust the range, then save'
                : 'Record a ride and it shows up in this list'
            }
          />
        ) : (
          sessions.map((session) => (
            <SessionRideRow
              key={session.id}
              testID={`history-session-row-${session.id}`}
              session={session}
              favorite={favoritesBySessionId.get(session.id)}
              selected={session.id === selectedSessionId}
              onPress={() => onSelectSession(session)}
            />
          ))
        )}
        {hasMore ? (
          <Button
            label="Load older rides"
            variant="outline"
            loading={loadingMore}
            onPress={onLoadMore}
            testID="history-load-more"
          />
        ) : null}
      </View>
    </Drawer>
  )
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
})
