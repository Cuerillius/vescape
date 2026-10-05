import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconAlertCircle from '@tabler/icons-react-native/IconAlertCircle'
import IconAdjustments from '@tabler/icons-react-native/IconAdjustments'
import IconBell from '@tabler/icons-react-native/IconBell'
import IconBolt from '@tabler/icons-react-native/IconBolt'
import IconChartBar from '@tabler/icons-react-native/IconChartBar'
import IconCrosshair from '@tabler/icons-react-native/IconCrosshair'
import IconPencil from '@tabler/icons-react-native/IconPencil'
import IconRoute from '@tabler/icons-react-native/IconRoute'
import IconMoonStars from '@tabler/icons-react-native/IconMoonStars'
import IconSatellite from '@tabler/icons-react-native/IconSatellite'
import IconSun from '@tabler/icons-react-native/IconSun'
import IconVolume from '@tabler/icons-react-native/IconVolume'
import IconSquareHalf from '@tabler/icons-react-native/IconSquareHalf'

import { Text } from '@/components/base/Text'
import { NewComponentHero } from '@/components/dev/NewComponentHero'
import { NewShowcaseCard } from '@/components/dev/NewShowcaseCard'
import { NewChipRow, NewToggleRow } from '@/components/dev/NewShowcaseControls'
import { useShowcaseValue } from '@/components/dev/useShowcaseValue'
import { Accordion } from '@/components/ui/Accordion'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Button, type ButtonVariant } from '@/components/ui/Button'
import { Card, CardDescription, CardTitle } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Drawer } from '@/components/ui/Drawer'
import { Input } from '@/components/ui/Input'
import { MessageCard } from '@/components/ui/MessageCard'
import { Progress } from '@/components/ui/Progress'
import { PromptDialog } from '@/components/ui/PromptDialog'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { SegmentedMenu } from '@/components/ui/SegmentedMenu'
import { SelectMenu } from '@/components/ui/SelectMenu'
import { Separator } from '@/components/ui/Separator'
import { StepBar } from '@/components/ui/StepBar'
import { Stepper } from '@/components/ui/Stepper'
import { Switch } from '@/components/ui/Switch'
import { ToggleGroup } from '@/components/ui/ToggleGroup'
import { theme } from '@/constants/theme'
import { SettingsGroup, SettingsLink } from '@/modules/settings/components/SettingsGroup'

const BASEMAP_OPTIONS = [
  { key: 'colourful', label: 'Colourful', icon: IconSun },
  { key: 'dark', label: 'Dark', icon: IconMoonStars },
  { key: 'satellite', label: 'Satellite', icon: IconSatellite },
]

function CardShowcase() {
  const [pressable, setPressable] = useState(true)
  return (
    <NewShowcaseCard
      name="Card / CardTitle / CardDescription"
      controls={<NewToggleRow label="pressable" value={pressable} onChange={setPressable} />}
    >
      <Card onPress={pressable ? () => {} : undefined} style={styles.cardPreview}>
        <CardTitle>Board tune</CardTitle>
        <CardDescription>Profiles, lights and legal mode</CardDescription>
      </Card>
    </NewShowcaseCard>
  )
}

function ButtonShowcase() {
  const [variant, setVariant] = useState<ButtonVariant>('outline')
  const [large, setLarge] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [destructive, setDestructive] = useState(false)
  const color = destructive ? theme.status.error.color : undefined
  const size = large ? 'lg' : 'default'
  return (
    <NewShowcaseCard
      name="Button"
      controls={
        <>
          <NewChipRow
            label="variant"
            options={['primary', 'secondary', 'outline', 'ghost', 'floating']}
            selected={variant}
            onSelect={(v) => setVariant(v as ButtonVariant)}
          />
          <NewToggleRow label="large" value={large} onChange={setLarge} />
          <NewToggleRow label="disabled" value={disabled} onChange={setDisabled} />
          <NewToggleRow label="destructive color" value={destructive} onChange={setDestructive} />
        </>
      }
    >
      <View style={styles.row}>
        <Button
          label="Connect"
          variant={variant}
          size={size}
          color={color}
          disabled={disabled}
          onPress={() => {}}
        />
        <Button
          label="IMU"
          icon={IconCrosshair}
          variant={variant}
          size={size}
          color={color}
          disabled={disabled}
          onPress={() => {}}
        />
        <Button
          icon={IconCrosshair}
          accessibilityLabel="IMU"
          variant={variant}
          size={size}
          color={color}
          disabled={disabled}
          onPress={() => {}}
        />
      </View>
    </NewShowcaseCard>
  )
}

