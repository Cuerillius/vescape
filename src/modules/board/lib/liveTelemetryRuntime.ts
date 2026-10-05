import { makeMutable, type SharedValue } from 'react-native-reanimated'
import { scheduleOnUI } from 'react-native-worklets'
import type { LiveStateEvent, TelemetryEvent } from 'vescape-core'

import { finite, absolute } from '@/helpers/finite'

interface LiveTelemetryValues {
  speedKmh: SharedValue<number | null>
  dutyPercent: SharedValue<number | null>
  motorCurrent: SharedValue<number | null>
  batteryCurrent: SharedValue<number | null>
  batteryVoltage: SharedValue<number | null>
  batteryPercent: SharedValue<number | null>
  motorTemp: SharedValue<number | null>
  controllerTemp: SharedValue<number | null>
  pitch: SharedValue<number | null>
  roll: SharedValue<number | null>
  balancePitch: SharedValue<number | null>
  adc1: SharedValue<number | null>
  adc2: SharedValue<number | null>
  /** Odometer distance covered since this board connection started, metres. */
  tripM: SharedValue<number | null>
  /** Distance left on this charge at this session's consumption, metres; null until measurable. */
  rangeM: SharedValue<number | null>
  lastPacketAt: SharedValue<number | null>
  avgLatencyMs: SharedValue<number | null>
  pullRateHz: SharedValue<number | null>
}

/** Plain scalar bundle shipped to the UI thread in one hop, instead of separate SharedValue writes. */
type TickScalars = Record<keyof LiveTelemetryValues, number | null>

const EMPTY_TICK: TickScalars = {
  speedKmh: null,
  dutyPercent: null,
  motorCurrent: null,
  batteryCurrent: null,
  batteryVoltage: null,
  batteryPercent: null,
  motorTemp: null,
  controllerTemp: null,
  pitch: null,
  roll: null,
  balancePitch: null,
  adc1: null,
  adc2: null,
  tripM: null,
  rangeM: null,
  lastPacketAt: null,
  avgLatencyMs: null,
  pullRateHz: null,
}

export interface LiveTelemetryRuntime {
  values: LiveTelemetryValues
  syncConnectionSeq: (connectionSeq: number) => void
  seedFromBoardState: (state: LiveStateEvent['board']) => void
  /** Per-frame presentation values; native owns telemetry history and series. */
  ingestTick: (tick: TelemetryEvent) => void
  reset: () => void
}

function dutyPercent(value: number | null | undefined): number | null {
  const finiteValue = absolute(value)
  return finiteValue == null ? null : finiteValue * 100
}

function createValues(): LiveTelemetryValues {
  return {
    speedKmh: makeMutable<number | null>(null),
    dutyPercent: makeMutable<number | null>(null),
    motorCurrent: makeMutable<number | null>(null),
    batteryCurrent: makeMutable<number | null>(null),
    batteryVoltage: makeMutable<number | null>(null),
    batteryPercent: makeMutable<number | null>(null),
    motorTemp: makeMutable<number | null>(null),
    controllerTemp: makeMutable<number | null>(null),
    pitch: makeMutable<number | null>(null),
    roll: makeMutable<number | null>(null),
    balancePitch: makeMutable<number | null>(null),
    adc1: makeMutable<number | null>(null),
    adc2: makeMutable<number | null>(null),
    tripM: makeMutable<number | null>(null),
    rangeM: makeMutable<number | null>(null),
    lastPacketAt: makeMutable<number | null>(null),
    avgLatencyMs: makeMutable<number | null>(null),
    pullRateHz: makeMutable<number | null>(null),
  }
}

/** Below this much session distance the consumption rate is too noisy to project, metres. */
const MIN_RANGE_SAMPLE_M = 1_000
/** Below this much charge used the consumption rate is too noisy to project, percent. */
const MIN_RANGE_USED_PERCENT = 2

/**
 * Distance left on this charge if the rest of it goes like this session so far: the metres ridden
 * per percent of charge used, times the percent left. Null until the session has enough of both.
 */
export function estimateRangeM(
  tripM: number | null,
  startPercent: number | null,
  percent: number | null,
): number | null {
  if (tripM == null || startPercent == null || percent == null) return null
  const usedPercent = startPercent - percent
  if (tripM < MIN_RANGE_SAMPLE_M || usedPercent < MIN_RANGE_USED_PERCENT) return null
  return (tripM / usedPercent) * Math.max(0, percent)
}

/** Where the current connection started: odometer and charge at its first readings. */
interface SessionStart {
  odometerM: number | null
  batteryPercent: number | null
}

