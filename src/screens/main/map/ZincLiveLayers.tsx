import { CircleLayer, FillLayer, Images, LineLayer, ShapeSource, SymbolLayer } from '@rnmapbox/maps'
import { useMemo } from 'react'
import { processColor } from 'react-native'

import { theme } from '@/constants/theme'
import { MAP_DEFAULTS } from '@/modules/map/constants/mapStyles'
import { useLivePuckColors } from '@/screens/main/map/useLivePuckColors'
import type { MainMapLayersProps } from '@/screens/main/map/mainMapLayerTypes'

const HEADING_ICON_ID = 'zinc-gps-heading'
const HEADING_ICON = require('@rnmapbox/maps/src/assets/heading.png')

/**
 * The rider's trail, accuracy ring, position dot, and heading cone, in their own color so they stand
 * apart from the group. The dot's ring uses the zinc background so it lifts off either appearance.
 */
export function ZincLiveLayers({
  liveTrailShape,
  accuracyFix,
  accuracyShape,
  gpsPuckBearingDeg,
}: Pick<
  MainMapLayersProps,
  'liveTrailShape' | 'accuracyFix' | 'accuracyShape' | 'gpsPuckBearingDeg'
>) {
  const { color: pointColor, ring: background } = useLivePuckColors()
  const trailColor = pointColor
  const puckPosition = useMemo(
    () =>
      accuracyFix
        ? ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [accuracyFix.longitude, accuracyFix.latitude] },
            properties: {},
          } as GeoJSON.Feature<GeoJSON.Point>)
        : null,
    [accuracyFix],
  )
  const puckHeading = useMemo(
    () =>
      accuracyFix && gpsPuckBearingDeg != null
        ? ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [accuracyFix.longitude, accuracyFix.latitude] },
            properties: { bearing: gpsPuckBearingDeg },
          } as GeoJSON.Feature<GeoJSON.Point>)
        : null,
    [accuracyFix, gpsPuckBearingDeg],
  )

  return (
    <>
      {liveTrailShape && (
        <ShapeSource id="zinc-live-trail-source" shape={liveTrailShape} lineMetrics>
          <LineLayer
            id="zinc-live-trail-line"
            style={{
              lineWidth: MAP_DEFAULTS.trailWidth,
              lineCap: 'round',
              lineJoin: 'round',
              lineGradient: [
                'interpolate',
                ['linear'],
                ['line-progress'],
                0,
                theme.alpha(trailColor, 0),
                1,
                theme.alpha(trailColor, 0.85),
              ],
            }}
          />
        </ShapeSource>
      )}
      {accuracyShape && (
        <ShapeSource id="zinc-gps-accuracy-source" shape={accuracyShape}>
          <FillLayer
            id="zinc-gps-accuracy-fill"
            style={{ fillColor: processColor(theme.alpha(trailColor, 0.12)) as never }}
          />
        </ShapeSource>
      )}
      {puckPosition && (
        <ShapeSource id="zinc-gps-puck-source" shape={puckPosition}>
          <CircleLayer
            id="zinc-gps-puck-core"
            style={{
              circleRadius: 8,
              circleColor: pointColor,
              circleStrokeColor: background,
              circleStrokeWidth: 3,
            }}
          />
        </ShapeSource>
      )}
      {puckHeading && (
        <>
          <Images images={{ [HEADING_ICON_ID]: { image: HEADING_ICON, sdf: true } }} />
          <ShapeSource id="zinc-gps-heading-source" shape={puckHeading}>
            <SymbolLayer
              id="zinc-gps-heading-cone"
              style={{
                iconImage: HEADING_ICON_ID,
                iconRotate: ['get', 'bearing'],
                iconAllowOverlap: true,
                iconIgnorePlacement: true,
                iconRotationAlignment: 'map',
                iconSize: 0.95,
                iconOffset: [0, -10],
                iconColor: pointColor,
                // Same ring as the dot, so the cone and dot read as one shape.
                iconHaloColor: background,
                iconHaloWidth: 2,
              }}
            />
          </ShapeSource>
        </>
      )}
    </>
  )
}
