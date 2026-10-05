import { useCallback, useMemo, useRef, useState } from 'react'
import IconCloudUpload from '@tabler/icons-react-native/IconCloudUpload'
import IconFileExport from '@tabler/icons-react-native/IconFileExport'
import IconTrash from '@tabler/icons-react-native/IconTrash'

import { ActionsDrawer, type DrawerAction } from '@/components/ui/ActionsDrawer'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { rideExportOptions } from '@/modules/history/lib/rideExport'
import { rideMovingWindow } from '@/modules/history/lib/sessions'
import { shareRideExport } from '@/modules/history/lib/shareRideExport'
import {
  formatFavoriteName,
  formatRideTime,
  suggestFavoriteName,
} from '@/modules/history/lib/rideFormat'
import type { HistorySession } from '@/modules/history/store/historyStore'
import { HistoryControls } from '@/screens/main/history/HistoryControls'
import { HistoryTelemetryPanel } from '@/screens/main/history/HistoryTelemetryPanel'
import { HistoryStatsButton } from '@/screens/main/history/HistoryStatsButton'
import { useRideSummary } from '@/screens/main/history/HistoryStats'
import { HistoryRideTool } from '@/screens/main/history/HistoryRideTool'
import { HistoryRideNav } from '@/screens/main/history/HistoryRideNav'
import type { MainHistoryOverlayProps } from '@/screens/main/history/HistoryOverlay'

interface HistoryRideDetailProps {
  history: MainHistoryOverlayProps
  /** The ride being replayed: a grouped history session, or a favorite-backed one. */
  session: HistorySession
  /**
   * Favorite detail rather than a history ride: the header carries the Favorite's name, rename and
   * delete, and the ride-only affordances (prev/next, star, trim, ride delete) are gone.
   */
  favoriteMode: boolean
  busy: boolean
  onRemoveSession: () => void
  onPanelHeightChange: (height: number) => void
}

/** Stable identity: a Favorite has no Favorite ranges drawn over it, and a fresh [] re-renders. */
const NO_FAVORITE_RANGES: { startMs: number; endMs: number }[] = []

