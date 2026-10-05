import { Fragment } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, type Href } from 'expo-router'
import type { Icon } from '@tabler/icons-react-native'
import IconAdjustments from '@tabler/icons-react-native/IconAdjustments'
import IconAdjustmentsHorizontal from '@tabler/icons-react-native/IconAdjustmentsHorizontal'
import IconAlertTriangle from '@tabler/icons-react-native/IconAlertTriangle'
import IconBatteryCharging from '@tabler/icons-react-native/IconBatteryCharging'
import IconBolt from '@tabler/icons-react-native/IconBolt'
import IconChartLine from '@tabler/icons-react-native/IconChartLine'
import IconChevronRight from '@tabler/icons-react-native/IconChevronRight'
import IconCloudStorm from '@tabler/icons-react-native/IconCloudStorm'
import IconDashboard from '@tabler/icons-react-native/IconDashboard'
import IconGauge from '@tabler/icons-react-native/IconGauge'
import IconHistory from '@tabler/icons-react-native/IconHistory'
import IconLayoutGrid from '@tabler/icons-react-native/IconLayoutGrid'
import IconMap from '@tabler/icons-react-native/IconMap'
import IconMapPin from '@tabler/icons-react-native/IconMapPin'
import IconNavigation from '@tabler/icons-react-native/IconNavigation'
import IconPalette from '@tabler/icons-react-native/IconPalette'
import IconPlugConnected from '@tabler/icons-react-native/IconPlugConnected'
import IconRocket from '@tabler/icons-react-native/IconRocket'
import IconRoute from '@tabler/icons-react-native/IconRoute'
import IconSquareHalf from '@tabler/icons-react-native/IconSquareHalf'
import IconTypography from '@tabler/icons-react-native/IconTypography'
import IconUserCircle from '@tabler/icons-react-native/IconUserCircle'

