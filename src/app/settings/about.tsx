import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconCrown from '@tabler/icons-react-native/IconCrown'
import IconPalette from '@tabler/icons-react-native/IconPalette'

import { theme } from '@/constants/theme'
import {
  SettingsDescription,
  SettingsGroup,
  SettingsLink,
} from '@/modules/settings/components/SettingsGroup'

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <SettingsDescription>
          The people who built this app, with a little less seriousness.
        </SettingsDescription>

        <SettingsGroup>
          <SettingsLink icon={IconCrown} label="Kacper Kozak" hint="Look mom, I'm a king." />
          <SettingsLink
            icon={IconPalette}
            label="Bartosz Kozak"
            hint="One more feature, app will hold it."
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
