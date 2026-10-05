import Mapbox, {
  Camera,
  FillExtrusionLayer,
  MapView,
  RasterDemSource,
  StyleImport,
  Terrain,
} from '@rnmapbox/maps'
import IconAdjustmentsHorizontal from '@tabler/icons-react-native/IconAdjustmentsHorizontal'
import { useCallback, useRef, useState, type ComponentRef } from 'react'
import { StyleSheet, View } from 'react-native'
import type { MapPoint } from 'vescape-core'

import { Text } from '@/components/base/Text'
import { NewChipRow, NewToggleRow } from '@/components/dev/NewShowcaseControls'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { MAPBOX_ACCESS_TOKEN } from '@/config/mapy'
import { theme, uiColors } from '@/constants/theme'
import { DASH } from '@/helpers/format'
import { useThemeStore } from '@/hooks/useTheme'
import type { HistoryMetricKey } from '@/modules/history/lib/metricColorScale'
import { LegalLimitsMapLayer } from '@/modules/legal/components/LegalLimitsMapLayer'
import { MapMark } from '@/modules/map/components/MapMark'
import { COLORFUL_BUILDING_COLOR, MAP_STYLES } from '@/modules/map/constants/mapStyles'
import { RadarRangeRings } from '@/modules/weather/components/RadarRangeRings'
import { RainViewerOverlay } from '@/modules/weather/components/RainViewerOverlay'
import { ZincHistoryLayers } from '@/screens/main/map/ZincHistoryLayers'
import { ZincLiveLayers } from '@/screens/main/map/ZincLiveLayers'
import { ZincNavigationLayers } from '@/screens/main/map/ZincNavigationLayers'
import { ZincRiderLayers } from '@/screens/main/map/ZincRiderLayers'
import {
  FIXTURE_ACCURACY_FIX,
  FIXTURE_ACCURACY_SHAPE,
  FIXTURE_CAMERA_CENTER,
  FIXTURE_CAMERA_ZOOM,
  FIXTURE_DIRECTION_POINT,
  FIXTURE_GPS_PUCK_BEARING_DEG,
  FIXTURE_HISTORY_METRIC_HOT_RANGES,
  FIXTURE_LIVE_TRAIL_SHAPE,
  FIXTURE_MAP_POINTS,
  FIXTURE_NAVIGATION_ROUTE,
  FIXTURE_RIDE_GPS_SAMPLES,
  FIXTURE_RIDE_MARKERS,
  FIXTURE_RIDE_ROUTE,
  FIXTURE_RIDE_ROUTE_SHAPE,
  FIXTURE_RIDE_TELEMETRY_SAMPLES,
  FIXTURE_RIDERS,
} from '@/screens/showcase/mapShowcaseFixtures'

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN)

/** Showcase basemaps are the hosted ones the Map view also offers. */
const STYLE_OPTIONS = MAP_STYLES.filter((style) => style.key !== 'mapy').map((style) => ({
  key: style.key,
  label: style.label,
  icon: style.Icon,
}))
type ZincMapStyleKey = (typeof STYLE_OPTIONS)[number]['key']

const HISTORY_METRIC_OPTIONS: { key: HistoryMetricKey; label: string }[] = [
  { key: 'speed', label: 'Speed' },
  { key: 'duty', label: 'Duty' },
  { key: 'battery', label: 'Battery' },
  { key: 'tempMotor', label: 'Motor temp' },
  { key: 'tempController', label: 'Controller temp' },
  { key: 'motorCurrent', label: 'Motor current' },
  { key: 'batteryCurrent', label: 'Battery current' },
]

