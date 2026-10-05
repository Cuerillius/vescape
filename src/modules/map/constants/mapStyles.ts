import IconMountain from '@tabler/icons-react-native/IconMountain'
import IconMoonStars from '@tabler/icons-react-native/IconMoonStars'
import IconSun from '@tabler/icons-react-native/IconSun'
import IconSatellite from '@tabler/icons-react-native/IconSatellite'
import { theme } from '@/constants/theme'

export const MAP_DEFAULTS = {
  fallbackCoordinate: [15.0, 54.0] as [number, number],
  fallbackZoom: 3.2,
  persistedGpsFallbackZoom: 13,
  maxZoom: 19,
  defaultPitch: 30,
  activePitch: 45,
  perspectiveMinZoom: 11,
  perspectiveMaxZoom: 16,
  zoomDeltaMultiplier: 4,
  zoomDeltaFallback: 0.004,
  zoomDeltaMinAccuracy: 0.002,
  animationDuration: 350,
  followAnimationDuration: 450,
  pitchThreshold: 10,
  markerColor: theme.palette.violet.color,
  markerInactiveColor: theme.palette.slate.light,
  trailColor: theme.palette.violet.color,
  trailWidth: 3,
  navigationWidth: 5,
  accuracyFillColor: theme.alpha(theme.palette.violet.color, 0.12),
  trailGradientStart: theme.alpha(theme.palette.violet.color, 0),
  trailGradientEnd: theme.alpha(theme.palette.violet.color, 0.85),
} as const

/** Extruded buildings tinted to sit in the Colourful basemap's own building palette. */
export const COLORFUL_BUILDING_COLOR = '#e6e2db'

export const BLANK_STYLE = JSON.stringify({
  version: 8,
  sources: {},
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': theme.palette.slate.bg } },
  ],
})

export const MAP_STYLES = [
  {
    key: 'colorful',
    label: 'Colourful',
    styleURL: 'mapbox://styles/mapbox/streets-v12',
    Icon: IconSun,
  },
  // Mapbox Standard; the map applies its night light preset.
  {
    key: 'colorfulDark',
    label: 'Colourful dark',
    styleURL: 'mapbox://styles/mapbox/standard',
    Icon: IconMoonStars,
  },
  {
    key: 'satelliteLegacy',
    label: 'Legacy satellite',
    styleURL: 'mapbox://styles/mapbox/satellite-streets-v11',
    Icon: IconSatellite,
  },
  { key: 'mapy', label: 'Mapy.cz', styleURL: null, Icon: IconMountain },
] as const

/** Streets, Outdoors and Satellite are retired keys that older installations still have saved. */
export type MapStyleKey = (typeof MAP_STYLES)[number]['key'] | 'onedark' | 'outdoors' | 'satellite'
export const MAP_ORIENTATION_MODES = [
  { key: 'northUp', label: 'North up' },
  { key: 'gpsHeading', label: 'GPS heading' },
  { key: 'phoneHeading', label: 'Compass' },
  { key: 'freeRotate', label: 'Free rotate' },
] as const

export type MapOrientationMode = (typeof MAP_ORIENTATION_MODES)[number]['key']
