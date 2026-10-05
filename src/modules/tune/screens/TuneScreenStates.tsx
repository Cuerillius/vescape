import { ActivityIndicator, StyleSheet, View } from 'react-native'
import IconAdjustmentsHorizontal from '@tabler/icons-react-native/IconAdjustmentsHorizontal'
import IconBluetoothOff from '@tabler/icons-react-native/IconBluetoothOff'

import { Button } from '@/components/base/Button'
import { Placeholder } from '@/components/base/Placeholder'
import { Text } from '@/components/base/Text'
import { theme } from '@/constants/theme'
import type { useTuneScreenData } from '@/modules/tune/hooks/useTuneScreenData'
import IconAlertCircle from '@tabler/icons-react-native/IconAlertCircle'
import IconRefresh from '@tabler/icons-react-native/IconRefresh'

type TuneScreenData = ReturnType<typeof useTuneScreenData>

/** What the screen shows before there is a profile to edit: no board, loading, empty, or failed. */
export function TuneScreenStates({
  hasTuneView,
  boardsLoaded,
  selectedBoardId,
  profileState,
  firmwareCommandBlockReason,
  loadOnline,
  loadOffline,
}: {
  hasTuneView: boolean
  boardsLoaded: TuneScreenData['boardsLoaded']
  selectedBoardId: TuneScreenData['selectedBoardId']
  profileState: TuneScreenData['profileState']
  firmwareCommandBlockReason: TuneScreenData['firmwareCommandBlockReason']
  loadOnline: TuneScreenData['loadOnline']
  loadOffline: TuneScreenData['loadOffline']
}) {
  return (
    <>
      {!selectedBoardId && boardsLoaded && !hasTuneView ? (
        <Placeholder
          icon={IconBluetoothOff}
          title="No board selected"
          description="Select a board to edit its saved Tune Profile"
        />
      ) : null}

      {profileState.phase === 'loading' && !hasTuneView && selectedBoardId ? (
        <View style={styles.mainState}>
          <ActivityIndicator color={theme.palette.sky.color} />
          <Text style={styles.stateText}>Loading saved tune profile...</Text>
        </View>
      ) : null}

      {profileState.phase === 'empty' ? (
        <View style={styles.mainState}>
          <Placeholder
            icon={IconAdjustmentsHorizontal}
            title="No tunes yet"
            description={
              firmwareCommandBlockReason ??
              'Connect to your board and create your first tune from the dashboard'
            }
          />
        </View>
      ) : null}

      {profileState.phase === 'error' && !hasTuneView ? (
        <View style={styles.mainState}>
          <IconAlertCircle size={28} color={theme.status.error.text} />
          <Text selectable style={styles.errorText}>
            {profileState.error}
          </Text>
          <Button
            label="Retry"
            icon={IconRefresh}
            onPress={() => {
              if (profileState.retry === 'online') {
                void loadOnline()
              } else if (selectedBoardId) {
                void loadOffline(selectedBoardId)
              }
            }}
          />
        </View>
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  mainState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  stateText: {
    color: theme.ui.mutedForeground,
    fontSize: 15,
  },
  errorText: {
    color: theme.status.error.text,
    fontSize: 15,
    textAlign: 'center',
  },
})
