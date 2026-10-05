import type { AlertRule } from 'vescape-core'

import {
  asAlertPresetMetric,
  type AlertPresetLevel,
  type AlertPresetMetric,
} from '@/modules/alerts/lib/alertPresets'
import { customRulesForControl } from '@/modules/alerts/lib/customAlertRules'

/** Every control a rider can set alerts on, in the order the Alerts screen lists them. */
export const ALERT_CONTROL_IDS = [
  'battery',
  'speed',
  'duty',
  'motor-temp',
  'controller-temp',
  'motor-current',
  'batt-current',
] as const

export type AlertControlId = (typeof ALERT_CONTROL_IDS)[number]

const LEVEL_LABELS: Record<AlertPresetLevel, string> = {
  off: 'Off',
  safe: 'Safe',
  normal: 'Normal',
  minimal: 'Minimal',
  custom: 'Custom',
}

/** One closed-row line: the preset level, the number of own rules (`custom`), or "None". */
export function alertLevelSummary(level: AlertPresetLevel, customCount: number): string {
  if (level === 'custom') {
    return customCount === 0 ? 'None' : `${customCount} ${customCount === 1 ? 'alert' : 'alerts'}`
  }
  return LEVEL_LABELS[level]
}

interface ControlAlertState {
  /** Whether this control warns the rider at all. */
  active: boolean
  /** One closed-row line: the preset level, the number of own rules, or "None". */
  summary: string
}

/**
 * What one control's alerts amount to. A preset metric follows its selected level (`custom` means
 * the rider's own rules); a control without presets has only the rider's own rules.
 */
export function controlAlertState(
  controlId: string,
  presetSelection: Partial<Record<AlertPresetMetric, AlertPresetLevel>>,
  rules: AlertRule[],
): ControlAlertState {
  const custom = customRulesForControl(rules, controlId).filter((rule) => rule.enabled).length
  const metric = asAlertPresetMetric(controlId)
  const level = metric ? (presetSelection[metric] ?? 'off') : 'custom'

  return {
    active: level === 'custom' ? custom > 0 : level !== 'off',
    summary: alertLevelSummary(level, custom),
  }
}

/** How many of the alert controls currently warn the rider. */
export function activeAlertCount(
  presetSelection: Partial<Record<AlertPresetMetric, AlertPresetLevel>>,
  rules: AlertRule[],
): number {
  return ALERT_CONTROL_IDS.filter(
    (controlId) => controlAlertState(controlId, presetSelection, rules).active,
  ).length
}
