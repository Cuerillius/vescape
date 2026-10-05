import { useEffect } from 'react'
import { StyleSheet, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSharedValue } from 'react-native-reanimated'
import IconCheck from '@tabler/icons-react-native/IconCheck'
import IconDatabaseExport from '@tabler/icons-react-native/IconDatabaseExport'
import IconDatabaseImport from '@tabler/icons-react-native/IconDatabaseImport'
import IconHistory from '@tabler/icons-react-native/IconHistory'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Progress } from '@/components/ui/Progress'
import { theme } from '@/constants/theme'
import {
  SettingsDescription,
  SettingsGroup,
  SettingsLink,
} from '@/modules/settings/components/SettingsGroup'
import { useSettingsDatabaseOps } from '@/modules/settings/hooks/useSettingsDatabaseOps'

export default function DatabaseSettingsScreen() {
  const db = useSettingsDatabaseOps()
  const rebuildProgress = useSharedValue<number | null>(null)
  useEffect(() => {
    rebuildProgress.value = db.rebuildState === 'running' ? db.rebuildProgressValue : null
  }, [db.rebuildState, db.rebuildProgressValue, rebuildProgress])

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <SettingsDescription>
          Back up, restore, and rebuild your ride history database.
        </SettingsDescription>
        {db.dbSizeError ? <Text style={styles.error}>{db.dbSizeError}</Text> : null}

        <SettingsGroup title="Ride history">
          <SettingsLink
            icon={IconHistory}
            label="Rebuild history"
            hint={db.rebuildHint}
            right={
              <Button
                label={
                  db.rebuildState === 'running'
                    ? 'Rebuilding…'
                    : db.rebuildState === 'done'
                      ? 'Done'
                      : 'Rebuild'
                }
                icon={db.rebuildState === 'done' ? IconCheck : undefined}
                color={db.rebuildState === 'done' ? theme.status.success.text : undefined}
                loading={db.rebuildState === 'running'}
                onPress={() => void db.handleRebuildBuckets()}
              />
            }
          />
          {db.rebuildState === 'running' ? (
            <View style={styles.progress}>
              <View style={styles.progressTrack}>
                <Progress value={rebuildProgress} />
              </View>
              {db.rebuildProgressLabel ? (
                <Text style={styles.progressText}>{db.rebuildProgressLabel}</Text>
              ) : null}
            </View>
          ) : null}
        </SettingsGroup>

        <SettingsGroup title="Backup">
          <SettingsLink
            icon={IconDatabaseExport}
            label="Back up database"
            hint={db.backupHint}
            right={
              <Button
                label={db.backupState === 'running' ? 'Exporting…' : 'Export'}
                loading={db.backupState === 'running'}
                disabled={db.restoreState === 'running' || db.rebuildState === 'running'}
                onPress={() => void db.handleBackupDatabase()}
              />
            }
          />
          <SettingsLink
            icon={IconDatabaseImport}
            label="Restore database"
            hint={db.restoreHint}
            right={
              <Button
                label={db.restoreState === 'running' ? 'Restoring…' : 'Restore'}
                color={theme.status.error.color}
                loading={db.restoreState === 'running'}
                disabled={db.backupState === 'running' || db.rebuildState === 'running'}
                onPress={() => void db.handleRestoreDatabase()}
              />
            }
          />
        </SettingsGroup>
      </ScrollView>
      <ConfirmDialog
        visible={db.restoreConfirmVisible}
        title="Restore database"
        message={`Current database will be replaced by ${db.pendingRestoreName ?? 'the selected backup'}. App keeps a temporary rollback copy during restore and restores old database if restore fails.`}
        confirmLabel="Restore"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => void db.handleConfirmRestore()}
        onDismiss={db.cancelRestore}
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
  error: {
    color: theme.status.error.text,
    fontSize: 13,
    marginTop: -8,
    marginHorizontal: 4,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  progressTrack: {
    flex: 1,
  },
  progressText: {
    minWidth: 44,
    color: theme.ui.mutedForeground,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
})
