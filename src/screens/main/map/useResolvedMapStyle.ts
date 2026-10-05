import { useMemo } from 'react'

import { IS_MAPY_CONFIGURED } from '@/config/mapy'
import { useThemeStore } from '@/hooks/useTheme'
import { BLANK_STYLE, MAP_STYLES, type MapStyleKey } from '@/modules/map/constants/mapStyles'
import {
  getSatelliteImageryPaint,
  getSatelliteOverlayMapStyle,
} from '@/modules/map/constants/satelliteDarkMapStyle'
import { mapStyleForTheme } from '@/modules/map/lib/mapTheme'
import { resolveMapThemeTone } from '@/modules/map/lib/mapThemeTone'

import type { MainViewState } from '@/screens/main/mainViewState'
import { baseStyleLayerIds } from '@/screens/main/map/baseStyleLayerIds'

/**
 * Resolves the requested map style into everything the map view and its layers need. Legacy
 * satellite follows the satellite settings, the app theme and daylight when its overlay is on.
 */
export function useResolvedMapStyle({
  mapStyleKey,
  mode,
  satelliteOverlayEnabled,
  satelliteImageryOpacity,
  satelliteMapImageryOpacity,
  satelliteImagerySaturation,
}: {
  mapStyleKey: MapStyleKey
  mode: MainViewState
  satelliteOverlayEnabled: boolean
  satelliteImageryOpacity: number
  satelliteMapImageryOpacity: number
  satelliteImagerySaturation: number
}) {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme)
  const outdoorLight = useThemeStore((state) => state.outdoorLight)
  const requestedMapStyle =
    MAP_STYLES.find((style) => style.key === mapStyleForTheme(mapStyleKey)) ?? MAP_STYLES[0]
  const selectedMapStyle =
    requestedMapStyle.key === 'mapy' && !IS_MAPY_CONFIGURED ? MAP_STYLES[0] : requestedMapStyle
  const styleKey = selectedMapStyle.key
  const isMapy = styleKey === 'mapy'
  const isSatellite = styleKey === 'satelliteLegacy'
  const isSatelliteOverlay = isSatellite && satelliteOverlayEnabled

  const imageryOpacity = mode === 'telemetry' ? satelliteImageryOpacity : satelliteMapImageryOpacity
  const imagerySaturation = mode === 'telemetry' ? satelliteImagerySaturation : 0
  const satelliteTone = useMemo(
    () =>
      resolveMapThemeTone({
        theme: resolvedTheme,
        outdoorLight,
        imageryOpacity,
        imagerySaturation,
      }),
    [imageryOpacity, imagerySaturation, outdoorLight, resolvedTheme],
  )
  const satelliteImageryPaint = useMemo(
    () =>
      getSatelliteImageryPaint(
        satelliteTone.imageryOpacity,
        satelliteTone.imagerySaturation,
        satelliteTone.imageryContrast,
      ),
    [satelliteTone],
  )
  const satelliteStyleJSON = useMemo(
    () => getSatelliteOverlayMapStyle(resolvedTheme),
    [resolvedTheme],
  )

  // Mapy draws its own raster tiles over an empty document, and the satellite overlay is a
  // document of ours; every other style is a hosted one.
  const styleJSON = isSatelliteOverlay ? satelliteStyleJSON : isMapy ? BLANK_STYLE : undefined
  const existingLayerIds = useMemo(() => baseStyleLayerIds(styleJSON), [styleJSON])
  // A theme change replaces the satellite backdrop, so it must wait for the new document.
  const styleSignature = isSatelliteOverlay
    ? `json:satellite:${resolvedTheme}`
    : isMapy
      ? 'json:blank'
      : String(selectedMapStyle.styleURL)
  const satelliteRoadLineOpacity = satelliteTone.roadLineOpacity * (mode === 'telemetry' ? 0.6 : 1)

  return useMemo(
    () => ({
      styleKey,
      isMapy,
      // Colourful dark is Mapbox Standard, which draws its own 3D buildings through its config.
      isStandard: styleKey === 'colorfulDark',
      isColorful: styleKey === 'colorful',
      isSatellite,
      isSatelliteOverlay,
      // Imagery and Standard would only be cluttered by extruded buildings.
      showBuildings3d: styleKey === 'colorful',
      styleURL: styleJSON ? undefined : (selectedMapStyle.styleURL ?? undefined),
      styleJSON,
      existingLayerIds,
      satelliteImageryPaint,
      satelliteRoadLineOpacity,
      styleSignature,
    }),
    [
      existingLayerIds,
      isMapy,
      isSatellite,
      isSatelliteOverlay,
      satelliteImageryPaint,
      satelliteRoadLineOpacity,
      selectedMapStyle.styleURL,
      styleJSON,
      styleKey,
      styleSignature,
    ],
  )
}
