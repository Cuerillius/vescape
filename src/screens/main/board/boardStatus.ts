import { fmtTimeAgo } from '@/helpers/format'
import { isConnecting, isLive } from '@/modules/board/lib/boardConnection'
import type { Board } from '@/modules/board/store/boardStore'

export type BoardStatusTone = 'live' | 'busy' | 'error' | 'attention' | 'idle'

export interface BoardStatus {
  label: string
  tone: BoardStatusTone
  /** What the board last reported, for a board that is not talking. */
  lastSeen?: { percent: number; ago: string }
}

/**
 * What a board is doing, in one line. Only the active board has a connection, so the others pass
 * no `bleStatus` and read from what was last seen.
 */
export function boardStatus(board: Board, bleStatus: string | null, now = Date.now()): BoardStatus {
  if (!board.link) return { label: 'Needs linking', tone: 'attention' }
  if (bleStatus && isLive(bleStatus)) return { label: 'Connected', tone: 'live' }
  if (bleStatus && isConnecting(bleStatus)) return { label: 'Connecting', tone: 'busy' }
  if (bleStatus === 'error') return { label: 'Connection failed', tone: 'error' }
  const last = board.lastBattery
  if (!last) return { label: 'Not connected yet', tone: 'idle' }
  return {
    label: 'Offline',
    tone: 'idle',
    lastSeen: { percent: Math.round(last.percent), ago: fmtTimeAgo(last.at, now) },
  }
}

export type BoardView = 'list' | 'board'

/**
 * Which face the Board tab shows. It follows the connection but only on its edges: going live opens
 * the board, a clean drop returns to the list, and the in-between phases (connecting, a weak link
 * reconnecting) keep whatever is showing so the screen never flaps with the signal.
 */
export function boardViewFor(current: BoardView, bleStatus: string): BoardView {
  if (isLive(bleStatus)) return 'board'
  if (isConnecting(bleStatus)) return current
  return 'list'
}
