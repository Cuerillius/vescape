import { useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import IconPlayerPlay from '@tabler/icons-react-native/IconPlayerPlay'
import IconPlayerStop from '@tabler/icons-react-native/IconPlayerStop'
import {
  getAlertSounds,
  previewAlertSound,
  startGeigerSimulation,
  stopGeigerSimulation,
} from 'vescape-core'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { ToggleGroup } from '@/components/ui/ToggleGroup'
import { theme } from '@/constants/theme'
import { TuneDial } from '@/modules/tune/components/TuneDial'
import { ProbeSection, probeStyles } from '@/screens/showcase/other/ProbeSection'

type PlaybackMode = 'single' | 'geiger'

const MODE_OPTIONS = [
  { key: 'single', label: 'Single play' },
  { key: 'geiger', label: 'Geiger simulation' },
] as const

/** Alert sound presets, single playback, and the Geiger simulation with its range depth. */
export function AlertSoundProbe() {
  const presets = useMemo(() => getAlertSounds(), [])
  const singlePresets = useMemo(
    () => presets.filter((preset) => preset.category === 'single'),
    [presets],
  )
  const geigerPresets = useMemo(
    () => presets.filter((preset) => preset.category === 'geiger'),
    [presets],
  )
  const [selectedUri, setSelectedUri] = useState<string>(singlePresets[0]?.uri ?? 'preset:beep')
  const [mode, setMode] = useState<PlaybackMode>('single')
  const [rangeDepth, setRangeDepth] = useState(0.5)
  const [geigerActive, setGeigerActive] = useState(false)

  const visiblePresets = mode === 'single' ? singlePresets : geigerPresets
  const selectedPreset = visiblePresets.find((p) => p.uri === selectedUri) ?? visiblePresets[0]

  useEffect(() => stopGeigerSimulation, [])

  const handlePlaySingle = useCallback(() => {
    previewAlertSound(selectedUri)
  }, [selectedUri])

  const handleStopGeiger = useCallback(() => {
    stopGeigerSimulation()
    setGeigerActive(false)
  }, [])

  const handleToggleGeiger = useCallback(() => {
    if (geigerActive) {
      handleStopGeiger()
      return
    }
    startGeigerSimulation(selectedUri, rangeDepth)
    setGeigerActive(true)
  }, [geigerActive, handleStopGeiger, rangeDepth, selectedUri])

  const handleRangeDepthChange = useCallback(
    (value: number) => {
      setRangeDepth(value)
      if (geigerActive) startGeigerSimulation(selectedUri, value)
    },
    [geigerActive, selectedUri],
  )

  const selectMode = useCallback(
    (next: PlaybackMode) => {
      if (geigerActive) handleStopGeiger()
      setMode(next)
      const nextPresets = next === 'single' ? singlePresets : geigerPresets
      setSelectedUri(nextPresets[0]?.uri ?? 'preset:beep')
    },
    [geigerActive, geigerPresets, handleStopGeiger, singlePresets],
  )

  return (
    <>
      <ProbeSection title="Sound preset">
        <View style={probeStyles.wrap}>
          {visiblePresets.map((preset) => (
            <Button
              key={preset.uri}
              label={preset.name}
              variant={selectedUri === preset.uri ? 'primary' : 'outline'}
              onPress={() => {
                if (geigerActive) handleStopGeiger()
                setSelectedUri(preset.uri)
              }}
            />
          ))}
        </View>
      </ProbeSection>

      <ProbeSection title="Playback mode">
        <ToggleGroup activeKey={mode} options={MODE_OPTIONS} onSelect={selectMode} />
      </ProbeSection>

      {mode === 'single' ? (
        <ProbeSection title="Play">
          <Button
            label={`Play ${selectedPreset?.name ?? selectedUri}`}
            icon={IconPlayerPlay}
            variant="primary"
            size="lg"
            onPress={handlePlaySingle}
          />
        </ProbeSection>
      ) : (
        <ProbeSection title="Geiger simulation">
          <View style={styles.dialHeader}>
            <Text style={styles.dialLabel}>Range depth</Text>
            <Text style={styles.dialValue}>{rangeDepth.toFixed(2)}</Text>
          </View>
          <TuneDial
            value={rangeDepth}
            min={0}
            max={1}
            step={0.01}
            onValueChange={handleRangeDepthChange}
          />
          <Button
            label={geigerActive ? 'Stop' : 'Start Geiger'}
            icon={geigerActive ? IconPlayerStop : IconPlayerPlay}
            variant={geigerActive ? 'outline' : 'primary'}
            color={geigerActive ? theme.status.error.color : undefined}
            size="lg"
            onPress={handleToggleGeiger}
          />
        </ProbeSection>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  dialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dialLabel: {
    color: theme.ui.mutedForeground,
    fontSize: 14,
    fontWeight: '500',
  },
  dialValue: {
    color: theme.ui.foreground,
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
})
