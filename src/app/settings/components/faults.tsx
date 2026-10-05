import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconAlertTriangle from '@tabler/icons-react-native/IconAlertTriangle'
import type { VescFaultOccurrence } from 'vescape-core'

import { NewComponentHero } from '@/components/dev/NewComponentHero'
import { NewShowcaseCard } from '@/components/dev/NewShowcaseCard'
import { NewChipRow, NewToggleRow } from '@/components/dev/NewShowcaseControls'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { theme } from '@/constants/theme'
import { VescFaultRow } from '@/modules/board/components/VescFaultRow'
import { VescFaultsDrawer } from '@/modules/board/components/VescFaultsDrawer'
import { VescFaultsView } from '@/modules/board/components/VescFaultsSheet'
import { VescFaultsNavRow } from '@/screens/main/board/VescFaultsNavRow'

const HOUR_MS = 60 * 60 * 1000

/** Mock occurrences: a live known code, a cleared unknown code and a known cleared one. */
function mockFaults(now: number): Omit<VescFaultOccurrence, 'dismissed'>[] {
  return [
    {
      id: 'active',
      boardId: 'demo',
      code: 9,
      occurredAtMs: now - 45 * 1000,
      lastObservedAtMs: now - 1000,
      clearedAtMs: null,
    },
    {
      id: 'cleared',
      boardId: 'demo',
      code: 247,
      occurredAtMs: now - 3 * HOUR_MS,
      lastObservedAtMs: now - 3 * HOUR_MS + 4000,
      clearedAtMs: now - 3 * HOUR_MS + 4000,
    },
    {
      id: 'pitch',
      boardId: 'demo',
      code: 6,
      occurredAtMs: now - 26 * HOUR_MS,
      lastObservedAtMs: now - 26 * HOUR_MS + 2000,
      clearedAtMs: now - 26 * HOUR_MS + 2000,
    },
  ]
}

const FAULT_LOG = `Fault: FAULT_CODE_NONE
Fault: FAULT_CODE_OVER_TEMP_FET
Voltage      : 58.40 V
Motor current: 41.20 A
Temp MOSFET  : 83.5 C`

const COUNTS = ['0', '1', '3']

export default function NewFaultsShowcase() {
  const [now] = useState(() => Date.now())
  const [count, setCount] = useState('3')
  const [dismissedIds, setDismissedIds] = useState<string[]>([])
  const [log, setLog] = useState(true)
  const [reading, setReading] = useState(false)
  const [open, setOpen] = useState(false)

  const faults = mockFaults(now)
    .slice(0, Number(count))
    .map((fault) => ({ ...fault, dismissed: dismissedIds.includes(fault.id) }))
  const setDismissed = (id: string, value: boolean) =>
    setDismissedIds((prev) => (value ? [...prev, id] : prev.filter((k) => k !== id)))
  // The Board view counts only faults the rider has not dismissed.
  const indicatorCount = faults.filter((fault) => !fault.dismissed).length

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <NewComponentHero
          icon={IconAlertTriangle}
          description="VESC faults on the Board view and in its drawer, in orange. Mock occurrences, so no board or real fault is needed."
        />

        <NewShowcaseCard
          name="VescFaultsNavRow"
          controls={
            <NewChipRow label="faults" options={COUNTS} selected={count} onSelect={setCount} />
          }
        >
          <Card>
            <VescFaultsNavRow count={indicatorCount} onPress={() => setOpen(true)} />
          </Card>
        </NewShowcaseCard>

        <NewShowcaseCard
          name="VescFaultRow"
          controls={
            <NewToggleRow
              label="dismissed"
              value={dismissedIds.length > 0}
              onChange={(next) => setDismissedIds(next ? faults.map((fault) => fault.id) : [])}
            />
          }
        >
          <View style={styles.stack}>
            {faults.map((fault) => (
              <VescFaultRow key={fault.id} fault={fault} onSetDismissed={setDismissed} />
            ))}
          </View>
        </NewShowcaseCard>

        <NewShowcaseCard
          name="VescFaultsDrawer"
          controls={
            <>
              <NewChipRow label="faults" options={COUNTS} selected={count} onSelect={setCount} />
              <NewToggleRow label="fault log" value={log} onChange={setLog} />
              <NewToggleRow label="reading log" value={reading} onChange={setReading} />
            </>
          }
        >
          <Button label="Open drawer" variant="outline" onPress={() => setOpen(true)} />
        </NewShowcaseCard>
      </ScrollView>

      <VescFaultsDrawer
        visible={open}
        boardId="demo"
        faults={faults}
        onClose={() => setOpen(false)}
      >
        <VescFaultsView
          faults={faults}
          onSetDismissed={setDismissed}
          faultLog={log ? FAULT_LOG : null}
          faultLogError={null}
          readingFaultLog={reading}
          error={null}
        />
      </VescFaultsDrawer>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 16, gap: 12 },
  stack: { gap: 10 },
})
