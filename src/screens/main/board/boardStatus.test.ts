import { describe, expect, test } from 'bun:test'

import type { Board } from '@/modules/board/store/boardStore'
import { boardStatus, boardViewFor } from '@/screens/main/board/boardStatus'

const HOUR = 3_600_000

function board(extra: Partial<Board> = {}): Board {
  return {
    id: 'b',
    name: 'Board',
    description: null,
    createdAt: 0,
    deletedAt: null,
    batteryConfig: null,
    link: { linkVersion: 4, bleId: 'ble', transport: 'direct' },
    lastBattery: null,
    ...extra,
  }
}

describe('boardStatus', () => {
  test('an unlinked board needs linking whatever the connection says', () => {
    expect(boardStatus(board({ link: null }), 'connected')).toEqual({
      label: 'Needs linking',
      tone: 'attention',
    })
  })

  test('reads the active board from the connection', () => {
    expect(boardStatus(board(), 'connected').tone).toBe('live')
    expect(boardStatus(board(), 'stale').tone).toBe('live')
    expect(boardStatus(board(), 'rescanning').tone).toBe('busy')
    expect(boardStatus(board(), 'error').tone).toBe('error')
  })

  test('other boards read from the last battery they reported', () => {
    const lastBattery = { percent: 73.6, voltage: 58, at: 10 * HOUR }
    expect(boardStatus(board({ lastBattery }), null, 12 * HOUR)).toEqual({
      label: 'Offline',
      tone: 'idle',
      lastSeen: { percent: 74, ago: '2h ago' },
    })
    expect(boardStatus(board(), null).label).toBe('Not connected yet')
  })
})

describe('boardViewFor', () => {
  test('opens the board when live and returns to the list on a clean drop', () => {
    expect(boardViewFor('list', 'connected')).toBe('board')
    expect(boardViewFor('board', 'disconnecting')).toBe('list')
    expect(boardViewFor('board', 'idle')).toBe('list')
  })

  test('keeps the current face while a connection is in flight', () => {
    expect(boardViewFor('list', 'connecting')).toBe('list')
    expect(boardViewFor('board', 'reconnecting')).toBe('board')
  })
})
