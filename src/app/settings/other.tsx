import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { theme } from '@/constants/theme'
import { SettingsDescription } from '@/modules/settings/components/SettingsGroup'
import { AlertSoundProbe } from '@/screens/showcase/other/AlertSoundProbe'
import { BoardWarningProbe } from '@/screens/showcase/other/BoardWarningProbe'
import { HapticsProbe } from '@/screens/showcase/other/HapticsProbe'
import { TtsProbe } from '@/screens/showcase/other/TtsProbe'

export default function OtherSettingsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <SettingsDescription>Small platform probes and local experiments.</SettingsDescription>
        <BoardWarningProbe />
        <HapticsProbe />
        <AlertSoundProbe />
        <TtsProbe />
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
