import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconAdjustments from '@tabler/icons-react-native/IconAdjustments'
import IconMap2 from '@tabler/icons-react-native/IconMap2'
import IconPalette from '@tabler/icons-react-native/IconPalette'
import IconPhoto from '@tabler/icons-react-native/IconPhoto'
import { useShallow } from 'zustand/react/shallow'

import { Stepper } from '@/components/ui/Stepper'
import { Switch } from '@/components/ui/Switch'
import { theme } from '@/constants/theme'
import {
  SettingsDescription,
  SettingsGroup,
  SettingsLink,
} from '@/modules/settings/components/SettingsGroup'
import { useSettingsStore } from '@/modules/settings/store/settingsStore'

export default function MapSettingsScreen() {
  const {
    satelliteOverlayEnabled,
    satelliteImageryOpacity,
    satelliteMapImageryOpacity,
    satelliteImagerySaturation,
    set,
  } = useSettingsStore(
    useShallow((s) => ({
      satelliteOverlayEnabled: s.satelliteOverlayEnabled,
      satelliteImageryOpacity: s.satelliteImageryOpacity,
      satelliteMapImageryOpacity: s.satelliteMapImageryOpacity,
      satelliteImagerySaturation: s.satelliteImagerySaturation,
      set: s.set,
    })),
  )
  const satelliteOpacityPercent = Math.round(satelliteImageryOpacity * 100)
  const satelliteMapOpacityPercent = Math.round(satelliteMapImageryOpacity * 100)
  const satelliteDesaturationPercent = Math.round(-satelliteImagerySaturation * 100)

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <SettingsDescription>
          Set the satellite baseline. Active theme and daylight adapt it without changing routes or
          pins.
        </SettingsDescription>
        <SettingsGroup title="Satellite view">
          <SettingsLink
            icon={IconPhoto}
            label="Satellite overlay"
            hint="Use toned satellite imagery with roads and labels"
            right={
              <Switch
                accessibilityLabel="Satellite overlay"
                value={satelliteOverlayEnabled}
                onValueChange={(enabled) => void set('satelliteOverlayEnabled', enabled)}
              />
            }
          />
          {satelliteOverlayEnabled ? (
            <SettingsLink
              icon={IconAdjustments}
              label="Home image opacity"
              hint="Maximum for the home map; theme and daylight may dim it"
              right={
                <Stepper
                  label="home image opacity"
                  value={satelliteOpacityPercent}
                  unit="%"
                  min={10}
                  max={100}
                  step={5}
                  onChange={(nextPercent) => {
                    const percent = Math.min(100, Math.max(10, nextPercent))
                    void set('satelliteImageryOpacity', percent / 100)
                  }}
                />
              }
            />
          ) : null}
          {satelliteOverlayEnabled ? (
            <SettingsLink
              icon={IconMap2}
              label="Explore image opacity"
              hint="Maximum in Explore; theme and daylight may dim it"
              right={
                <Stepper
                  label="explore image opacity"
                  value={satelliteMapOpacityPercent}
                  unit="%"
                  min={10}
                  max={100}
                  step={5}
                  onChange={(nextPercent) => {
                    const percent = Math.min(100, Math.max(10, nextPercent))
                    void set('satelliteMapImageryOpacity', percent / 100)
                  }}
                />
              }
            />
          ) : null}
          {satelliteOverlayEnabled ? (
            <SettingsLink
              icon={IconPalette}
              label="Satellite desaturation"
              hint="Base home-map value; night adaptation can desaturate further"
              right={
                <Stepper
                  label="satellite desaturation"
                  value={satelliteDesaturationPercent}
                  unit="%"
                  min={0}
                  max={100}
                  step={5}
                  onChange={(nextPercent) => {
                    const percent = Math.min(100, Math.max(0, nextPercent))
                    void set('satelliteImagerySaturation', -percent / 100)
                  }}
                />
              }
            />
          ) : null}
        </SettingsGroup>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.ui.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 24,
  },
})
