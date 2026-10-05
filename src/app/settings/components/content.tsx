import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconBluetoothOff from '@tabler/icons-react-native/IconBluetoothOff'
import IconCloudCheck from '@tabler/icons-react-native/IconCloudCheck'
import IconDownload from '@tabler/icons-react-native/IconDownload'
import IconPackage from '@tabler/icons-react-native/IconPackage'
import IconPlug from '@tabler/icons-react-native/IconPlug'
import IconTypography from '@tabler/icons-react-native/IconTypography'

import { Button } from '@/components/ui/Button'
import { DeviceRow } from '@/components/base/DeviceRow'
import { Markdown } from '@/components/base/Markdown'
import { Placeholder } from '@/components/base/Placeholder'
import { StepTimeline, type StepState, type TimelineStep } from '@/components/base/StepTimeline'
import { TickText } from '@/components/base/TickText'
import { Text } from '@/components/base/Text'
import { VescapeWordmark } from '@/components/base/VescapeWordmark'
import { NewComponentHero } from '@/components/dev/NewComponentHero'
import { NewShowcaseCard } from '@/components/dev/NewShowcaseCard'
import { NewChipRow, NewToggleRow } from '@/components/dev/NewShowcaseControls'
import { useShowcaseValue } from '@/components/dev/useShowcaseValue'
import { theme } from '@/constants/theme'

const WEIGHTS = ['300', '400', '500', '600', '700', '800', '900'] as const

const MARKDOWN_SAMPLE = `# Release 1.2

Ride **safer** with *smarter* alerts. See the [changelog](https://example.com).

- Cell balance warnings
- Faster reconnects

> Update before your next ride.

\`\`\`
bun run ios
\`\`\``

const STEP_ICONS = [IconPlug, IconDownload, IconPackage, IconCloudCheck]
const STEP_LABELS = ['Connect', 'Download', 'Install', 'Verify']
const STEP_CAPTIONS = [
  'Opening the connection',
  'Fetching the payload',
  'Writing files to disk',
  'Checking the signature',
]

/** Everything before `reach` is done, `reach` is active, the rest pending; `failed` fails the active step. */
function buildSteps(reach: number, failed: boolean): TimelineStep[] {
  return STEP_LABELS.map((label, i): TimelineStep => {
    let state: StepState = i < reach ? 'done' : i === reach ? 'active' : 'pending'
    if (failed && i === reach) state = 'failed'
    else if (failed && i > reach) state = 'absent'
    return {
      key: label,
      icon: STEP_ICONS[i]!,
      label,
      caption: state === 'done' ? 'Done' : STEP_CAPTIONS[i],
      state,
    }
  })
}

function TextShowcase() {
  return (
    <NewShowcaseCard name="base/Text">
      <View style={styles.stack}>
        {WEIGHTS.map((weight) => (
          <Text key={weight} style={{ fontSize: 16, fontWeight: weight }}>
            Geist {weight} — Ride safe 0123456789
          </Text>
        ))}
      </View>
    </NewShowcaseCard>
  )
}

function TickTextShowcase() {
  const [live, setLive] = useState(true)
  const value = useShowcaseValue(null, live ? { min: 0, max: 42, durationMs: 3000 } : null)
  return (
    <NewShowcaseCard
      name="base/TickText"
      controls={<NewToggleRow label="live" value={live} onChange={setLive} />}
    >
      <View style={styles.stack}>
        <TickText value={value} decimals={1} unit="km/h" size={32} weight="700" />
        <TickText value={value} decimals={0} unit="°C" size={20} />
      </View>
    </NewShowcaseCard>
  )
}

function MarkdownShowcase() {
  const [align, setAlign] = useState<'left' | 'center'>('left')
  return (
    <NewShowcaseCard
      name="base/Markdown"
      controls={
        <NewChipRow
          label="align"
          options={['left', 'center']}
          selected={align}
          onSelect={(next) => setAlign(next as 'left' | 'center')}
        />
      }
    >
      <Markdown align={align} onLinkPress={() => {}}>
        {MARKDOWN_SAMPLE}
      </Markdown>
    </NewShowcaseCard>
  )
}

function PlaceholderShowcase() {
  const [compact, setCompact] = useState(false)
  return (
    <NewShowcaseCard
      name="base/Placeholder"
      controls={<NewToggleRow label="compact" value={compact} onChange={setCompact} />}
    >
      <Placeholder
        icon={IconBluetoothOff}
        title="No boards found"
        description="Turn the board on and keep it close to your phone."
        compact={compact}
        action={<Button label="Scan again" variant="outline" onPress={() => {}} />}
      />
    </NewShowcaseCard>
  )
}

function WordmarkShowcase() {
  return (
    <NewShowcaseCard name="base/VescapeWordmark">
      <View style={styles.center}>
        <VescapeWordmark width={220} />
      </View>
    </NewShowcaseCard>
  )
}

function DeviceRowShowcase() {
  const [rssi, setRssi] = useState('-65')
  return (
    <NewShowcaseCard
      name="base/DeviceRow"
      controls={
        <NewChipRow
          label="rssi"
          options={['-45', '-65', '-80', '-95']}
          selected={rssi}
          onSelect={setRssi}
        />
      }
    >
      <DeviceRow
        id="AA:BB:CC:DD:EE:FF"
        name="VESC Onewheel"
        rssi={Number(rssi)}
        onPress={() => {}}
      />
    </NewShowcaseCard>
  )
}

function StepTimelineShowcase() {
  const [reach, setReach] = useState('2')
  const [failed, setFailed] = useState(false)
  return (
    <NewShowcaseCard
      name="base/StepTimeline"
      controls={
        <>
          <NewChipRow
            label="reach"
            options={['0', '1', '2', '3', '4']}
            selected={reach}
            onSelect={setReach}
          />
          <NewToggleRow label="failed" value={failed} onChange={setFailed} />
        </>
      }
    >
      <StepTimeline steps={buildSteps(Number(reach), failed)} />
    </NewShowcaseCard>
  )
}

export default function NewContentPage() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <NewComponentHero
          icon={IconTypography}
          description="Text, rich content and step-by-step display that every screen builds on."
        />
        <TextShowcase />
        <TickTextShowcase />
        <MarkdownShowcase />
        <PlaceholderShowcase />
        <WordmarkShowcase />
        <DeviceRowShowcase />
        <StepTimelineShowcase />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  stack: { gap: 8 },
  center: { alignItems: 'center', paddingVertical: 8 },
})