/** Pure JS projection of a telemetry frame into the scalar bundle. No SharedValue writes. */
function tickScalars(telemetry: TelemetryEvent, start: SessionStart): TickScalars {
  const odometerM = finite(telemetry.odometer)
  const batteryPercent = finite(telemetry.batteryPercent)
  const tripM =
    odometerM == null || start.odometerM == null ? null : Math.max(0, odometerM - start.odometerM)
  return {
    speedKmh: absolute(telemetry.speed),
    dutyPercent: dutyPercent(telemetry.dutyCycle),
    motorCurrent: finite(telemetry.motorCurrent),
    batteryCurrent: finite(telemetry.batteryCurrent),
    batteryVoltage: finite(telemetry.batteryVoltage),
    batteryPercent,
    motorTemp: telemetry.tempMotor != null && telemetry.tempMotor > 0 ? telemetry.tempMotor : null,
    controllerTemp: finite(telemetry.tempMosfet),
    pitch: finite(telemetry.pitch),
    roll: finite(telemetry.roll),
    balancePitch: finite(telemetry.balancePitch),
    adc1: finite(telemetry.adc1),
    adc2: finite(telemetry.adc2),
    tripM,
    rangeM: estimateRangeM(tripM, start.batteryPercent, batteryPercent),
    lastPacketAt: finite(telemetry.lastPacketAt),
    avgLatencyMs: finite(telemetry.avgLatency),
    pullRateHz: finite(telemetry.pullRateHz),
  }
}

export function createLiveTelemetryRuntime(): LiveTelemetryRuntime {
  const values = createValues()

  // One UI-thread worklet assigns all SharedValues. Only the scalar bundle crosses the
  // JS→UI boundary (a single serialization per frame) instead of separate `.value=` hops
  // on the JS thread, which were the dominant live-telemetry cost (createSerializable + GC).
  function applyTick(next: TickScalars): void {
    'worklet'
    values.speedKmh.value = next.speedKmh
    values.dutyPercent.value = next.dutyPercent
    values.motorCurrent.value = next.motorCurrent
    values.batteryCurrent.value = next.batteryCurrent
    values.batteryVoltage.value = next.batteryVoltage
    values.batteryPercent.value = next.batteryPercent
    values.motorTemp.value = next.motorTemp
    values.controllerTemp.value = next.controllerTemp
    values.pitch.value = next.pitch
    values.roll.value = next.roll
    values.balancePitch.value = next.balancePitch
    values.adc1.value = next.adc1
    values.adc2.value = next.adc2
    values.tripM.value = next.tripM
    values.rangeM.value = next.rangeM
    values.lastPacketAt.value = next.lastPacketAt
    values.avgLatencyMs.value = next.avgLatencyMs
    values.pullRateHz.value = next.pullRateHz
  }

  function pushTick(next: TickScalars): void {
    scheduleOnUI(applyTick, next)
  }

  let connectionSeq = 0
  // The session counts from the first odometer and charge readings of the current connection.
  const start: SessionStart = { odometerM: null, batteryPercent: null }
  function resetStart(): void {
    start.odometerM = null
    start.batteryPercent = null
  }
  function captureStart(telemetry: TelemetryEvent | null): void {
    start.odometerM ??= finite(telemetry?.odometer)
    start.batteryPercent ??= finite(telemetry?.batteryPercent)
  }

  return {
    values,

    syncConnectionSeq(nextConnectionSeq) {
      if (nextConnectionSeq !== connectionSeq) resetStart()
      connectionSeq = nextConnectionSeq
    },

    seedFromBoardState(state) {
      if (state.connectionSeq !== connectionSeq) resetStart()
      connectionSeq = state.connectionSeq
      let latest: TelemetryEvent | null = null
      for (const telemetry of state.recentTelemetry) {
        if (latest === null || telemetry.lastPacketAt > latest.lastPacketAt) latest = telemetry
      }
      // Oldest first, so the session starts at the earliest reading native still holds.
      const byAge = [...state.recentTelemetry].sort((a, b) => a.lastPacketAt - b.lastPacketAt)
      for (const telemetry of byAge) captureStart(telemetry)
      pushTick(latest ? tickScalars(latest, start) : EMPTY_TICK)
    },

    ingestTick(tick) {
      if (tick.generation != null && tick.generation !== connectionSeq) return
      captureStart(tick)
      pushTick(tickScalars(tick, start))
    },

    reset() {
      resetStart()
      pushTick(EMPTY_TICK)
    },
  }
}

export const liveTelemetryRuntime = createLiveTelemetryRuntime()
