const CONNECTING_STATUSES = new Set([
  'connecting',
  'discovering',
  'subscribing',
  'waiting_for_telemetry',
  'reconnecting',
  'rescanning',
])

/** A connection attempt is in flight; the rider can cancel it. */
export function isConnecting(bleStatus: string): boolean {
  return CONNECTING_STATUSES.has(bleStatus)
}

/** The board is streaming telemetry, possibly with a weak signal. */
export function isLive(bleStatus: string): boolean {
  return bleStatus === 'connected' || bleStatus === 'stale'
}

/** Mirrors native's Ride Recording lifecycle. Pause/resume are automatic (idle-pause); the rider
 * can only end the ride outright. */
export type RecordingState = 'recording' | 'paused'

/** Derives the rider-facing recording state from `bleStore`'s raw `telemetryRecording*` fields. */
export function recordingStateFrom(enabled: boolean, paused: boolean): RecordingState | undefined {
  if (!enabled) return undefined
  return paused ? 'paused' : 'recording'
}
