import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconAlertCircle from '@tabler/icons-react-native/IconAlertCircle'
import IconChartLine from '@tabler/icons-react-native/IconChartLine'
import IconChevronRight from '@tabler/icons-react-native/IconChevronRight'
import IconUserCircle from '@tabler/icons-react-native/IconUserCircle'
import type { ProfileStats } from 'vescape-core'

import { Text } from '@/components/base/Text'
import { NewComponentHero } from '@/components/dev/NewComponentHero'
import { NewShowcaseCard } from '@/components/dev/NewShowcaseCard'
import { NewChipRow, NewToggleRow } from '@/components/dev/NewShowcaseControls'
import { Button } from '@/components/ui/Button'
import { ToggleGroup } from '@/components/ui/ToggleGroup'
import { theme } from '@/constants/theme'
import {
  AccountCardView,
  type AccountCardState,
} from '@/modules/profile/components/AccountCardView'
import { ProfileStatsGrid } from '@/modules/profile/components/ProfileStatsGrid'
import { MessageCard } from '@/components/ui/MessageCard'
import { StatsPeriodPicker } from '@/modules/profile/components/StatsPeriodPicker'
import {
  useProfileStatItems,
  type ProfileStatKey,
} from '@/modules/profile/hooks/useProfileStatItems'

const ACCOUNT_STATES = {
  loading: { kind: 'loading' },
  'signed out': { kind: 'signedOut' },
  provisioning: { kind: 'provisioning', name: 'Alex Rider' },
  failed: { kind: 'failed', name: 'Alex Rider' },
  'signed in': { kind: 'signedIn', name: 'Alex Rider', email: 'alex@example.com' },
  'email only': {
    kind: 'signedIn',
    name: 'alex@example.com',
    email: 'alex@example.com',
  },
} satisfies Record<string, AccountCardState>

type AccountShowcaseState = keyof typeof ACCOUNT_STATES

function AccountCardShowcase() {
  const [state, setState] = useState<AccountShowcaseState>('signed out')
  const [lastAction, setLastAction] = useState('none yet')

  return (
    <NewShowcaseCard
      name="AccountCardView"
      controls={
        <NewChipRow
          label="state"
          options={Object.keys(ACCOUNT_STATES)}
          selected={state}
          onSelect={(v) => setState(v as AccountShowcaseState)}
        />
      }
    >
      <Text style={styles.caption}>
        The top card of the Profile tab. Signed out it is one Sign in button; signed in the whole
        card opens the account. A failed credential exchange turns it into a retry. Last action:{' '}
        {lastAction}.
      </Text>
      <AccountCardView
        state={ACCOUNT_STATES[state]}
        onSignIn={() => setLastAction('sign in')}
        onOpenAccount={() => setLastAction('open account')}
        onRetry={() => {
          setLastAction('retry')
          setState('provisioning')
        }}
      />
    </NewShowcaseCard>
  )
}

const MOCK_STATS: ProfileStats = {
  distanceM: 1_284_300,
  rideCount: 86,
  rideTimeMs: 187_200_000,
  topSpeedKmh: 41.6,
  avgSpeedKmh: 24.3,
  longestRideM: 38_900,
  batteryUsedWh: 52_400,
  batteryRegenWh: 6_100,
}

const SUMMARY_KEYS: ProfileStatKey[] = ['distance', 'rides', 'topSpeed', 'longestRide']

const MOCK_MONTHS = [
  { value: 'all', label: 'All time' },
  { value: '2026-10', label: 'October 2026' },
  { value: '2026-9', label: 'September 2026' },
  { value: '2026-8', label: 'August 2026' },
]

function ProfileStatsGridShowcase() {
  const [summary, setSummary] = useState(true)
  const items = useProfileStatItems(MOCK_STATS, summary ? SUMMARY_KEYS : undefined)
  return (
    <NewShowcaseCard
      name="ProfileStatsGrid"
      controls={<NewToggleRow label="summary (4 figures)" value={summary} onChange={setSummary} />}
    >
      <Text style={styles.caption}>
        Riding totals as cards, two per row. The Profile tab shows four; the details screen shows
        all eight.
      </Text>
      <ProfileStatsGrid items={items} />
    </NewShowcaseCard>
  )
}

function ProfileStatsSummaryShowcase() {
  const [scope, setScope] = useState('total')
  const items = useProfileStatItems(MOCK_STATS, SUMMARY_KEYS)
  return (
    <NewShowcaseCard name="Stats summary">
      <Text style={styles.caption}>
        The Profile tab's glance: a ToggleGroup between all time and this month, with the Details
        button opposite.
      </Text>
      <View style={styles.summaryHead}>
        <ToggleGroup
          activeKey={scope}
          options={[
            { key: 'total', label: 'All time' },
            { key: 'month', label: 'This month' },
          ]}
          onSelect={setScope}
        />
        <Button label="Details" icon={IconChevronRight} onPress={() => {}} />
      </View>
      <ProfileStatsGrid items={items} />
    </NewShowcaseCard>
  )
}

function StatsPeriodPickerShowcase() {
  const [value, setValue] = useState('all')
  const index = MOCK_MONTHS.findIndex((m) => m.value === value)
  const months = value !== 'all'
  return (
    <NewShowcaseCard name="StatsPeriodPicker">
      <Text style={styles.caption}>
        The details screen's period: All time or one month. The arrows step between months and are
        off on All time.
      </Text>
      <StatsPeriodPicker
        options={MOCK_MONTHS}
        value={value}
        onChange={setValue}
        onPrevious={
          months && index < MOCK_MONTHS.length - 1
            ? () => setValue(MOCK_MONTHS[index + 1]!.value)
            : null
        }
        onNext={months && index > 1 ? () => setValue(MOCK_MONTHS[index - 1]!.value) : null}
      />
    </NewShowcaseCard>
  )
}

function MessageCardShowcase() {
  const [error, setError] = useState(false)
  return (
    <NewShowcaseCard
      name="MessageCard"
      controls={<NewToggleRow label="read failed" value={error} onChange={setError} />}
    >
      {error ? (
        <MessageCard
          icon={IconAlertCircle}
          tone="error"
          title="Could not load riding totals"
          description="Restart the app to try again"
        />
      ) : (
        <MessageCard
          icon={IconChartLine}
          title="No riding stats yet"
          description="Record a ride and your totals appear here"
        />
      )}
    </NewShowcaseCard>
  )
}

export default function NewComponentProfilePage() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <NewComponentHero
          icon={IconUserCircle}
          description="The Profile tab: the account card in every state, and the riding stats."
        />
        <AccountCardShowcase />
        <ProfileStatsSummaryShowcase />
        <ProfileStatsGridShowcase />
        <StatsPeriodPickerShowcase />
        <MessageCardShowcase />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  caption: { color: theme.ui.mutedForeground, fontSize: 13, marginBottom: 10 },
  summaryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
})
