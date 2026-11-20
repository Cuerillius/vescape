import type { ResolvedTheme } from '@/constants/theme'
import { getOneDarkMapStyle } from '@/modules/map/constants/oneDarkMapStyle'
import { SWISSTOPO_PALETTES, type SwisstopoPalette } from '@/modules/map/constants/swisstopoPalette'

type PaintOverrides = Record<string, string | number>

interface StyleLayer {
  id?: string
  paint?: Record<string, unknown>
  [key: string]: unknown
}

/** Paint changes per One Dark layer id, expressed in Swisstopo palette roles. */
function paintOverrides(c: SwisstopoPalette): Record<string, PaintOverrides> {
  return {
    background: { 'background-color': c.land },
    'landcover-grass': { 'fill-color': c.grass, 'fill-opacity': 0.8 },
    'landcover-wood': { 'fill-color': c.forest, 'fill-opacity': 0.8 },
    'landcover-scrub': { 'fill-color': c.forest, 'fill-opacity': 0.5 },
    'landuse-park': { 'fill-color': c.grass, 'fill-opacity': 0.9 },
    'landuse-park-outline': { 'line-color': c.forest },
    'landuse-forest': { 'fill-color': c.forest, 'fill-opacity': 0.8 },
    'landuse-forest-outline': { 'line-color': c.forest },
    'landuse-cemetery': { 'fill-color': c.grass },
    'landuse-hospital': { 'fill-color': c.buildingOutline },
    'landuse-school': { 'fill-color': c.building },
    water: { 'fill-color': c.water },
    waterway: { 'line-color': c.waterway },
    'road-path': { 'line-color': c.path },
    'road-track': { 'line-color': c.path },
    'road-service': { 'line-color': c.streetLine },
    'road-street': { 'line-color': c.streetLine },
    'road-secondary-tertiary': { 'line-color': c.majorLine },
    'road-primary': { 'line-color': c.majorLine },
    'road-trunk': { 'line-color': c.motorwayLine },
    'road-motorway': { 'line-color': c.motorwayLine },
    'road-rail': { 'line-color': c.rail, 'line-opacity': 0.8 },
    building: { 'fill-color': c.building },
    'building-outline': { 'line-color': c.buildingOutline },
    'admin-1-boundary': { 'line-color': c.boundary },
    'admin-0-boundary': { 'line-color': c.boundary },
    'water-label': { 'text-color': c.waterLabel, 'text-halo-color': c.labelHalo },
    'road-label': { 'text-color': c.labelMuted, 'text-halo-color': c.labelHalo },
    'poi-label': {
      'icon-color': c.labelMuted,
      'text-color': c.labelMuted,
      'text-halo-color': c.labelHalo,
    },
    'transit-label': {
      'icon-color': c.labelMuted,
      'text-color': c.labelMuted,
      'text-halo-color': c.labelHalo,
    },
    'place-label-region': { 'text-color': c.labelMuted, 'text-halo-color': c.labelHalo },
    'place-label-subdivision': { 'text-color': c.labelMuted, 'text-halo-color': c.labelHalo },
    'place-label-town': { 'text-color': c.label, 'text-halo-color': c.labelHalo },
    'place-label-village': { 'text-color': c.labelMuted, 'text-halo-color': c.labelHalo },
    'place-label-hamlet': { 'text-color': c.labelMuted, 'text-halo-color': c.labelHalo },
    'place-label-city': { 'text-color': c.label, 'text-halo-color': c.labelHalo },
    'place-label-country': { 'text-color': c.labelMuted, 'text-halo-color': c.labelHalo },
  }
}

const ONE_DARK_STYLE = JSON.parse(getOneDarkMapStyle(true, true, false)) as {
  layers: StyleLayer[]
}

function buildSwissStyle(theme: ResolvedTheme) {
  const overrides = paintOverrides(SWISSTOPO_PALETTES[theme])
  return JSON.stringify({
    ...ONE_DARK_STYLE,
    name: `Swiss ${theme}`,
    layers: ONE_DARK_STYLE.layers.map((layer) => {
      const paint = layer.id ? overrides[layer.id] : undefined
      return paint ? { ...layer, paint: { ...layer.paint, ...paint } } : layer
    }),
  })
}

const SWISS_STYLES: Record<ResolvedTheme, string> = {
  light: buildSwissStyle('light'),
  dark: buildSwissStyle('dark'),
}

/**
 * Streets drawn with the Swisstopo Light Base Map palette, light and dark. It reuses the One Dark
 * layer set (Mapbox Streets data), so it works worldwide and has no coverage edge.
 */
export function getSwissMapStyle(theme: ResolvedTheme) {
  return SWISS_STYLES[theme]
}
