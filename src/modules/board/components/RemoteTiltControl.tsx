import { StyleSheet, View } from 'react-native'
import { Text } from '@/components/base/Text'
import { Drawer } from '@/components/ui/Drawer'

import { RemoteTiltPad } from '@/modules/board/components/RemoteTiltPad'
import type { WidgetHeaderProps } from '@/components/widgets/widgetHeader'
import { theme } from '@/constants/theme'
import { useRemoteTiltControl } from '@/modules/board/hooks/useRemoteTiltControl'
import type { GroundClearanceRelease } from 'vescape-core'
import IconDeviceGamepad2 from '@tabler/icons-react-native/IconDeviceGamepad2'

/** Header of the Remote Tilt panel, shared by every entry point that opens it. */
export const REMOTE_TILT_WIDGET: WidgetHeaderProps = {
  icon: IconDeviceGamepad2,
  title: 'Tilt',
  description: 'Adjust board tilt from your phone in real time.',
  accent: theme.palette.sky.color,
}

/**
 * Why the ground-clearance binding is not commanding, in the rider's words.
 *
 * Native decides which of these it is and JS only names it; re-deriving any of these conditions here
 * would be a second definition of "safe to tilt" that could disagree with the one commanding the
 * board. Every reason gets a sentence — a read-only pad sitting at neutral with no explanation is
 * indistinguishable from a broken one.
 */
const RELEASE_REASONS: Record<GroundClearanceRelease, string> = {
  'not-riding': 'Waiting for you to ride. Sensor tilt is off while parked.',
  'no-link': 'Sensor accessory not connected.',
  'not-calibrated': 'Sensor not calibrated for this mounting position.',
  disabled: 'Ground-clearance sensor disabled.',
  stale: 'No sensor readings. Tilt released.',
  'out-of-range': 'Sensor cannot see the ground. Tilt released.',
  'sensor-error': 'Sensor reported an error. Tilt released.',
  'board-untrusted': 'Board link is not trusted. Sensor tilt is blocked.',
  'board-stale': 'Board stopped reporting. Sensor tilt is blocked.',
  contested: 'Two calibrated sensors are enabled. Disable one to use sensor tilt.',
  'board-move': 'Board Move is using the remote input.',
  'manual-tilt': 'Finishing your tilt before the sensor takes over.',
}

/** The Remote Tilt pad, as opened in a widget focus panel. */
export function RemoteTiltBody() {
  const {
    canCommand,
    boardConnected,
    sensorTilt,
    readState,
    blockedMessage,
    setRemoteTilt,
    releaseRemoteTilt,
    lockRemoteTilt,
    stopRemoteTilt,
  } = useRemoteTiltControl()

  const sensorNote = sensorTilt.driving
    ? 'Ground clearance sensor is controlling tilt.'
    : (sensorTilt.release && RELEASE_REASONS[sensorTilt.release]) ||
      'Ground clearance sensor is not commanding tilt.'

  return (
    <>
      <RemoteTiltPad
        // A bound pad is not dimmed: it is showing a live commanded tilt, which is exactly when it
        // needs to be readable.
        disabled={!canCommand && !sensorTilt.bound}
        readOnly={sensorTilt.bound}
        readOnlyLabel={sensorNote}
        connected={boardConnected}
        readState={readState}
        onChange={setRemoteTilt}
        onRelease={releaseRemoteTilt}
        onLock={lockRemoteTilt}
        onCancel={stopRemoteTilt}
      />
      {blockedMessage ? <Text style={styles.remoteTiltDisabled}>{blockedMessage}</Text> : null}
    </>
  )
}

/** The Remote Tilt pad in the shared bottom drawer; entry points only decide when it is open. */
export function RemoteTiltDrawer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Drawer
      visible={visible}
      title={REMOTE_TILT_WIDGET.title}
      description={REMOTE_TILT_WIDGET.description}
      onClose={onClose}
    >
      <View style={styles.drawerBody}>
        <RemoteTiltBody />
      </View>
    </Drawer>
  )
}

const styles = StyleSheet.create({
  drawerBody: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  remoteTiltDisabled: {
    color: theme.ui.mutedForeground,
    fontSize: 12,
  },
})
