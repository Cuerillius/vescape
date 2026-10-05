import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  cancelAnimation,
  Easing,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import IconDashboard from '@tabler/icons-react-native/IconDashboard'
import type { BoardWarning } from 'vescape-core'

import { NewComponentHero } from '@/components/dev/NewComponentHero'
import { NewShowcaseCard } from '@/components/dev/NewShowcaseCard'
import { NewChipRow, NewToggleRow } from '@/components/dev/NewShowcaseControls'
import { useShowcaseValue } from '@/components/dev/useShowcaseValue'
import { theme } from '@/constants/theme'
import { BoardWarningRow } from '@/modules/board/components/BoardWarningRow'
import { FootpadIndicator } from '@/modules/board/components/FootpadIndicator'
import { ImuBackIndicator } from '@/modules/board/components/ImuBackIndicator'
import { ImuIndicator } from '@/modules/board/components/ImuIndicator'
import { RecordBadge } from '@/modules/board/components/RecordBadge'
import { SingleGauge } from '@/modules/board/components/SingleGauge'
import type { RecordingState } from '@/modules/board/lib/boardConnection'

const FOOTPAD_WIDTHS: Record<string, number> = { strip: 26, medium: 64, detail: 132 }
/** Refloat default fault_adc, a high one, a disabled zone, and no config at all. */
const THRESHOLDS: Record<string, number | null> = {
  '0.8': 0.8,
  '2.0': 2,
  'off (0)': 0,
  'no config': null,
}

function FootpadShowcase() {
  const [size, setSize] = useState('detail')
  const [threshold2, setThreshold2] = useState('0.8')
  const [live, setLive] = useState(true)
  const [posi, setPosi] = useState(false)
  const adc1 = useSharedValue<number | null>(null)
  const adc2 = useSharedValue<number | null>(null)

  useEffect(() => {
    if (!live) {
      cancelAnimation(adc1)
      cancelAnimation(adc2)
      adc1.set(null)
      adc2.set(null)
      return
    }
    // Two sweeps of different length, so the zones are usually out of step.
    adc1.set(0)
    adc2.set(0)
    adc1.set(
      withRepeat(withTiming(3.3, { duration: 2600, easing: Easing.inOut(Easing.quad) }), -1, true),
    )
    adc2.set(
      withRepeat(withTiming(3.3, { duration: 4100, easing: Easing.inOut(Easing.quad) }), -1, true),
    )
    return () => {
      cancelAnimation(adc1)
      cancelAnimation(adc2)
    }
  }, [live, adc1, adc2])

  return (
    <NewShowcaseCard
      name="FootpadIndicator"
      controls={
        <>
          <NewChipRow
            label="width"
            options={Object.keys(FOOTPAD_WIDTHS)}
            selected={size}
            onSelect={setSize}
          />
          <NewChipRow
            label="zone 2 fault_adc"
            options={Object.keys(THRESHOLDS)}
            selected={threshold2}
            onSelect={setThreshold2}
          />
          <NewToggleRow label="live sweep" value={live} onChange={setLive} />
          <NewToggleRow label="posi (both sensors as one)" value={posi} onChange={setPosi} />
        </>
      }
    >
      <View style={styles.center}>
        <FootpadIndicator
          adc1={adc1}
          adc2={adc2}
          posi={posi}
          threshold1={0.8}
          threshold2={THRESHOLDS[threshold2] ?? null}
          width={FOOTPAD_WIDTHS[size] ?? 132}
        />
      </View>
    </NewShowcaseCard>
  )
}

function ImuShowcase() {
  const [live, setLive] = useState(true)
  const [ticks, setTicks] = useState(true)
  const pitch = useShowcaseValue(0, live ? { min: -20, max: 20, durationMs: 2400 } : null)
  const roll = useShowcaseValue(0, live ? { min: -15, max: 15, durationMs: 3100 } : null)
  return (
    <NewShowcaseCard
      name="ImuIndicator, ImuBackIndicator"
      controls={
        <>
          <NewToggleRow label="live sweep" value={live} onChange={setLive} />
          <NewToggleRow label="level ticks" value={ticks} onChange={setTicks} />
        </>
      }
    >
      <View style={styles.row}>
        <ImuIndicator pitch={pitch} size={120} showLevelTicks={ticks} />
        <ImuBackIndicator roll={roll} size={120} showLevelTicks={ticks} />
      </View>
    </NewShowcaseCard>
  )
}

