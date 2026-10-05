import { useState } from 'react'
import { Modal, Pressable, View, StyleSheet } from 'react-native'
import { Text } from '@/components/base/Text'
import { theme } from '@/constants/theme'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface TextPromptModalContentProps {
  title: string
  placeholder?: string
  initialValue: string
  confirmLabel: string
  /** Allow confirming with an empty value, for fields that can be cleared (e.g. optional names). */
  allowEmpty?: boolean
  onConfirm: (value: string) => void
  onDismiss: () => void
  loading?: boolean
  error?: string | null
}

function TextPromptModalContent({
  title,
  placeholder,
  initialValue,
  confirmLabel,
  allowEmpty,
  onConfirm,
  onDismiss,
  loading = false,
  error,
}: TextPromptModalContentProps) {
  const [text, setText] = useState(initialValue)
  return (
    <Pressable style={styles.modalBackdrop} onPress={loading ? undefined : onDismiss}>
      <Pressable style={styles.promptModal} onPress={(e) => e.stopPropagation()}>
        <Text style={styles.promptTitle}>{title}</Text>
        <Input
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          accessibilityLabel={title}
          autoFocus
          selectTextOnFocus
          editable={!loading}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.promptActions}>
          <Button variant="outline" label="Cancel" disabled={loading} onPress={onDismiss} />
          <Button
            variant="primary"
            label={confirmLabel}
            disabled={loading}
            onPress={() => (allowEmpty || text.trim()) && onConfirm(text.trim())}
          />
        </View>
      </Pressable>
    </Pressable>
  )
}

interface TextPromptModalProps {
  visible: boolean
  title: string
  placeholder?: string
  initialValue: string
  confirmLabel: string
  allowEmpty?: boolean
  onConfirm: (value: string) => void
  onDismiss: () => void
  loading?: boolean
  error?: string | null
}

export function TextPromptModal({
  visible,
  title,
  placeholder,
  initialValue,
  confirmLabel,
  allowEmpty,
  onConfirm,
  onDismiss,
  loading,
  error,
}: TextPromptModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={loading ? undefined : onDismiss}
    >
      {visible ? (
        <TextPromptModalContent
          title={title}
          placeholder={placeholder}
          initialValue={initialValue}
          confirmLabel={confirmLabel}
          allowEmpty={allowEmpty}
          onConfirm={onConfirm}
          onDismiss={onDismiss}
          loading={loading}
          error={error}
        />
      ) : null}
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.alpha(theme.palette.mono.black, 0.6),
    padding: 24,
  },
  promptModal: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: theme.ui.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.ui.border,
    padding: 16,
    gap: 16,
  },
  promptTitle: { color: theme.ui.foreground, fontSize: 16, fontWeight: '600' },
  error: { color: theme.status.error.text, fontSize: 12 },
  promptActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
})
