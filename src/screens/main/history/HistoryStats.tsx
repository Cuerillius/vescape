import type { Icon as TablerIcon } from '@tabler/icons-react-native'
import IconBatteryVertical from '@tabler/icons-react-native/IconBatteryVertical'
import IconBatteryVerticalCharging from '@tabler/icons-react-native/IconBatteryVerticalCharging'
import IconCircleDot from '@tabler/icons-react-native/IconCircleDot'
import IconClock from '@tabler/icons-react-native/IconClock'
import IconCpu from '@tabler/icons-react-native/IconCpu'
import IconEngine from '@tabler/icons-react-native/IconEngine'
import IconGauge from '@tabler/icons-react-native/IconGauge'
import IconPercentage from '@tabler/icons-react-native/IconPercentage'
import IconRoad from '@tabler/icons-react-native/IconRoad'
import IconTrendingUp from '@tabler/icons-react-native/IconTrendingUp'
import { useFormat } from '@/hooks/useFormat'
import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { theme } from '@/constants/theme'
import { DASH } from '@/helpers/format'
import type { HistorySession } from '@/modules/history/store/historyStore'
import { useRideFormat } from '@/modules/history/hooks/useRideFormat'
import { rideDurationMs } from '@/modules/history/lib/sessions'

interface StatItem {
  key: string
  label: string
  value: string
  unit?: string
  icon: TablerIcon
}

/** The ride's figures as a two-column grid, for the stats drawer. */
export function HistoryStatsGrid({ session }: { session: HistorySession }) {
  const stats = useSessionStats(session)
  return (
    <View testID="history-stats" style={styles.grid}>
      {stats.map((item) => (
        <StatCell key={item.key} item={item} />
      ))}
    </View>
  )
}

/** The headline figures as one line, for under the ride's name: "32.4 km · 1h 12m · top 48 km/h". */
export function useRideSummary(session: HistorySession): string {
  const stats = useSessionStats(session)
  return useMemo(() => {
    const [distance, time, topSpeed] = stats
    const join = (item: StatItem) => [item.value, item.unit].filter(Boolean).join(' ')
    return [join(distance), join(time), `top ${join(topSpeed)}`].join(' · ')
  }, [stats])
}

function StatCell({ item }: { item: StatItem }) {
  return (
    // Flows assert on the id, not the label: iOS reports the rendered text where Android reports
    // the source string, so the label is not a stable thing to match.
    <View testID={`history-stat-${item.key}`} style={styles.cell}>
      <View style={styles.caption}>
        <item.icon size={14} color={theme.ui.mutedForeground} strokeWidth={2.25} />
        <Text style={styles.label} numberOfLines={1}>
          {item.label}
        </Text>
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
          {item.value}
        </Text>
        {item.unit ? (
          <Text style={styles.unit} numberOfLines={1}>
            {item.unit}
          </Text>
        ) : null}
      </View>
    </View>
  )
}

function useSessionStats(session: HistorySession): StatItem[] {
  const { formatSpeed, speedUnit } = useFormat()
  const { formatHistoryDistance } = useRideFormat()
  return useMemo(
    () => [
      {
        key: 'distance',
        label: 'Distance',
        icon: IconRoad,
        ...formatHistoryDistance(session.distanceM),
      },
      {
        key: 'rideTime',
        label: 'Time',
        icon: IconClock,
        ...formatDuration(rideDurationMs(session)),
      },
      {
        key: 'topSpeed',
        label: 'Top speed',
        icon: IconGauge,
        value: formatSpeed(session.maxSpeedKmh),
        unit: speedUnit,
      },
      {
        key: 'avgSpeed',
        label: 'Avg speed',
        icon: IconTrendingUp,
        value: formatSpeed(session.avgSpeedKmh),
        unit: speedUnit,
      },
      {
        key: 'maxDuty',
        label: 'Max duty',
        icon: IconPercentage,
        value: formatDuty(session.maxDuty),
        unit: '%',
      },
      {
        key: 'mosfetTemp',
        label: 'Ctrl max',
        icon: IconCpu,
        ...formatTemp(session.maxTempMosfet),
      },
      {
        key: 'motorTemp',
        label: 'Motor max',
        icon: IconEngine,
        ...formatTemp(session.maxTempMotor),
      },
      {
        key: 'batteryUsed',
        label: 'Used',
        icon: IconBatteryVertical,
        ...formatWh(session.batteryUsedWh),
      },
      {
        key: 'batteryRegen',
        label: 'Regen',
        icon: IconBatteryVerticalCharging,
        ...formatWh(session.batteryRegenWh),
      },
      {
        key: 'samples',
        label: 'Points',
        icon: IconCircleDot,
        value: formatCount(session.sampleCount),
      },
    ],
    [session, formatHistoryDistance, formatSpeed, speedUnit],
  )
}

function formatCount(value: number): string {
  if (value < 1000) return String(value)
  if (value < 10_000) return `${(value / 1000).toFixed(1)}k`
  return `${Math.round(value / 1000)}k`
}

function formatDuration(valueMs: number): Pick<StatItem, 'value' | 'unit'> {
  // A zoomed window is often shorter than a minute, and "1 min" for eight seconds of riding is
  // a wrong number rather than a rounded one.
  if (valueMs < 60_000) return { value: String(Math.max(1, Math.round(valueMs / 1000))), unit: 's' }
  const totalMinutes = Math.max(1, Math.round(valueMs / 60_000))
  if (totalMinutes < 60) return { value: String(totalMinutes), unit: 'min' }
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes === 0
    ? { value: String(hours), unit: 'h' }
    : { value: String(hours), unit: `h ${minutes}m` }
}

function formatTemp(value: number | null): Pick<StatItem, 'value' | 'unit'> {
  if (value == null) return { value: DASH }
  return { value: String(Math.round(value)), unit: '°C' }
}

function formatDuty(value: number): string {
  return String(Math.round(value * 100))
}

function formatWh(value: number): Pick<StatItem, 'value' | 'unit'> {
  if (value < 1) return { value: (value * 1000).toFixed(0), unit: 'mWh' }
  // Whole watt-hours: the cell is one line of a five-across bar, and the decimal was the digit
  // that pushed the number into shrinking to fit.
  return { value: String(Math.round(value)), unit: 'Wh' }
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 12,
    rowGap: 18,
  },
  cell: {
    width: '50%',
    gap: 2,
  },
  caption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    flexShrink: 1,
    color: theme.ui.mutedForeground,
    fontSize: 12,
    fontWeight: '600',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  value: {
    color: theme.ui.foreground,
    fontFamily: theme.mono('700'),
    fontSize: 22,
    lineHeight: 26,
  },
  unit: {
    color: theme.ui.mutedForeground,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 3,
  },
})
