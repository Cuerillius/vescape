import { StyleSheet, View } from 'react-native'
import { Text } from '@/components/base/Text'
import IconUpload from '@tabler/icons-react-native/IconUpload'

import { Button } from '@/components/ui/Button'

import type { SyncBarState } from '@/modules/tune/lib/syncBarState'
import { theme } from '@/constants/theme'
import IconRefresh from '@tabler/icons-react-native/IconRefresh'

const SUBTLE_TEXT: Partial<Record<SyncBarState['variant'], string>> = {
  loading_config: 'Checking board…',
  saving: 'Saving…',
  syncing: 'Syncing to board…',
  up_to_date: 'Identical to board',
  connect_to_sync: 'Connect to board to sync',
}

interface TuneSyncBarProps {
  state: SyncBarState | null
  onRetrySave: () => void
  onSync: () => void
  onRetryConfig: () => void
}

export function TuneSyncBar({ state, onRetrySave, onSync, onRetryConfig }: TuneSyncBarProps) {
  if (!state) return null

  if (state.variant === 'sync_with_board') {
    return (
      <View style={styles.wrapper}>
        <View style={styles.applyRow}>
          <Text style={styles.applyText} numberOfLines={2}>
            Tune is different from board
          </Text>
          <Button
            variant="primary"
            size="lg"
            label="Apply"
            icon={IconUpload}
            onPress={onSync}
            testID="tune-apply"
          />
        </View>
      </View>
    )
  }

  const subtleText = SUBTLE_TEXT[state.variant]
  if (subtleText) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.subtle}>{subtleText}</Text>
      </View>
    )
  }

  if (state.variant === 'save_failed' || state.variant === 'config_error') {
    const isSave = state.variant === 'save_failed'
    return (
      <View style={styles.wrapper}>
        <View style={styles.applyRow}>
          <Text style={styles.applyText} numberOfLines={2}>
            {isSave
              ? `Couldn't save ${state.dirtyCount} change${state.dirtyCount === 1 ? '' : 's'}`
              : 'Board config not read'}
          </Text>
          <Button
            variant="primary"
            size="lg"
            label="Retry"
            icon={IconRefresh}
            onPress={isSave ? onRetrySave : onRetryConfig}
          />
        </View>
      </View>
    )
  }

  return null
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: theme.ui.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.ui.border,
  },
  applyRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  applyText: {
    flex: 1,
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '600',
  },
  subtle: {
    color: theme.ui.mutedForeground,
    fontSize: 12,
    fontWeight: '600',
  },
})
