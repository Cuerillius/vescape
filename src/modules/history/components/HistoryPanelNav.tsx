import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import IconChevronDown from '@tabler/icons-react-native/IconChevronDown'
import IconPencil from '@tabler/icons-react-native/IconPencil'
import IconStar from '@tabler/icons-react-native/IconStar'
import IconStarFilled from '@tabler/icons-react-native/IconStarFilled'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { StepBar } from '@/components/ui/StepBar'
import { interaction, theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import { formatRideMeta, formatRideTime } from '@/modules/history/lib/rideFormat'

interface HistoryPanelNavProps {
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
  /** Before the switcher, e.g. back. */
  leading?: ReactNode
  /** After the Favorite button, e.g. the actions menu. */
  trailing?: ReactNode
  onPrevious: () => void
  onNext: () => void
  onOpenList: () => void
  /** Stars (or edits) the Favorite: a ride's star, an open Favorite's pencil. */
  onFavoriteAction: () => void
}

/**
 * The ride (or Favorite) being replayed between step arrows, where tapping its name opens the
 * list, with a Favorite button after it: the star on a ride, the pencil on a Favorite.
 */
export function HistoryPanelNav({
  titleStartMs,
  titleEndMs,
  boardName,
  title,
  subtitle,
  canPrevious,
  canNext,
  favoriteMode,
  favorited,
  actionDisabled,
  leading,
  trailing,
  onPrevious,
  onNext,
  onOpenList,
  onFavoriteAction,
}: HistoryPanelNavProps) {
  const mutedColor = useResolvedColor(theme.ui.mutedForeground)
  const primaryLabel = title ?? formatRideTime(titleStartMs, titleEndMs)
  const secondaryLabel = subtitle ?? formatRideMeta(titleStartMs, titleEndMs, boardName)

  return (
    <View style={styles.navControls}>
      {leading}
      <View style={styles.selector}>
        <StepBar
          onPrevious={canPrevious ? onPrevious : null}
          onNext={canNext ? onNext : null}
          previousLabel="Previous ride"
          nextLabel="Next ride"
          previousTestID="history-previous-ride"
          nextTestID="history-next-ride"
        >
          <Pressable
            testID="history-ride-list-button"
            accessibilityRole="button"
            accessibilityLabel={`${primaryLabel}, show all`}
            style={({ pressed }) => [styles.titleButton, pressed && styles.titlePressed]}
            android_ripple={interaction.ripple}
            onPress={onOpenList}
          >
            <View style={styles.titleText}>
              <Text style={styles.title} numberOfLines={1}>
                {primaryLabel}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {secondaryLabel}
              </Text>
            </View>
            <IconChevronDown size={14} color={mutedColor} />
          </Pressable>
        </StepBar>
      </View>
      {favoriteMode ? (
        <Button
          icon={IconPencil}
          variant="floating"
          size="lg"
          onPress={onFavoriteAction}
          disabled={actionDisabled}
          testID="favorite-edit"
          accessibilityLabel="Edit Favorite"
        />
      ) : (
        <Button
          icon={favorited ? IconStarFilled : IconStar}
          variant="floating"
          size="lg"
          onPress={onFavoriteAction}
          testID="history-favorite-ride"
          color={favorited ? theme.palette.amber.color : undefined}
          disabled={actionDisabled}
          accessibilityLabel={favorited ? 'Edit Favorite' : 'Create Favorite'}
        />
      )}
      {trailing}
    </View>
  )
}

const styles = StyleSheet.create({
  navControls: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    gap: 8,
  },
  selector: {
    flex: 1,
    minWidth: 0,
  },
  titleButton: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  titlePressed: {
    backgroundColor: theme.ui.muted,
  },
  titleText: {
    flexShrink: 1,
    alignItems: 'center',
  },
  title: {
    color: theme.ui.foreground,
    fontSize: 13,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.ui.mutedForeground,
    fontSize: 11,
    fontWeight: '500',
  },
})
