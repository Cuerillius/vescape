import type {
  RefloatConfigSnapshot,
  TuneHistoryEntry,
  TuneProfile,
  TuneProfileFieldValue,
} from 'vescape-core'

export interface TuneProfileBoardDiff {
  fieldId: string
  profileValue: TuneProfileFieldValue | undefined
  boardValue: TuneProfileFieldValue
}

export interface TuneProfileState {
  profiles: TuneProfile[]
  activeProfile: TuneProfile | null
  activeBoardId: string | null
  refloatBaseVersion: string | null
  draftFields: Record<string, TuneProfileFieldValue>
  hasDirtyFields: boolean
  boardFields: Record<string, TuneProfileFieldValue>
  boardDiff: TuneProfileBoardDiff[]
  hasBoardDiff: boolean
  loading: boolean
  saving: boolean
  syncing: boolean
  error: string | null
}

export interface TuneProfileActions {
  loadProfiles: (boardId: string, refloatBaseVersion: string | null) => Promise<TuneProfile[]>
  loadProfile: (profileId: string) => Promise<TuneProfile | null>
  setActiveProfile: (profileId: string) => void
  /** Saves the board's current values as a new profile. */
  createProfile: (name: string, icon: string, color: string) => Promise<TuneProfile | null>
  /** Saves a copy of a saved profile, named after it, and selects the copy. */
  duplicateProfile: (profileId: string) => Promise<TuneProfile | null>
  renameProfile: (
    profileId: string,
    name: string,
    icon: string,
    color: string,
  ) => Promise<TuneProfile | null>
  deleteProfile: (profileId: string) => Promise<void>
  loadHistory: (profileId: string) => Promise<TuneHistoryEntry[]>
  rollbackToHistory: (historyEntryId: number) => Promise<TuneProfile | null>
  copyProfileToBoard: (
    profileId: string,
    targetBoardId: string,
    newName: string,
  ) => Promise<TuneProfile | null>
  setDraftField: (fieldId: string, value: TuneProfileFieldValue) => void
  /** Applies field edits to the active profile and saves them at once; there is no unsaved state to leave open. */
  editFields: (values: Record<string, TuneProfileFieldValue>) => Promise<void>
  setBoardSnapshot: (snapshot: RefloatConfigSnapshot | null) => void
  getDirtyFields: () => Record<string, TuneProfileFieldValue>
  acceptAllBoardValues: () => void
  saveActiveProfile: () => Promise<TuneProfile | null>
  syncToBoard: () => Promise<void>
  clear: () => void
}

export type TuneProfileStore = TuneProfileState & TuneProfileActions

export const INITIAL_TUNE_PROFILE_STATE: TuneProfileState = {
  profiles: [],
  activeProfile: null,
  activeBoardId: null,
  refloatBaseVersion: null,
  draftFields: {},
  hasDirtyFields: false,
  boardFields: {},
  boardDiff: [],
  hasBoardDiff: false,
  loading: false,
  saving: false,
  syncing: false,
  error: null,
}
