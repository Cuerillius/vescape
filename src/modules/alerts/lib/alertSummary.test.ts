import { describe, expect, test } from 'bun:test'
import type { AlertRule } from 'vescape-core'

import { activeAlertCount, controlAlertState } from '@/modules/alerts/lib/alertSummary'

function rule(controlId: string, extra: Partial<AlertRule> = {}): AlertRule {
  return {
    boardId: 'b',
    id: `${controlId}-rule`,
    controlId,
    threshold: 50,
    thresholdMax: null,
    enabled: true,
    soundType: 'preset:beep',
    createdAt: 0,
    repeatEverySeconds: null,
    beepCount: 1,
    ...extra,
  } as AlertRule
}

describe('controlAlertState', () => {
  test('a preset metric reads as its selected level', () => {
    expect(controlAlertState('speed', { speed: 'safe' }, [])).toEqual({
      active: true,
      summary: 'Safe',
    })
    expect(controlAlertState('speed', { speed: 'off' }, [])).toEqual({
      active: false,
      summary: 'Off',
    })
  })

  test('a custom level counts only the rider rules that are enabled', () => {
    const rules = [rule('duty'), rule('duty', { id: 'muted', enabled: false })]
    expect(controlAlertState('duty', { duty: 'custom' }, rules)).toEqual({
      active: true,
      summary: '1 alert',
    })
    expect(controlAlertState('duty', { duty: 'custom' }, [])).toEqual({
      active: false,
      summary: 'None',
    })
  })

  test('a control without presets is only ever the rider rules', () => {
    expect(controlAlertState('motor-current', {}, [rule('motor-current')]).summary).toBe('1 alert')
    expect(controlAlertState('motor-current', {}, []).active).toBe(false)
  })
})

describe('activeAlertCount', () => {
  test('counts every control that warns, preset or custom', () => {
    expect(
      activeAlertCount({ battery: 'normal', speed: 'off', duty: 'custom' }, [rule('batt-current')]),
    ).toBe(2)
  })
})
