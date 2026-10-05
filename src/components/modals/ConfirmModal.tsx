import { StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { FadeCardModal } from '@/components/modals/FadeCardModal'
import { theme } from '@/constants/theme'

interface ConfirmModalProps {
  visible: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  loading?: boolean
  error?: string | null
  onConfirm: () => Promise<void> | void
  onCancel: () => void
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <FadeCardModal
      visible={visible}
      onDismiss={onCancel}
      dismissDisabled={loading}
      scrollable={false}
      cardStyle={styles.card}
      footer={
        <View style={styles.actions}>
          <Button variant="outline" label={cancelLabel} disabled={loading} onPress={onCancel} />
          <Button
            variant={destructive ? 'outline' : 'primary'}
            color={destructive ? theme.status.error.color : undefined}
            label={confirmLabel}
            loading={loading}
            onPress={() => void onConfirm()}
          />
        </View>
      }
    >
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </FadeCardModal>
  )
}

const styles = StyleSheet.create({
  card: {
    maxWidth: 360,
    padding: 16,
    gap: 16,
    borderRadius: theme.radius.lg,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
  },
  text: { gap: 6 },
  title: { color: theme.ui.foreground, fontSize: 16, fontWeight: '600' },
  message: { color: theme.ui.mutedForeground, fontSize: 14, lineHeight: 20 },
  error: { color: theme.status.error.text, fontSize: 12 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
})
