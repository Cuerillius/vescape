import { LineLayer, ShapeSource } from '@rnmapbox/maps'
import { useMemo } from 'react'

import { theme } from '@/constants/theme'
import { useResolvedAccentColors } from '@/hooks/useTheme'
import { useRiderStore } from '@/modules/group-ride/store/riderStore'
import { MAP_DEFAULTS } from '@/modules/map/constants/mapStyles'
import { NAVIGATION_CASING_WIDTH, navigationDots } from '@/screens/main/map/NavigationMapLayers'
import { navigationActionColors } from '@/screens/main/map/navigationActionColors'
import { useLivePuckColors } from '@/screens/main/map/useLivePuckColors'

/**
 * The planned route to the Direction Point: a dotted line in the rider's navigation color on a halo
 * of the zinc background, so it lifts off either map appearance. Coordinates are GeoJSON
 * `[longitude, latitude]`.
 */
export function ZincNavigationLayers({ coordinates }: { coordinates: [number, number][] }) {
  const accents = useResolvedAccentColors()
  const riderColor = useRiderStore((state) => state.riderColor)
  const { ring } = useLivePuckColors()
  const { color } = navigationActionColors(riderColor, accents.green.solid, accents.green.onSolid)
  const shape = useMemo<GeoJSON.Feature<GeoJSON.LineString>>(
    () => ({ type: 'Feature', geometry: { type: 'LineString', coordinates }, properties: {} }),
    [coordinates],
  )

  return (
    <ShapeSource id="zinc-navigation-source" shape={shape}>
      <LineLayer
        id="zinc-navigation-casing"
        style={{
          lineColor: theme.alpha(ring, 0.85),
          lineWidth: NAVIGATION_CASING_WIDTH,
          lineCap: 'round',
          lineJoin: 'round',
          lineDasharray: navigationDots(NAVIGATION_CASING_WIDTH),
        }}
      />
      <LineLayer
        id="zinc-navigation-line"
        style={{
          lineColor: color,
          lineWidth: MAP_DEFAULTS.navigationWidth,
          lineCap: 'round',
          lineJoin: 'round',
          lineDasharray: navigationDots(MAP_DEFAULTS.navigationWidth),
        }}
      />
    </ShapeSource>
  )
}