import { Text } from '@/components/base/Text'
import { NewComponentHero } from '@/components/dev/NewComponentHero'
import { interaction, theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

/** Grouped the way the app is laid out: foundations and kit first, then each area of the app. */
const groups = [
  {
    title: 'Foundations',
    sections: [
      {
        label: 'Tokens',
        hint: 'The zinc theme.ui colors the rebuilt kit is built on',
        route: '/settings/components/tokens',
        icon: IconPalette,
      },
      {
        label: 'Text & content',
        hint: 'Text weights, TickText, Markdown, Placeholder, wordmark, DeviceRow and StepTimeline',
        route: '/settings/components/content',
        icon: IconTypography,
      },
    ],
  },
  {
    title: 'UI kit',
    sections: [
      {
        label: 'Primitives',
        hint: 'Card, Button, Badge, Progress, Accordion, Drawer, Separator, SelectMenu, StepBar, MessageCard, ConfirmDialog, PromptDialog and the segmented controls',
        route: '/settings/components/primitives',
        icon: IconSquareHalf,
      },
      {
        label: 'Charts',
        hint: 'ChartStack, the zoomable telemetry chart with scrub, pinch, selection and stacked charts',
        route: '/settings/components/chart',
        icon: IconChartLine,
      },
    ],
  },
  {
    title: 'App shell',
    sections: [
      {
        label: 'IconTab & ConnectButton',
        hint: 'The bottom tab bar’s tab and centre connect button, pulled out on their own',
        route: '/settings/components/navbar',
        icon: IconNavigation,
      },
      {
        label: 'Release',
        hint: 'The update pill, version notice and community message surfaces',
        route: '/settings/components/release',
        icon: IconRocket,
      },
    ],
  },
  {
    title: 'Ride dashboard',
    sections: [
      {
        label: 'Metrics & quick controls',
        hint: 'MetricHero in every bar state, MetricTile, DualMetricBar and the quick-control row',
        route: '/settings/components/metrics',
        icon: IconGauge,
      },
      {
        label: 'BatteryCard, SpeedRing & TuningCard',
        hint: 'The ride dashboard’s battery card, speed ring and tuning card, pulled out on their own',
        route: '/settings/components/dashboard',
        icon: IconBolt,
      },
    ],
  },
  {
    title: 'Board & hardware',
    sections: [
      {
        label: 'Board instruments',
        hint: 'Footpad, IMU, gauge, record badge and warning rows, driven by synthetic sweeps',
        route: '/settings/components/board-instruments',
        icon: IconDashboard,
      },
      {
        label: 'VESC faults',
        hint: 'The Board view’s faults row, fault card and bottom drawer, driven by mock faults',
        route: '/settings/components/faults',
        icon: IconAlertTriangle,
      },
      {
        label: 'Alerts & battery',
        hint: 'Board top speed, battery configuration, cell balance, alert presets and rule rows',
        route: '/settings/components/alerts-battery',
        icon: IconBatteryCharging,
      },
      {
        label: 'Accessories',
        hint: 'Accessory rows in every link phase, brake light states and live sensor readouts',
        route: '/settings/components/accessories',
        icon: IconPlugConnected,
      },
    ],
  },
  {
    title: 'Tune',
    sections: [
      {
        label: 'Tune editing',
        hint: 'The tune dial, profile pills, sync bar and setting group grid',
        route: '/settings/components/tune',
        icon: IconAdjustmentsHorizontal,
      },
    ],
  },
  {
    title: 'Map & weather',
    sections: [
      {
        label: 'Zinc map & pins',
        hint: 'The streets map repainted in theme.ui, with a themed position dot and Tabler pins',
        route: '/settings/components/map',
        icon: IconMap,
      },
      {
        label: 'Map marks',
        hint: 'Every pin on the map, today’s next to the redesign',
        route: '/settings/components/map-marks',
        icon: IconMapPin,
      },
      {
        label: 'Map controls',
        hint: 'Basemap tiles, orientation menu and the placement reticle',
        route: '/settings/components/map-controls',
        icon: IconAdjustments,
      },
      {
        label: 'Weather',
        hint: 'Condition glyphs, stat, pill and hourly strip in Tabler on the zinc theme',
        route: '/settings/components/weather',
        icon: IconCloudStorm,
      },
    ],
  },
  {
    title: 'History & profile',
    sections: [
      {
        label: 'Ride history',
        hint: 'The ride view’s controls, ride header, metric tabs and legend',
        route: '/settings/components/history',
        icon: IconHistory,
      },
      {
        label: 'Account & stats',
        hint: 'The Profile tab’s account card in every state, the riding stats summary, grid and period picker',
        route: '/settings/components/profile',
        icon: IconUserCircle,
      },
      {
        label: 'Rides',
        hint: 'The ride row, the Favorite card and the full rides list',
        route: '/settings/components/profile-rides',
        icon: IconRoute,
      },
    ],
  },
]

function NewComponentRow({
  icon: IconComponent,
  label,
  hint,
  onPress,
}: {
  icon: Icon
  label: string
  hint: string
  onPress: () => void
}) {
  const iconColor = useResolvedColor(theme.ui.mutedForeground)
  const chevronColor = useResolvedColor(theme.ui.faintForeground)
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      <View style={styles.rowIcon}>
        <IconComponent size={20} color={iconColor} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowHint}>{hint}</Text>
      </View>
      <IconChevronRight size={18} color={chevronColor} strokeWidth={2.5} />
    </Pressable>
  )
}

export default function NewComponentsIndex() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <NewComponentHero
          icon={IconLayoutGrid}
          description="The rebuilt UI kit, as it lands — separate from the old components showcase."
        />
        {groups.map((group) => (
          <Fragment key={group.title}>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            <View style={styles.card}>
              {group.sections.map((s, i) => (
                <Fragment key={s.label}>
                  {i > 0 ? <View style={styles.separator} /> : null}
                  <NewComponentRow
                    icon={s.icon}
                    label={s.label}
                    hint={s.hint}
                    onPress={() => router.push(s.route as Href)}
                  />
                </Fragment>
              ))}
            </View>
          </Fragment>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 16, gap: 8 },
  sectionTitle: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 4,
    marginLeft: 4,
  },
  card: {
    backgroundColor: theme.ui.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.ui.border,
    overflow: 'hidden',
  },
  separator: {
    height: StyleSheet.hairlineWidth * 2,
    marginLeft: 14,
    backgroundColor: theme.ui.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  rowPressed: {
    opacity: interaction.pressedOpacity,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.ui.muted,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    color: theme.ui.foreground,
    fontSize: 15,
    fontWeight: '600',
  },
  rowHint: {
    color: theme.ui.mutedForeground,
    fontSize: 12,
    fontWeight: '500',
  },
})
