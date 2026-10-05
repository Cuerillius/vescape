import { useEffect, useMemo, useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useShallow } from 'zustand/react/shallow'

import { theme } from '@/constants/theme'
import {
  buildNavigationDiagnosticsViewModel,
  type DiagnosticRow,
} from '@/modules/map/lib/navigationDiagnostics'
import { useNavigationDiagnosticsStore } from '@/modules/map/store/navigationDiagnosticsStore'
import {
  SettingsDescription,
  SettingsGroup,
  SettingsValue,
} from '@/modules/settings/components/SettingsGroup'
import { useSettingsStore } from '@/modules/settings/store/settingsStore'

export default function NavigationDiagnosticScreen() {
  const mapOrientationMode = useSettingsStore((s) => s.mapOrientationMode)
  const mapStyleKey = useSettingsStore((s) => s.mapStyleKey)
  const [now, setNow] = useState(() => Date.now())
  const diagnostics = useNavigationDiagnosticsStore(
    useShallow((s) => ({
      gpsFix: s.gpsFix,
      retainedGpsBearingDeg: s.retainedGpsBearingDeg,
      retainedGpsBearingAt: s.retainedGpsBearingAt,
      phoneHeadingDeg: s.phoneHeadingDeg,
      phoneHeadingStatus: s.phoneHeadingStatus,
      activeDisplayHeadingDeg: s.activeDisplayHeadingDeg,
      cameraHeadingDeg: s.cameraHeadingDeg,
      fallbackReason: s.fallbackReason,
      updatedAt: s.updatedAt,
    })),
  )
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1_000)
    return () => clearInterval(timer)
  }, [])

  const vm = useMemo(
    () =>
      buildNavigationDiagnosticsViewModel({
        mapOrientationMode,
        mapStyleKey,
        ...diagnostics,
        now,
      }),
    [diagnostics, mapOrientationMode, mapStyleKey, now],
  )

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <SettingsDescription>Live map heading, GPS, and fallback evidence.</SettingsDescription>
        <DiagnosticSection
          title="Navigation"
          rows={[
            { label: 'Selected mode', value: vm.selectedMode },
            { label: 'Map style', value: vm.mapStyle },
            { label: 'Heading-source readiness', value: vm.readiness },
            { label: 'Fallback reason', value: vm.fallbackReason },
            { label: 'Diagnostics age', value: vm.updatedAge },
          ]}
        />
        <DiagnosticSection title="GPS" rows={vm.gpsRows} />
        <DiagnosticSection title="Heading" rows={vm.headingRows} />
        <DiagnosticSection title="Board heading reserved" rows={vm.boardRows} />
      </ScrollView>
    </SafeAreaView>
  )
}

function DiagnosticSection({ title, rows }: { title: string; rows: DiagnosticRow[] }) {
  return (
    <SettingsGroup title={title}>
      {rows.map((row) => (
        <SettingsValue key={row.label} label={row.label} value={row.value} />
      ))}
    </SettingsGroup>
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