function SingleGaugeShowcase() {
  const [live, setLive] = useState(true)
  const [alert, setAlert] = useState(true)
  const value = useShowcaseValue(24, live ? { min: 0, max: 45, durationMs: 3500 } : null)
  return (
    <NewShowcaseCard
      name="SingleGauge"
      controls={
        <>
          <NewToggleRow label="live sweep" value={live} onChange={setLive} />
          <NewToggleRow label="alert marker" value={alert} onChange={setAlert} />
        </>
      }
    >
      <SingleGauge
        value={value}
        max={45}
        unit="km/h"
        decimals={0}
        label="Speed"
        alerts={alert ? [{ id: 'a', threshold: 35, thresholdMax: null, label: '35' }] : []}
      />
    </NewShowcaseCard>
  )
}

const RECORDING_STATES: Record<string, RecordingState | undefined> = {
  recording: 'recording',
  paused: 'paused',
  ended: undefined,
}

function RecordBadgeShowcase() {
  const [state, setState] = useState('recording')
  return (
    <NewShowcaseCard
      name="RecordBadge"
      controls={
        <NewChipRow
          label="state"
          options={Object.keys(RECORDING_STATES)}
          selected={state}
          onSelect={setState}
        />
      }
    >
      <View style={styles.center}>
        <RecordBadge
          recordingState={RECORDING_STATES[state]}
          onEndRide={() => setState('ended')}
          onStartRecording={() => setState('recording')}
        />
      </View>
    </NewShowcaseCard>
  )
}

function BoardWarningRowShowcase() {
  const [now] = useState(() => Date.now())
  const [dismissedKinds, setDismissedKinds] = useState<string[]>([])
  // One critical + one warn row, so both severity styles stay visible side by side.
  const warnings: BoardWarning[] = [
    {
      boardId: 'demo',
      kind: 'cell-spread',
      severity: 'critical',
      firstDetectedAtMs: now - 3 * 60 * 60 * 1000,
      lastDetectedAtMs: now - 90 * 1000,
      payloadJson: '{"peakSpread":0.27,"worstGroup":4,"balancing":true}',
    },
    {
      boardId: 'demo',
      kind: 'duty-pushback-high',
      severity: 'warn',
      firstDetectedAtMs: now - 20 * 1000,
      lastDetectedAtMs: now - 20 * 1000,
      payloadJson: '{"param":"tiltback_duty","value":0.9,"bound":0.85}',
    },
  ]
  return (
    <NewShowcaseCard
      name="BoardWarningRow"
      controls={
        <NewToggleRow
          label="dismissed"
          value={dismissedKinds.length > 0}
          onChange={(next) => setDismissedKinds(next ? warnings.map((w) => w.kind) : [])}
        />
      }
    >
      <View style={styles.stack}>
        {warnings.map((warning) => (
          <BoardWarningRow
            key={warning.kind}
            warning={warning}
            dismissed={dismissedKinds.includes(warning.kind)}
            onSetDismissed={(kind, value) =>
              setDismissedKinds((prev) =>
                value ? [...prev, kind] : prev.filter((k) => k !== kind),
              )
            }
          />
        ))}
      </View>
    </NewShowcaseCard>
  )
}

export default function NewBoardInstrumentsPage() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <NewComponentHero
          icon={IconDashboard}
          description="The live board instruments on the control detail screens, driven by synthetic sweeps so no board is needed."
        />
        <FootpadShowcase />
        <ImuShowcase />
        <SingleGaugeShowcase />
        <RecordBadgeShowcase />
        <BoardWarningRowShowcase />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  stack: { gap: 10 },
  center: { alignItems: 'center', paddingVertical: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
})
