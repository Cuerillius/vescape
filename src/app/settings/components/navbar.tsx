import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconHome from '@tabler/icons-react-native/IconHome'
import IconMap from '@tabler/icons-react-native/IconMap'
import IconNavigation from '@tabler/icons-react-native/IconNavigation'
import type { BoardPhase } from 'vescape-core'

import { Text } from '@/components/base/Text'
import { IconTab } from '@/components/controls/IconTab'
import { OnewheelIcon } from '@/components/icons/OnewheelIcon'
import { NewComponentHero } from '@/components/dev/NewComponentHero'
import { NewShowcaseCard } from '@/components/dev/NewShowcaseCard'
import { NewChipRow } from '@/components/dev/NewShowcaseControls'
import { theme } from '@/constants/theme'
import { DEFAULT_BATTERY_CONFIG } from '@/modules/battery/lib'
import { ConnectButton, type RecordingState } from '@/modules/board/components/ConnectButton'
import type { Board } from '@/modules/board/store/boardStore'

const PREVIEW_BOARD: Board = {
  id: 'preview-board',
  name: 'Preview board',
  description: null,
  createdAt: Date.now(),
  deletedAt: null,
  batteryConfig: DEFAULT_BATTERY_CONFIG,
  topSpeedKmh: 45,
  alertPreset: null,
  alertPresetsOnboarded: true,
  legalMode: { enabled: false },
  link: null,
}

const CONNECT_STATES = [
  'no board',
  'idle',
  'connecting',
  'discovering',
  'subscribing',
  'waiting_for_telemetry',
  'connected',
  'stale',
  'reconnecting',
  'rescanning',
  'disconnecting',
  'error',
] as const
type ConnectShowcaseState = (typeof CONNECT_STATES)[number]

// Only meaningful while the link is live: recording auto-starts with the connection, pause/resume
// are automatic (idle-pause) and not user-triggered. "stopped" previews the explicit start badge
// without having to end a real ride first.
const CONNECTED_RECORDING_STATES = ['recording', 'paused', 'stopped'] as const
type ConnectedRecordingShowcaseState = (typeof CONNECTED_RECORDING_STATES)[number]

function IconTabShowcase() {
  const [active, setActive] = useState<'ride' | 'map' | 'board'>('ride')
  return (
    <NewShowcaseCard name="IconTab">
      <View style={styles.tabRow}>
        <IconTab
          icon={IconHome}
          label="Home"
          active={active === 'ride'}
          onPress={() => setActive('ride')}
        />
        <IconTab
          icon={IconMap}
          label="Map"
          active={active === 'map'}
          onPress={() => setActive('map')}
        />
        <IconTab
          icon={OnewheelIcon}
          label="Board"
          active={active === 'board'}
          onPress={() => setActive('board')}
        />
      </View>
    </NewShowcaseCard>
  )
}

function ConnectButtonShowcase() {
  const [state, setState] = useState<ConnectShowcaseState>('no board')
  const [recordingState, setRecordingState] = useState<ConnectedRecordingShowcaseState>('recording')
  const activeBoard = state === 'no board' ? undefined : PREVIEW_BOARD
  const bleStatus: BoardPhase = state === 'no board' ? 'idle' : state
  const linkLive = state === 'connected' || state === 'stale'
  const resolvedRecordingState: RecordingState | undefined =
    linkLive && recordingState !== 'stopped' ? recordingState : undefined

  return (
    <NewShowcaseCard
      name="ConnectButton"
      controls={
        <>
          <NewChipRow
            label="state"
            options={[...CONNECT_STATES]}
            selected={state}
            onSelect={(v) => setState(v as ConnectShowcaseState)}
          />
          {linkLive ? (
            <NewChipRow
              label="recording"
              options={[...CONNECTED_RECORDING_STATES]}
              selected={recordingState}
              onSelect={(v) => setRecordingState(v as ConnectedRecordingShowcaseState)}
            />
          ) : null}
        </>
      }
    >
      <Text style={styles.caption}>
        The disc is always the connection. While the link is live, a badge on its corner carries the
        ride: a pulsing red dot while recording, a pause glyph when idle-paused (both automatic) —
        tap it to end the ride after a confirmation. After a ride ends with the board still linked,
        the badge becomes a hollow record dot; tap it to start the next one.
      </Text>
      <View style={styles.connectStage}>
        <ConnectButton
          activeBoard={activeBoard}
          bleStatus={bleStatus}
          recordingState={resolvedRecordingState}
          onConnect={() => setState('connected')}
          onDisconnect={() => setState('idle')}
          onEndRide={() => setRecordingState('stopped')}
          onStartRecording={
            linkLive && !resolvedRecordingState ? () => setRecordingState('recording') : undefined
          }
        />
      </View>
    </NewShowcaseCard>
  )
}

export default function NewComponentNavbarPage() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <NewComponentHero
          icon={IconNavigation}
          description="IconTab and ConnectButton, pulled out of MainTabBar — connecting, every BoardPhase, and the recording badge pinned to it while the link is live."
        />
        <IconTabShowcase />
        <ConnectButtonShowcase />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  caption: { color: theme.ui.mutedForeground, fontSize: 13 },
  tabRow: { flexDirection: 'row' },
  connectStage: { height: 140, alignItems: 'center', justifyContent: 'flex-end', marginTop: 10 },
})
