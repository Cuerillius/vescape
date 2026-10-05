import { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import type { Favorite, HistoryGpsSample, HistoryMarker } from 'vescape-core'

import { Text } from '@/components/base/Text'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { theme } from '@/constants/theme'
import { HistoryEmptyState } from '@/modules/history/components/HistoryEmptyState'
import { MediaHistoryViewer } from '@/modules/history/components/MediaHistoryViewer'
import type { MediaAssetInput, MediaHistoryAsset } from '@/modules/history/lib/mediaHistory'
import { favoriteSessionId, sessionContainsFavorite } from '@/modules/history/lib/favorites'
import type { HistoryMetricKey } from '@/modules/history/lib/metricColorScale'
import type {
  HistorySession,
  TelemetryMinuteBucket,
  TelemetrySample,
} from '@/modules/history/store/historyStore'
import { HistoryControls } from '@/screens/main/history/HistoryControls'
import { HistoryRideDetail } from '@/screens/main/history/HistoryRideDetail'
import { HistorySessionSheet } from '@/screens/main/history/HistorySessionSheet'
import type { HistoryTab } from '@/screens/main/mainScreenStore'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export interface MainHistoryOverlayProps {
  selectedSession: HistorySession | null
  sessionSamples: TelemetrySample[]
  sessionChartSamples: TelemetrySample[]
  sessionGpsSamples: HistoryGpsSample[]
  sessionMarkers: HistoryMarker[]
  nextRide: HistorySession | null
  canPreviousRide: boolean
  loadingSession: boolean
  historyLoading: boolean
  historyHasMore: boolean
  historyError: string | undefined
  blocks: TelemetryMinuteBucket[]
  sessions: HistorySession[]
  historySheetVisible: boolean
  setHistorySheetVisible: (visible: boolean) => void
  historyTab: HistoryTab
  selectHistoryTab: (tab: HistoryTab) => void
  favorites: Favorite[]
  favoritesLoading: boolean
  favoritesSaving: boolean
  favoritesError: string | undefined
  selectedSessionFavorite: Favorite | null
  trimming: boolean
  trimSeed: { startMs: number; endMs: number } | null
  beginTrimFavorite: () => void
  beginEditFavorite: () => Promise<void>
  updateTrimRange: (startMs: number, endMs: number) => void
  cancelTrim: () => Promise<void>
  saveTrim: (name: string) => Promise<void>
  favoriteSessions: HistorySession[]
  canPreviousFavorite: boolean
  canNextFavorite: boolean
  selectPreviousFavorite: () => Promise<void>
  selectNextFavorite: () => Promise<void>
  /** The selected Favorite while the Favorites tab is active. */
  openFavorite: Favorite | null
  selectFavorite: (favorite: Favorite) => Promise<void>
  removeOpenFavorite: () => Promise<void>
  loadMoreHistory: () => Promise<void>
  selectPreviousRide: () => Promise<void>
  selectNextRide: () => Promise<void>
  selectRide: (session: HistorySession) => void
  selectFavoriteRide: (favoriteId: string, session: HistorySession) => void
  exitHistory: () => void
  removeSession: () => void
  setActiveHistoryMapMetric: (metric: HistoryMetricKey) => void
  mediaHistory: {
    assets: MediaHistoryAsset[]
    unmatched: MediaAssetInput[]
    loading: boolean
    error: string | null
    add: () => Promise<void>
  }
  openMedia: (asset: MediaAssetInput) => void
  openMediaAssetId: string | null
  closeMedia: () => void
}

interface HistoryOverlayProps {
  visible: boolean
  history: MainHistoryOverlayProps
  /** Height of the telemetry panel, so the session sheet and the map vignette sit above it. */
  panelHeight: number
  onPanelHeightChange: (height: number) => void
}

/** History mode: the replayed ride's panel, stats and controls, plus the ride list and media. */
export function HistoryOverlay({
  visible,
  history,
  panelHeight,
  onPanelHeightChange,
}: HistoryOverlayProps) {
  const [removeConfirmVisible, setRemoveConfirmVisible] = useState(false)
  const busy =
    history.loadingSession ||
    history.historyLoading ||
    history.favoritesLoading ||
    history.favoritesSaving
  const insets = useSafeAreaInsets()
  // Error text sits just above the ride panel, or above the home indicator when no ride is open.
  const errorBottom = Math.max(panelHeight, insets.bottom) + 16
  const favoriteMode = history.historyTab === 'favorites'
  const detailSession =
    history.historyTab === 'history' || history.openFavorite ? history.selectedSession : null
  const selectedSessionContainsFavorite =
    history.selectedSession != null &&
    sessionContainsFavorite(history.favorites, history.selectedSession)

  const handleRemoveConfirm = useCallback(() => {
    setRemoveConfirmVisible(false)
    history.removeSession()
  }, [history])

  return (
    <>
      {visible && detailSession && (
        <HistoryRideDetail
          history={history}
          session={detailSession}
          favoriteMode={favoriteMode}
          busy={busy}
          onRemoveSession={() => setRemoveConfirmVisible(true)}
          onPanelHeightChange={onPanelHeightChange}
        />
      )}

      {visible && !detailSession && (
        <>
          {!busy && <HistoryEmptyState favoriteMode={favoriteMode} />}
          <HistoryControls
            tab={history.historyTab}
            trimming={false}
            saving={false}
            trimName=""
            onTrimNameChange={() => undefined}
            onSelectTab={history.selectHistoryTab}
            onBack={history.exitHistory}
            onCancelTrim={() => undefined}
            onSaveTrim={() => undefined}
          />
        </>
      )}

      <HistorySessionSheet
        visible={history.historySheetVisible}
        favoriteMode={favoriteMode}
        sessions={favoriteMode ? history.favoriteSessions : history.sessions}
        favorites={favoriteMode ? history.favorites : []}
        selectedSessionId={history.selectedSession?.id ?? null}
        hasMore={!favoriteMode && history.historyHasMore}
        loadingMore={history.historyLoading}
        tab={history.historyTab}
        onSelectTab={history.selectHistoryTab}
        onClose={() => history.setHistorySheetVisible(false)}
        onSelectSession={(session) => {
          history.setHistorySheetVisible(false)
          if (favoriteMode) {
            const favorite = history.favorites.find(
              (item) => session.id === favoriteSessionId(item.id),
            )
            if (favorite) void history.selectFavorite(favorite)
          } else {
            history.selectRide(session)
          }
        }}
        onLoadMore={() => {
          void history.loadMoreHistory()
        }}
      />

      {visible && (history.historyError ?? history.favoritesError) ? (
        <View style={[styles.historyError, { bottom: errorBottom }]}>
          <Text style={styles.historyErrorText} selectable>
            {history.historyError ?? history.favoritesError}
          </Text>
        </View>
      ) : null}

      {history.openMediaAssetId ? (
        <MediaHistoryViewer
          key={history.openMediaAssetId}
          assets={[...history.mediaHistory.assets, ...history.mediaHistory.unmatched]}
          initialAssetId={history.openMediaAssetId}
          samples={history.sessionSamples}
          markers={history.sessionMarkers}
          onClose={history.closeMedia}
        />
      ) : null}

      <ConfirmDialog
        visible={removeConfirmVisible}
        title="Delete Ride"
        message={
          selectedSessionContainsFavorite
            ? 'Favorited telemetry will be kept. The rest of this ride will be permanently removed.'
            : 'This ride and all its telemetry data will be permanently removed.'
        }
        confirmLabel="Delete"
        cancelLabel="Keep"
        destructive
        onConfirm={handleRemoveConfirm}
        onDismiss={() => setRemoveConfirmVisible(false)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  historyError: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 25,
    borderRadius: theme.radius.lg,
    padding: 12,
    backgroundColor: theme.status.error.bg,
    borderWidth: 1,
    borderColor: theme.status.error.border,
  },
  historyErrorText: {
    color: theme.status.error.text,
    fontSize: 13,
    fontWeight: '600',
  },
})
