import { StyleSheet, View } from 'react-native'
import IconRoute from '@tabler/icons-react-native/IconRoute'
import IconStar from '@tabler/icons-react-native/IconStar'

import { MessageCard } from '@/components/ui/MessageCard'

interface HistoryEmptyStateProps {
  favoriteMode?: boolean
}

/** Over the map when there is no ride to replay: nothing recorded yet, or nothing starred. */
export function HistoryEmptyState({ favoriteMode = false }: HistoryEmptyStateProps) {
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <View style={styles.card}>
        <MessageCard
          icon={favoriteMode ? IconStar : IconRoute}
          title={favoriteMode ? 'No favorites yet' : 'No rides yet'}
          description={
            favoriteMode
              ? 'Star a stretch of a ride in History to keep it here'
              : 'Record a ride and it shows up here'
          }
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    zIndex: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
  },
})
