import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconAngle from '@tabler/icons-react-native/IconAngle'
import IconArrowsUpDown from '@tabler/icons-react-native/IconArrowsUpDown'
import IconBrightnessUp from '@tabler/icons-react-native/IconBrightnessUp'
import IconBrightnessUpFilled from '@tabler/icons-react-native/IconBrightnessUpFilled'
import IconBulb from '@tabler/icons-react-native/IconBulb'
import IconBulbFilled from '@tabler/icons-react-native/IconBulbFilled'
import IconGavel from '@tabler/icons-react-native/IconGavel'
import IconGauge from '@tabler/icons-react-native/IconGauge'

import { Text } from '@/components/base/Text'
import { NewComponentHero } from '@/components/dev/NewComponentHero'
import { NewShowcaseCard } from '@/components/dev/NewShowcaseCard'
import { NewChipRow, NewToggleRow } from '@/components/dev/NewShowcaseControls'
import { useShowcaseValue } from '@/components/dev/useShowcaseValue'
import { theme } from '@/constants/theme'
import { MetricHero, type MetricHeroLimit } from '@/modules/board/components/MetricHero'
import { telemetry, type TelemetryMetricConfig } from '@/modules/board/constants/telemetry'
import {
  DualMetricBar,
  MetricTile,
  useLiveNumberText,
} from '@/screens/main/dashboard/DashboardWidgets'
import { GpsStatusPill } from '@/modules/location/components/GpsStatusPill'
import { GPS_STATUS_BADGES, type GpsStatusBadge } from '@/modules/location/lib/gpsStatusBadge'
import { QuickControl, QuickControlsRow } from '@/screens/main/dashboard/QuickControls'

interface HeroScenario {
  metric: TelemetryMetricConfig
  absolute?: boolean
  limit: MetricHeroLimit | null
  /** Values for the "low", "near" and "over" chips, and the bounds of the sweep. */
  values: { low: number; near: number; over: number }
  sweep: { min: number; max: number; durationMs: number }
}

// One scenario per way the hero draws its bar, each with the metric that uses it on a real screen.
const HERO_SCENARIOS = {
  'no limit': {
    metric: telemetry.speed,
    absolute: true,
    limit: null,
    values: { low: 8, near: 32, over: 45 },
    sweep: { min: -10, max: 45, durationMs: 4000 },
  },
  'bar = limit': {
    metric: telemetry.motorTemp,
    limit: { max: 80, label: 'Pushback at 80°' },
    values: { low: 35, near: 68, over: 84 },
    sweep: { min: 20, max: 90, durationMs: 5000 },
  },
  'limit tick': {
    metric: telemetry.duty,
    limit: { max: 90, barMax: 100, label: 'Pushback at 90%' },
    values: { low: 30, near: 76, over: 94 },
    sweep: { min: 0, max: 100, durationMs: 5000 },
  },
  'two-sided': {
    metric: telemetry.motorCurrent,
    limit: { max: 150, min: -60, label: 'Limits +150 / −60 A' },
    values: { low: 40, near: -52, over: 160 },
    sweep: { min: -70, max: 160, durationMs: 6000 },
  },
} satisfies Record<string, HeroScenario>
type HeroScenarioKey = keyof typeof HERO_SCENARIOS
const HERO_SCENARIO_KEYS = Object.keys(HERO_SCENARIOS) as HeroScenarioKey[]

const READINGS = ['low', 'near', 'over'] as const

function MetricHeroShowcase() {
  const [scenarioKey, setScenarioKey] = useState<HeroScenarioKey>('limit tick')
  const [reading, setReading] = useState<(typeof READINGS)[number]>('near')
  const [sweeping, setSweeping] = useState(false)
  const [noReading, setNoReading] = useState(false)
  const scenario: HeroScenario = HERO_SCENARIOS[scenarioKey]
  const value = useShowcaseValue(
    noReading ? null : scenario.values[reading],
    sweeping && !noReading ? scenario.sweep : null,
  )

  return (
    <NewShowcaseCard
      name="MetricHero"
      controls={
        <>
          <NewChipRow
            label="bar"
            options={HERO_SCENARIO_KEYS}
            selected={scenarioKey}
            onSelect={(v) => setScenarioKey(v as HeroScenarioKey)}
          />
          <NewChipRow
            label="reading"
            options={[...READINGS]}
            selected={reading}
            onSelect={(v) => setReading(v as (typeof READINGS)[number])}
          />
          <NewToggleRow label="sweep" value={sweeping} onChange={setSweeping} />
          <NewToggleRow label="no reading" value={noReading} onChange={setNoReading} />
        </>
      }
    >
      <Text style={styles.caption}>
        The bar warns at 80% of the limit and turns red at it. Speed shows magnitude only.
      </Text>
      <View style={styles.stage}>
        <MetricHero
          metric={scenario.metric}
          value={value}
          absolute={scenario.absolute}
          limit={scenario.limit}
        />
      </View>
    </NewShowcaseCard>
  )
}

