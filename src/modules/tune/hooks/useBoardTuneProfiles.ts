import { useMemo } from 'react'

import { useBoardStore } from '@/modules/board/store/boardStore'
import { isCompatibleProfile } from '@/modules/tune/store/tuneProfileHelpers'
import { useTuneProfileStore } from '@/modules/tune/store/tuneProfileStore'

/**
 * The active Board's Tune Profiles at its current Tune Compatibility, and the selected one. Empty
 * until the store has loaded that exact scope. Reads only: loading is the screen's job.
 */
export function useBoardTuneProfiles() {
  const boardId = useBoardStore((state) => state.activeBoardId)
  const compatibility = useBoardStore(
    (state) =>
      state.boards.find((board) => board.id === state.activeBoardId)?.link?.refloatBaseVersion ??
      null,
  )
  const profiles = useTuneProfileStore((state) => state.profiles)
  const activeProfile = useTuneProfileStore((state) => state.activeProfile)
  const loading = useTuneProfileStore((state) => state.loading)
  const loadedBoardId = useTuneProfileStore((state) => state.activeBoardId)
  const loadedCompatibility = useTuneProfileStore((state) => state.refloatBaseVersion)

  const loaded =
    boardId != null && loadedBoardId === boardId && loadedCompatibility === compatibility
  const boardProfiles = useMemo(
    () =>
      loaded
        ? profiles.filter((profile) => isCompatibleProfile(profile, boardId, compatibility))
        : [],
    [boardId, compatibility, loaded, profiles],
  )
  const boardActiveProfile =
    loaded && activeProfile != null && isCompatibleProfile(activeProfile, boardId, compatibility)
      ? activeProfile
      : null

  return {
    boardId,
    compatibility,
    loaded,
    loading,
    profiles: boardProfiles,
    activeProfile: boardActiveProfile,
  }
}
