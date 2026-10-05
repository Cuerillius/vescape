import { useMemo, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconBatteryCharging from '@tabler/icons-react-native/IconBatteryCharging'
import { ALERT_BEEP_COUNT_DEFAULT } from 'vescape-core'

import { NewComponentHero } from '@/components/dev/NewComponentHero'
import { NewShowcaseCard } from '@/components/dev/NewShowcaseCard'
import { NewChipRow, NewToggleRow } from '@/components/dev/NewShowcaseControls'
import { theme } from '@/constants/theme'
import { useUnitSystem } from '@/hooks/useUnitSystem'
import { AlertPresetControl } from '@/modules/alerts/components/AlertPresetControl'
import { AlertRuleRow } from '@/modules/alerts/components/AlertRuleList'
import { BoardTopSpeedCard } from '@/modules/alerts/components/BoardTopSpeedCard'
import type { AlertPresetLevel, AlertPresetMetric } from '@/modules/alerts/lib/alertPresets'
import type { DraftAlertRule } from '@/modules/alerts/lib/customAlertRules'
import { draftAlertPreview } from '@/modules/alerts/lib/draftAlertPreview'
import { BmsCellVoltagesView } from '@/modules/battery/components/BmsCellVoltages'
import { DEFAULT_BATTERY_CONFIG, summarizeBms, summarizeBmsWindow } from '@/modules/battery/lib'
import { BoardBatteryEditor } from '@/modules/board/components/BoardBatteryEditor'
import type { BoardBatteryDraft } from '@/modules/board/hooks/useBoardBatteryForm'

const METRICS: AlertPresetMetric[] = ['speed', 'duty', 'battery', 'motor-temp', 'controller-temp']
const LEVELS: AlertPresetLevel[] = ['off', 'minimal', 'normal', 'safe', 'custom']

const CELL_SCENARIOS = {
  'Small imbalance': {
    cells: [4.012, 4.03, 4.028, 4.031, 4.019, 4.03, 4.027, 4.03, 4.025, 4.029],
    balancing: [true, false, false, false, true, false, false, false, false, false],
  },
  Balanced: {
    cells: [4.03, 4.03, 4.031, 4.03, 4.03, 4.029, 4.03, 4.03, 4.03, 4.03],
    balancing: [],
  },
  'Dead group': {
    cells: [4.03, 4.031, 3.62, 4.03, 4.029, 4.03, 4.028, 4.03, 4.031, 4.03],
    balancing: [],
  },
  '20S pack': {
    cells: Array.from({ length: 20 }, (_, i) => 3.9 + (i % 5) * 0.012),
    balancing: Array.from({ length: 20 }, (_, i) => i % 7 === 0),
  },
} as const

const DEMO_RULES: DraftAlertRule[] = [
  rule('threshold', 45, {}),
  rule('geiger', 38, { thresholdMax: 48, soundType: 'preset:tick' }),
  rule('tts', 42, { soundType: 'tts:Slow down', repeatEverySeconds: 10 }),
  rule('muted', 30, { enabled: false }),
]

function rule(id: string, threshold: number, patch: Partial<DraftAlertRule>): DraftAlertRule {
  return {
    id,
    controlId: 'speed',
    threshold,
    thresholdMax: null,
    enabled: true,
    createdAt: 0,
    soundType: 'preset:beep',
    repeatEverySeconds: null,
    beepCount: ALERT_BEEP_COUNT_DEFAULT,
    ...patch,
  }
}

function TopSpeedShowcase() {
  const [kmh, setKmh] = useState(40)
  return (
    <NewShowcaseCard name="BoardTopSpeedCard">
      <BoardTopSpeedCard value={kmh} onChange={setKmh} />
    </NewShowcaseCard>
  )
}

function BatteryEditorShowcase() {
  const [saved, setSaved] = useState<BoardBatteryDraft>({
    batteryMode: 'preset',
    cellPresetId: DEFAULT_BATTERY_CONFIG.cellPresetId,
    seriesCount: 20,
    parallelCount: 2,
    manualMinVoltage: '60',
    manualMaxVoltage: '84',
  })
  const [saving, setSaving] = useState(false)
  return (
    <NewShowcaseCard
      name="BoardBatteryEditor"
      controls={<NewToggleRow label="saving" value={saving} onChange={setSaving} />}
    >
      <BoardBatteryEditor
        value={saved}
        saving={saving}
        onSave={(next) => {
          setSaved(next)
          return true
        }}
      />
    </NewShowcaseCard>
  )
}

function CellVoltagesShowcase() {
  const [scenario, setScenario] = useState<keyof typeof CELL_SCENARIOS>('Small imbalance')
  const summary = useMemo(() => {
    const { cells, balancing } = CELL_SCENARIOS[scenario]
    return summarizeBms({
      cellVoltages: [...cells],
      balancing: [...balancing],
    })
  }, [scenario])
  const windowStats = useMemo(() => {
    const { cells } = CELL_SCENARIOS[scenario]
    return summarizeBmsWindow([
      {
        capturedAt: 0,
        cellVoltages: cells.map((v, i) => v - (i === 0 ? 0.006 : 0)),
        balancing: [],
      },
      { capturedAt: 1000, cellVoltages: [...cells], balancing: [] },
      {
        capturedAt: 2000,
        cellVoltages: cells.map((v, i) => v - (i === 2 ? 0.01 : 0)),
        balancing: [],
      },
    ])
  }, [scenario])
  return (
    <NewShowcaseCard
      name="BmsCellVoltages"
      controls={
        <NewChipRow
          label="scenario"
          options={Object.keys(CELL_SCENARIOS)}
          selected={scenario}
          onSelect={(v) => setScenario(v as keyof typeof CELL_SCENARIOS)}
        />
      }
    >
      {summary ? (
        <BmsCellVoltagesView summary={summary} windowStats={windowStats} windowMs={5 * 60_000} />
      ) : null}
    </NewShowcaseCard>
  )
}

function AlertPresetShowcase() {
  const units = useUnitSystem()
  const [metric, setMetric] = useState<AlertPresetMetric>('speed')
  const [level, setLevel] = useState<AlertPresetLevel>('normal')
  const [disabled, setDisabled] = useState(false)
  const [match, setMatch] = useState(false)

  const preview = useMemo(
    () =>
      draftAlertPreview(
        metric,
        level,
        { speedUnitSystem: units, topSpeedKmh: 50, hasBatteryConfig: true },
        level === 'custom' ? DEMO_RULES.map((r) => ({ ...r, controlId: metric })) : [],
      ),
    [level, metric, units],
  )

  return (
    <NewShowcaseCard
      name="AlertPresetControl"
      controls={
        <>
          <NewChipRow
            label="metric"
            options={METRICS}
            selected={metric}
            onSelect={(v) => setMetric(v as AlertPresetMetric)}
          />
          <NewChipRow
            label="level"
            options={LEVELS}
            selected={level}
            onSelect={(v) => setLevel(v as AlertPresetLevel)}
          />
          <NewToggleRow label="disabled" value={disabled} onChange={setDisabled} />
          <NewToggleRow label="match board config" value={match} onChange={setMatch} />
        </>
      }
    >
      <AlertPresetControl
        metric={metric}
        level={level}
        onLevelChange={setLevel}
        boardTopSpeedKmh={50}
        matchBoardConfig={{ [metric]: match }}
        onMatchBoardConfigChange={setMatch}
        configBases={{
          refloat: { tiltback_duty: 0.82 },
          motor: { l_temp_fet_start: 85, l_temp_motor_start: 100 },
        }}
        disabled={disabled}
        ruleSnapshot={preview.rules}
        onCustomize={() => setLevel('custom')}
        onDiscardCustom={() => setLevel('normal')}
      />
    </NewShowcaseCard>
  )
}

function RuleRowsShowcase() {
  return (
    <NewShowcaseCard name="AlertRuleRow">
      <View style={styles.stack}>
        {DEMO_RULES.map((r) => (
          <AlertRuleRow
            key={r.id}
            rule={r}
            unit="km/h"
            batteryConfig={null}
            onEdit={() => undefined}
            onToggle={() => undefined}
            onDelete={() => undefined}
          />
        ))}
      </View>
    </NewShowcaseCard>
  )
}

export default function NewComponentAlertsBatteryPage() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <NewComponentHero
          icon={IconBatteryCharging}
          description="Board top speed, battery configuration, cell balance and the alert controls, in the rebuilt kit."
        />
        <TopSpeedShowcase />
        <BatteryEditorShowcase />
        <CellVoltagesShowcase />
        <AlertPresetShowcase />
        <RuleRowsShowcase />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  stack: { gap: 8 },
})
