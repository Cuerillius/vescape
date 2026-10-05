import { useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import IconPackage from '@tabler/icons-react-native/IconPackage'
import IconPlayerRecord from '@tabler/icons-react-native/IconPlayerRecord'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { Card, CardDescription, CardTitle } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Separator } from '@/components/ui/Separator'
import { Switch } from '@/components/ui/Switch'
import { theme } from '@/constants/theme'
import { formatBytes } from '@/helpers/format'
import { useResolvedColor } from '@/hooks/useTheme'
import { useDebugRecordings } from '@/modules/history/hooks/useDebugRecordings'
import {
  SettingsDescription,
  SettingsGroup,
  SettingsLink,
} from '@/modules/settings/components/SettingsGroup'

function formatCreatedAt(createdAt: number): string {
  return new Date(createdAt).toLocaleString()
}

export function DebugRecordingsScreen() {
  const debug = useDebugRecordings()
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const spinnerColor = useResolvedColor(theme.ui.mutedForeground)

  const busy =
    debug.replayingName != null || debug.exportingName != null || debug.deletingName != null

  const confirmDelete = async () => {
    if (!pendingDelete) return
    await debug.deleteRecording(pendingDelete)
    setPendingDelete(null)
  }

  const startReplay = async (name: string) => {
    const started = await debug.replayRecording(name)
    // Replay drives the normal live UI — jump back to the main screen to watch it.
    if (started) router.dismissAll()
  }

  const replayButton = (name: string) => (
    <Button
      label={debug.replayingName === name ? 'Starting...' : 'Replay'}
      variant="secondary"
      loading={debug.replayingName === name}
      disabled={busy}
      onPress={() => void startReplay(name)}
    />
  )

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <SettingsDescription>
          Capture raw BLE packets, connection states, and location for diagnosis.
        </SettingsDescription>

        <SettingsGroup title="Capture">
          <SettingsLink
            icon={IconPlayerRecord}
            label="Record future sessions"
            hint="Applies to every new board session until disabled"
            right={
              <Switch
                accessibilityLabel="Record future sessions"
                value={debug.enabled}
                onValueChange={debug.setEnabled}
              />
            }
          />
        </SettingsGroup>

        <View style={styles.group}>
          <View style={styles.heading}>
            <Text style={styles.title}>Recordings</Text>
            <Button
              label={debug.loading ? 'Loading...' : 'Refresh'}
              variant="ghost"
              disabled={debug.loading}
              onPress={() => void debug.refresh()}
            />
          </View>
          {debug.error ? (
            <Text style={styles.errorText} selectable>
              {debug.error}
            </Text>
          ) : null}
          {debug.loading ? (
            <ActivityIndicator color={spinnerColor} />
          ) : debug.recordings.length === 0 ? (
            <Text style={styles.emptyText}>No debug recordings yet.</Text>
          ) : (
            <Card>
              {debug.recordings.map((recording, index) => (
                <View key={recording.name}>
                  {index > 0 ? <Separator /> : null}
                  <View style={styles.recording}>
                    <View style={styles.recordingText}>
                      <CardTitle>{recording.name}</CardTitle>
                      <CardDescription>
                        {`device · ${formatCreatedAt(recording.createdAt)} · ${formatBytes(recording.sizeBytes)}`}
                      </CardDescription>
                    </View>
                    <View style={styles.actions}>
                      {replayButton(recording.name)}
                      <Button
                        label={debug.exportingName === recording.name ? 'Exporting...' : 'Export'}
                        variant="secondary"
                        loading={debug.exportingName === recording.name}
                        disabled={busy}
                        onPress={() => void debug.exportRecording(recording)}
                      />
                      <Button
                        label="Delete"
                        color={theme.status.error.color}
                        loading={debug.deletingName === recording.name}
                        disabled={busy}
                        onPress={() => setPendingDelete(recording.name)}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </Card>
          )}
        </View>

        {debug.fixtures.length > 0 && (
          <SettingsGroup title="Bundled fixtures">
            {debug.fixtures.map((fixture) => (
              <SettingsLink
                key={fixture.name}
                icon={IconPackage}
                label={fixture.name}
                hint={`bundled · ${formatBytes(fixture.sizeBytes)}`}
                right={replayButton(fixture.name)}
              />
            ))}
          </SettingsGroup>
        )}
      </ScrollView>
      <ConfirmDialog
        visible={pendingDelete != null}
        title="Delete recording?"
        message={`Permanently delete "${pendingDelete ?? ''}". This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        loading={debug.deletingName != null}
        onConfirm={() => void confirmDelete()}
        onDismiss={() => setPendingDelete(null)}
      />
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
  group: {
    gap: 8,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  recording: {
    padding: 16,
    gap: 12,
  },
  recordingText: {
    gap: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  errorText: {
    color: theme.status.error.color,
    fontSize: 12,
  },
  emptyText: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },
})
