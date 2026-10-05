import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconAdjustmentsHorizontal from '@tabler/icons-react-native/IconAdjustmentsHorizontal'

import { Text } from '@/components/base/Text'
import { NewComponentHero } from '@/components/dev/NewComponentHero'
import { NewShowcaseCard } from '@/components/dev/NewShowcaseCard'
import { NewChipRow } from '@/components/dev/NewShowcaseControls'
import { theme } from '@/constants/theme'
import { TuneDial } from '@/modules/tune/components/TuneDial'
import { TuneGroupGrid } from '@/modules/tune/components/TuneGroupGrid'
import { TuneSyncBar } from '@/modules/tune/components/TuneSyncBar'
import { TuneTileFill } from '@/modules/tune/components/TuneTileFill'
import type { SyncBarState } from '@/modules/tune/lib/syncBarState'

const DIAL_RANGES = {
  small: { min: 0, max: 10, step: 0.5, value: 5, previous: 3, unit: undefined },
  fine: { min: 0, max: 0.5, step: 0.001, value: 0.026, previous: 0.02, unit: undefined },
  signed: { min: -100, max: 100, step: 1, value: 40, previous: 10, unit: undefined },
  percent: { min: 0, max: 100, step: 1, value: 80, previous: 65, unit: '%' },
} as const
type DialRange = keyof typeof DIAL_RANGES

function TuneDialShowcase() {
  const [range, setRange] = useState<DialRange>('small')
  const config = DIAL_RANGES[range]
  const [value, setValue] = useState<number>(config.value)
  return (
    <NewShowcaseCard
      name="TuneDial"
      controls={
        <NewChipRow
          label="range"
          options={Object.keys(DIAL_RANGES)}
          selected={range}
          onSelect={(next) => {
            setRange(next as DialRange)
            setValue(DIAL_RANGES[next as DialRange].value)
          }}
        />
      }
    >
      <Text style={styles.value}>{value}</Text>
      <TuneDial
        value={value}
        previousValue={config.previous}
        min={config.min}
        max={config.max}
        step={config.step}
        unit={config.unit}
        onValueChange={setValue}
      />
    </NewShowcaseCard>
  )
}

const SYNC_STATES: Record<string, SyncBarState | null> = {
  none: null,
  loading_config: { variant: 'loading_config', dirtyCount: 0, diffCount: 0, configError: null },
  config_error: {
    variant: 'config_error',
    dirtyCount: 0,
    diffCount: 0,
    configError: 'Could not read the board config.',
  },
  up_to_date: { variant: 'up_to_date', dirtyCount: 0, diffCount: 0, configError: null },
  connect_to_sync: { variant: 'connect_to_sync', dirtyCount: 0, diffCount: 3, configError: null },
  save_failed: { variant: 'save_failed', dirtyCount: 2, diffCount: 0, configError: null },
  sync_with_board: { variant: 'sync_with_board', dirtyCount: 0, diffCount: 3, configError: null },
  saving: { variant: 'saving', dirtyCount: 2, diffCount: 0, configError: null },
  syncing: { variant: 'syncing', dirtyCount: 0, diffCount: 3, configError: null },
}

function TuneSyncBarShowcase() {
  const [state, setState] = useState('sync_with_board')
  return (
    <NewShowcaseCard
      name="TuneSyncBar"
      controls={
        <NewChipRow
          label="state"
          options={Object.keys(SYNC_STATES)}
          selected={state}
          onSelect={setState}
        />
      }
    >
      <TuneSyncBar
        state={SYNC_STATES[state] ?? null}
        onRetrySave={() => {}}
        onSync={() => {}}
        onRetryConfig={() => {}}
      />
    </NewShowcaseCard>
  )
}

function TuneGroupGridShowcase() {
  const [collapsible, setCollapsible] = useState('collapsible')
  return (
    <NewShowcaseCard
      name="TuneGroupGrid, TuneTileFill"
      controls={
        <NewChipRow
          label="mode"
          options={['collapsible', 'fixed']}
          selected={collapsible}
          onSelect={setCollapsible}
        />
      }
    >
      <TuneGroupGrid
        title="Tilt back"
        subtitle="When the board pushes back"
        collapsible={collapsible === 'collapsible'}
      >
        {[0.2, 0.55, 0.9, null].map((fraction, index) => (
          <View key={index} style={styles.tile}>
            <Text style={styles.tileLabel}>Setting {index + 1}</Text>
            <TuneTileFill fraction={fraction} />
          </View>
        ))}
      </TuneGroupGrid>
    </NewShowcaseCard>
  )
}

export default function NewTunePage() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <NewComponentHero
          icon={IconAdjustmentsHorizontal}
          description="Tune profile editing pieces: the dial, the sync bar and the setting grid."
        />
        <TuneDialShowcase />
        <TuneSyncBarShowcase />
        <TuneGroupGridShowcase />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  value: {
    color: theme.ui.mutedForeground,
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  tile: {
    height: 64,
    justifyContent: 'center',
    paddingHorizontal: 12,
    overflow: 'hidden',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.muted,
  },
  tileLabel: { color: theme.ui.foreground, fontSize: 13, fontWeight: '600' },
})
