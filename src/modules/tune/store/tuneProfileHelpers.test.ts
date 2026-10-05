import { expect, test } from 'bun:test'
import type { TuneProfile } from 'vescape-core'

import { isUnsavedBoardTune, uniqueTuneName } from '@/modules/tune/store/tuneProfileHelpers'

function profile(id: string, fields: TuneProfile['fields']): TuneProfile {
  return {
    id,
    boardId: 'board-1',
    refloatBaseVersion: '1.3',
    name: id,
    icon: '',
    color: '',
    fields,
    createdAt: 0,
    updatedAt: 0,
  }
}

const SPORT = profile('sport', { kp: 26, kp2: 0.7 })
const CHILL = profile('chill', { kp: 18, kp2: 0.4 })

test('a board that matches a saved tune is not an unsaved tune', () => {
  expect(isUnsavedBoardTune([CHILL, SPORT], { kp: 26, kp2: 0.7, ki: 0.005 })).toBe(false)
})

test('a board that matches none of the saved tunes is unsaved, even with no tunes at all', () => {
  expect(isUnsavedBoardTune([CHILL, SPORT], { kp: 27, kp2: 0.7 })).toBe(true)
  expect(isUnsavedBoardTune([], { kp: 27 })).toBe(true)
})

test('nothing is unsaved while the board values are unknown', () => {
  expect(isUnsavedBoardTune([CHILL, SPORT], null)).toBe(false)
  expect(isUnsavedBoardTune([], null)).toBe(false)
})

test('a quick save takes the first free name, ignoring case', () => {
  expect(uniqueTuneName('Board tune', [])).toBe('Board tune')
  expect(uniqueTuneName('Board tune', ['Sport'])).toBe('Board tune')
  expect(uniqueTuneName('Board tune', ['board tune', 'Board tune 2'])).toBe('Board tune 3')
})