function MetricTileShowcase() {
  const [noReading, setNoReading] = useState(false)
  const motor = useShowcaseValue(noReading ? null : 62)
  const controller = useShowcaseValue(noReading ? null : 48)
  const current = useShowcaseValue(noReading ? null : 12.4)
  const motorText = useLiveNumberText(motor, 0, '°')
  const controllerText = useLiveNumberText(controller, 0, '°')
  const currentText = useLiveNumberText(current, 0, 'A')

  return (
    <NewShowcaseCard
      name="MetricTile"
      controls={<NewToggleRow label="no reading" value={noReading} onChange={setNoReading} />}
    >
      <View style={styles.tiles}>
        <MetricTile label="Motor" value={motorText} onPress={() => {}} />
        <MetricTile label="Controller" value={controllerText} onPress={() => {}} />
        <MetricTile label="Battery" value={currentText} />
      </View>
    </NewShowcaseCard>
  )
}

function DualMetricBarShowcase() {
  const [sweeping, setSweeping] = useState(true)
  const [noReading, setNoReading] = useState(false)
  const fraction = useShowcaseValue(
    noReading ? null : 0.4,
    sweeping && !noReading ? { min: 0, max: 1, durationMs: 4000 } : null,
  )

  return (
    <NewShowcaseCard
      name="DualMetricBar"
      controls={
        <>
          <NewToggleRow label="sweep" value={sweeping} onChange={setSweeping} />
          <NewToggleRow label="no reading" value={noReading} onChange={setNoReading} />
        </>
      }
    >
      <DualMetricBar
        fraction={fraction}
        left={
          <>
            <Text style={styles.barText}>Session</Text>
            <Text style={styles.barText}>12.4KM</Text>
          </>
        }
        right={
          <>
            <Text style={styles.barText}>18.6KM</Text>
            <Text style={styles.barText}>Range</Text>
          </>
        }
      />
    </NewShowcaseCard>
  )
}

function QuickControlsShowcase() {
  const [lights, setLights] = useState(false)
  const [headlight, setHeadlight] = useState(true)
  const [legal, setLegal] = useState(false)
  const [gpsIssue, setGpsIssue] = useState(true)
  const [ready, setReady] = useState(true)
  const [failed, setFailed] = useState(false)

  return (
    <NewShowcaseCard
      name="QuickControlsRow"
      controls={
        <>
          <NewToggleRow label="GPS issue" value={gpsIssue} onChange={setGpsIssue} />
          <NewToggleRow label="commands ready" value={ready} onChange={setReady} />
          <NewToggleRow label="error" value={failed} onChange={setFailed} />
        </>
      }
    >
      <QuickControlsRow
        gpsBadge={gpsIssue ? GPS_STATUS_BADGES.searching : null}
        error={failed ? 'Could not reach the board' : null}
      >
        <QuickControl icon={IconAngle} label="Tilt" onPress={() => {}} />
        <QuickControl icon={IconArrowsUpDown} label="Move" onPress={() => {}} />
        <QuickControl
          icon={lights ? IconBulbFilled : IconBulb}
          label="Lights"
          active={lights}
          disabled={!ready}
          onPress={() => setLights((on) => !on)}
        />
        <QuickControl
          icon={headlight ? IconBrightnessUpFilled : IconBrightnessUp}
          label="Headlight"
          active={headlight}
          disabled={!ready}
          onPress={() => setHeadlight((on) => !on)}
        />
        <QuickControl
          icon={IconGavel}
          label="Legal Mode"
          active={legal}
          onPress={() => setLegal((on) => !on)}
        />
      </QuickControlsRow>
    </NewShowcaseCard>
  )
}

const GPS_KINDS = Object.keys(GPS_STATUS_BADGES) as GpsStatusBadge['kind'][]

function GpsStatusPillShowcase() {
  const [kind, setKind] = useState<GpsStatusBadge['kind']>('searching')

  return (
    <NewShowcaseCard
      name="GpsStatusPill"
      controls={
        <NewChipRow
          label="state"
          options={GPS_KINDS}
          selected={kind}
          onSelect={(v) => setKind(v as GpsStatusBadge['kind'])}
        />
      }
    >
      <GpsStatusPill badge={GPS_STATUS_BADGES[kind]} />
    </NewShowcaseCard>
  )
}

export default function NewComponentMetricsPage() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <NewComponentHero
          icon={IconGauge}
          description="Live readouts: the metric hero behind every /control screen, and the dashboard's tiles, bar and quick controls."
        />
        <MetricHeroShowcase />
        <MetricTileShowcase />
        <DualMetricBarShowcase />
        <QuickControlsShowcase />
        <GpsStatusPillShowcase />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  caption: { color: theme.ui.mutedForeground, fontSize: 13 },
  stage: { marginTop: 10 },
  tiles: { flexDirection: 'row', gap: 8 },
  barText: { color: theme.ui.foreground, fontSize: 17, fontWeight: '500' },
})
