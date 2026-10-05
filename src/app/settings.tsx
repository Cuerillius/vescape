import { useLayoutEffect } from 'react'
import { View, StyleSheet, ScrollView, Platform } from 'react-native'
import { router, useNavigation } from 'expo-router'
import Constants from 'expo-constants'
import IconBluetooth from '@tabler/icons-react-native/IconBluetooth'
import IconBrandAndroid from '@tabler/icons-react-native/IconBrandAndroid'
import IconBrandApple from '@tabler/icons-react-native/IconBrandApple'
import IconChartLine from '@tabler/icons-react-native/IconChartLine'
import IconCloudUpload from '@tabler/icons-react-native/IconCloudUpload'
import IconCode from '@tabler/icons-react-native/IconCode'
import IconCpu from '@tabler/icons-react-native/IconCpu'
import IconDatabase from '@tabler/icons-react-native/IconDatabase'
import IconDeviceWatch from '@tabler/icons-react-native/IconDeviceWatch'
import IconEngine from '@tabler/icons-react-native/IconEngine'
import IconGauge from '@tabler/icons-react-native/IconGauge'
import IconHistory from '@tabler/icons-react-native/IconHistory'
import IconHome from '@tabler/icons-react-native/IconHome'
import IconInfoCircle from '@tabler/icons-react-native/IconInfoCircle'
import IconMap from '@tabler/icons-react-native/IconMap'
import IconRuler from '@tabler/icons-react-native/IconRuler'
import IconScale from '@tabler/icons-react-native/IconScale'
import IconTag from '@tabler/icons-react-native/IconTag'
import IconVolume from '@tabler/icons-react-native/IconVolume'

import { routes } from '@/navigation/routes'
import { theme } from '@/constants/theme'
import { DASH, fmtCompactCount, fmtTimeAgo, formatBytes } from '@/helpers/format'
import { Badge } from '@/components/ui/Badge'
import { RawValuesButton } from '@/components/ui/RawValuesButton'
import { SelectMenu } from '@/components/ui/SelectMenu'
import { VescapeWordmark } from '@/components/base/VescapeWordmark'
import { useBackupSlot } from '@/modules/profile/hooks/useBackupSlot'
import type { BackupSlot } from '@/modules/profile/lib/backupSlot'
import { SettingsGroup, SettingsLink } from '@/modules/settings/components/SettingsGroup'
import { ThemePicker } from '@/modules/settings/components/ThemePicker'
import { useSettingsDatabaseOps } from '@/modules/settings/hooks/useSettingsDatabaseOps'
import { useSettingsStore } from '@/modules/settings/store/settingsStore'
import { ReleaseActionPill } from '@/modules/release/components/ReleaseActionPill'
import { selectAvailableUpdate } from '@/modules/release/lib/availableUpdate'
import { useAppStatusStore } from '@/modules/release/store/appStatusStore'
import { openAppUpdate } from 'vescape-core'

const UNIT_OPTIONS = [
  { label: 'Metric', value: 'metric' },
  { label: 'Imperial', value: 'imperial' },
] as const

const appVersion = Constants.expoConfig?.version ?? DASH

/** What the backup row says and where it leads: sign in, or nothing while it just reports. */
function backupRow(backup: BackupSlot): { hint: string; onPress?: () => void } {
  switch (backup.kind) {
    case 'signedOut':
      return { hint: 'Sign in to back up', onPress: () => router.push(routes.signIn) }
    case 'unavailable':
      return { hint: 'Unavailable' }
    case 'idle':
      return {
        hint: backup.lastUploadAtMs != null ? fmtTimeAgo(backup.lastUploadAtMs) : 'Backed up',
      }
    case 'syncing':
      return { hint: `${fmtCompactCount(backup.current)}/${fmtCompactCount(backup.total)}` }
  }
}

