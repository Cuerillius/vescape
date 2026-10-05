import { useEffect, useMemo, useState } from 'react'
import { router } from 'expo-router'

import { InfoModal } from '@/components/modals/InfoModal'
import { theme, type ThemeColor } from '@/constants/theme'
import { errorMessage } from '@/helpers/error'
import { useFirmwareCommandsReady } from '@/modules/board/hooks/useFirmwareCommandsReady'
import { useBoardConfigValuesStore } from '@/modules/board/store/boardConfigValuesStore'
import { boardConfigPrefill } from '@/modules/tune/lib/boardConfigPrefill'
import { tuneCardFactors } from '@/modules/tune/lib/tuneCardArt'
import { useBoardTuneProfiles } from '@/modules/tune/hooks/useBoardTuneProfiles'
import { useCreateTune } from '@/modules/tune/hooks/useCreateTune'
import {
  boardDiff,
  fieldsFromSnapshot,
  isUnsavedBoardTune,
} from '@/modules/tune/store/tuneProfileHelpers'
import { useTuneProfileStore } from '@/modules/tune/store/tuneProfileStore'
import { useTuneSnapshotStore } from '@/modules/tune/store/tuneSnapshotStore'
import { routes } from '@/navigation/routes'
import { TuningCard, type TuningCardPage } from '@/screens/main/dashboard/TuningCard'

const FALLBACK_PAGE_ID = 'fallback'
const UNSAVED_PAGE_ID = 'unsaved'
const NEW_PAGE_ID = 'new'

/**
 * The dashboard's tuning card: swipe through the board's tunes, open the one in view to edit it,
 * or apply it. Swiping only selects; the board changes when Apply writes the selected tune to it.
 * It is also where tunes are created, from the board's current values: a leading page when the board
 * runs something no saved tune matches, and a last page that always can.
 */
export function DashboardTuningCard({
  connected,
  legalModeActive,
}: {
  connected: boolean
  legalModeActive: boolean
}) {
  const { boardId, compatibility, loaded, profiles, activeProfile } = useBoardTuneProfiles()
  const loadProfiles = useTuneProfileStore((state) => state.loadProfiles)
  const setActiveProfile = useTuneProfileStore((state) => state.setActiveProfile)
  const syncToBoard = useTuneProfileStore((state) => state.syncToBoard)
  const syncing = useTuneProfileStore((state) => state.syncing)
  const hasDirtyFields = useTuneProfileStore((state) => state.hasDirtyFields)
  const snapshot = useTuneSnapshotStore((state) =>
    state.status === 'ready' ? state.snapshot : null,
  )
  const boardConfigValues = useBoardConfigValuesStore((state) => state.values)
  const commandsReady = useFirmwareCommandsReady()
  const { create: createTune, creating } = useCreateTune(profiles.map((profile) => profile.name))
  // The page the rider last swiped to. Until they swipe, the card opens on the board's own values
  // when no saved tune matches, and on the selected tune otherwise.
  const [viewedId, setViewedId] = useState<string | null>(null)
  // The message outlives `visible` so the modal's exit animation does not blank it.
  const [notice, setNotice] = useState({ title: '', message: '', visible: false })

  useEffect(() => {
    // intentional-suppression: the tune screen renders the store's load error
    if (boardId) void loadProfiles(boardId, compatibility).catch(() => undefined)
  }, [boardId, compatibility, loadProfiles])

  // A fresh snapshot is only read once the tune screen has been opened this session. Until then the
  // board's Last Known values stand in, so the card knows what the board runs without that visit.
  const boardFields = useMemo(() => {
    const known =
      snapshot && (snapshot.boardId == null || snapshot.boardId === boardId)
        ? snapshot
        : boardConfigPrefill(boardConfigValues, boardId)
    return known ? fieldsFromSnapshot(known) : null
  }, [boardConfigValues, boardId, snapshot])

  const activeId = activeProfile?.id ?? null
  const createState = creating ? 'saving' : 'ready'
  const pages = useMemo<TuningCardPage[]>(() => {
    const tunePages: TuningCardPage[] = profiles.map((profile) => ({
      id: profile.id,
      title: profile.name,
      art: { kind: 'tune', factors: tuneCardFactors(profile.fields) },
      apply:
        profile.id === activeId && syncing
          ? 'applying'
          : boardFields && boardDiff(profile, boardFields).length === 0
            ? 'applied'
            : 'ready',
    }))
    const newPage: TuningCardPage = {
      id: NEW_PAGE_ID,
      title: 'New tune',
      art: { kind: 'status', color: theme.tune.color },
      create: createState,
    }
    const unsavedPage: TuningCardPage | null =
      boardFields && isUnsavedBoardTune(profiles, boardFields)
        ? {
            id: UNSAVED_PAGE_ID,
            title: 'Board tune',
            art: { kind: 'tune', factors: tuneCardFactors(boardFields) },
            create: createState,
            unsaved: true,
          }
        : null
    return [...(unsavedPage ? [unsavedPage] : []), ...tunePages, newPage]
  }, [activeId, boardFields, createState, profiles, syncing])

  const available = connected && !legalModeActive && loaded
  // Edits on the active tune keep it in view: the carousel is locked, so it must not open elsewhere.
  const editingId = hasDirtyFields ? activeId : null
  const defaultId = pages[0]!.id === UNSAVED_PAGE_ID ? UNSAVED_PAGE_ID : (activeId ?? NEW_PAGE_ID)
  const pageId =
    editingId ?? (viewedId != null && pages.some((p) => p.id === viewedId) ? viewedId : defaultId)

  // The buttons belong to their card, not to whatever the store has selected, so a press on a card
  // that is still sliding in selects its tune first. Re-selecting the active one would drop its edits.
  const select = (id: string) => {
    if (id !== activeId) setActiveProfile(id)
  }

  const onSelect = (id: string) => {
    setViewedId(id)
    if (profiles.some((profile) => profile.id === id)) select(id)
  }

  const apply = (id: string) => {
    select(id)
    setViewedId(id)
    syncToBoard().catch((error: unknown) => {
      setNotice({
        title: 'Tune not applied',
        message: errorMessage(error, 'Could not apply the tune.'),
        visible: true,
      })
    })
  }

  const create = async () => {
    try {
      const created = await createTune()
      setViewedId(created.id)
    } catch (error) {
      setNotice({
        title: 'Tune not created',
        message: errorMessage(error, 'Could not create the tune.'),
        visible: true,
      })
    }
  }

  return (
    <>
      <TuningCard
        pages={available ? pages : [fallbackPage(connected, legalModeActive)]}
        activeId={available ? pageId : FALLBACK_PAGE_ID}
        actionsDisabled={!commandsReady}
        swipeLocked={hasDirtyFields}
        onSelect={onSelect}
        onApply={apply}
        onEdit={(id) => {
          select(id)
          router.push(routes.tuneEdit)
        }}
        onCreate={() => void create()}
      />
      <InfoModal
        visible={notice.visible}
        title={notice.title}
        message={notice.message}
        variant="danger"
        dismissLabel="Close"
        onDismiss={() => setNotice((current) => ({ ...current, visible: false }))}
      />
    </>
  )
}

function fallbackPage(connected: boolean, legalModeActive: boolean): TuningCardPage {
  const color: ThemeColor = legalModeActive
    ? theme.status.error.color
    : connected
      ? theme.tune.color
      : theme.ui.mutedForeground
  return {
    id: FALLBACK_PAGE_ID,
    title: !connected ? 'Tuning unavailable' : legalModeActive ? 'Legal mode' : 'Loading tunes',
    art: { kind: 'status', color },
  }
}
