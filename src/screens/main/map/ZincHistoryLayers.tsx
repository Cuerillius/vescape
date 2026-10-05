import { LineLayer, ShapeSource } from '@rnmapbox/maps'
import { useMemo } from 'react'

import { theme } from '@/constants/theme'
import {
  useResolvedAccentColors,
  useResolvedColor,
  useResolvedTelemetryColors,
} from '@/hooks/useTheme'
import {
  getHistoryMetricBaseColor,
  getHistoryRouteMetricGradient,
} from '@/modules/history/lib/historyRouteGradient'
import { resolveMarkerRenderData } from '@/modules/history/lib/markerOverlap'
import { MapMark } from '@/modules/map/components/MapMark'
import type { MainMapLayersProps } from '@/screens/main/map/mainMapLayerTypes'

/**
 * A ride on the zinc map: the route colored by the active metric over a background-colored casing,
 * start and end pins, and the Ride History Markers. The metric gradient and the marker status colors
 * keep their hue — they encode data — while casing, pins, and glyphs stay on the zinc tokens.
 */
export function ZincHistoryLayers({
  rideRouteShape,
  rideRoute,
  rideTelemetrySamples,
  activeHistoryMapMetric,
  rideMarkers,
  rideGpsSamples,
  historyMetricHotRanges,
  onSelectMarker,
}: Pick<
  MainMapLayersProps,
  | 'rideRouteShape'
  | 'rideRoute'
  | 'rideTelemetrySamples'
  | 'activeHistoryMapMetric'
  | 'rideMarkers'
  | 'rideGpsSamples'
  | 'historyMetricHotRanges'
  | 'onSelectMarker'
>) {
  const accents = useResolvedAccentColors()
  const telemetryColors = useResolvedTelemetryColors()
  const casingColor = useResolvedColor(theme.ui.background)
  const routeMetricGradient = useMemo(
    () =>
      getHistoryRouteMetricGradient({
        gpsSamples: rideGpsSamples,
        telemetrySamples: rideTelemetrySamples,
        metric: activeHistoryMapMetric,
        hotRanges: historyMetricHotRanges,
        gradientsEnabled: true,
        colors: telemetryColors,
        hotColor: accents.red.color,
      }),
    [
      accents.red.color,
      activeHistoryMapMetric,
      historyMetricHotRanges,
      rideGpsSamples,
      rideTelemetrySamples,
      telemetryColors,
    ],
  )
  const routeStart = rideRoute[0]
  const routeEnd = rideRoute.at(-1)

  return (
    <>
      {rideRouteShape && (
        <ShapeSource id="zinc-ride-route-source" shape={rideRouteShape} lineMetrics>
          <LineLayer
            id="zinc-ride-route-casing"
            style={{
              lineColor: theme.alpha(casingColor, 0.85),
              lineWidth: 8,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
          <LineLayer
            id="zinc-ride-route-line"
            style={{
              lineColor: getHistoryMetricBaseColor(activeHistoryMapMetric, telemetryColors),
              lineWidth: 5,
              lineCap: 'round',
              lineJoin: 'round',
              ...(routeMetricGradient ? { lineGradient: routeMetricGradient } : {}),
            }}
          />
        </ShapeSource>
      )}
      {routeStart && <MapMark id="zinc-ride-start" kind="start" coordinate={routeStart} />}
      {routeEnd && <MapMark id="zinc-ride-end" kind="end" coordinate={routeEnd} />}
      {resolveMarkerRenderData(rideMarkers, rideGpsSamples).map(
        ({ marker, gps, renderCoordinate }) => (
          <MapMark
            key={marker.id}
            id={`zinc-ride-marker-${marker.id}`}
            kind={marker.type}
            coordinate={renderCoordinate}
            onSelected={() => onSelectMarker({ marker, gps })}
          />
        ),
      )}
    </>
  )
}
