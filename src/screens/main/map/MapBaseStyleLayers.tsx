import Mapbox from '@rnmapbox/maps'
import { memo } from 'react'

const SATELLITE_ROAD_LINE_LAYER_IDS = [
  'road-path',
  'road-track',
  'road-service',
  'road-street',
  'road-secondary-tertiary',
  'road-primary',
  'road-trunk',
  'road-motorway',
] as const

const LAYER_TRANSITION = { duration: 260, delay: 0 } as const

/**
 * Satellite overlay road-line tone, applied to layers the loaded style document owns. Only mounted once the
 * matching style signature has finished loading, otherwise the ids do not exist yet.
 * Standard and Mapy own no such layers, so nothing is adopted for them.
 */
export const MapBaseStyleLayers = memo(function MapBaseStyleLayers({
  enabled,
  existingLayerIds,
  isSatelliteOverlay,
  satelliteRoadLineOpacity,
}: {
  enabled: boolean
  existingLayerIds: ReadonlySet<string>
  isSatelliteOverlay: boolean
  satelliteRoadLineOpacity: number
}) {
  if (!enabled) return null

  return (
    <>
      {isSatelliteOverlay &&
        SATELLITE_ROAD_LINE_LAYER_IDS.map(
          (id) =>
            existingLayerIds.has(id) && (
              <Mapbox.LineLayer
                key={id}
                id={id}
                existing
                style={{
                  lineOpacity: satelliteRoadLineOpacity,
                  lineOpacityTransition: LAYER_TRANSITION,
                }}
              />
            ),
        )}
    </>
  )
})