function SegmentedControlShowcase() {
  const [active, setActive] = useState('colourful')
  const [large, setLarge] = useState(false)
  return (
    <NewShowcaseCard
      name="SegmentedControl"
      controls={<NewToggleRow label="large" value={large} onChange={setLarge} />}
    >
      <View style={styles.alignEnd}>
        <SegmentedControl
          activeKey={active}
          options={BASEMAP_OPTIONS}
          size={large ? 'lg' : 'default'}
          onSelect={setActive}
        />
      </View>
    </NewShowcaseCard>
  )
}

function ToggleGroupShowcase() {
  const [active, setActive] = useState('total')
  const [three, setThree] = useState(false)
  return (
    <NewShowcaseCard
      name="ToggleGroup"
      controls={<NewToggleRow label="three options" value={three} onChange={setThree} />}
    >
      <ToggleGroup
        activeKey={active}
        options={[
          { key: 'total', label: 'All time' },
          { key: 'month', label: 'This month' },
          ...(three ? [{ key: 'year', label: '2026' }] : []),
        ]}
        onSelect={setActive}
      />
    </NewShowcaseCard>
  )
}

function SegmentedMenuShowcase() {
  const [expanded, setExpanded] = useState(false)
  const [active, setActive] = useState('colourful')
  return (
    <NewShowcaseCard
      name="SegmentedMenu"
      controls={<NewToggleRow label="expanded" value={expanded} onChange={setExpanded} />}
    >
      <View style={styles.alignEnd}>
        <SegmentedMenu
          activeKey={active}
          options={BASEMAP_OPTIONS}
          expanded={expanded}
          collapsedAccessibilityLabel="Basemap"
          autoCloseDelayMs={null}
          onToggle={() => setExpanded((open) => !open)}
          onSelect={setActive}
        />
      </View>
    </NewShowcaseCard>
  )
}

const TERRAIN_OPTIONS = [
  { value: 'flat', label: 'Flat road' },
  { value: 'large', label: 'Large hills · 8 m · 90 m' },
  { value: 'small', label: 'Small hills · 2 m · 24 m' },
  { value: 'pumptrack', label: 'Pumptrack · 0.5 m · 5 m' },
] as const

function SelectMenuShowcase() {
  const [terrain, setTerrain] = useState<(typeof TERRAIN_OPTIONS)[number]['value']>('flat')
  const [labelled, setLabelled] = useState(true)
  const [short, setShort] = useState(false)
  return (
    <NewShowcaseCard
      name="SelectMenu"
      controls={
        <>
          <NewToggleRow label="label" value={labelled} onChange={setLabelled} />
          <NewToggleRow label="short trigger text" value={short} onChange={setShort} />
        </>
      }
    >
      <SelectMenu
        label={labelled ? 'Terrain' : undefined}
        accessibilityLabel="Terrain"
        options={TERRAIN_OPTIONS}
        value={terrain}
        onChange={setTerrain}
        triggerText={short ? (option) => option.label.split(' · ')[0] : undefined}
      />
    </NewShowcaseCard>
  )
}

function PromptDialogShowcase() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('Street')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  return (
    <NewShowcaseCard
      name="PromptDialog"
      controls={
        <>
          <NewToggleRow label="error" value={error} onChange={setError} />
          <NewToggleRow label="loading" value={loading} onChange={setLoading} />
        </>
      }
    >
      <View style={styles.row}>
        <Button label={name} icon={IconPencil} variant="outline" onPress={() => setOpen(true)} />
      </View>
      <PromptDialog
        visible={open}
        title="Edit name"
        confirmLabel="Save"
        placeholder="Tune name"
        initialValue={name}
        error={error ? 'The tune could not be saved.' : null}
        loading={loading}
        onConfirm={(next) => {
          setName(next)
          setOpen(false)
        }}
        onDismiss={() => setOpen(false)}
      />
    </NewShowcaseCard>
  )
}

