import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconLayoutGrid from '@tabler/icons-react-native/IconLayoutGrid'

import { NewComponentHero } from '@/components/dev/NewComponentHero'
import { NewShowcaseCard } from '@/components/dev/NewShowcaseCard'
import { NewChipRow, NewToggleRow } from '@/components/dev/NewShowcaseControls'
import { useShowcaseValue } from '@/components/dev/useShowcaseValue'
import { theme } from '@/constants/theme'
import { PlaygroundSlider } from '@/modules/map/components/PlaygroundSlider'
import { tuneCardFactors } from '@/modules/tune/lib/tuneCardArt'
import { BASIC_SLIDER_BY_ID } from '@/modules/tune/lib/sliderDefinitions'
import { BatteryCard } from '@/screens/main/dashboard/BatteryCard'
import { SpeedRing } from '@/screens/main/dashboard/SpeedRing'
import { FLAME_PAD_RATIO } from '@/screens/main/dashboard/SpeedRingFlames'
import { TuningCard, type TuningCardPage } from '@/screens/main/dashboard/TuningCard'

const PERCENTS = ['5', '24', '62', '98', '100'] as const
const VOLTAGES: Record<(typeof PERCENTS)[number], number> = {
  '5': 60.2,
  '24': 64.8,
  '62': 71.4,
  '98': 83.6,
  '100': 84,
}

function BatteryCardShowcase() {
  const [percent, setPercent] = useState<(typeof PERCENTS)[number]>('62')
  const [charging, setCharging] = useState(false)
  const percentValue = useShowcaseValue(Number(percent))
  const voltageValue = useShowcaseValue(VOLTAGES[percent])

  return (
    <NewShowcaseCard
      name="BatteryCard"
      controls={
        <>
          <NewChipRow
            label="percent"
            options={[...PERCENTS]}
            selected={percent}
            onSelect={(v) => setPercent(v as (typeof PERCENTS)[number])}
          />
          <NewToggleRow label="charging" value={charging} onChange={setCharging} />
        </>
      }
    >
      <BatteryCard percent={percentValue} voltage={voltageValue} charging={charging} />
    </NewShowcaseCard>
  )
}

const RING_SIZE = 260
const SPEEDS = ['0', '18', '32', '45'] as const
const DUTIES = ['0', '40', '70', '90'] as const
const THRESHOLDS = ['60', '80', '90'] as const

// Out of phase, so speed and duty don't move in lockstep.
const SPEED_SWEEP = { min: 0, max: 45, durationMs: 4000 }
const DUTY_SWEEP = { min: 0, max: 95, durationMs: 5500 }

function SpeedRingShowcase() {
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>('18')
  const [duty, setDuty] = useState<(typeof DUTIES)[number]>('40')
  const [preview, setPreview] = useState(false)
  const [threshold, setThreshold] = useState<(typeof THRESHOLDS)[number]>('80')
  const speedValue = useShowcaseValue(Number(speed), preview ? SPEED_SWEEP : null)
  const dutyValue = useShowcaseValue(Number(duty), preview ? DUTY_SWEEP : null)

  return (
    <NewShowcaseCard
      name="SpeedRing"
      controls={
        <>
          <NewToggleRow label="preview" value={preview} onChange={setPreview} />
          <NewChipRow
            label="speed km/h"
            options={[...SPEEDS]}
            selected={speed}
            onSelect={(v) => setSpeed(v as (typeof SPEEDS)[number])}
          />
          <NewChipRow
            label="alarm threshold %"
            options={[...THRESHOLDS]}
            selected={threshold}
            onSelect={(v) => setThreshold(v as (typeof THRESHOLDS)[number])}
          />
          <NewChipRow
            label="duty %"
            options={[...DUTIES]}
            selected={duty}
            onSelect={(v) => setDuty(v as (typeof DUTIES)[number])}
          />
        </>
      }
    >
      <View style={styles.ringStage}>
        <SpeedRing
          size={RING_SIZE}
          speedKmh={speedValue}
          dutyPercent={dutyValue}
          alarmThresholdPercent={Number(threshold)}
        />
      </View>
    </NewShowcaseCard>
  )
}

