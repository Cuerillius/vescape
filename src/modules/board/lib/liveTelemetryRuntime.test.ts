import { describe, expect, test } from 'bun:test'
import type { LiveStateEvent, TelemetryEvent } from 'vescape-core'

import { createLiveTelemetryRuntime } from '@/modules/board/lib/liveTelemetryRuntime'

function telemetry(overrides: Partial<TelemetryEvent> = {}): TelemetryEvent {
  return {
    generation: 7,
    pitch: 1,
    roll: 2,
    balancePitch: 3,
    balanceCurrent: 4,
    speed: -15,
    batteryVoltage: 48,
    batteryPercent: null,
    motorCurrent: 20,
    batteryCurrent: 7,
    erpm: 1000,
    dutyCycle: -0.5,
    state: 1,
    stateName: 'running',
    switchState: 0,
    adc1: 0.1,
    adc2: 0.2,
    odometer: 123,
    tempMosfet: 40,
    tempMotor: 35,
    avgLatency: 18,
    pullRateHz: 20,
    lastPacketAt: 10_000,
    ...overrides,
  }
}

function boardState(samples: TelemetryEvent[]): LiveStateEvent['board'] {
  return {
    phase: 'connected',
    selectedBoardId: 'board-1',
    connectedBoardId: 'board-1',
    bleId: 'ble-1',
    name: 'Board',
    connectionSeq: 7,
    lastTelemetryAt: samples.at(-1)?.lastPacketAt ?? null,
    recentTelemetry: samples,
    error: null,
    autoConnect: true,
    linkIntegrity: 'trusted',
    remoteTilt: null,
  }
}

describe('live telemetry runtime', () => {
  test('seeds values from the newest native sample even when the snapshot is out of order', () => {
    const runtime = createLiveTelemetryRuntime()
    runtime.seedFromBoardState(
      boardState([
        telemetry({ lastPacketAt: 10_000, speed: -8 }),
        telemetry({ lastPacketAt: 9_000, speed: 3 }),
      ]),
    )

    expect(runtime.values.speedKmh.value).toBe(8)
    expect(runtime.values.dutyPercent.value).toBe(50)
    expect(runtime.values.pitch.value).toBe(1)
    expect(runtime.values.roll.value).toBe(2)
    expect(runtime.values.balancePitch.value).toBe(3)
  })

  test('ignores frames from the previous board generation after a connection switch', () => {
    const runtime = createLiveTelemetryRuntime()
    runtime.seedFromBoardState(boardState([telemetry({ speed: 12 })]))
    runtime.syncConnectionSeq(8)
    runtime.ingestTick(telemetry({ generation: 7, speed: 30 }))
    expect(runtime.values.speedKmh.value).toBe(12)
    runtime.ingestTick(telemetry({ generation: 8, speed: -22 }))
    expect(runtime.values.speedKmh.value).toBe(22)
  })

  test('tick updates presentation values without changing signed current or orientation', () => {
    const runtime = createLiveTelemetryRuntime()
    runtime.seedFromBoardState(boardState([]))
    runtime.ingestTick(
      telemetry({
        speed: -22,
        dutyCycle: -0.25,
        pitch: 37.5,
        roll: -12.25,
        balancePitch: 4.5,
        motorCurrent: -3,
        batteryCurrent: -2,
        avgLatency: 11,
        pullRateHz: 28,
      }),
    )
    expect(runtime.values.speedKmh.value).toBe(22)
    expect(runtime.values.dutyPercent.value).toBe(25)
    expect(runtime.values.pitch.value).toBe(37.5)
    expect(runtime.values.roll.value).toBe(-12.25)
    expect(runtime.values.balancePitch.value).toBe(4.5)
    expect(runtime.values.motorCurrent.value).toBe(-3)
    expect(runtime.values.batteryCurrent.value).toBe(-2)
    expect(runtime.values.avgLatencyMs.value).toBe(11)
    expect(runtime.values.pullRateHz.value).toBe(28)
  })

  test('invalid scalars and missing motor temperature render as unavailable', () => {
    const runtime = createLiveTelemetryRuntime()
    runtime.seedFromBoardState(boardState([]))
    runtime.ingestTick(
      telemetry({
        speed: Number.NaN,
        dutyCycle: Infinity,
        tempMotor: 0,
        batteryVoltage: Number.NaN,
      }),
    )
    expect(runtime.values.speedKmh.value).toBeNull()
    expect(runtime.values.dutyPercent.value).toBeNull()
    expect(runtime.values.motorTemp.value).toBeNull()
    expect(runtime.values.batteryVoltage.value).toBeNull()
  })

  test('trip counts odometer distance from the first reading of the current connection', () => {
    const runtime = createLiveTelemetryRuntime()
    runtime.seedFromBoardState(
      boardState([
        telemetry({ lastPacketAt: 10_000, odometer: 1_250 }),
        telemetry({ lastPacketAt: 9_000, odometer: 1_000 }),
      ]),
    )
    expect(runtime.values.tripM.value).toBe(250)

    runtime.ingestTick(telemetry({ odometer: 1_600 }))
    expect(runtime.values.tripM.value).toBe(600)

    // A new connection starts a new trip.
    runtime.syncConnectionSeq(8)
    runtime.ingestTick(telemetry({ generation: 8, odometer: 1_700 }))
    expect(runtime.values.tripM.value).toBe(0)
    runtime.ingestTick(telemetry({ generation: 8, odometer: 1_750 }))
    expect(runtime.values.tripM.value).toBe(50)
  })

  test('range projects session distance per percent onto the charge left', () => {
    const runtime = createLiveTelemetryRuntime()
    runtime.syncConnectionSeq(7)
    runtime.ingestTick(telemetry({ odometer: 10_000, batteryPercent: 90 }))
    // Too little ridden or used to project yet.
    runtime.ingestTick(telemetry({ odometer: 10_500, batteryPercent: 88 }))
    expect(runtime.values.rangeM.value).toBeNull()
    runtime.ingestTick(telemetry({ odometer: 12_000, batteryPercent: 89 }))
    expect(runtime.values.rangeM.value).toBeNull()

    // 4 km for 10 % → 400 m per percent, 80 % left.
    runtime.ingestTick(telemetry({ odometer: 14_000, batteryPercent: 80 }))
    expect(runtime.values.rangeM.value).toBe(32_000)

    runtime.reset()
    expect(runtime.values.rangeM.value).toBeNull()
  })

  test('an empty authoritative snapshot clears values from the prior session', () => {
    const runtime = createLiveTelemetryRuntime()
    runtime.seedFromBoardState(boardState([telemetry()]))
    runtime.seedFromBoardState(boardState([]))
    for (const value of Object.values(runtime.values)) expect(value.value).toBeNull()
  })

  test('reset clears every hot value', () => {
    const runtime = createLiveTelemetryRuntime()
    runtime.seedFromBoardState(boardState([telemetry()]))
    runtime.reset()
    for (const value of Object.values(runtime.values)) expect(value.value).toBeNull()
  })
})
