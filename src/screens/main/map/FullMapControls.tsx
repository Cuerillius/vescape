import * as Haptics from 'expo-haptics'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { MapPointCategory } from 'vescape-core'

import { useResolvedAccentColors } from '@/hooks/useTheme'
import { useRiderStore } from '@/modules/group-ride/store/riderStore'
import type { MapSelection } from '@/modules/map/lib/mapSelection'
import type { MapSearchResult } from '@/modules/map/lib/search'
import { MapPointAddMenu } from '@/modules/map-points/components/MapPointAddMenu'
import { getMapPointKindLabel } from '@/modules/map-points/constants/mapPoints'
import { useMapPointStore } from '@/modules/map-points/store/mapPointStore'
import { CenterPlacementPointer } from '@/screens/main/map/CenterPlacementPointer'
import { MapSearch } from '@/screens/main/map/MapSearch'
import type { MapModeOverlayProps } from '@/screens/main/map/mapModeOverlayTypes'

export interface FullMapControlsProps extends Pick<
  MapModeOverlayProps,
  | 'mapRef'
  | 'mapInteractionHandlerRef'
  | 'top'
  | 'bottom'
  | 'sheetBottom'
  | 'searchProximity'
  | 'onSelectNavigationTarget'
> {
  bottomControlsVisible: boolean
  addMenuOpen: boolean
  onAddMenuVisibilityChange: (visible: boolean) => void
  onBeginEditMapPoint: (id: string) => void
  onRequireMapAccount: () => boolean
}

/** Search and the Map Point add menu — everything only Explore mode shows. */
export function FullMapControls({
  mapRef,
  mapInteractionHandlerRef,
  top,
  bottom,
  sheetBottom,
  searchProximity,
  onSelectNavigationTarget,
  bottomControlsVisible,
  addMenuOpen,
  onAddMenuVisibilityChange,
  onBeginEditMapPoint,
  onRequireMapAccount,
}: FullMapControlsProps) {
  const accents = useResolvedAccentColors()
  const riderColor = useRiderStore((s) => s.riderColor)
  // Map Point creation is store truth, not screen wiring.
  const addMapPoint = useMapPointStore((s) => s.addMapPoint)
  const searchDismissRef = useRef<(() => void) | null>(null)
  const [placementPulseKey, setPlacementPulseKey] = useState(0)
  const placementTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const addMenuZoomedRef = useRef(false)

  const clearPlacementTimeout = useCallback(() => {
    if (!placementTimeoutRef.current) return
    clearTimeout(placementTimeoutRef.current)
    placementTimeoutRef.current = null
  }, [])

  const closeAddMenu = useCallback(
    (restoreZoom = true) => {
      clearPlacementTimeout()
      if (addMenuOpen && restoreZoom && addMenuZoomedRef.current) {
        mapRef.current?.zoomBy(-0.45)
      }
      addMenuZoomedRef.current = false
      setPlacementPulseKey(0)
      onAddMenuVisibilityChange(false)
    },
    [addMenuOpen, clearPlacementTimeout, mapRef, onAddMenuVisibilityChange],
  )

  useEffect(() => {
    const dismissTransientControls = (selection?: MapSelection) => {
      if (addMenuOpen && selection) {
        mapRef.current?.centerCoordinatePreservingCamera([selection.longitude, selection.latitude])
        return true
      }
      searchDismissRef.current?.()
      return false
    }
    mapInteractionHandlerRef.current = dismissTransientControls
    return () => {
      if (mapInteractionHandlerRef.current === dismissTransientControls) {
        mapInteractionHandlerRef.current = () => {}
      }
    }
  }, [addMenuOpen, mapInteractionHandlerRef, mapRef])

  useEffect(() => clearPlacementTimeout, [clearPlacementTimeout])

  const handleSearchSelect = useCallback(
    (result: MapSearchResult) => {
      searchDismissRef.current?.()
      mapRef.current?.focusCoordinate([result.longitude, result.latitude])
      onSelectNavigationTarget({
        type: 'place',
        id: result.id,
        latitude: result.latitude,
        longitude: result.longitude,
        title: result.title,
        subtitle: result.subtitle,
        category: result.category,
      })
    },
    [mapRef, onSelectNavigationTarget],
  )

  const toggleAddMenu = useCallback(() => {
    if (addMenuOpen) {
      closeAddMenu()
      return
    }
    if (!onRequireMapAccount()) return
    mapRef.current?.zoomBy(0.45)
    addMenuZoomedRef.current = true
    setPlacementPulseKey(0)
    onAddMenuVisibilityChange(true)
  }, [addMenuOpen, closeAddMenu, mapRef, onAddMenuVisibilityChange, onRequireMapAccount])

  const handleSelectMapPoint = useCallback(
    async (category: MapPointCategory) => {
      const center = await mapRef.current?.getViewfinderCoordinate()
      if (!center) return
      await Haptics.selectionAsync()
      setPlacementPulseKey((key) => key + 1)
      clearPlacementTimeout()
      placementTimeoutRef.current = setTimeout(() => {
        closeAddMenu()
        void addMapPoint(category, center.latitude, center.longitude).then((point) => {
          if (!point) return
          onSelectNavigationTarget({
            type: 'mapPoint',
            id: point.id,
            latitude: point.latitude,
            longitude: point.longitude,
            title: point.name?.trim() || getMapPointKindLabel(point.category),
            subtitle: null,
            point,
          })
          onBeginEditMapPoint(point.id)
        })
        placementTimeoutRef.current = null
      }, 180)
    },
    [
      addMapPoint,
      clearPlacementTimeout,
      closeAddMenu,
      mapRef,
      onBeginEditMapPoint,
      onSelectNavigationTarget,
    ],
  )

  return (
    <>
      {addMenuOpen ? (
        <CenterPlacementPointer
          color={riderColor ?? accents.green.color}
          pulseKey={placementPulseKey}
        />
      ) : null}
      <MapSearch
        top={top}
        searchProximity={searchProximity}
        dismissRef={searchDismissRef}
        onSelectResult={handleSearchSelect}
      />
      {bottomControlsVisible ? (
        <MapPointAddMenu
          bottom={bottom}
          sheetBottom={sheetBottom}
          open={addMenuOpen}
          onToggle={toggleAddMenu}
          onSelectCategory={(category) => void handleSelectMapPoint(category)}
        />
      ) : null}
    </>
  )
}
