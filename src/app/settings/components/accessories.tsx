import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSharedValue } from 'react-native-reanimated'
import IconPlugConnected from '@tabler/icons-react-native/IconPlugConnected'
import type { AccessoryLinkPhase, BrakeLightMode } from 'vescape-core'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Stepper } from '@/components/ui/Stepper'
import { NewComponentHero } from '@/components/dev/NewComponentHero'
import { NewShowcaseCard } from '@/components/dev/NewShowcaseCard'
import { NewChipRow, NewToggleRow } from '@/components/dev/NewShowcaseControls'
import { theme } from '@/constants/theme'
import { AccessoryRow } from '@/modules/accessories/components/AccessoryRow'
import { BrakeLightStates } from '@/modules/accessories/components/BrakeLightStates'
import { GroundClearanceTiltPreview } from '@/modules/accessories/components/GroundClearanceTiltPreview'
import { LiveNumber } from '@/modules/accessories/components/LiveNumber'
import { SensorBar } from '@/modules/accessories/components/SensorBar'

const PHASES: AccessoryLinkPhase[] = [
  'idle',
  'connecting',
  'handshaking',
  'connected',
  'unavailable',
  'incompatible',
]

function AccessoryRowShowcase() {
  const [needsSetup, setNeedsSetup] = useState(false)
  return (
    <NewShowcaseCard
      name="AccessoryRow"
      controls={<NewToggleRow label="needs setup" value={needsSetup} onChange={setNeedsSetup} />}
    >
      <Card>
        {PHASES.map((phase) => (
          <AccessoryRow
            key={phase}
            name="Ground clearance sensor"
            detail="v1.4.2"
            phase={phase}
            needsSetup={needsSetup}
            onPress={() => {}}
          />
        ))}
      </Card>
    </NewShowcaseCard>
  )
}

const MODES: BrakeLightMode[] = ['not_riding', 'riding', 'braking', 'hard_braking']

function BrakeLightStatesShowcase() {
  const [mode, setMode] = useState<BrakeLightMode>('riding')
  const [holding, setHolding] = useState(false)
  const [glow, setGlow] = useState(false)
  const [disabled, setDisabled] = useState(false)
  return (
    <NewShowcaseCard
      name="BrakeLightStates"
      controls={
        <>
          <NewChipRow
            label="live state"
            options={MODES}
            selected={mode}
            onSelect={(next) => setMode(next as BrakeLightMode)}
          />
          <NewToggleRow label="rider is holding it" value={holding} onChange={setHolding} />
          <NewToggleRow label="parked glows" value={glow} onChange={setGlow} />
          <NewToggleRow label="disconnected or off" value={disabled} onChange={setDisabled} />
        </>
      }
    >
      <BrakeLightStates
        activeMode={mode}
        previewMode={holding ? mode : null}
        parked={glow ? 'glow' : 'off'}
        previewSecondsLeft={holding ? 7 : null}
        disabled={disabled}
        onPreview={(next) => {
          setHolding(next != null)
          if (next) setMode(next)
        }}
      />
    </NewShowcaseCard>
  )
}

function SensorReadoutShowcase() {
  const [distance, setDistance] = useState(15)
  const [tilt, setTilt] = useState(-25)
  const distanceValue = useSharedValue(15)
  const tiltValue = useSharedValue(-25)
  return (
    <NewShowcaseCard name="LiveNumber, SensorBar, GroundClearanceTiltPreview">
      <View style={styles.stack}>
        <LiveNumber value={distanceValue} decimals={1} unit="cm" />
        <SensorBar
          value={distanceValue}
          range={{ min: 3, max: 100 }}
          color={theme.palette.sky.color}
        />
        <GroundClearanceTiltPreview value={tiltValue} />
        <Stepper
          value={tilt}
          min={-100}
          max={100}
          step={1}
          unit="%"
          label="tilt preview"
          onChange={(next) => {
            setTilt(next)
            tiltValue.set(next)
          }}
        />
        <Stepper
          value={distance}
          min={3}
          max={100}
          step={1}
          unit="cm"
          label="distance"
          onChange={(next) => {
            setDistance(next)
            distanceValue.set(next)
          }}
        />
        <Button
          label="Invalid reading"
          variant="secondary"
          onPress={() => {
            distanceValue.set(Number.NaN)
            tiltValue.set(Number.NaN)
          }}
        />
      </View>
    </NewShowcaseCard>
  )
}

export default function NewAccessoriesPage() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <NewComponentHero
          icon={IconPlugConnected}
          description="Accessory list rows in every link phase, the brake light state picker and live sensor readouts."
        />
        <AccessoryRowShowcase />
        <BrakeLightStatesShowcase />
        <SensorReadoutShowcase />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  stack: { gap: 12 },
})
