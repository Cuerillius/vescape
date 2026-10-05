import { StyleSheet, View } from 'react-native'
import IconHome from '@tabler/icons-react-native/IconHome'
import IconMap from '@tabler/icons-react-native/IconMap'
import IconUser from '@tabler/icons-react-native/IconUser'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { IconTab } from '@/components/controls/IconTab'
import { OnewheelIcon } from '@/components/icons/OnewheelIcon'
import { theme } from '@/constants/theme'
import { severityStatus } from '@/modules/board/constants/boardWarnings'
import { useBoardIssues } from '@/modules/board/hooks/useBoardIssues'
import { ConnectButton } from '@/modules/board/components/ConnectButton'
import type { RecordingState } from '@/modules/board/lib/boardConnection'
import type { Board } from '@/modules/board/store/boardStore'

const TAB_BAR_CONTENT_HEIGHT = 72

export type MainTab = 'ride' | 'map' | 'board' | 'profile'

/** Total height the tab bar takes from the bottom of the screen, safe area included. */
export function useMainTabBarHeight(): number {
  const insets = useSafeAreaInsets()
  return TAB_BAR_CONTENT_HEIGHT + Math.max(insets.bottom, 8)
}

interface MainTabBarProps {
  active: MainTab
  /** The Board tab lists the saved boards until one is connected, then shows that board. */
  boardLabel: 'Board' | 'Boards'
  onSelect: (tab: MainTab) => void
  activeBoard: Board | undefined
  bleStatus: string
  recordingState?: RecordingState
  onConnect: () => void
  onDisconnect: () => void
  onEndRide: () => void
  onStartRecording: () => void
}

/**
 * The main screen's bottom bar: Home (the Ride dashboard), Board, the centre button that connects
 * the board, Map, and Profile.
 */
export function MainTabBar({
  active,
  boardLabel,
  onSelect,
  activeBoard,
  bleStatus,
  recordingState,
  onConnect,
  onDisconnect,
  onEndRide,
  onStartRecording,
}: MainTabBarProps) {
  const height = useMainTabBarHeight()
  const insets = useSafeAreaInsets()
  const issues = useBoardIssues(activeBoard?.id ?? null, activeBoard?.id ?? null)
  const warned = issues.warningsEnabled && issues.warningCount > 0
  const faulted = issues.faultsEnabled && issues.faultCount > 0
  // Faults are orange; a critical warning outranks them in red.
  const boardDot =
    warned && issues.severity === 'critical'
      ? severityStatus('critical').color
      : warned || faulted
        ? severityStatus('warn').color
        : undefined

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.bar, { height, paddingBottom: Math.max(insets.bottom, 8) }]}
    >
      <IconTab
        icon={IconHome}
        label="Home"
        active={active === 'ride'}
        onPress={() => onSelect('ride')}
        testID="main-tab-ride"
      />
      <IconTab
        icon={OnewheelIcon}
        label={boardLabel}
        active={active === 'board'}
        dotColor={boardDot}
        onPress={() => onSelect('board')}
        testID="main-tab-board"
      />
      <ConnectButton
        activeBoard={activeBoard}
        bleStatus={bleStatus}
        recordingState={recordingState}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
        onEndRide={onEndRide}
        onStartRecording={onStartRecording}
      />
      <IconTab
        icon={IconMap}
        label="Map"
        active={active === 'map'}
        onPress={() => onSelect('map')}
        testID="main-tab-map"
      />
      <IconTab
        icon={IconUser}
        label="Profile"
        active={active === 'profile'}
        onPress={() => onSelect('profile')}
        testID="main-tab-profile"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 60,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingHorizontal: 4,
    backgroundColor: theme.ui.background,
    borderTopWidth: 1,
    borderTopColor: theme.ui.border,
  },
})
