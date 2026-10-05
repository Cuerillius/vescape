import { router } from 'expo-router'
import IconBluetooth from '@tabler/icons-react-native/IconBluetooth'
import IconBluetoothConnected from '@tabler/icons-react-native/IconBluetoothConnected'
import IconBluetoothX from '@tabler/icons-react-native/IconBluetoothX'
import IconPlus from '@tabler/icons-react-native/IconPlus'
import type { BoardPhase } from 'vescape-core'

import { RaisedActionButton } from '@/components/controls/RaisedActionButton'
import { theme } from '@/constants/theme'
import { RecordBadge } from '@/modules/board/components/RecordBadge'
import type { RecordingState } from '@/modules/board/lib/boardConnection'
import type { Board } from '@/modules/board/store/boardStore'
import { routes } from '@/navigation/routes'

export type { RecordingState } from '@/modules/board/lib/boardConnection'

type ConnectState = 'noBoard' | BoardPhase

/** Phases where a connection attempt (or teardown) is in flight; the rider can cancel it. */
const IN_PROGRESS_LABELS: Partial<Record<BoardPhase, string>> = {
  connecting: 'Connecting…',
  discovering: 'Discovering…',
  subscribing: 'Subscribing…',
  waiting_for_telemetry: 'Waiting for data…',
  reconnecting: 'Reconnecting…',
  rescanning: 'Rescanning…',
  disconnecting: 'Disconnecting…',
}

function connectState(activeBoard: Board | undefined, bleStatus: string): ConnectState {
  return activeBoard ? (bleStatus as BoardPhase) : 'noBoard'
}

interface ConnectButtonProps {
  activeBoard: Board | undefined
  bleStatus: string
  /** Only meaningful while connected. With the `autoRecording` setting on it is set the instant the
   * board is live; with it off it stays unset until the rider starts a ride from the badge. */
  recordingState?: RecordingState
  onConnect: () => void
  onDisconnect: () => void
  /** Fired once the rider confirms ending the ride. */
  onEndRide?: () => void
  /** Connected but no `recordingState` — a prior ride was explicitly ended while the board stayed
   * linked. Lets the rider manually start a new one instead of waiting for the next (re)connect. */
  onStartRecording?: () => void
}

/**
 * The raised centre button of the main tab bar. Its face is the connection: an outlined Bluetooth
 * glyph to connect, a filled disc with the board's name while live. Every `BoardPhase` collapses
 * into one of a handful of looks — the in-progress phases (connecting, discovering, subscribing,
 * waiting for telemetry, reconnecting, rescanning, disconnecting) all read as "something's
 * happening, nothing to do but wait or cancel" and share one outline treatment with a spinner in
 * place of the icon; only `error` gets color, everything else stays on the zinc tokens.
 *
 * The disc is only ever the connection, so the rider can always disconnect. While the link is live
 * the ride lives in a `RecordBadge` pinned to the disc's corner: recording status, tap to end the
 * ride behind a confirmation, and an explicit start once a ride was ended with the board still linked.
 */
export function ConnectButton({
  activeBoard,
  bleStatus,
  recordingState,
  onConnect,
  onDisconnect,
  onEndRide,
  onStartRecording,
}: ConnectButtonProps) {
  const state = connectState(activeBoard, bleStatus)
  const recordBadge = (
    <RecordBadge
      recordingState={recordingState}
      onEndRide={onEndRide}
      onStartRecording={onStartRecording}
    />
  )

  if (state === 'noBoard') {
    return (
      <RaisedActionButton
        icon={IconPlus}
        label="Add board"
        accessibilityLabel="Add a board"
        onPress={() => router.push(routes.addBoard)}
        testID="main-tab-connect"
      />
    )
  }

  if (state === 'connected') {
    const label = activeBoard?.name ?? 'Connect'
    return (
      <RaisedActionButton
        icon={IconBluetoothConnected}
        label={label}
        accessibilityLabel={`Disconnect ${label}`}
        active
        onPress={onDisconnect}
        badge={recordBadge}
        testID="main-tab-connect"
      />
    )
  }

  if (state === 'stale') {
    return (
      <RaisedActionButton
        icon={IconBluetoothConnected}
        label="Weak signal"
        accessibilityLabel="Disconnect — weak signal"
        onPress={onDisconnect}
        badge={recordBadge}
        testID="main-tab-connect"
      />
    )
  }

  if (state === 'error') {
    return (
      <RaisedActionButton
        icon={IconBluetoothX}
        label="Connection failed"
        accessibilityLabel="Retry connecting"
        accentColor={theme.status.error.color}
        onPress={onConnect}
        testID="main-tab-connect"
      />
    )
  }

  const inProgressLabel = IN_PROGRESS_LABELS[state]
  if (inProgressLabel) {
    return (
      <RaisedActionButton
        icon={IconBluetooth}
        label={inProgressLabel}
        accessibilityLabel={
          state === 'disconnecting' ? 'Disconnecting' : `Cancel ${state.replaceAll('_', ' ')}`
        }
        loading
        onPress={onDisconnect}
        testID="main-tab-connect"
      />
    )
  }

  // 'idle'. With auto-connect on, native moves out of idle on its own at launch, so an idle board
  // here is one the rider disconnected (or that auto-connect skipped): the plain Connect button.
  return (
    <RaisedActionButton
      icon={IconBluetooth}
      label="Connect"
      accessibilityLabel={`Connect ${activeBoard?.name ?? ''}`}
      onPress={onConnect}
      testID="main-tab-connect"
    />
  )
}
