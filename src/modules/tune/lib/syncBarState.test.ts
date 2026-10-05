import { expect, test } from 'bun:test'

import { getSyncBarState } from '@/modules/tune/lib/syncBarState'

test('reports a failed save before anything about the board, even while the config loads', () => {
  expect(
    getSyncBarState({
      hasProfile: true,
      bleStatus: 'connected',
      hasDirtyFields: true,
      hasBoardDiff: false,
      dirtyCount: 2,
      diffCount: 0,
      loadingConfig: true,
      configError: null,
      boardSnapshotReady: false,
      saving: false,
      syncing: false,
    }),
  ).toEqual({ variant: 'save_failed', dirtyCount: 2, diffCount: 0, configError: null })
})

test('shows board config loading when there are no local edits', () => {
  expect(
    getSyncBarState({
      hasProfile: true,
      bleStatus: 'connected',
      hasDirtyFields: false,
      hasBoardDiff: false,
      dirtyCount: 0,
      diffCount: 0,
      loadingConfig: true,
      configError: null,
      boardSnapshotReady: false,
      saving: false,
      syncing: false,
    }),
  ).toEqual({ variant: 'loading_config', dirtyCount: 0, diffCount: 0, configError: null })
})

test('does not claim board is up to date when board config read failed', () => {
  expect(
    getSyncBarState({
      hasProfile: true,
      bleStatus: 'connected',
      hasDirtyFields: false,
      hasBoardDiff: false,
      dirtyCount: 0,
      diffCount: 0,
      loadingConfig: false,
      configError: 'Timed out reading Refloat config',
      boardSnapshotReady: false,
      saving: false,
      syncing: false,
    }),
  ).toEqual({
    variant: 'config_error',
    dirtyCount: 0,
    diffCount: 0,
    configError: 'Timed out reading Refloat config',
  })
})

test('offers to send the tune only after a real board snapshot shows a difference', () => {
  const differing = {
    hasProfile: true,
    bleStatus: 'connected',
    hasDirtyFields: false,
    hasBoardDiff: true,
    dirtyCount: 0,
    diffCount: 3,
    loadingConfig: false,
    configError: null,
    boardSnapshotReady: true,
    saving: false,
    syncing: false,
  }
  expect(getSyncBarState(differing)).toEqual({
    variant: 'sync_with_board',
    dirtyCount: 0,
    diffCount: 3,
    configError: null,
  })
  expect(getSyncBarState({ ...differing, boardSnapshotReady: false })?.variant).toBe(
    'loading_config',
  )
})

test('only claims board is up to date after real board snapshot is ready', () => {
  expect(
    getSyncBarState({
      hasProfile: true,
      bleStatus: 'connected',
      hasDirtyFields: false,
      hasBoardDiff: false,
      dirtyCount: 0,
      diffCount: 0,
      loadingConfig: false,
      configError: null,
      boardSnapshotReady: true,
      saving: false,
      syncing: false,
    }),
  ).toEqual({ variant: 'up_to_date', dirtyCount: 0, diffCount: 0, configError: null })
})
