import { FillExtrusionLayer, RasterLayer, RasterSource } from '@rnmapbox/maps'

import { MAPY_TILE_URL_TEMPLATE } from '@/config/mapy'
import { uiColors } from '@/constants/theme'
import { useThemeStore } from '@/hooks/useTheme'
import { useRiderStore } from '@/modules/group-ride/store/riderStore'
import { PrivacyZonesMapLayer } from '@/modules/history/components/PrivacyZonesMapLayer'
import { LegalLimitsMapLayer } from '@/modules/legal/components/LegalLimitsMapLayer'
import { COLORFUL_BUILDING_COLOR, MAP_DEFAULTS } from '@/modules/map/constants/mapStyles'
import { useSettingsStore } from '@/modules/settings/store/settingsStore'
import { RadarRangeRings } from '@/modules/weather/components/RadarRangeRings'
import { RainViewerOverlay } from '@/modules/weather/components/RainViewerOverlay'
import { HistoryMapLayers } from '@/screens/main/map/HistoryMapLayers'
import { ZincLiveLayers } from '@/screens/main/map/ZincLiveLayers'
import { ZincRiderLayers } from '@/screens/main/map/ZincRiderLayers'
import { MapPointLayers } from '@/screens/main/map/MapPointLayers'
import { NavigationMapLayers } from '@/screens/main/map/NavigationMapLayers'
import { DESTINATION_POINT_COLOR } from '@/screens/main/map/offscreenMapIndicators'
import type { MainMapLayersProps } from '@/screens/main/map/mainMapLayerTypes'

// Ride History Markers are diagnostic detail; the history route stays clean unless they are opted in.
const NO_MARKERS: MainMapLayersProps['rideMarkers'] = []

export { HistoryMapLayers }

function BaseTerrainLayers({
  isMapy,
  isColorful,
  showBuildings3d,
}: Pick<MainMapLayersProps, 'isMapy' | 'isColorful' | 'showBuildings3d'>) {
  const appearance = useThemeStore((state) => state.resolvedTheme)
  return (
    <>
      {showBuildings3d && (
        <FillExtrusionLayer
          id="center-3d-buildings"
          sourceLayerID="building"
          minZoomLevel={14}
          maxZoomLevel={22}
          style={{
            fillExtrusionColor: isColorful ? COLORFUL_BUILDING_COLOR : uiColors[appearance].muted,
            fillExtrusionHeight: ['coalesce', ['get', 'height'], 12],
            fillExtrusionBase: ['coalesce', ['get', 'min_height'], 0],
            fillExtrusionOpacity: 0.7,
            fillExtrusionVerticalGradient: true,
          }}
        />
      )}
      {isMapy && MAPY_TILE_URL_TEMPLATE ? (
        <RasterSource
          id="center-mapy-tiles"
          tileUrlTemplates={[MAPY_TILE_URL_TEMPLATE]}
          tileSize={256}
          maxZoomLevel={MAP_DEFAULTS.maxZoom}
        >
          <RasterLayer
            id="center-mapy-tiles-layer"
            sourceID="center-mapy-tiles"
            // Native rejects an empty style dictionary and logs `Invalid style: [:]`, so the
            // opaque default is spelled out rather than left blank.
            style={{ rasterOpacity: 1 }}
          />
        </RasterSource>
      ) : null}
    </>
  )
}

export function MainMapLayers(props: MainMapLayersProps) {
  const {
    historyActive,
    isMapy,
    isSatellite,
    showBuildings3d,
    weatherActive,
    legalLimitsActive,
    riders,
    onSelectLegalCountry,
  } = props
  const riderColor = useRiderStore((state) => state.riderColor)
  const showHistoryMapMarkers = useSettingsStore((state) => state.showHistoryMapMarkers)

  return (
    <>
      <BaseTerrainLayers
        isMapy={isMapy}
        isColorful={props.isColorful}
        showBuildings3d={showBuildings3d}
      />
      <RainViewerOverlay visible={weatherActive} />
      <RadarRangeRings visible={weatherActive} fix={props.accuracyFix} />
      {legalLimitsActive ? <LegalLimitsMapLayer onSelectCountry={onSelectLegalCountry} /> : null}
      <PrivacyZonesMapLayer />
      {historyActive ? (
        <HistoryMapLayers
          rideRouteShape={props.rideRouteShape}
          rideRoute={props.rideRoute}
          rideTelemetrySamples={props.rideTelemetrySamples}
          activeHistoryMapMetric={props.activeHistoryMapMetric}
          rideMarkers={showHistoryMapMarkers ? props.rideMarkers : NO_MARKERS}
          rideGpsSamples={props.rideGpsSamples}
          mediaAssets={props.mediaAssets}
          favoriteRanges={props.favoriteRanges}
          mapZoom={props.mapZoom}
          historyMetricGradientsEnabled={props.historyMetricGradientsEnabled}
          historyMetricHotRanges={props.historyMetricHotRanges}
          onSuppressNextMapPress={props.onSuppressNextMapPress}
          onSelectMarker={props.onSelectMarker}
          onOpenMedia={props.onOpenMedia}
          highContrastRoutes={isSatellite}
        />
      ) : (
        <>
          {/* Mapbox paints later style layers above earlier ones. Keep the navigation path before
              every live point so its dots never cross over the GPS puck or heading arrow. */}
          <NavigationMapLayers
            directionPoint={props.directionPoint}
            activeNavigationTarget={props.activeNavigationTarget}
            selectedNavigationTarget={props.selectedNavigationTarget}
            directionColor={riderColor ?? DESTINATION_POINT_COLOR}
            onFocusDirectionPoint={props.onFocusDirectionPoint}
          />
          <ZincLiveLayers
            liveTrailShape={props.liveTrailShape}
            accuracyFix={props.accuracyFix}
            accuracyShape={props.accuracyShape}
            gpsPuckBearingDeg={props.gpsPuckBearingDeg}
          />
          <ZincRiderLayers riders={riders} />
          <MapPointLayers
            mapPoints={props.mapPoints}
            hiddenMapPointCategories={props.hiddenMapPointCategories}
            selectedMapPointId={props.selectedMapPointId}
            activeNavigationTarget={props.activeNavigationTarget}
            interactive={!weatherActive && !legalLimitsActive}
            onToggleMapPointSelection={props.onToggleMapPointSelection}
            onSuppressNextMapPress={props.onSuppressNextMapPress}
          />
        </>
      )}
    </>
  )
}
