import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import {
  cancelAnimation,
  Easing,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconAdjustments from '@tabler/icons-react-native/IconAdjustments'

import { NewComponentHero } from '@/components/dev/NewComponentHero'
import { NewShowcaseCard } from '@/components/dev/NewShowcaseCard'
import { NewChipRow } from '@/components/dev/NewShowcaseControls'
import { theme } from '@/constants/theme'
import { MapOrientationSelector } from '@/modules/map/components/MapOrientationSelector'
import { MapStyleList } from '@/modules/map/components/MapStyleList'
import { MapTargetReticle } from '@/modules/map/components/MapTargetReticle'
import {
  MAP_ORIENTATION_MODES,
  type MapOrientationMode,
  type MapStyleKey,
} from '@/modules/map/constants/mapStyles'

function MapStyleListShowcase() {
  const [active, setActive] = useState<MapStyleKey>('colorful')
  return (
    <NewShowcaseCard name="MapStyleList">
      <MapStyleList activeKey={active} onSelect={setActive} />
    </NewShowcaseCard>
  )
}

function MapOrientationSelectorShowcase() {
  const [mode, setMode] = useState<MapOrientationMode>('northUp')
  const [expanded, setExpanded] = useState(true)
  const heading = useSharedValue(0)
  useEffect(() => {
    heading.set(
      withRepeat(withTiming(40, { duration: 4000, easing: Easing.inOut(Easing.quad) }), -1, true),
    )
    return () => cancelAnimation(heading)
  }, [heading])
  return (
    <NewShowcaseCard
      name="MapOrientationSelector"
      controls={
        <NewChipRow
          label="state"
          options={['expanded', 'collapsed']}
          selected={expanded ? 'expanded' : 'collapsed'}
          onSelect={(next) => setExpanded(next === 'expanded')}
        />
      }
    >
      <View style={styles.row}>
        <MapOrientationSelector
          activeMode={mode}
          heading={heading}
          expanded={expanded}
          onToggle={() => setExpanded((prev) => !prev)}
          onSelect={(next) => {
            setMode(next)
            setExpanded(false)
          }}
        />
      </View>
      <NewChipRow
        label="mode"
        options={MAP_ORIENTATION_MODES.map((entry) => entry.key)}
        selected={mode}
        onSelect={(next) => setMode(next as MapOrientationMode)}
      />
    </NewShowcaseCard>
  )
}

function MapTargetReticleShowcase() {
  const [pulse, setPulse] = useState(0)
  const [tone, setTone] = useState('primary')
  const colors = {
    primary: theme.ui.foreground,
    info: theme.status.info.color,
    error: theme.status.error.color,
  } as const
  return (
    <NewShowcaseCard
      name="MapTargetReticle"
      controls={
        <>
          <NewChipRow
            label="color"
            options={Object.keys(colors)}
            selected={tone}
            onSelect={setTone}
          />
          <NewChipRow
            label="pulse"
            options={['fire']}
            selected=""
            onSelect={() => setPulse((prev) => prev + 1)}
          />
        </>
      }
    >
      <View style={styles.reticle}>
        <MapTargetReticle color={colors[tone as keyof typeof colors]} pulseKey={pulse} />
      </View>
    </NewShowcaseCard>
  )
}

export default function NewMapControlsPage() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <NewComponentHero
          icon={IconAdjustments}
          description="Map controls that sit on or beside the map: basemap tiles, orientation menu and the placement reticle."
        />
        <MapStyleListShowcase />
        <MapOrientationSelectorShowcase />
        <MapTargetReticleShowcase />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  row: { flexDirection: 'row', paddingVertical: 8 },
  reticle: { height: 140, alignItems: 'center', justifyContent: 'center' },
})
