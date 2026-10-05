/**
 * What the Settings Drawer knows about Ride History backup.
 *
 * Backup itself is native and lands with #276; this is the seam the UI is built against so the
 * drawer ships before the uploader does. When #276 merges, `useBackupSlot` projects
 * `useSyncStatusStore` (native's own status) into these cases and nothing above it changes.
 */
export type BackupSlot =
  /** Backup is not in this build yet — the tile says so rather than implying rides are safe. */
  | { kind: 'unavailable' }
  /** No Vescape account, so there is nothing to back up to. */
  | { kind: 'signedOut' }
  /** Signed in and nothing pending. */
  | { kind: 'idle'; lastUploadAtMs: number | null }
  /** A drain is running. `total` is the backlog it started with. */
  | { kind: 'syncing'; current: number; total: number }
