import { create } from 'zustand'

import type { HistoryMetricKey } from '@/modules/history/lib/metricColorScale'
import type { MainViewState } from '@/screens/main/mainViewState'

export type MapSelector = 'navigation' | 'layers' | null

/** The tabs that cover the Ride dashboard or the map instead of replacing them. */
export type CoverTab = 'board' | 'profile'

/** Overlays that sit on the Explore map without taking the map over, so navigation stays live. */
export type MapLayer = 'weather' | 'legalLimits'

/** Which list the history screen shows: recorded rides, or the Favorites the rider starred. */
export type HistoryTab = 'history' | 'favorites'

/** The time span a rider is trimming into a Favorite. Non-null means trim mode is active. */
export interface TrimRange {
  startMs: number
  endMs: number
}

interface MainScreenState {
  mode: MainViewState
  /** Weather and Legal limits are layers on the Explore map, not modes of their own. */
  mapLayer: MapLayer | null
  /** The Board or Profile view covers the Ride dashboard or the map; Home and Map close it. */
  coverTab: CoverTab | null
  historyTab: HistoryTab
  /** The Favorite whose detail is open, or null while the Favorites list is showing. */
  openFavoriteId: string | null
  historySheetVisible: boolean
  mapSelector: MapSelector
  perspectiveEnabled: boolean
  /** Measured height of the History panel; the map fits the route into what is left above it. */
  historyPanelHeight: number
  trimRange: TrimRange | null
  activeHistoryMapMetric: HistoryMetricKey
}

interface MainScreenActions {
  reset: () => void
  enterTelemetry: () => void
  openCoverTab: (tab: CoverTab) => void
  closeCoverTab: () => void
  enterMap: () => void
  /** Explore map with the weather layer on. */
  enterWeather: () => void
  /** Explore map with the legal limits layer on. */
  enterLegalLimits: () => void
  exitMapLayer: () => void
  enterHistory: () => void
  setHistoryTab: (tab: HistoryTab) => void
  /** Open one Favorite's detail. */
  openFavorite: (id: string) => void
  /** Back to the Favorites list. */
  closeFavorite: () => void
  setHistorySheetVisible: (visible: boolean) => void
  setMapSelector: (selector: MapSelector) => void
  dismissMapSelector: () => void
  setPerspectiveEnabled: (enabled: boolean) => void
  setHistoryPanelHeight: (height: number) => void
  /** Enter trim mode seeded with a default range (the ride's full Moving Window). */
  beginTrim: (range: TrimRange) => void
  /** Live-update the trimmed span while a handle is dragged. */
  setTrimRange: (range: TrimRange) => void
  /** Leave trim mode (save or cancel). */
  endTrim: () => void
  setActiveHistoryMapMetric: (metric: HistoryMetricKey) => void
}

const initialState: MainScreenState = {
  mode: 'telemetry',
  mapLayer: null,
  coverTab: null,
  historyTab: 'history',
  openFavoriteId: null,
  historySheetVisible: false,
  mapSelector: null,
  perspectiveEnabled: true,
  historyPanelHeight: 0,
  trimRange: null,
  activeHistoryMapMetric: 'speed',
}

export const useMainScreenStore = create<MainScreenState & MainScreenActions>((set) => ({
  ...initialState,

  reset() {
    set(initialState)
  },

  enterTelemetry() {
    set({
      mode: 'telemetry',
      mapLayer: null,
      coverTab: null,
      historySheetVisible: false,
      mapSelector: null,
      trimRange: null,
      openFavoriteId: null,
    })
  },

  openCoverTab(tab) {
    set((state) => (state.coverTab === tab ? state : { coverTab: tab, mapSelector: null }))
  },

  closeCoverTab() {
    set((state) => (state.coverTab ? { coverTab: null } : state))
  },

  enterMap() {
    set({ mode: 'map', mapLayer: null, coverTab: null, mapSelector: null })
  },

  enterWeather() {
    set({ mode: 'map', mapLayer: 'weather', coverTab: null, mapSelector: null })
  },

  exitMapLayer() {
    set((state) => (state.mapLayer ? { mapLayer: null } : state))
  },

  enterLegalLimits() {
    set({ mode: 'map', mapLayer: 'legalLimits', coverTab: null, mapSelector: null })
  },

  enterHistory() {
    set({ mode: 'history', mapLayer: null, coverTab: null, mapSelector: null })
  },

  setHistoryTab(tab) {
    set((state) =>
      state.historyTab === tab
        ? state
        : {
            historyTab: tab,
            historySheetVisible: false,
            openFavoriteId: null,
            trimRange: null,
          },
    )
  },

  openFavorite(id) {
    set({ openFavoriteId: id, historySheetVisible: false, trimRange: null })
  },

  closeFavorite() {
    set((state) => (state.openFavoriteId === null ? state : { openFavoriteId: null }))
  },

  setHistorySheetVisible(visible) {
    set({ historySheetVisible: visible })
  },

  setMapSelector(selector) {
    set((state) => (state.mapSelector === selector ? state : { mapSelector: selector }))
  },

  dismissMapSelector() {
    set((state) => (state.mapSelector === null ? state : { mapSelector: null }))
  },

  setPerspectiveEnabled(enabled) {
    set({ perspectiveEnabled: enabled })
  },

  setHistoryPanelHeight(height) {
    set((state) => (state.historyPanelHeight === height ? state : { historyPanelHeight: height }))
  },

  beginTrim(range) {
    set({ trimRange: range })
  },

  setTrimRange(range) {
    set((state) =>
      state.trimRange &&
      state.trimRange.startMs === range.startMs &&
      state.trimRange.endMs === range.endMs
        ? state
        : { trimRange: range },
    )
  },

  endTrim() {
    set((state) => (state.trimRange === null ? state : { trimRange: null }))
  },

  setActiveHistoryMapMetric(metric) {
    set((state) =>
      state.activeHistoryMapMetric === metric ? state : { activeHistoryMapMetric: metric },
    )
  },
}))
