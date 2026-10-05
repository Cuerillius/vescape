import { ScrollView, StyleSheet, View } from 'react-native'
import IconAlertCircle from '@tabler/icons-react-native/IconAlertCircle'
import IconCircleCheck from '@tabler/icons-react-native/IconCircleCheck'
import IconInfoCircle from '@tabler/icons-react-native/IconInfoCircle'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { FadeCardModal } from '@/components/modals/FadeCardModal'
import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

const ICONS = {
  info: IconInfoCircle,
  warning: IconAlertCircle,
  success: IconCircleCheck,
  danger: IconAlertCircle,
}

interface InfoModalProps {
  visible: boolean
  title: string
  message: string
  variant?: keyof typeof ICONS
  dismissLabel?: string
  onDismiss: () => void
}

export function InfoModal({
  visible,
  title,
  message,
  variant = 'info',
  dismissLabel = 'Got it!',
  onDismiss,
}: InfoModalProps) {
  const VariantIcon = ICONS[variant]
  const iconColor = useResolvedColor(theme.ui.foreground)

  return (
    <FadeCardModal
      visible={visible}
      onDismiss={onDismiss}
      scrollable={false}
      cardStyle={styles.card}
      footer={
        <View style={styles.actions}>
          <Button variant="primary" label={dismissLabel} onPress={onDismiss} />
        </View>
      }
    >
      <View style={styles.text}>
        <View style={styles.titleRow}>
          <VariantIcon size={18} color={iconColor} strokeWidth={2} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <ScrollView style={styles.body}>
          <Text style={styles.message} selectable>
            {message}
          </Text>
        </ScrollView>
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
  text: { gap: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, color: theme.ui.foreground, fontSize: 16, fontWeight: '600' },
  body: { maxHeight: 280 },
  message: { color: theme.ui.mutedForeground, fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
})
