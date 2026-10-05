import type { RefObject } from 'react'
import type { MapPoint, MapPointPatch } from 'vescape-core'

import type { MapSelection } from '@/modules/map/lib/mapSelection'
import type { DirectionPoint } from '@/modules/map/store/mapStore'
import type { MainMapHandle } from '@/screens/main/map/MainMap'

export interface MapModeOverlayProps {
  visible: boolean
  /** A map layer (weather, legal limits) owns the bottom of the screen, so the sheets step aside. */
  layerActive: boolean
  mapRef: RefObject<MainMapHandle | null>
  mapInteractionHandlerRef: RefObject<(selection?: MapSelection) => boolean | undefined>
  /** Top of the map's control row, shared with the mode tabs. */
  top: number
  /** Where the add and filter menus sit above the telemetry strip. */
  bottom: number
  /** Where the target sheet sits above the safe area. */
  sheetBottom: number
  searchProximity: { latitude: number; longitude: number } | null
  directionPoint: DirectionPoint | null
  activeNavigationTarget: MapSelection | null
  selectedNavigationTarget: MapSelection | null
  longPressMapTarget: MapSelection | null
  onLongPressMapTargetHandled: () => void
  onSelectNavigationTarget: (selection: MapSelection) => void
  onNavigateSelectedTarget: () => Promise<void>
  onCancelNavigation: () => void
  onDismissSelectedTarget: () => void
  updateMapPoint: (id: string, patch: MapPointPatch) => Promise<MapPoint | null>
  setMapPointReaction: (id: string, reaction: 'up' | 'down' | null) => void
  onRemoveMapPoint: (id: string) => void
}
