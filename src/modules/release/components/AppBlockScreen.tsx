import { Modal, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button } from '@/components/base/Button'
import { Markdown } from '@/components/base/Markdown'
import { Text } from '@/components/base/Text'
import { theme } from '@/constants/theme'
import IconArrowBigUpLines from '@tabler/icons-react-native/IconArrowBigUpLines'
import IconArrowRight from '@tabler/icons-react-native/IconArrowRight'

interface AppBlockScreenProps {
  /** Markdown body — the server message or a bundled default. */
  message: string
  /** The blocked build the rider is on. */
  installedVersion: string
  /** The build to update to. */
  latestVersion: string
  /** Open the stable platform download route. The only action App Block offers. */
  onUpdate: () => void
}

/**
 * The exceptional App Block presentation: a full-screen, non-dismissible update-only shell that
 * covers normal navigation. Its single action opens the stable platform download route; there is no
 * close, backdrop-dismiss, or hardware-back exit. Presentational only — {@link ReleaseSurfaces}
 * mounts it, and only while nothing else is presented.
 *
 * This shell issues no Board Session or Ride Recording command: already-running native work keeps
 * going underneath it (PRD story 9).
 */
export function AppBlockScreen({
  message,
  installedVersion,
  latestVersion,
  onUpdate,
}: AppBlockScreenProps) {
  return (
    <Modal
      visible
      transparent={false}
      animationType="fade"
      statusBarTranslucent
      // App Block is not dismissible: swallow the Android hardware back press instead of exiting.
      onRequestClose={() => {}}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <IconArrowBigUpLines size={28} color={theme.status.upgrade.color} strokeWidth={2.5} />
          </View>
          <Text style={styles.title}>Update required</Text>
          <View style={styles.versions}>
            <Text style={styles.versionFrom}>v{installedVersion}</Text>
            <IconArrowRight size={14} color={theme.ui.mutedForeground} strokeWidth={2.5} />
            <Text style={styles.versionTo}>v{latestVersion}</Text>
          </View>
        </View>
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          <Markdown align="center">{message}</Markdown>
        </ScrollView>
        <Button
          label="Update Vescape"
          variant="tune"
          icon={IconArrowBigUpLines}
          onPress={onUpdate}
        />
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.ui.background,
    padding: 24,
    gap: 20,
  },
  header: {
    alignItems: 'center',
    gap: 14,
    paddingTop: 24,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.status.upgrade.bg,
    borderWidth: 1,
    borderColor: theme.status.upgrade.border,
  },
  title: {
    color: theme.ui.foreground,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  versions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  versionFrom: {
    color: theme.ui.mutedForeground,
    fontSize: 14,
  },
  versionTo: {
    color: theme.palette.purple.light,
    fontSize: 14,
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingBottom: 12,
  },
})
