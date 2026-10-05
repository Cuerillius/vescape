import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconPhoto from '@tabler/icons-react-native/IconPhoto'
import IconShieldCheck from '@tabler/icons-react-native/IconShieldCheck'

import { openExternalUrl } from '@/components/base/openExternalUrl'
import { theme } from '@/constants/theme'
import {
  SettingsDescription,
  SettingsGroup,
  SettingsLink,
} from '@/modules/settings/components/SettingsGroup'

const PRIVACY_POLICY_URL = 'https://vescape.app/privacy'
const ONEWHEEL_ICON_URL = 'https://thenounproject.com/browse/icons/term/onewheel/'

export default function LegalScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <SettingsDescription>How the app treats your data, and who to thank.</SettingsDescription>
        <SettingsGroup>
          <SettingsLink
            icon={IconShieldCheck}
            label="Privacy policy"
            hint="Data, Group Ride sharing, and contact"
            onPress={() => openExternalUrl(PRIVACY_POLICY_URL, 'privacy_policy_link')}
          />
          <SettingsLink
            icon={IconPhoto}
            label="Credits"
            hint="Onewheel icon by Anthony Ledoux from Noun Project (CC BY 3.0)"
            onPress={() => openExternalUrl(ONEWHEEL_ICON_URL, 'onewheel_icon_credit_link')}
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
