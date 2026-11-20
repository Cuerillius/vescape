import type { AppSettings } from 'vescape-core'

/**
 * Transparent Swisstopo / federal-office WMTS layers (public, keyless) that add rider-relevant
 * information the basemap lacks. They are transparent outside Switzerland and Liechtenstein, so
 * unlike a raster basemap they leave no rectangle behind.
 */
export type SwisstopoOverlayKey = Extract<keyof AppSettings, `swissOverlay${string}`>

export interface SwisstopoOverlay {
  key: SwisstopoOverlayKey
  label: string
  hint: string
  layers: readonly { id: string; maxZoom: number }[]
}

export const SWISSTOPO_OVERLAYS: readonly SwisstopoOverlay[] = [
  {
    key: 'swissOverlayTrails',
    label: 'Hiking trails',
    hint: 'Official trail network (swissTLM3D); shows where paths exist',
    layers: [{ id: 'ch.swisstopo.swisstlm3d-wanderwege', maxZoom: 18 }],
  },
  {
    key: 'swissOverlayMountainBike',
    label: 'Mountain bike routes',
    hint: 'Signposted Mountainbikeland Schweiz routes',
    layers: [{ id: 'ch.astra.mountainbikeland', maxZoom: 18 }],
  },
  {
    key: 'swissOverlayVelo',
    label: 'Cycling routes',
    hint: 'Signposted Veloland Schweiz network',
    layers: [{ id: 'ch.astra.veloland', maxZoom: 18 }],
  },
  {
    key: 'swissOverlaySkating',
    label: 'Skating routes',
    hint: 'Skatingland Schweiz routes on smooth surfaces',
    layers: [{ id: 'ch.astra.skatingland', maxZoom: 18 }],
  },
  {
    key: 'swissOverlayWildlife',
    label: 'Wildlife protection',
    hint: 'Wildlife quiet zones and hunting-ban reserves',
    layers: [
      { id: 'ch.bafu.wrz-wildruhezonen_portal', maxZoom: 18 },
      { id: 'ch.bafu.wrz-jagdbanngebiete_select', maxZoom: 18 },
    ],
  },
  {
    key: 'swissOverlayAvalanche',
    label: 'Avalanche zones',
    hint: 'Terrain where avalanches can release or run (SilvaProtect-CH)',
    layers: [{ id: 'ch.bafu.silvaprotect-lawinen', maxZoom: 18 }],
  },
  {
    key: 'swissOverlayRockfall',
    label: 'Rockfall zones',
    hint: 'Terrain exposed to falling rock (SilvaProtect-CH)',
    layers: [{ id: 'ch.bafu.silvaprotect-sturz', maxZoom: 18 }],
  },
]

export const SWISSTOPO_OVERLAY_ATTRIBUTION = '© swisstopo, FOEN, FEDRO'

/** Tile requests outside this box answer HTTP 400, so the sources are fenced to it. */
export const SWISSTOPO_OVERLAY_BOUNDS = [5.14, 45.39, 11.48, 48.24]

export function swisstopoOverlayTileUrl(layerId: string) {
  return `https://wmts.geo.admin.ch/1.0.0/${layerId}/default/current/3857/{z}/{x}/{y}.png`
}
