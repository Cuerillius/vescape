import type { MapStyleKey } from '@/modules/map/constants/mapStyles'

/** Retired style keys still saved by older installations, and the style that replaces each. */
const RETIRED_STYLE_REPLACEMENTS = {
  onedark: 'colorful',
  outdoors: 'colorful',
  satellite: 'satelliteLegacy',
} as const

/** Resolve the rendered style without changing the saved map preference. */
export function mapStyleForTheme(style: MapStyleKey): MapStyleKey {
  return style in RETIRED_STYLE_REPLACEMENTS
    ? RETIRED_STYLE_REPLACEMENTS[style as keyof typeof RETIRED_STYLE_REPLACEMENTS]
    : style
}
