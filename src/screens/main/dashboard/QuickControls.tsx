import { useCallback, useState, type ComponentType, type ReactNode } from 'react'
import { router } from 'expo-router'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import IconAngle from '@tabler/icons-react-native/IconAngle'
import IconArrowsUpDown from '@tabler/icons-react-native/IconArrowsUpDown'
import IconBrightnessUp from '@tabler/icons-react-native/IconBrightnessUp'
import IconBrightnessUpFilled from '@tabler/icons-react-native/IconBrightnessUpFilled'
import IconBulb from '@tabler/icons-react-native/IconBulb'
import IconBulbFilled from '@tabler/icons-react-native/IconBulbFilled'
import IconGavel from '@tabler/icons-react-native/IconGavel'
import type { Icon as TablerIcon } from '@tabler/icons-react-native'

import { Text } from '@/components/base/Text'
import { InfoModal } from '@/components/modals/InfoModal'
import { Button } from '@/components/ui/Button'
import { theme } from '@/constants/theme'
import { BoardMoveDrawer } from '@/modules/board/components/BoardMoveControl'
import { RemoteTiltDrawer } from '@/modules/board/components/RemoteTiltControl'
import { useBoardLights } from '@/modules/board/hooks/useBoardLights'
import { useBleStore } from '@/modules/board/store/bleStore'
import { useFirmwareCommandsReady } from '@/modules/board/hooks/useFirmwareCommandsReady'
import { routes } from '@/navigation/routes'
import { GpsStatusPill } from '@/modules/location/components/GpsStatusPill'
import { useGpsStatusBadge } from '@/modules/location/hooks/useGpsStatusBadge'
import { useLegalModeToggle } from '@/screens/main/useLegalModeToggle'
import type { GpsStatusBadge } from '@/modules/location/lib/gpsStatusBadge'

/** One bare icon in the quick-control row; bright while its state is on. */
export function QuickControl({
  icon,
  label,
  active = false,
  disabled = false,
  onPress,
  testID,
}: {
  icon: TablerIcon
  label: string
  active?: boolean
  disabled?: boolean
  onPress: () => void
  testID?: string
}) {
  return (
    <Button
      icon={icon}
      variant="ghost"
      accessibilityLabel={label}
      color={active ? theme.ui.foreground : theme.ui.mutedForeground}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
    />
  )
}

/**
 * The quick-control row: the GPS status pill at the left (empty while GPS is healthy), the board's
 * controls at the right. Presentational — `QuickControls` fills it from the live GPS state, and the
 * showcase fills it with fixtures.
 */
export function QuickControlsRow({
  gpsBadge,
  onPressGps,
  error,
  style,
  children,
}: {
  gpsBadge?: GpsStatusBadge | null
  onPressGps?: () => void
  error?: string | null
  style?: StyleProp<ViewStyle>
  children: ReactNode
}) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <View style={styles.status}>
          {gpsBadge ? (
            <GpsStatusPill badge={gpsBadge} style={styles.pillRow} onPress={onPressGps} />
          ) : null}
        </View>
        {children}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

/** Opens a board control's bottom drawer; there is nothing to control without a board, so it is disabled until one connects. */
function DrawerControl({
  icon,
  label,
  connected,
  drawer: BoardDrawerContent,
  testID,
}: {
  icon: TablerIcon
  label: string
  connected: boolean
  drawer: ComponentType<{ visible: boolean; onClose: () => void }>
  testID: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <QuickControl
        icon={icon}
        label={label}
        disabled={!connected}
        onPress={() => setOpen(true)}
        testID={testID}
      />
      <BoardDrawerContent visible={open && connected} onClose={() => setOpen(false)} />
    </>
  )
}

/**
 * One-tap board controls on the Ride view, as a compact icon row. Tilt and Move open bottom
 * drawers; the two light switches toggle in place and wait for a trusted
 * board link, and Legal Mode toggles in place for the active board. The GPS status pill sits at
 * the left of the row.
 */
export function QuickControls() {
  const gpsBadge = useGpsStatusBadge()
  const lights = useBoardLights()
  // The message outlives `visible` so the modal keeps its text through the exit animation.
  const [legalError, setLegalError] = useState({ message: '', visible: false })
  const showLegalError = useCallback(
    (message: string) => setLegalError({ message, visible: true }),
    [],
  )
  const legal = useLegalModeToggle(showLegalError)
  const ready = useFirmwareCommandsReady()
  const lightsOn = lights.enabled ?? false
  const headlightsOn = lights.headlightsEnabled ?? false
  const connected = useBleStore((s) => s.status === 'connected')

  return (
    <QuickControlsRow
      gpsBadge={gpsBadge}
      onPressGps={() => router.push(routes.settingsNavigationDiagnostic)}
      error={lights.error}
      style={styles.pulledUp}
    >
      <DrawerControl
        icon={IconAngle}
        label="Tilt"
        connected={connected}
        drawer={RemoteTiltDrawer}
        testID="quick-control-tilt"
      />
      <DrawerControl
        icon={IconArrowsUpDown}
        label="Move"
        connected={connected}
        drawer={BoardMoveDrawer}
        testID="quick-control-move"
      />
      <QuickControl
        icon={lightsOn ? IconBulbFilled : IconBulb}
        label="Lights"
        active={lightsOn}
        disabled={!ready || lights.enabled == null}
        onPress={() => lights.setLights(!lightsOn)}
        testID="quick-control-lights"
      />
      <QuickControl
        icon={headlightsOn ? IconBrightnessUpFilled : IconBrightnessUp}
        label="Headlight"
        active={headlightsOn}
        disabled={!ready || lights.headlightsEnabled == null}
        onPress={() => lights.setHeadlights(!headlightsOn)}
        testID="quick-control-headlight"
      />
      <QuickControl
        icon={IconGavel}
        label="Legal Mode"
        active={legal.enabled}
        disabled={!legal.available}
        onPress={() => legal.toggle(!legal.enabled)}
        testID="quick-control-legal"
      />
      <InfoModal
        visible={legalError.visible}
        title="Legal Mode unavailable"
        message={legalError.message}
        variant="danger"
        dismissLabel="Close"
        onDismiss={() => setLegalError((current) => ({ ...current, visible: false }))}
      />
    </QuickControlsRow>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  // Pulled up against the battery card, past the content gap.
  pulledUp: {
    marginTop: -12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  status: {
    flex: 1,
  },
  pillRow: {
    alignItems: 'flex-start',
  },
  error: {
    color: theme.status.error.text,
    fontSize: 12,
  },
})
