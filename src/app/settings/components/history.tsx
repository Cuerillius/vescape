import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconHistory from '@tabler/icons-react-native/IconHistory'

import { Text } from '@/components/base/Text'
import { NewComponentHero } from '@/components/dev/NewComponentHero'
import { NewShowcaseCard } from '@/components/dev/NewShowcaseCard'
import { NewToggleRow } from '@/components/dev/NewShowcaseControls'
import { theme } from '@/constants/theme'
import {
  ALL_CHART_METRICS,
  PANEL_CHART_METRICS,
  toggleOptionalChartMetric,
  type ChartToggleMetric,
} from '@/modules/history/components/historyChartMetrics'
import { HistoryMetricLegend } from '@/modules/history/components/HistoryMetricLegend'
import { HistoryMetricChips } from '@/modules/history/components/HistoryMetricChips'
import { HistoryMetricTabs } from '@/modules/history/components/HistoryMetricTabs'
import { HistoryPanelNav } from '@/modules/history/components/HistoryPanelNav'
import { HistoryControls } from '@/screens/main/history/HistoryControls'
import type { HistoryTab } from '@/screens/main/mainScreenStore'

const HOUR_MS = 60 * 60 * 1000

function HistoryControlsShowcase() {
  const [tab, setTab] = useState<HistoryTab>('history')
  const [trimming, setTrimming] = useState(false)
  const [name, setName] = useState('')
  return (
    <NewShowcaseCard
      name="HistoryControls"
      controls={
        <NewToggleRow label="trimming a Favorite" value={trimming} onChange={setTrimming} />
      }
    >
      <Text style={styles.caption}>
        The top of the History view, over the map: back and the History / Favorites switch when no
        ride is open. Trimming swaps them for cancel, the Favorite's name and save.
      </Text>
      {/* The controls pin themselves to the top of their parent, so the preview needs a frame. */}
      <View style={styles.frame}>
        <HistoryControls
          tab={tab}
          trimming={trimming}
          saving={false}
          trimName={name}
          onTrimNameChange={setName}
          onSelectTab={setTab}
          onBack={() => {}}
          onCancelTrim={() => setTrimming(false)}
          onSaveTrim={() => setTrimming(false)}
        />
      </View>
    </NewShowcaseCard>
  )
}

function HistoryPanelNavShowcase() {
  const [favoriteMode, setFavoriteMode] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [index, setIndex] = useState(1)
  const now = Date.now()
  return (
    <NewShowcaseCard
      name="HistoryPanelNav"
      controls={
        <>
          <NewToggleRow label="Favorite mode" value={favoriteMode} onChange={setFavoriteMode} />
          <NewToggleRow label="favorited" value={favorited} onChange={setFavorited} />
        </>
      }
    >
      <Text style={styles.caption}>
        The ride switcher: step between rides, tap the name for the list. A ride has the star; an
        open Favorite has the pencil.
      </Text>
      <HistoryPanelNav
        titleStartMs={now - (index + 1) * 24 * HOUR_MS}
        titleEndMs={now - (index + 1) * 24 * HOUR_MS + HOUR_MS / 2}
        boardName="Preview board"
        title={favoriteMode ? 'Evening ride' : undefined}
        subtitle={favoriteMode ? '18:42 · Preview board' : undefined}
        canPrevious={index < 3}
        canNext={index > 0}
        favoriteMode={favoriteMode}
        favorited={favorited}
        actionDisabled={false}
        onPrevious={() => setIndex(index + 1)}
        onNext={() => setIndex(index - 1)}
        onOpenList={() => {}}
        onFavoriteAction={() => setFavorited((value) => !value)}
      />
    </NewShowcaseCard>
  )
}

function HistoryMetricTabsShowcase() {
  const [active, setActive] = useState<Set<ChartToggleMetric>>(() => new Set(['speed']))
  return (
    <NewShowcaseCard name="HistoryMetricTabs & legend">
      <Text style={styles.caption}>
        Which lines the chart stack draws. Each tab keeps the colour of its line; tap to toggle.
      </Text>
      <View style={styles.stack}>
        <HistoryMetricTabs
          activeCharts={active}
          metrics={PANEL_CHART_METRICS}
          onToggle={(metric) => setActive((current) => toggleOptionalChartMetric(current, metric))}
        />
        <HistoryMetricLegend />
      </View>
    </NewShowcaseCard>
  )
}

function HistoryMetricChipsShowcase() {
  const [active, setActive] = useState<Set<ChartToggleMetric>>(() => new Set(['speed']))
  return (
    <NewShowcaseCard name="HistoryMetricChips">
      <Text style={styles.caption}>
        The full-screen charts page's toggles: separate raised buttons, each with its line's colour
        on top.
      </Text>
      <HistoryMetricChips
        activeCharts={active}
        metrics={ALL_CHART_METRICS}
        columns={7}
        onToggle={(metric) => setActive((current) => toggleOptionalChartMetric(current, metric))}
      />
    </NewShowcaseCard>
  )
}

export default function NewComponentHistoryPage() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <NewComponentHero
          icon={IconHistory}
          description="The ride history view's chrome: controls, ride header, metric tabs and legend."
        />
        <HistoryControlsShowcase />
        <HistoryPanelNavShowcase />
        <HistoryMetricTabsShowcase />
        <HistoryMetricChipsShowcase />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  caption: { color: theme.ui.mutedForeground, fontSize: 13, marginBottom: 10 },
  stack: { gap: 8 },
  frame: { height: 64, overflow: 'hidden' },
})
