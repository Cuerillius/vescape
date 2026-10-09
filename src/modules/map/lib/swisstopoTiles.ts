/**
 * Swisstopo's national map is public and keyless, but it only covers Switzerland and Liechtenstein:
 * a tile outside the footprint answers HTTP 400. The raster is therefore laid over the Streets
 * basemap and confined to `SWISSTOPO_BOUNDS`, so the rest of the world keeps rendering Streets.
 */
export const SWISSTOPO_TILE_URL_TEMPLATE =
  'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg'

/** `[sw.lng, sw.lat, ne.lng, ne.lat]` around Switzerland and Liechtenstein. */
export const SWISSTOPO_BOUNDS = [5.9, 45.7, 10.6, 47.9]

export const SWISSTOPO_ATTRIBUTION = '© swisstopo'