/** The replayed ride: chart panel, stats and header. Shared by history mode and favorite mode. */
export function HistoryRideDetail({
  history,
  session,
  favoriteMode,
  busy,
  onRemoveSession,
  onPanelHeightChange,
}: HistoryRideDetailProps) {
  const [deleteVisible, setDeleteVisible] = useState(false)
  const [trimName, setTrimName] = useState('')
  const [actionsVisible, setActionsVisible] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [shareInfoVisible, setShareInfoVisible] = useState(false)
  const pendingAction = useRef<(() => void) | null>(null)
  const afterActionsDismissed = () => {
    const action = pendingAction.current
    pendingAction.current = null
    action?.()
  }
  const dismissForAction = (action: () => void) => {
    pendingAction.current = action
    setActionsVisible(false)
  }
  const openFavorite = favoriteMode ? history.openFavorite : null
  const trimming = history.trimming
  const rideWindow = rideMovingWindow(session)

  // Stable handlers, so the panel — which rebuilds every chart series it is handed — re-renders
  // when the ride changes rather than every time this screen does.
  const {
    selectPreviousFavorite,
    selectPreviousRide,
    selectNextFavorite,
    selectNextRide,
    setHistorySheetVisible,
    beginTrimFavorite,
  } = history
  const mediaAdd = history.mediaHistory.add
  const handlePrevious = useCallback(() => {
    void (favoriteMode ? selectPreviousFavorite() : selectPreviousRide())
  }, [favoriteMode, selectPreviousFavorite, selectPreviousRide])
  const handleNext = useCallback(() => {
    void (favoriteMode ? selectNextFavorite() : selectNextRide())
  }, [favoriteMode, selectNextFavorite, selectNextRide])
  const handleOpenList = useCallback(() => setHistorySheetVisible(true), [setHistorySheetVisible])
  const handleAddMedia = useCallback(() => void mediaAdd(), [mediaAdd])
  const beginEditFavorite = history.beginEditFavorite
  const openFavoriteName = openFavorite?.name
  // A ride's star starts a new Favorite; an open Favorite's pencil edits it in place.
  const handleFavoriteAction = useCallback(() => {
    if (favoriteMode) {
      setTrimName(openFavoriteName ?? '')
      void beginEditFavorite()
      return
    }
    setTrimName('')
    beginTrimFavorite()
  }, [beginEditFavorite, beginTrimFavorite, favoriteMode, openFavoriteName])
  const { assets: mediaAssets, unmatched: mediaUnmatched } = history.mediaHistory
  const mediaLoading = history.mediaHistory.loading
  const mediaError = history.mediaHistory.error
  const openMedia = history.openMedia
  const { sessionSamples, sessionGpsSamples } = history
  const rideSummary = useRideSummary(session)
  // Memoized: it is a prop of the memoized panel, which would otherwise re-render with this screen.
  const leadingTool = useMemo(
    () => (
      <HistoryStatsButton
        session={session}
        samples={sessionSamples}
        gpsSamples={sessionGpsSamples}
        trimming={trimming}
      />
    ),
    [session, sessionSamples, sessionGpsSamples, trimming],
  )
  const tool = useMemo(
    () => (
      <HistoryRideTool
        favoriteMode={favoriteMode}
        mediaAssets={mediaAssets}
        mediaUnmatched={mediaUnmatched}
        mediaLoading={mediaLoading}
        mediaError={mediaError}
        onAddMedia={handleAddMedia}
        onOpenMedia={openMedia}
      />
    ),
    [
      favoriteMode,
      handleAddMedia,
      mediaAssets,
      mediaError,
      mediaLoading,
      mediaUnmatched,
      openMedia,
    ],
  )
  const trimSeedStartMs = history.trimSeed?.startMs
  const trimSeedEndMs = history.trimSeed?.endMs
  const updateTrimRange = history.updateTrimRange
  const trimConfig = useMemo(
    () =>
      trimming && trimSeedStartMs != null && trimSeedEndMs != null
        ? {
            startMs: trimSeedStartMs,
            endMs: trimSeedEndMs,
            onChange: updateTrimRange,
            onCommit: updateTrimRange,
          }
        : undefined,
    [trimSeedEndMs, trimSeedStartMs, trimming, updateTrimRange],
  )

  const rideActions: DrawerAction[] = [
    ...(openFavorite
      ? [
          {
            id: 'share',
            label: 'Share',
            icon: IconCloudUpload,
            disabled: busy || history.favoritesSaving,
            onPress: () => dismissForAction(() => setShareInfoVisible(true)),
          },
        ]
      : []),
    ...(['gpx', 'csv'] as const).map((format) => ({
      id: `export-${format}`,
      label: `Export ${format.toUpperCase()}`,
      icon: IconFileExport,
      disabled: exporting,
      onPress: () => {
        const options = rideExportOptions(session, openFavorite)
        dismissForAction(() => {
          setExporting(true)
          void shareRideExport(options, format)
            .catch((cause: unknown) =>
              setExportError(cause instanceof Error ? cause.message : 'Could not export ride'),
            )
            .finally(() => setExporting(false))
        })
      },
    })),
    {
      id: 'delete',
      label: openFavorite ? 'Delete Favorite' : 'Delete ride',
      icon: IconTrash,
      danger: true,
      disabled: busy,
      onPress: () =>
        dismissForAction(openFavorite ? () => setDeleteVisible(true) : onRemoveSession),
    },
  ]

  return (
    <>
      {!trimming ? (
        <HistoryRideNav
          titleStartMs={rideWindow?.startMs ?? session.startAtMs}
          titleEndMs={rideWindow?.endMs ?? session.endAtMs}
          boardName={session.boardName}
          title={
            openFavorite
              ? formatFavoriteName(openFavorite.name, openFavorite.startMs, openFavorite.endMs)
              : undefined
          }
          subtitle={
            openFavorite
              ? [formatRideTime(openFavorite.startMs, openFavorite.endMs), openFavorite.boardName]
                  .filter(Boolean)
                  .join(' · ')
              : rideSummary
          }
          canPrevious={favoriteMode ? history.canPreviousFavorite : history.canPreviousRide}
          canNext={favoriteMode ? history.canNextFavorite : history.nextRide != null}
          favoriteMode={favoriteMode}
          favorited={history.selectedSessionFavorite != null}
          actionDisabled={busy || history.favoritesSaving}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onOpenList={handleOpenList}
          onFavoriteAction={handleFavoriteAction}
          onBack={history.exitHistory}
          onOpenActions={() => setActionsVisible(true)}
        />
      ) : null}
      <HistoryTelemetryPanel
        session={session}
        leadingTool={leadingTool}
        tool={tool}
        gpsGapSamples={sessionSamples}
        samples={history.sessionChartSamples}
        favoriteRanges={favoriteMode ? NO_FAVORITE_RANGES : history.favorites}
        onMetricInteraction={history.setActiveHistoryMapMetric}
        onHeightChange={onPanelHeightChange}
        trim={trimConfig}
      />
      {trimming ? (
        <HistoryControls
          tab={history.historyTab}
          trimming
          saving={history.favoritesSaving}
          trimName={trimName}
          trimNamePlaceholder={
            history.trimSeed
              ? suggestFavoriteName(history.trimSeed.startMs, history.trimSeed.endMs)
              : 'Favorite name'
          }
          onTrimNameChange={setTrimName}
          onSelectTab={history.selectHistoryTab}
          onBack={history.exitHistory}
          onCancelTrim={() => {
            setTrimName('')
            void history.cancelTrim()
          }}
          onSaveTrim={() => {
            void history.saveTrim(trimName)
          }}
        />
      ) : null}

      <ActionsDrawer
        visible={actionsVisible}
        title={openFavorite ? 'Favorite actions' : 'Ride actions'}
        testIDPrefix="history-action"
        actions={rideActions}
        onClose={() => setActionsVisible(false)}
        onDismissed={afterActionsDismissed}
      />
      <ConfirmDialog
        visible={shareInfoVisible}
        title="Share Favorite"
        message="Sharing is coming in the future."
        onConfirm={() => setShareInfoVisible(false)}
        onDismiss={() => setShareInfoVisible(false)}
      />
      <ConfirmDialog
        visible={exportError != null}
        title="Export failed"
        message={exportError ?? ''}
        onConfirm={() => setExportError(null)}
        onDismiss={() => setExportError(null)}
      />
      <ConfirmDialog
        visible={deleteVisible}
        title="Delete Favorite"
        message="The Favorite is removed. Its telemetry stays in history and becomes deletable again."
        confirmLabel="Delete"
        cancelLabel="Keep"
        destructive
        onConfirm={() => {
          setDeleteVisible(false)
          void history.removeOpenFavorite()
        }}
        onDismiss={() => setDeleteVisible(false)}
      />
    </>
  )
}
