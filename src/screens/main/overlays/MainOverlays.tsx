import type { RefObject } from 'react'
import type { SharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { MapPoint, MapPointPatch } from 'vescape-core'

import type { RecordingState } from '@/modules/board/lib/boardConnection'
import type { Board } from '@/modules/board/store/boardStore'
import { LegalLimitsMapOverlay } from '@/modules/legal/components/LegalLimitsMapOverlay'
import type { MapOrientationMode, MapStyleKey } from '@/modules/map/constants/mapStyles'
import type { MapSelection } from '@/modules/map/lib/mapSelection'
import type { DirectionPoint } from '@/modules/map/store/mapStore'
import { WeatherMapOverlay } from '@/modules/weather/components/WeatherMapOverlay'
import { HistoryOverlay, type MainHistoryOverlayProps } from '@/screens/main/history/HistoryOverlay'
import type { MainMapHandle } from '@/screens/main/map/MainMap'
import { MapControls } from '@/screens/main/map/MapControls'
import { MapModeOverlay } from '@/screens/main/map/MapModeOverlay'
import { useMainScreenStore, type MapSelector } from '@/screens/main/mainScreenStore'
import type { MainViewState } from '@/screens/main/mainViewState'
import { MapPointStatusBanner } from '@/modules/map-points/components/MapPointStatusBanner'
import { BoardDashboard } from '@/screens/main/board/BoardDashboard'
import { useBoardView } from '@/screens/main/board/useBoardView'
import { RideDashboard } from '@/screens/main/dashboard/RideDashboard'
import { ProfileDashboard } from '@/screens/main/profile/ProfileDashboard'
import { MainTabBar, useMainTabBarHeight } from '@/screens/main/MainTabBar'

interface MainBoardOverlayProps {
  boards: Board[]
  activeBoardId: string | null
  activeBoard: Board | undefined
  bleStatus: string
  recordingState?: RecordingState
  onStopScan: () => void
  onRetryConnect: () => void
  onConnectBoard: (id: string) => void
  onAddBoard: () => void
  onEndRide: () => void
  onStartRecording: () => void
}

interface MainMapOverlayProps {
  heading: SharedValue<number>
  mapStyleKey: MapStyleKey
  setMapStyleKey: (key: MapStyleKey) => void
  mapOrientationMode: MapOrientationMode
  setMapOrientationMode: (mode: MapOrientationMode) => void
  mapSelector: MapSelector
  setMapSelector: (selector: MapSelector) => void
  enterMapFocus: () => void
  exitMapFocus: () => void
  enterWeather: () => void
  weatherActive: boolean
  legalLimitsActive: boolean
  enterLegalLimits: () => void
  exitMapLayer: () => void
  weatherLocation: { latitude: number; longitude: number } | null
  directionPoint: DirectionPoint | null
  activeNavigationTarget: MapSelection | null
  selectedNavigationTarget: MapSelection | null
  longPressMapTarget: MapSelection | null
  onLongPressMapTargetHandled: () => void
  onSelectNavigationTarget: (selection: MapSelection) => void
  onNavigateSelectedTarget: () => Promise<void>
  onCancelNavigation: () => void
  onDismissSelectedTarget: () => void
  updateMapPoint: (id: string, patch: MapPointPatch) => Promise<MapPoint | null>
  setMapPointReaction: (id: string, reaction: 'up' | 'down' | null) => void
  onRemoveMapPoint: (id: string) => void
}

interface MainOverlaysProps {
  mode: MainViewState
  mapRef: RefObject<MainMapHandle | null>
  mapInteractionHandlerRef: RefObject<(selection?: MapSelection) => boolean | undefined>
  board: MainBoardOverlayProps
  map: MainMapOverlayProps
  history: MainHistoryOverlayProps
}

/**
 * Everything drawn on top of the map. The main screen has two views, switched by the tab bar: the
 * Ride dashboard (opaque, covers the map) and the Map with its Weather and Legal limits layers; the
 * Board and Profile views open over either of them.
 * History opens on the map from the Ride view. One overlay per mode or layer, each owning its own
 * state; this only decides which of them is on screen.
 */
export function MainOverlays({
  mode,
  mapRef,
  mapInteractionHandlerRef,
  board,
  map,
  history,
}: MainOverlaysProps) {
  const insets = useSafeAreaInsets()
  // In the store rather than in state: the map camera frames the route into the space this panel
  // leaves, and it lives in a different tree.
  const panelHeight = useMainScreenStore((s) => s.historyPanelHeight)
  const setPanelHeight = useMainScreenStore((s) => s.setHistoryPanelHeight)
  const boardView = useBoardView(board.bleStatus)
  const coverTab = useMainScreenStore((s) => s.coverTab)
  const openCoverTab = useMainScreenStore((s) => s.openCoverTab)
  const closeCoverTab = useMainScreenStore((s) => s.closeCoverTab)
  const tabBarHeight = useMainTabBarHeight()
  const mapModeTabsTop = Math.max(insets.top, 8)
  const tabBarVisible = mode === 'telemetry' || mode === 'map'

  return (
    <>
      <RideDashboard
        visible={mode === 'telemetry'}
        activeBoard={board.activeBoard}
        bleStatus={board.bleStatus}
      />

      {mode === 'map' ? <MapPointStatusBanner top={mapModeTabsTop} /> : null}

      <MapModeOverlay
        visible={mode === 'map'}
        layerActive={map.weatherActive || map.legalLimitsActive}
        mapRef={mapRef}
        mapInteractionHandlerRef={mapInteractionHandlerRef}
        top={mapModeTabsTop}
        bottom={tabBarHeight + 12}
        sheetBottom={tabBarHeight + 12}
        searchProximity={map.weatherLocation}
        directionPoint={map.directionPoint}
        activeNavigationTarget={map.activeNavigationTarget}
        selectedNavigationTarget={map.selectedNavigationTarget}
        longPressMapTarget={map.longPressMapTarget}
        onLongPressMapTargetHandled={map.onLongPressMapTargetHandled}
        onSelectNavigationTarget={map.onSelectNavigationTarget}
        onNavigateSelectedTarget={map.onNavigateSelectedTarget}
        onCancelNavigation={map.onCancelNavigation}
        onDismissSelectedTarget={map.onDismissSelectedTarget}
        updateMapPoint={map.updateMapPoint}
        setMapPointReaction={map.setMapPointReaction}
        onRemoveMapPoint={map.onRemoveMapPoint}
      />

      {mode !== 'telemetry' ? (
        <MapControls
          mode={mode}
          top={mapModeTabsTop}
          mapRef={mapRef}
          heading={map.heading}
          mapStyleKey={map.mapStyleKey}
          setMapStyleKey={map.setMapStyleKey}
          mapOrientationMode={map.mapOrientationMode}
          setMapOrientationMode={map.setMapOrientationMode}
          mapSelector={map.mapSelector}
          setMapSelector={map.setMapSelector}
          weatherActive={map.weatherActive}
          legalLimitsActive={map.legalLimitsActive}
          onEnterWeather={map.enterWeather}
          onEnterLegalLimits={map.enterLegalLimits}
          onExitMapLayer={map.exitMapLayer}
        />
      ) : null}

      <WeatherMapOverlay visible={map.weatherActive} bottom={tabBarHeight} />

      <LegalLimitsMapOverlay visible={map.legalLimitsActive} bottom={tabBarHeight} />

      <HistoryOverlay
        visible={mode === 'history'}
        history={history}
        panelHeight={panelHeight}
        onPanelHeightChange={setPanelHeight}
      />

      <BoardDashboard
        visible={tabBarVisible && coverTab === 'board'}
        view={boardView}
        boards={board.boards}
        activeBoardId={board.activeBoardId}
        activeBoard={board.activeBoard}
        bleStatus={board.bleStatus}
        onConnectBoard={board.onConnectBoard}
        onDisconnect={board.onStopScan}
        onOpenLegalLimits={() => {
          // Leaving the Board view first, so Android back exits Legal limits rather than the Board.
          closeCoverTab()
          map.enterLegalLimits()
        }}
        onAddBoard={board.onAddBoard}
      />

      <ProfileDashboard
        visible={tabBarVisible && coverTab === 'profile'}
        onOpenRide={history.selectRide}
        onOpenFavorite={history.selectFavoriteRide}
      />

      {tabBarVisible ? (
        <MainTabBar
          boardLabel={boardView === 'board' ? 'Board' : 'Boards'}
          active={coverTab ?? (mode === 'telemetry' ? 'ride' : 'map')}
          onSelect={(tab) => {
            if (tab === 'board' || tab === 'profile') return openCoverTab(tab)
            closeCoverTab()
            if (tab === 'ride') map.exitMapFocus()
            else map.enterMapFocus()
          }}
          bleStatus={board.bleStatus}
          activeBoard={board.activeBoard}
          recordingState={board.recordingState}
          onConnect={board.onRetryConnect}
          onDisconnect={board.onStopScan}
          onEndRide={board.onEndRide}
          onStartRecording={board.onStartRecording}
        />
      ) : null}
    </>
  )
}
