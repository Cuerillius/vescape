import { RasterLayer, RasterSource } from '@rnmapbox/maps'
import { useShallow } from 'zustand/react/shallow'

import {
  SWISSTOPO_OVERLAYS,
  SWISSTOPO_OVERLAY_ATTRIBUTION,
  SWISSTOPO_OVERLAY_BOUNDS,
  swisstopoOverlayTileUrl,
} from '@/modules/map/constants/swisstopoOverlays'
import { useSettingsStore } from '@/modules/settings/store/settingsStore'

/** The Swisstopo overlays the rider switched on in Map settings, stacked in list order. */
export function SwisstopoOverlayLayers() {
  const enabled = useSettingsStore(
    useShallow((state) => SWISSTOPO_OVERLAYS.map((overlay) => state[overlay.key])),
  )

  return (
    <>
      {SWISSTOPO_OVERLAYS.flatMap((overlay, index) =>
        enabled[index]
          ? overlay.layers.map((layer) => (
              <RasterSource
                key={layer.id}
                id={`center-${layer.id}`}
                tileUrlTemplates={[swisstopoOverlayTileUrl(layer.id)]}
                tileSize={256}
                maxZoomLevel={layer.maxZoom}
                sourceBounds={SWISSTOPO_OVERLAY_BOUNDS}
                attribution={SWISSTOPO_OVERLAY_ATTRIBUTION}
              >
                <RasterLayer
                  id={`center-${layer.id}-layer`}
                  sourceID={`center-${layer.id}`}
                  style={{ rasterOpacity: 0.85 }}
                />
              </RasterSource>
            ))
          : [],
      )}
    </>
  )
}
