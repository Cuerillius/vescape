import { StyleSheet, View } from 'react-native'
import IconArrowLeft from '@tabler/icons-react-native/IconArrowLeft'
import IconDots from '@tabler/icons-react-native/IconDots'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button } from '@/components/ui/Button'
import { HistoryPanelNav } from '@/modules/history/components/HistoryPanelNav'

interface HistoryRideNavProps {
  titleStartMs: number
  titleEndMs: number
  boardName: string
  title?: string
  subtitle?: string
  canPrevious: boolean
  canNext: boolean
  favoriteMode: boolean
  favorited: boolean
  actionDisabled: boolean
  onPrevious: () => void
  onNext: () => void
  onOpenList: () => void
  onFavoriteAction: () => void
  onBack: () => void
  onOpenActions: () => void
}

/** The top of an open ride, over the map: back, the ride switcher, its Favorite button and actions. */
export function HistoryRideNav({
  onBack,
  onOpenActions,
  favoriteMode,
  ...nav
}: HistoryRideNavProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.wrap, { top: Math.max(insets.top, 8) }]} pointerEvents="box-none">
      <HistoryPanelNav
        {...nav}
        favoriteMode={favoriteMode}
        leading={
          <Button
            icon={IconArrowLeft}
            variant="floating"
            size="lg"
            testID="history-back"
            onPress={onBack}
            accessibilityLabel="Back"
          />
        }
        trailing={
          <Button
            icon={IconDots}
            variant="floating"
            size="lg"
            onPress={onOpenActions}
            testID={favoriteMode ? 'favorite-actions' : 'history-actions'}
            accessibilityLabel={favoriteMode ? 'Favorite actions' : 'Ride actions'}
          />
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 30,
    paddingHorizontal: 10,
  },
})