// The five basic sliders that shape the card's background, set like a saved tune would set them.
const TUNE_ART_SLIDERS = {
  aggressiveness: 4,
  noseStiffness: 5,
  carveTilt: 7,
  brakeTilt: 2,
  atrIntensity: 6,
}
type TuneArtSliderId = keyof typeof TUNE_ART_SLIDERS
type TuneArtSliders = Record<TuneArtSliderId, number>
const TUNE_ART_SLIDER_IDS = Object.keys(TUNE_ART_SLIDERS) as TuneArtSliderId[]
/** What the board runs on the Not saved page: different from the tune beside it. */
const BOARD_TUNE_SLIDERS: TuneArtSliders = {
  aggressiveness: 8,
  noseStiffness: 3,
  carveTilt: 10,
  brakeTilt: 4,
  atrIntensity: 11,
}

function factorsFromSliders(values: TuneArtSliders) {
  const fields = Object.assign(
    {},
    ...TUNE_ART_SLIDER_IDS.map((id) => BASIC_SLIDER_BY_ID.get(id)!.computeFieldValues(values[id])),
  ) as Record<string, number>
  return tuneCardFactors(fields)
}

function TuningCardShowcase() {
  const [values, setValues] = useState<TuneArtSliders>(TUNE_ART_SLIDERS)
  const [applied, setApplied] = useState(false)
  const [unsaved, setUnsaved] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeId, setActiveId] = useState('unsaved')
  const tunePage: TuningCardPage = {
    id: 'showcase',
    title: 'Sport',
    art: { kind: 'tune', factors: factorsFromSliders(values) },
    apply: applied ? 'applied' : 'ready',
  }
  const unsavedPage: TuningCardPage = {
    id: 'unsaved',
    title: 'Board tune',
    art: { kind: 'tune', factors: factorsFromSliders(BOARD_TUNE_SLIDERS) },
    create: saving ? 'saving' : 'ready',
    unsaved: true,
  }
  const newPage: TuningCardPage = {
    id: 'new',
    title: 'New tune',
    art: { kind: 'status', color: theme.tune.color },
    create: saving ? 'saving' : 'ready',
  }
  const pages = unsaved ? [unsavedPage, tunePage, newPage] : [tunePage, newPage]

  return (
    <NewShowcaseCard
      name="TuningCard"
      controls={
        <>
          <NewToggleRow label="not saved page" value={unsaved} onChange={setUnsaved} />
          <NewToggleRow label="saving" value={saving} onChange={setSaving} />
          <NewToggleRow label="applied" value={applied} onChange={setApplied} />
          {TUNE_ART_SLIDER_IDS.map((id) => {
            const def = BASIC_SLIDER_BY_ID.get(id)!
            return (
              <PlaygroundSlider
                key={id}
                label={def.label}
                value={values[id]}
                min={def.min}
                max={def.max}
                step={def.step}
                format={String}
                onChange={(value) => setValues((current) => ({ ...current, [id]: value }))}
              />
            )
          })}
        </>
      }
    >
      <View style={styles.tuningFrame}>
        <TuningCard
          pages={pages}
          activeId={pages.some((page) => page.id === activeId) ? activeId : tunePage.id}
          onSelect={setActiveId}
          onApply={() => setApplied(true)}
          onEdit={() => undefined}
          onCreate={() => {
            setUnsaved(false)
            setActiveId(tunePage.id)
          }}
        />
      </View>
    </NewShowcaseCard>
  )
}

export default function NewComponentDashboardPage() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <NewComponentHero
          icon={IconLayoutGrid}
          description="The ride dashboard's battery card, speed ring and tuning card."
        />
        <BatteryCardShowcase />
        <SpeedRingShowcase />
        <TuningCardShowcase />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  // The ring's track is card-coloured, so it needs the dashboard's background to show; the padding
  // leaves room for the flames, which the showcase card would otherwise clip.
  ringStage: {
    alignItems: 'center',
    backgroundColor: theme.ui.background,
    borderRadius: theme.radius.md,
    paddingTop: Math.round(RING_SIZE * FLAME_PAD_RATIO),
    paddingBottom: 32,
    paddingHorizontal: 32,
  },
  tuningFrame: { height: 140, borderRadius: theme.radius.lg, overflow: 'hidden' },
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
})