function ConfirmDialogShowcase() {
  const [open, setOpen] = useState(false)
  const [destructive, setDestructive] = useState(true)
  const [notice, setNotice] = useState(false)
  const [loading, setLoading] = useState(false)
  return (
    <NewShowcaseCard
      name="ConfirmDialog"
      controls={
        <>
          <NewToggleRow label="destructive" value={destructive} onChange={setDestructive} />
          <NewToggleRow label="notice (one button)" value={notice} onChange={setNotice} />
          <NewToggleRow label="loading" value={loading} onChange={setLoading} />
        </>
      }
    >
      <View style={styles.row}>
        <Button
          label="Delete ride"
          icon={IconPencil}
          variant="outline"
          onPress={() => setOpen(true)}
        />
      </View>
      <ConfirmDialog
        visible={open}
        title={notice ? 'Export failed' : 'Delete Ride'}
        message={
          notice
            ? 'Could not export ride.'
            : 'This ride and all its telemetry data will be permanently removed.'
        }
        confirmLabel={notice ? 'OK' : 'Delete'}
        cancelLabel={notice ? undefined : 'Keep'}
        destructive={destructive && !notice}
        loading={loading}
        onConfirm={() => setOpen(false)}
        onDismiss={() => setOpen(false)}
      />
    </NewShowcaseCard>
  )
}

function StepBarShowcase() {
  const [index, setIndex] = useState(1)
  const rides = ['18:42 · Today', '08:10 · Yesterday', '17:05 · Mon']
  return (
    <NewShowcaseCard name="StepBar">
      <StepBar
        onPrevious={index < rides.length - 1 ? () => setIndex(index + 1) : null}
        onNext={index > 0 ? () => setIndex(index - 1) : null}
        previousLabel="Previous ride"
        nextLabel="Next ride"
      >
        <View style={styles.stepCenter}>
          <Text style={styles.stepText}>{rides[index]}</Text>
        </View>
      </StepBar>
    </NewShowcaseCard>
  )
}

function MessageCardShowcase() {
  const [error, setError] = useState(false)
  return (
    <NewShowcaseCard
      name="MessageCard"
      controls={<NewToggleRow label="error" value={error} onChange={setError} />}
    >
      <MessageCard
        icon={error ? IconAlertCircle : IconRoute}
        tone={error ? 'error' : 'neutral'}
        title={error ? 'Could not load rides' : 'No rides yet'}
        description={error ? 'Restart the app to try again' : 'Record a ride and it shows up here'}
      />
    </NewShowcaseCard>
  )
}

function DrawerShowcase() {
  const [open, setOpen] = useState(false)
  return (
    <NewShowcaseCard name="Drawer">
      <Button label="Open drawer" variant="outline" onPress={() => setOpen(true)} />
      <Drawer
        visible={open}
        title="Show markers"
        description="Hidden categories stay off the map."
        onClose={() => setOpen(false)}
      >
        <View style={styles.drawerBody}>
          <CardDescription>Swipe the header down or tap outside to close.</CardDescription>
        </View>
      </Drawer>
    </NewShowcaseCard>
  )
}

function InputShowcase() {
  const [text, setText] = useState('2.5')
  const [disabled, setDisabled] = useState(false)
  return (
    <NewShowcaseCard
      name="Input"
      controls={<NewToggleRow label="disabled" value={disabled} onChange={setDisabled} />}
    >
      <View style={styles.row}>
        <Input
          value={text}
          onChangeText={setText}
          placeholder="Enter a value"
          keyboardType="numeric"
          editable={!disabled}
          accessibilityLabel="Value"
          style={styles.inputPreview}
        />
      </View>
    </NewShowcaseCard>
  )
}

function StepperShowcase() {
  const [value, setValue] = useState(50)
  return (
    <NewShowcaseCard name="Stepper">
      <Stepper
        label="strength"
        value={value}
        unit="%"
        min={10}
        max={100}
        step={10}
        onChange={setValue}
      />
    </NewShowcaseCard>
  )
}

function SwitchShowcase() {
  const [value, setValue] = useState(true)
  const [disabled, setDisabled] = useState(false)
  return (
    <NewShowcaseCard
      name="Switch"
      controls={<NewToggleRow label="disabled" value={disabled} onChange={setDisabled} />}
    >
      <Switch
        accessibilityLabel="Preview switch"
        value={value}
        disabled={disabled}
        onValueChange={setValue}
      />
    </NewShowcaseCard>
  )
}

