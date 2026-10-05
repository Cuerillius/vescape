import type { ReactNode } from 'react'
import type { MapPoint, MapPointPatch } from 'vescape-core'

import { MapTargetEditBody } from '@/modules/map-points/components/MapTargetSheetEditBody'
import { MapTargetNavigationBody } from '@/modules/map-points/components/MapTargetSheetNavigationBody'
import { MapTargetSelectBody } from '@/modules/map-points/components/MapTargetSheetSelectBody'
import type { MapTargetSheetAction } from '@/modules/map-points/components/mapTargetSheetChrome'
import { useMapPointMedia } from '@/modules/map-points/hooks/useMapPointMedia'
import type { MapSelection } from '@/modules/map/lib/mapSelection'

export function MapTargetSheet({
  target,
  bottom,
  mode,
  action,
  sideAction,
  notice,
  path,
  computing,
  profileSelector,
  onEdit,
  onSave,
  onSaveMapPoint,
  onVoteMapPoint,
  onDelete,
  onDismiss,
  onFocusTarget,
}: {
  target: MapSelection
  bottom: number
  mode: 'select' | 'navigation' | 'edit'
  action: MapTargetSheetAction
  /** Navigation mode only: smaller buttons flanking the primary one. */
  sideAction?: MapTargetSheetAction
  /** Navigation mode only: why there is no path, in rider-facing words. */
  notice?: string | null
  /** Navigation mode only: how far the drawn path runs and how long it takes. */
  path?: { distanceMeters: number; durationSeconds: number } | null
  /** Navigation mode only: native is computing a path right now. */
  computing?: boolean
  /** Navigation mode only: the Navigation Profile switcher, shown beside the drawn path. */
  profileSelector?: ReactNode
  onEdit?: () => void
  onSave?: () => void
  onSaveMapPoint?: (id: string, patch: MapPointPatch) => Promise<MapPoint | null>
  onVoteMapPoint?: (id: string, reaction: 'up' | 'down' | null) => boolean
  onDelete?: () => void
  onDismiss?: () => void
  onFocusTarget?: () => void
}) {
  const point = target.type === 'mapPoint' ? target.point : null
  const media = useMapPointMedia(point)

  if (mode === 'edit') {
    if (target.type !== 'mapPoint') return null
    return (
      <MapTargetEditBody
        target={target}
        bottom={bottom}
        media={media}
        onSave={onSave}
        onSaveMapPoint={onSaveMapPoint}
        onDelete={onDelete}
        onDismiss={onDismiss}
        onFocusTarget={onFocusTarget}
      />
    )
  }

  if (mode === 'navigation') {
    return (
      <MapTargetNavigationBody
        target={target}
        bottom={bottom}
        action={action}
        sideAction={sideAction}
        notice={notice}
        path={path}
        computing={computing}
        profileSelector={profileSelector}
        media={media.assets}
        onDismiss={onDismiss}
        onFocusTarget={onFocusTarget}
      />
    )
  }

  return (
    <MapTargetSelectBody
      target={target}
      bottom={bottom}
      action={action}
      media={media.assets}
      onEdit={onEdit}
      onVoteMapPoint={onVoteMapPoint}
      onDismiss={onDismiss}
      onFocusTarget={onFocusTarget}
    />
  )
}
