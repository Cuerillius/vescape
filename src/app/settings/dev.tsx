import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import IconCameraRotate from '@tabler/icons-react-native/IconCameraRotate'
import IconPlayerRecord from '@tabler/icons-react-native/IconPlayerRecord'
import IconComponents from '@tabler/icons-react-native/IconComponents'
import IconTool from '@tabler/icons-react-native/IconTool'

import { routes } from '@/navigation/routes'
import { theme } from '@/constants/theme'
import {
  SettingsDescription,
  SettingsGroup,
  SettingsLink,
} from '@/modules/settings/components/SettingsGroup'

// @parity /src/modules/diagnostics/components/DevBadge.tsx `DEV_PAGE_SHORTCUTS`
const DEV_PAGE_SHORTCUTS = [
  {
    label: 'Components library',
    hint: 'Browse all UI components with live props',
    route: routes.settingsComponents,
    icon: IconComponents,
  },
  {
    label: 'Debug recordings',
    hint: 'Capture and export raw BLE sessions',
    route: routes.settingsDebugRecordings,
    icon: IconPlayerRecord,
  },
  {
    label: 'Camera playground',
    hint: 'Tune the spring camera engine against fake GPS',
    route: routes.devMapPlayground,
    icon: IconCameraRotate,
  },
  {
    label: 'Other',
    hint: 'Small platform probes and local experiments',
    route: routes.settingsOther,
    icon: IconTool,
  },
]

export default function DevSettingsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <SettingsDescription>
          Diagnostics, local verification, and component previews.
        </SettingsDescription>
        <SettingsGroup>
          {DEV_PAGE_SHORTCUTS.map((page) => (
            <SettingsLink
              key={page.label}
              icon={page.icon}
              label={page.label}
              hint={page.hint}
              onPress={() => router.push(page.route)}
            />
          ))}
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
