import IconAlertTriangle from '@tabler/icons-react-native/IconAlertTriangle'
import IconClock from '@tabler/icons-react-native/IconClock'
import IconRoute from '@tabler/icons-react-native/IconRoute'
import type { ReactNode } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { useFormat } from '@/hooks/useFormat'
import { Text } from '@/components/base/Text'
import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import { fmtRideDuration } from '@/helpers/format'
import type { MapTargetSheetAction } from '@/modules/map-points/components/mapTargetSheetChrome'
import {
  MapPointDetails,
  MapTargetActionRow,
  MapTargetPrimaryAction,
  MapTargetReadHeader,
  MapTargetSheetFrame,
} from '@/modules/map-points/components/mapTargetSheetChrome'
import type { MapPointMediaAsset } from '@/modules/map-points/store/mapPointPhotoFiles'
import type { MapSelection } from '@/modules/map/lib/mapSelection'

export function MapTargetNavigationBody({
  target,
  bottom,
  action,
  sideAction,
  notice,
  path,
  computing = false,
  profileSelector,
  media,
  onDismiss,
  onFocusTarget,
}: {
  target: MapSelection
  bottom: number
  /** Confirming the path and leaving the map for the ride view. The rider's likely next move. */
  action: MapTargetSheetAction
  /** Beside the confirm at lesser weight: asking for the path again. Dropping it is the header X. */
  sideAction?: MapTargetSheetAction
  /** Why there is no line, in rider-facing words. */
  notice?: string | null
  /** How far the drawn path runs and how long it is estimated to take. `null` while there is none. */
  path?: { distanceMeters: number; durationSeconds: number } | null
  /** Native is computing a path right now: the row says so instead of showing yesterday's numbers. */
  computing?: boolean
  /** Which kind of ways the path may follow. Sits on the path view, never in app settings. */
  profileSelector?: ReactNode
  media: readonly MapPointMediaAsset[]
  onDismiss?: () => void
  onFocusTarget?: () => void
}) {
  return (
    <MapTargetSheetFrame
      target={target}
      bottom={bottom}
      header={<MapTargetReadHeader target={target} />}
      onDismiss={onDismiss}
      onFocusTarget={onFocusTarget}
      animateEntrance
    >
      {target.type === 'mapPoint' ? <MapPointDetails point={target.point} media={media} /> : null}
      <PathFacts computing={computing} notice={notice} path={path} />
      {profileSelector}
      <MapTargetActionRow>
        {sideAction ? <MapTargetPrimaryAction action={sideAction} iconOnly /> : null}
        <MapTargetPrimaryAction action={action} />
      </MapTargetActionRow>
    </MapTargetSheetFrame>
  )
}

/**
 * The one line about the path itself, in the order the rider needs it: whether one is being worked
 * out at all, then why there is none, then how far and how long the one on screen is.
 *
 * Computing wins over the notice because a failed path stays on screen while the rider asks again —
 * leaving "no path leads here" up during the retry would answer a question they just re-asked.
 */
function PathFacts({
  computing,
  notice,
  path,
}: {
  computing: boolean
  notice?: string | null
  path?: { distanceMeters: number; durationSeconds: number } | null
}) {
  const { formatDistance } = useFormat()
  const mutedColor = useResolvedColor(theme.ui.mutedForeground)
  const warningColor = useResolvedColor(theme.status.warning.text)
  if (computing) {
    return (
      <View style={styles.pathFacts}>
        <ActivityIndicator size="small" color={mutedColor} />
        <Text style={styles.pathFactText}>Finding a path…</Text>
      </View>
    )
  }

  if (notice) {
    return (
      <View style={styles.notice}>
        <IconAlertTriangle size={16} color={warningColor} />
        <Text style={styles.noticeText}>{notice}</Text>
      </View>
    )
  }

  // A restored path from before these were stored has neither; the line simply steps aside rather
  // than claiming a 0 km ride.
  if (!path || path.distanceMeters <= 0) return null

  return (
    <View style={styles.pathFacts}>
      <IconRoute size={16} color={mutedColor} />
      <Text style={styles.pathFactText}>{formatDistance(path.distanceMeters)}</Text>
      {path.durationSeconds > 0 ? (
        <>
          <IconClock size={16} color={mutedColor} />
          <Text style={styles.pathFactText}>{fmtRideDuration(path.durationSeconds)}</Text>
        </>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  /**
   * Centred under the target, over the full-width Profile switcher: the length, the ways it
   * follows and the confirm read as one column about the path, rather than as a detail list.
   * The notice keeps the left edge — it is a sentence, and sentences are read from a margin.
   */
  pathFacts: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    // Fixed, because the spinner is taller than the numbers it stands in for: without it the sheet
    // grows for the second a recompute takes and drops back, and the buttons move under the thumb.
    height: 22,
  },
  pathFactText: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '500',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 36,
  },
  noticeText: {
    flexShrink: 1,
    color: theme.status.warning.text,
    fontSize: 12,
    fontWeight: '700',
  },
})
