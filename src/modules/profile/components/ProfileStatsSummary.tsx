import { useState, type ReactNode } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import IconAlertCircle from '@tabler/icons-react-native/IconAlertCircle'
import IconChartLine from '@tabler/icons-react-native/IconChartLine'

import { ToggleGroup } from '@/components/ui/ToggleGroup'
import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import { ProfileStatsGrid } from '@/modules/profile/components/ProfileStatsGrid'
import { MessageCard } from '@/components/ui/MessageCard'
import { useProfileStatItems } from '@/modules/profile/hooks/useProfileStatItems'
import { useProfileStats } from '@/modules/profile/hooks/useProfileStats'
import { formatMonthLabel, isCurrentMonth } from '@/modules/profile/lib/profileStats'

type Scope = 'total' | 'month'

interface ProfileStatsSummaryProps {
  /** Load and refresh while the containing view is visible. */
  active?: boolean
  /** Action pinned opposite the scope switch, e.g. a link into the full stats screen. */
  action?: ReactNode
}

/**
 * The rider's headline totals: four figures, switchable between all time and the current month.
 * The full breakdown lives on the Profile Stats screen; this is the glance version.
 */
export function ProfileStatsSummary({ active = true, action }: ProfileStatsSummaryProps) {
  const { total, monthly, selectedMonth, loading, error, empty } = useProfileStats(active)
  const mutedColor = useResolvedColor(theme.ui.mutedForeground)
  const [scope, setScope] = useState<Scope>('total')
  const items = useProfileStatItems(scope === 'total' ? total : monthly, [
    'distance',
    'rides',
    'topSpeed',
    'longestRide',
  ])

  return (
    <View style={styles.root} testID="profile-stats-summary" accessibilityState={{ busy: loading }}>
      <View style={styles.head}>
        <ToggleGroup<Scope>
          options={[
            { key: 'total', label: 'All time' },
            {
              key: 'month',
              // The hook falls back to the latest month with rides when this one has none.
              label: isCurrentMonth(selectedMonth) ? 'This month' : formatMonthLabel(selectedMonth),
            },
          ]}
          activeKey={scope}
          onSelect={setScope}
        />
        {action}
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={mutedColor} style={styles.loading} />
      ) : error ? (
        <MessageCard
          icon={IconAlertCircle}
          tone="error"
          title="Could not load riding totals"
          description="Restart the app to try again"
        />
      ) : empty ? (
        <MessageCard
          icon={IconChartLine}
          title="No riding stats yet"
          description="Record a ride and your totals appear here"
        />
      ) : (
        <ProfileStatsGrid items={items} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  root: {
    gap: 10,
  },
  loading: {
    paddingVertical: 48,
  },
})
