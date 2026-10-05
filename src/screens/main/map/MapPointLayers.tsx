import { useMemo } from 'react'

import { MapMark } from '@/modules/map/components/MapMark'
import { isMapPinKindVisible } from '@/modules/map-points/lib/mapPointVisibility'
import type { MainMapLayersProps } from '@/screens/main/map/mainMapLayerTypes'

/** Saved Map Points, with the one the rider tapped (or is navigating to) drawn as selected. */
export function MapPointLayers({
  mapPoints,
  hiddenMapPointCategories,
  selectedMapPointId,
  activeNavigationTarget,
  interactive,
  onToggleMapPointSelection,
  onSuppressNextMapPress,
}: {
  mapPoints: MainMapLayersProps['mapPoints']
  hiddenMapPointCategories: MainMapLayersProps['hiddenMapPointCategories']
  selectedMapPointId: MainMapLayersProps['selectedMapPointId']
  activeNavigationTarget: MainMapLayersProps['activeNavigationTarget']
  interactive: boolean
  onToggleMapPointSelection: MainMapLayersProps['onToggleMapPointSelection']
  onSuppressNextMapPress: MainMapLayersProps['onSuppressNextMapPress']
}) {
  const visiblePoints = useMemo(
    () =>
      mapPoints.filter((point) => isMapPinKindVisible(point.category, hiddenMapPointCategories)),
    [hiddenMapPointCategories, mapPoints],
  )
  const activeNavigationMapPointId =
    activeNavigationTarget?.type === 'mapPoint' ? activeNavigationTarget.point.id : null
  const selectedId = visiblePoints.some((point) => point.id === selectedMapPointId)
    ? selectedMapPointId
    : null

  return (
    <>
      {visiblePoints.map((point) => (
        <MapMark
          key={point.id}
          id={`center-map-point-${point.id}`}
          kind={point.category}
          coordinate={[point.longitude, point.latitude]}
          selected={selectedId === point.id || activeNavigationMapPointId === point.id}
          onSelected={
            interactive
              ? () => {
                  onSuppressNextMapPress()
                  onToggleMapPointSelection(point.id)
                }
              : undefined
          }
        />
      ))}
    </>
  )
}
