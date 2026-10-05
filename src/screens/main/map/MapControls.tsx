import IconGauge from '@tabler/icons-react-native/IconGauge'
import IconStack2 from '@tabler/icons-react-native/IconStack2'
import type { RefObject } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import type { SharedValue } from 'react-native-reanimated'

import { Text } from '@/components/base/Text'
import { WeatherMapButton } from '@/modules/weather/components/WeatherMapButton'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { theme } from '@/constants/theme'
import { MapOrientationSelector } from '@/modules/map/components/MapOrientationSelector'
import { MapStyleList } from '@/modules/map/components/MapStyleList'
import type { MapOrientationMode, MapStyleKey } from '@/modules/map/constants/mapStyles'
import { MapPointFilterList } from '@/modules/map-points/components/MapPointFilterList'
import { useMapPointStore } from '@/modules/map-points/store/mapPointStore'
import { GroupRideControl } from '@/screens/main/GroupRideControl'
import type { MainMapHandle } from '@/screens/main/map/MainMap'
import type { MapSelector } from '@/screens/main/mainScreenStore'
import type { MainViewState } from '@/screens/main/mainViewState'

interface MapControlsProps {
  mode: MainViewState
  top: number
  mapRef: RefObject<MainMapHandle | null>
  heading: SharedValue<number>
  mapStyleKey: MapStyleKey
  setMapStyleKey: (key: MapStyleKey) => void
  mapOrientationMode: MapOrientationMode
  setMapOrientationMode: (mode: MapOrientationMode) => void
  mapSelector: MapSelector
  setMapSelector: (selector: MapSelector) => void
  /** Weather and Legal limits are layers on the Explore map; their buttons toggle them. */
  weatherActive: boolean
  legalLimitsActive: boolean
  onEnterWeather: () => void
  onEnterLegalLimits: () => void
  onExitMapLayer: () => void
}

/**
 * The map selectors: one layers drawer (basemap style, and in Explore the Map Point filter), the
 * weather and legal-limit overlays, and camera behaviour. Ordered from what the map shows to how
 * the camera follows the rider. Explore stacks layers and camera behaviour in a rail under the search button, with the
 * weather and legal-limit buttons in a matching rail on the left; History puts the same rail under its top row; the other modes keep
 * everything mid-left, clear of their own top-right controls.
 */
export function MapControls({
  mode,
  top,
  mapRef,
  heading,
  mapStyleKey,
  setMapStyleKey,
  mapOrientationMode,
  setMapOrientationMode,
  mapSelector,
  setMapSelector,
  weatherActive,
  legalLimitsActive,
  onEnterWeather,
  onEnterLegalLimits,
  onExitMapLayer,
}: MapControlsProps) {
  const showNavigationSelector = mode !== 'history'
  const navigationExpanded = showNavigationSelector && mapSelector === 'navigation'
  const showFilterSelector = mode === 'map'
  const layersOpen = mapSelector === 'layers'
  // The layers drawer has its own backdrop, so only the navigation menu needs a dismiss layer.
  const selectorOpen = navigationExpanded
  const hiddenMapPointCategories = useMapPointStore((s) => s.hiddenMapPointCategories)
  const toggleMapPointCategoryVisibility = useMapPointStore(
    (s) => s.toggleMapPointCategoryVisibility,
  )

  // Collapsing after a pick is the menu's own idle timer: it restarts on every tap, so the rider
  // can try basemaps one by one and the list only folds away once they stop.
  return (
    <View pointerEvents="box-none" style={styles.mapControlsLayer}>
      {selectorOpen ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close map selector"
          style={styles.mapSelectorDismissLayer}
          onPress={() => setMapSelector(null)}
        />
      ) : null}
      <View
        pointerEvents="box-none"
        style={
          mode === 'map'
            ? [styles.mapSelectorRail, { top: top + RAIL_OFFSET }]
            : mode === 'history'
              ? [styles.mapSelectorRail, { top: top + HISTORY_RAIL_OFFSET }]
              : styles.mapSelectors
        }
      >
        <Button
          icon={IconStack2}
          variant="floating"
          size="lg"
          accessibilityLabel="Map layers"
          testID="map-layers"
          onPress={() => setMapSelector('layers')}
        />
        <Drawer visible={layersOpen} title="Map type" onClose={() => setMapSelector(null)}>
          <MapStyleList activeKey={mapStyleKey} onSelect={setMapStyleKey} />
          {showFilterSelector ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Map details</Text>
              <MapPointFilterList
                hiddenCategories={hiddenMapPointCategories}
                onToggleCategory={toggleMapPointCategoryVisibility}
              />
            </>
          ) : null}
        </Drawer>
        {showNavigationSelector ? (
          <MapOrientationSelector
            activeMode={mapOrientationMode}
            heading={heading}
            expanded={navigationExpanded}
            onToggle={() => setMapSelector(mapSelector === 'navigation' ? null : 'navigation')}
            onSelect={(nextMode) => {
              if (mapOrientationMode === 'freeRotate' && nextMode !== 'freeRotate') {
                mapRef.current?.resetRotation()
              }
              setMapOrientationMode(nextMode)
            }}
          />
        ) : null}
      </View>
      {mode === 'map' ? (
        <View pointerEvents="box-none" style={[styles.mapOverlayRail, { top: top + RAIL_OFFSET }]}>
          <GroupRideControl variant="floating" />
          <WeatherMapButton
            active={weatherActive}
            onPress={weatherActive ? onExitMapLayer : onEnterWeather}
          />
          <Button
            icon={IconGauge}
            label={legalLimitsActive ? 'Legal limits' : undefined}
            variant="floating"
            size="lg"
            style={legalLimitsActive ? styles.layerActive : undefined}
            testID="map-mode-legal-limits"
            accessibilityLabel={legalLimitsActive ? 'Hide legal limits' : 'Show legal limits'}
            onPress={legalLimitsActive ? onExitMapLayer : onEnterLegalLimits}
          />
        </View>
      ) : null}
    </View>
  )
}

/** Rail top below the search button: its 52 height plus an 8 gap. */
const RAIL_OFFSET = 60
/** Below History's top row of 44-high buttons, plus an 8 gap. */
const HISTORY_RAIL_OFFSET = 52

const styles = StyleSheet.create({
  // A layer that is on: tapping its button again goes back to the plain map.
  layerActive: {
    borderColor: theme.ui.foreground,
    backgroundColor: theme.ui.muted,
  },
  mapControlsLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 41,
  },
  mapSelectorDismissLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  mapSelectors: {
    position: 'absolute',
    left: 12,
    top: '50%',
    marginTop: -42,
    zIndex: 30,
    alignItems: 'flex-start',
    gap: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 16,
    backgroundColor: theme.ui.border,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    color: theme.ui.foreground,
    fontSize: 16,
    fontWeight: '600',
  },
  mapOverlayRail: {
    position: 'absolute',
    left: 12,
    zIndex: 30,
    alignItems: 'flex-start',
    gap: 8,
  },
  mapSelectorRail: {
    position: 'absolute',
    right: 12,
    zIndex: 30,
    alignItems: 'flex-end',
    gap: 8,
  },
})
