import { useState } from 'react'
import { Modal, Pressable, StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { theme } from '@/constants/theme'

interface PromptDialogProps {
  visible: boolean
  title: string
  confirmLabel: string
  initialValue: string
  placeholder?: string
  /** Allow confirming an empty value, for fields that can be cleared. */
  allowEmpty?: boolean
  loading?: boolean
  error?: string | null
  onConfirm: (value: string) => void
  onDismiss: () => void
}

type PromptDialogContentProps = Omit<PromptDialogProps, 'visible'>

function PromptDialogContent({
  title,
  confirmLabel,
  initialValue,
  placeholder,
  allowEmpty = false,
  loading = false,
  error,
  onConfirm,
  onDismiss,
}: PromptDialogContentProps) {
  const [text, setText] = useState(initialValue)
  const trimmed = text.trim()
  const canConfirm = !loading && (allowEmpty || trimmed.length > 0)

  return (
    <Pressable style={styles.backdrop} onPress={loading ? undefined : onDismiss}>
      <Pressable style={styles.dialog} onPress={(event) => event.stopPropagation()}>
        <Text style={styles.title}>{title}</Text>
        <Input
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          accessibilityLabel={title}
          autoFocus
          selectTextOnFocus
          editable={!loading}
          returnKeyType="done"
          onSubmitEditing={() => canConfirm && onConfirm(trimmed)}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.actions}>
          <Button variant="outline" label="Cancel" disabled={loading} onPress={onDismiss} />
          <Button
            variant="primary"
            label={confirmLabel}
            disabled={!canConfirm}
            onPress={() => onConfirm(trimmed)}
          />
        </View>
      </Pressable>
    </Pressable>
  )
}

/** Centered dialog asking for one line of text, e.g. a name. Tapping outside dismisses it. */
export function PromptDialog({ visible, ...props }: PromptDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={props.loading ? undefined : props.onDismiss}
    >
      {visible ? <PromptDialogContent {...props} /> : null}
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
    maxWidth: 420,
    gap: 16,
    padding: 16,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
  },
  title: { color: theme.ui.foreground, fontSize: 16, fontWeight: '600' },
  error: { color: theme.status.error.text, fontSize: 12 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
})