export default function NewMapShowcase() {
  const appearance = useThemeStore((state) => state.resolvedTheme)
  const [styleKey, setStyleKey] = useState<ZincMapStyleKey>('colorful')
  const [pointsVisible, setPointsVisible] = useState(true)
  const [ridersVisible, setRidersVisible] = useState(true)
  const [routeVisible, setRouteVisible] = useState(true)
  const [plannedRouteVisible, setPlannedRouteVisible] = useState(true)
  const [markersVisible, setMarkersVisible] = useState(true)
  const [weatherActive, setWeatherActive] = useState(false)
  const [legalLimitsActive, setLegalLimitsActive] = useState(false)
  const [buildings3d, setBuildings3d] = useState(true)
  const [terrain, setTerrain] = useState(false)
  const [metric, setMetric] = useState<HistoryMetricKey>('speed')
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null)
  const [lastEvent, setLastEvent] = useState<string | null>(null)
  const [sheetVisible, setSheetVisible] = useState(false)
  const cameraRef = useRef<ComponentRef<typeof Camera>>(null)
  const mapboxStyleURL = MAP_STYLES.find((style) => style.key === styleKey)?.styleURL ?? ''
  const isStandard = styleKey === 'colorfulDark'
  const isColorful = styleKey === 'colorful'
  const buildingColor = isColorful ? COLORFUL_BUILDING_COLOR : uiColors[appearance].muted

  const handleMapLoaded = useCallback(() => {
    cameraRef.current?.setCamera({
      centerCoordinate: FIXTURE_CAMERA_CENTER,
      zoomLevel: FIXTURE_CAMERA_ZOOM,
      animationDuration: 0,
    })
  }, [])

  const handleTerrainChange = useCallback((enabled: boolean) => {
    setTerrain(enabled)
    // Terrain only reads in perspective; flatten again when it goes off.
    cameraRef.current?.setCamera({ pitch: enabled ? 60 : 0, animationDuration: 500 })
  }, [])

  const points: MapPoint[] = pointsVisible ? FIXTURE_MAP_POINTS : []
  const selectedPoint = points.find((point) => point.id === selectedPointId)

  return (
    <View style={styles.container}>
      <MapView
        // The style document is swapped wholesale, so remount to keep layers from targeting ids the
        // previous style owned.
        key={`${styleKey}-${appearance}`}
        style={StyleSheet.absoluteFill}
        styleURL={mapboxStyleURL}
        pitchEnabled={terrain}
        rotateEnabled={false}
        compassEnabled={false}
        scaleBarEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
        onDidFinishLoadingMap={handleMapLoaded}
      >
        <Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: FIXTURE_CAMERA_CENTER,
            zoomLevel: FIXTURE_CAMERA_ZOOM,
          }}
          animationMode="none"
        />
        {terrain && (
          <>
            <RasterDemSource
              id="zinc-terrain-dem"
              url="mapbox://mapbox.mapbox-terrain-dem-v1"
              tileSize={514}
              maxZoomLevel={14}
            />
            <Terrain sourceID="zinc-terrain-dem" style={{ exaggeration: 1.4 }} />
          </>
        )}
        {isStandard && (
          <StyleImport
            id="basemap"
            existing
            config={{ lightPreset: 'night', show3dBuildings: buildings3d }}
          />
        )}
        {buildings3d && isColorful && (
          <FillExtrusionLayer
            id="zinc-3d-buildings"
            sourceLayerID="building"
            minZoomLevel={14}
            maxZoomLevel={22}
            style={{
              fillExtrusionColor: buildingColor,
              fillExtrusionHeight: ['coalesce', ['get', 'height'], 12],
              fillExtrusionBase: ['coalesce', ['get', 'min_height'], 0],
              fillExtrusionOpacity: 0.7,
              fillExtrusionVerticalGradient: true,
            }}
          />
        )}
        <RainViewerOverlay visible={weatherActive} />
        <RadarRangeRings visible={weatherActive} fix={FIXTURE_ACCURACY_FIX} />
        {legalLimitsActive && (
          <LegalLimitsMapLayer
            onSelectCountry={(country) => setLastEvent(`Legal limits: ${country.name}`)}
          />
        )}
        {routeVisible && (
          <ZincHistoryLayers
            rideRouteShape={FIXTURE_RIDE_ROUTE_SHAPE}
            rideRoute={FIXTURE_RIDE_ROUTE}
            rideTelemetrySamples={FIXTURE_RIDE_TELEMETRY_SAMPLES}
            activeHistoryMapMetric={metric}
            rideMarkers={markersVisible ? FIXTURE_RIDE_MARKERS : []}
            rideGpsSamples={FIXTURE_RIDE_GPS_SAMPLES}
            historyMetricHotRanges={FIXTURE_HISTORY_METRIC_HOT_RANGES}
            onSelectMarker={(selection) => setLastEvent(`Marker: ${selection.marker.type}`)}
          />
        )}
        <ZincLiveLayers
          liveTrailShape={FIXTURE_LIVE_TRAIL_SHAPE}
          accuracyFix={FIXTURE_ACCURACY_FIX}
          accuracyShape={FIXTURE_ACCURACY_SHAPE}
          gpsPuckBearingDeg={FIXTURE_GPS_PUCK_BEARING_DEG}
        />
        {ridersVisible && <ZincRiderLayers riders={FIXTURE_RIDERS} />}
        {plannedRouteVisible && <ZincNavigationLayers coordinates={FIXTURE_NAVIGATION_ROUTE} />}
        <MapMark
          id="zinc-direction-point"
          kind="direction"
          coordinate={[FIXTURE_DIRECTION_POINT.longitude, FIXTURE_DIRECTION_POINT.latitude]}
        />
        {points.map((point) => (
          <MapMark
            key={point.id}
            id={`zinc-map-point-${point.id}`}
            kind={point.category}
            coordinate={[point.longitude, point.latitude]}
            selected={selectedPointId === point.id}
            onSelected={() =>
              setSelectedPointId((current) => (current === point.id ? null : point.id))
            }
          />
        ))}
      </MapView>

      <View style={styles.topRight} pointerEvents="box-none">
        <SegmentedControl activeKey={styleKey} options={STYLE_OPTIONS} onSelect={setStyleKey} />
        <Button
          icon={IconAdjustmentsHorizontal}
          variant="floating"
          accessibilityLabel="Map options"
          onPress={() => setSheetVisible(true)}
        />
      </View>

      <Drawer visible={sheetVisible} title="Map options" onClose={() => setSheetVisible(false)}>
        <NewToggleRow label="Weather radar" value={weatherActive} onChange={setWeatherActive} />
        <NewToggleRow
          label="Legal limits"
          value={legalLimitsActive}
          onChange={setLegalLimitsActive}
        />
        <NewToggleRow label="Map points" value={pointsVisible} onChange={setPointsVisible} />
        <NewToggleRow label="Riders" value={ridersVisible} onChange={setRidersVisible} />
        <NewToggleRow label="Ride route" value={routeVisible} onChange={setRouteVisible} />
        <NewToggleRow
          label="Planned route"
          value={plannedRouteVisible}
          onChange={setPlannedRouteVisible}
        />
        <NewToggleRow label="Ride markers" value={markersVisible} onChange={setMarkersVisible} />
        <NewToggleRow label="Buildings 3D" value={buildings3d} onChange={setBuildings3d} />
        <NewToggleRow label="Terrain" value={terrain} onChange={handleTerrainChange} />
        <NewChipRow
          label="Route metric"
          options={HISTORY_METRIC_OPTIONS.map((option) => option.label)}
          selected={HISTORY_METRIC_OPTIONS.find((option) => option.key === metric)?.label ?? ''}
          onSelect={(label) => {
            const match = HISTORY_METRIC_OPTIONS.find((option) => option.label === label)
            if (match) setMetric(match.key)
          }}
        />
        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>Selected point</Text>
          <Text style={styles.value}>{selectedPoint?.category ?? DASH}</Text>
        </View>
        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>Last interaction</Text>
          <Text style={styles.value}>{lastEvent ?? DASH}</Text>
        </View>
        <Text style={styles.hint}>
          Zinc ground and chrome follow the app appearance. The route gradient and marker status
          colors keep their hue because they encode data. Weather radar and legal limits are the
          existing layers, not yet restyled.
        </Text>
      </Drawer>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ui.background },
  topRight: { position: 'absolute', top: 12, right: 12, alignItems: 'flex-end', gap: 8 },
  valueRow: { flexDirection: 'row', justifyContent: 'space-between', minHeight: 28 },
  valueLabel: { color: theme.ui.mutedForeground, fontSize: 13, fontWeight: '600' },
  value: { color: theme.ui.foreground, fontSize: 13, fontFamily: 'monospace' },
  hint: { color: theme.ui.mutedForeground, fontSize: 12, lineHeight: 17 },
})
