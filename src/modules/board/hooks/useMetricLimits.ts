import { useMemo } from 'react'

import type { MetricHeroLimit } from '@/modules/board/components/MetricHero'
import { useBoardConfigFields } from '@/modules/board/store/boardConfigValuesStore'
import { useMotorConfigFields } from '@/modules/board/store/motorConfigValuesStore'

type ConfigValues = { values: Record<string, number | boolean | undefined> } | null

function read(config: ConfigValues, id: string): number | null {
  const value = config?.values[id]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

/**
 * Limits this board's config puts on a metric, as the hero draws them. Each is `null` until the
 * config has been read, and the hero then shows the value without a headroom bar.
 *
 * Duty: where the board starts pushing back — the controller's hard ceiling is the fallback.
 */
export function useDutyLimit(): MetricHeroLimit | null {
  const board = useBoardConfigFields()
  const motor = useMotorConfigFields()
  return useMemo(() => {
    const pushback = read(board, 'tiltback_duty')
    if (pushback != null && pushback > 0) {
      return {
        max: pushback * 100,
        barMax: 100,
        label: `Pushback at ${Math.round(pushback * 100)}%`,
      }
    }
    const ceiling = read(motor, 'l_max_duty')
    if (ceiling != null && ceiling > 0) {
      return { max: ceiling * 100, barMax: 100, label: `Duty limit ${Math.round(ceiling * 100)}%` }
    }
    return null
  }, [board, motor])
}

function currentLimit(
  motor: ConfigValues,
  maxId: string,
  minId: string,
  noun: string,
): MetricHeroLimit | null {
  const max = read(motor, maxId)
  if (max == null || max <= 0) return null
  const min = read(motor, minId)
  return {
    max,
    min: min != null && min < 0 ? min : undefined,
    label: `${noun} limit ${Math.round(max)} A`,
  }
}

/** Motor current against the controller's accelerating and braking limits. */
export function useMotorCurrentLimit(): MetricHeroLimit | null {
  const motor = useMotorConfigFields()
  return useMemo(() => currentLimit(motor, 'l_current_max', 'l_current_min', 'Motor'), [motor])
}

/** Battery current against what the controller may draw from, and regen into, the pack. */
export function useBatteryCurrentLimit(): MetricHeroLimit | null {
  const motor = useMotorConfigFields()
  return useMemo(
    () => currentLimit(motor, 'l_in_current_max', 'l_in_current_min', 'Battery'),
    [motor],
  )
}

/**
 * Temperature against where the controller starts cutting power. The bar runs to the full-cut
 * temperature, so the tick marks where limiting begins and the hero turns red once it has.
 */
function temperatureLimit(
  motor: ConfigValues,
  startId: string,
  endId: string,
): MetricHeroLimit | null {
  const start = read(motor, startId)
  const end = read(motor, endId)
  if (start == null || end == null || start <= 0 || end <= start) return null
  return { max: start, barMax: end, label: `Limiting from ${Math.round(start)} °C` }
}

export function useMotorTempLimit(): MetricHeroLimit | null {
  const motor = useMotorConfigFields()
  return useMemo(() => temperatureLimit(motor, 'l_temp_motor_start', 'l_temp_motor_end'), [motor])
}

export function useControllerTempLimit(): MetricHeroLimit | null {
  const motor = useMotorConfigFields()
  return useMemo(() => temperatureLimit(motor, 'l_temp_fet_start', 'l_temp_fet_end'), [motor])
}
