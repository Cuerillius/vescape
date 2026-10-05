import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import IconAlertTriangle from '@tabler/icons-react-native/IconAlertTriangle'
import IconEngine from '@tabler/icons-react-native/IconEngine'
import IconList from '@tabler/icons-react-native/IconList'
import IconMapPin from '@tabler/icons-react-native/IconMapPin'
import IconNavigation from '@tabler/icons-react-native/IconNavigation'

import { routes } from '@/navigation/routes'
import { theme } from '@/constants/theme'
import { Switch } from '@/components/ui/Switch'
import {
  SettingsDescription,
  SettingsGroup,
  SettingsLink,
} from '@/modules/settings/components/SettingsGroup'
import { useSettingsStore } from '@/modules/settings/store/settingsStore'

export default function DiagnosticsSettingsScreen() {
  const boardWarningsEnabled = useSettingsStore((s) => s.boardWarningsEnabled)
  const vescFaultCollectionEnabled = useSettingsStore((s) => s.vescFaultCollectionEnabled)
  const showHistoryMapMarkers = useSettingsStore((s) => s.showHistoryMapMarkers)
  const set = useSettingsStore((s) => s.set)

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <SettingsDescription>
          Board health checks that watch telemetry and flag problems while you ride, plus live GPS
          and heading evidence.
        </SettingsDescription>
        <SettingsGroup title="Detection">
          <SettingsLink
            icon={IconEngine}
            label="Board warnings"
            hint="Master switch — off stops all detection and hides warnings"
            right={
              <Switch
                accessibilityLabel="Board warnings"
                value={boardWarningsEnabled}
                onValueChange={(v) => void set('boardWarningsEnabled', v)}
              />
            }
          />
          <SettingsLink
            icon={IconAlertTriangle}
            label="VESC fault collection"
            hint="Record live Refloat faults. Controller log loads when the fault drawer opens"
            right={
              <Switch
                accessibilityLabel="VESC fault collection"
                value={vescFaultCollectionEnabled}
                onValueChange={(v) => void set('vescFaultCollectionEnabled', v)}
              />
            }
          />
          <SettingsLink
            icon={IconMapPin}
            label="Ride markers on map"
            hint="Show pause, connection, error, and gap markers on history routes"
            right={
              <Switch
                accessibilityLabel="Ride markers on map"
                value={showHistoryMapMarkers}
                onValueChange={(v) => void set('showHistoryMapMarkers', v)}
              />
            }
          />
        </SettingsGroup>

        <SettingsGroup title="Inspect">
          <SettingsLink
            icon={IconList}
            label="Event log"
            hint="Browse locally persisted diagnostic events"
            onPress={() => router.push(routes.settingsDiagnosticEvents)}
          />
          <SettingsLink
            icon={IconNavigation}
            label="Navigation diagnostics"
            hint="Live map heading, GPS, and fallback evidence"
            onPress={() => router.push(routes.settingsNavigationDiagnostic)}
          />
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
