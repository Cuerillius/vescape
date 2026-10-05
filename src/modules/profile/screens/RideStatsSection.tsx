import { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import IconAlertCircle from '@tabler/icons-react-native/IconAlertCircle'
import IconChartLine from '@tabler/icons-react-native/IconChartLine'

import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import { ProfileStatsGrid } from '@/modules/profile/components/ProfileStatsGrid'
import { MessageCard } from '@/components/ui/MessageCard'
import { StatsPeriodPicker } from '@/modules/profile/components/StatsPeriodPicker'
import { useProfileStatItems } from '@/modules/profile/hooks/useProfileStatItems'
import { useProfileStats } from '@/modules/profile/hooks/useProfileStats'
import { formatMonthLabel, getAdjacentMonths } from '@/modules/profile/lib/profileStats'

const ALL_TIME = 'all'

/** The riding totals for one period: all time, or a single month picked from the rides recorded. */
export function RideStatsSection() {
  const {
    total,
    monthly,
    months,
    selectedMonth,
    loading,
    monthLoading,
    error,
    empty,
    selectMonth,
  } = useProfileStats()
  const mutedColor = useResolvedColor(theme.ui.mutedForeground)
  const [allTime, setAllTime] = useState(true)
  const items = useProfileStatItems(allTime ? total : monthly)
  const adjacent = useMemo(() => getAdjacentMonths(months, selectedMonth), [months, selectedMonth])

  const options = useMemo(
    () => [
      { value: ALL_TIME, label: 'All time' },
      ...(months.length ? months : [selectedMonth]).map((m) => ({
        value: `${m.year}-${m.month}`,
        label: formatMonthLabel(m),
      })),
    ],
    [months, selectedMonth],
  )

  const showMonth = useCallback(
    (month: typeof selectedMonth) => {
      setAllTime(false)
      void selectMonth(month)
    },
    [selectMonth],
  )

  const handleChange = useCallback(
    (value: string) => {
      if (value === ALL_TIME) {
        setAllTime(true)
        return
      }
      const [year, month] = value.split('-').map(Number)
      const found = months.find((m) => m.year === year && m.month === month)
      if (found) showMonth(found)
    },
    [months, showMonth],
  )

  if (loading) {
    return <ActivityIndicator size="small" color={mutedColor} style={styles.loading} />
  }

  return (
    <View testID="profile-stats-section" style={styles.section}>
      {error ? (
        <MessageCard
          icon={IconAlertCircle}
          tone="error"
          title="Could not load profile stats"
          description="Restart the app to try again"
        />
      ) : empty ? (
        <MessageCard
          icon={IconChartLine}
          title="No riding stats yet"
          description="Record a ride and your totals appear here"
        />
      ) : (
        <>
          <StatsPeriodPicker
            options={options}
            value={allTime ? ALL_TIME : `${selectedMonth.year}-${selectedMonth.month}`}
            onChange={handleChange}
            onPrevious={!allTime && adjacent.previous ? () => showMonth(adjacent.previous!) : null}
            onNext={!allTime && adjacent.next ? () => showMonth(adjacent.next!) : null}
            testID="profile-period-select"
          />
          <View style={monthLoading && styles.dimmed}>
            <ProfileStatsGrid items={items} />
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  loading: {
    paddingVertical: 48,
  },
  dimmed: {
    opacity: 0.5,
  },
})
