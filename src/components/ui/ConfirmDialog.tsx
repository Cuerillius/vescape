import { Modal, Pressable, StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { theme } from '@/constants/theme'

interface ConfirmDialogProps {
  visible: boolean
  title: string
  message: string
  confirmLabel?: string
  /** Omit for a notice with a single button, e.g. an error the rider only has to acknowledge. */
  cancelLabel?: string
  /** Tints the confirm button as the error colour: the action cannot be undone. */
  destructive?: boolean
  loading?: boolean
  error?: string | null
  onConfirm: () => void
  onDismiss: () => void
}

/** Centered dialog with a message and one or two buttons. Tapping outside dismisses it. */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel,
  destructive = false,
  loading = false,
  error,
  onConfirm,
  onDismiss,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={loading ? undefined : onDismiss}
    >
      <Pressable style={styles.backdrop} onPress={loading ? undefined : onDismiss}>
        <Pressable style={styles.dialog} onPress={(event) => event.stopPropagation()}>
          <View style={styles.text}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
          <View style={styles.actions}>
            {cancelLabel ? (
              <Button
                variant="outline"
                label={cancelLabel}
                disabled={loading}
                onPress={onDismiss}
              />
            ) : null}
            <Button
              variant={destructive ? 'outline' : 'primary'}
              color={destructive ? theme.status.error.color : undefined}
              label={confirmLabel}
              loading={loading}
              onPress={onConfirm}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: theme.alpha(theme.palette.mono.black, 0.6),
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    gap: 16,
    padding: 16,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
  },
  text: { gap: 6 },
  title: { color: theme.ui.foreground, fontSize: 16, fontWeight: '600' },
  message: { color: theme.ui.mutedForeground, fontSize: 14, lineHeight: 20 },
  error: { color: theme.status.error.text, fontSize: 12 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
})