function BadgeShowcase() {
  const [variant, setVariant] = useState<BadgeVariant>('outline')
  const [dot, setDot] = useState(true)
  return (
    <NewShowcaseCard
      name="Badge"
      controls={
        <>
          <NewChipRow
            label="variant"
            options={['secondary', 'outline']}
            selected={variant}
            onSelect={(v) => setVariant(v as BadgeVariant)}
          />
          <NewToggleRow label="dot" value={dot} onChange={setDot} />
        </>
      }
    >
      <View style={styles.row}>
        <Badge
          label="Connected"
          variant={variant}
          dot={dot ? theme.status.success.color : undefined}
        />
        <Badge label="Charging" icon={IconBolt} variant={variant} />
        <Badge label="Legal mode" variant={variant} color={theme.status.error.color} />
      </View>
    </NewShowcaseCard>
  )
}

function ProgressShowcase() {
  const [empty, setEmpty] = useState(false)
  const value = useShowcaseValue(null, empty ? null : { min: 0, max: 1, durationMs: 3000 })
  return (
    <NewShowcaseCard
      name="Progress"
      controls={<NewToggleRow label="no value" value={empty} onChange={setEmpty} />}
    >
      <View style={styles.stack}>
        <Progress value={value} />
        <Progress value={value} color={theme.telemetry.duty} />
        <Progress value={value} size="lg" />
      </View>
    </NewShowcaseCard>
  )
}

function AccordionShowcase() {
  const [summary, setSummary] = useState(true)
  return (
    <NewShowcaseCard
      name="Accordion"
      controls={<NewToggleRow label="summary" value={summary} onChange={setSummary} />}
    >
      <Accordion
        items={[
          {
            key: 'stats',
            title: 'Stats',
            summary: summary ? 'Peak 85%' : undefined,
            icon: IconChartBar,
            content: <CardDescription>One row is open at a time.</CardDescription>,
          },
          {
            key: 'alerts',
            title: 'Alerts',
            summary: summary ? 'Normal' : undefined,
            icon: IconBell,
            content: <CardDescription>Opening another row closes this one.</CardDescription>,
          },
          {
            key: 'limits',
            title: 'Limits',
            summary: summary ? 'Pushback at 90%' : undefined,
            icon: IconAdjustments,
            content: <CardDescription>Closed rows show their state at a glance.</CardDescription>,
          },
        ]}
      />
    </NewShowcaseCard>
  )
}

function SeparatorShowcase() {
  return (
    <NewShowcaseCard name="Separator">
      <View style={styles.stack}>
        <CardDescription>Trip</CardDescription>
        <Separator />
        <View style={[styles.row, styles.separatorRow]}>
          <CardDescription>Left</CardDescription>
          <Separator orientation="vertical" />
          <CardDescription>Right</CardDescription>
        </View>
      </View>
    </NewShowcaseCard>
  )
}

function SettingsGroupShowcase() {
  const [withControl, setWithControl] = useState(false)
  return (
    <NewShowcaseCard
      name="SettingsGroup / SettingsLink"
      controls={
        <NewToggleRow label="trailing control" value={withControl} onChange={setWithControl} />
      }
    >
      <SettingsGroup title="Preferences">
        <SettingsLink
          icon={IconVolume}
          label="Sounds"
          hint="Choose and preview a sound pack"
          onPress={() => {}}
          right={withControl ? <Badge label="Default" variant="outline" /> : undefined}
        />
        <SettingsLink icon={IconBell} label="Alerts" hint="Read-only row without a chevron" />
      </SettingsGroup>
    </NewShowcaseCard>
  )
}

export default function NewComponentPrimitivesPage() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <NewComponentHero
          icon={IconSquareHalf}
          description="The shadcn-style primitives in src/components/ui, on the zinc theme.ui tokens."
        />
        <CardShowcase />
        <ButtonShowcase />
        <SegmentedControlShowcase />
        <ToggleGroupShowcase />
        <SegmentedMenuShowcase />
        <StepBarShowcase />
        <MessageCardShowcase />
        <ConfirmDialogShowcase />
        <SelectMenuShowcase />
        <PromptDialogShowcase />
        <DrawerShowcase />
        <InputShowcase />
        <StepperShowcase />
        <SwitchShowcase />
        <BadgeShowcase />
        <ProgressShowcase />
        <AccordionShowcase />
        <SeparatorShowcase />
        <SettingsGroupShowcase />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  stepCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: theme.ui.foreground, fontSize: 13, fontWeight: '700' },
  inputPreview: { flex: 1 },
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  drawerBody: { paddingHorizontal: 16, paddingVertical: 12 },
  alignEnd: { alignItems: 'flex-end' },
  cardPreview: { padding: 16, gap: 2 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  stack: { gap: 10 },
  separatorRow: { height: 20 },
})