export default function SettingsScreen() {
  const unitSystem = useSettingsStore((state) => state.unitSystem)
  const setSetting = useSettingsStore((state) => state.set)
  const db = useSettingsDatabaseOps()
  const backupState = backupRow(useBackupSlot())
  const navigation = useNavigation()
  const appStatus = useAppStatusStore((state) => state.status)
  const availableUpdate = selectAvailableUpdate(appStatus)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <RawValuesButton
          onPress={() => router.push(routes.settingsRawSettings)}
          accessibilityLabel="Raw settings"
        />
      ),
    })
  }, [navigation])

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.header}>
        <VescapeWordmark width={160} />
        <View style={styles.badges}>
          <Badge label={`v${appVersion}`} variant="outline" icon={IconTag} />
          <Badge
            label={`${Platform.OS === 'ios' ? 'iOS' : 'Android'} ${Platform.Version}`}
            variant="outline"
            icon={Platform.OS === 'ios' ? IconBrandApple : IconBrandAndroid}
          />
          <Badge
            label={db.dbSize != null ? formatBytes(db.dbSize) : DASH}
            variant="outline"
            icon={IconDatabase}
          />
        </View>
        <ReleaseActionPill
          latestVersion={availableUpdate?.latestVersion}
          onPress={availableUpdate ? openAppUpdate : () => router.push(routes.settingsReleaseNotes)}
        />
      </View>

      <SettingsGroup title="Connection">
        <SettingsLink
          icon={IconBluetooth}
          label="Automation"
          hint="Auto start and auto connect"
          onPress={() => router.push(routes.settingsAutomation)}
        />
        <SettingsLink
          icon={IconGauge}
          label="Live telemetry"
          hint="Graphs, update rate, and battery smoothing"
          onPress={() => router.push(routes.settingsLiveTelemetry)}
        />
        <SettingsLink
          icon={IconEngine}
          label="Diagnostics"
          hint="Board warnings and health checks"
          onPress={() => router.push(routes.settingsDiagnostics)}
        />
      </SettingsGroup>

      <SettingsGroup title="Preferences">
        <SettingsLink
          icon={IconRuler}
          label="Units"
          hint={unitSystem === 'metric' ? 'km/h · km · m' : 'mph · mi · ft'}
          right={
            <SelectMenu
              options={UNIT_OPTIONS}
              value={unitSystem}
              onChange={(value) => void setSetting('unitSystem', value)}
              accessibilityLabel="Units"
              testID="unit-system-select"
            />
          }
        />
        <ThemePicker />
        <SettingsLink
          icon={IconMap}
          label="Map"
          hint="Map appearance and satellite imagery"
          onPress={() => router.push(routes.settingsMap)}
        />
        <SettingsLink
          icon={IconVolume}
          label="Sounds"
          hint="Choose and preview a sound pack"
          onPress={() => router.push(routes.settingsSounds)}
        />
      </SettingsGroup>

      <SettingsGroup title="Devices">
        <SettingsLink
          icon={IconDeviceWatch}
          label="Watch"
          hint="Push rate and what the wrist shows"
          onPress={() => router.push(routes.settingsWatch)}
        />
        <SettingsLink
          icon={IconCpu}
          label="Accessories"
          hint="Manage sensors and lights"
          onPress={() => router.push(routes.accessories)}
        />
      </SettingsGroup>

      <SettingsGroup title="Recording">
        <SettingsLink
          icon={IconHome}
          label="Privacy zones"
          hint="Skip recording near saved places"
          onPress={() => router.push(routes.settingsPrivacyZones)}
        />
        <SettingsLink
          icon={IconHistory}
          label="History"
          hint="Ride splitting and ride data filtering"
          onPress={() => router.push(routes.settingsHistory)}
        />
        <SettingsLink
          icon={IconChartLine}
          label="Graphs"
          hint="Hot gradients and color ramps"
          onPress={() => router.push(routes.settingsGraphs)}
        />
      </SettingsGroup>

      <SettingsGroup title="Data">
        <SettingsLink
          icon={IconCloudUpload}
          label="Backup"
          hint={backupState.hint}
          onPress={backupState.onPress}
        />
        <SettingsLink
          icon={IconDatabase}
          label="Storage"
          hint={db.dbSize != null ? formatBytes(db.dbSize) : DASH}
          onPress={() => router.push(routes.settingsDatabase)}
        />
      </SettingsGroup>

      <SettingsGroup title="More">
        <SettingsLink
          icon={IconCode}
          label="Dev tools"
          hint="Diagnostics and local verification"
          onPress={() => router.push(routes.settingsDev)}
        />
        <SettingsLink
          icon={IconScale}
          label="Legal"
          hint="Privacy policy and credits"
          onPress={() => router.push(routes.settingsLegal)}
        />
        <SettingsLink
          icon={IconInfoCircle}
          label="About us"
          hint="The people who built this app"
          onPress={() => router.push(routes.settingsAbout)}
        />
      </SettingsGroup>
    </ScrollView>
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
  header: {
    alignItems: 'flex-start',
    gap: 14,
    paddingHorizontal: 4,
    paddingTop: 8,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
})
