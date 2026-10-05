import type { Icon } from '@tabler/icons-react-native'
import { StyleSheet } from 'react-native'

import { Text } from '@/components/base/Text'
import { Card, CardDescription } from '@/components/ui/Card'
import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

interface MessageCardProps {
  icon: Icon
  title: string
  description: string
  /** Error tone for a failed read; neutral for a rider with no rides yet. */
  tone?: 'neutral' | 'error'
}

/** What a list or panel says in place of its content: nothing recorded yet, or the read failed. */
export function MessageCard({
  icon: IconComponent,
  title,
  description,
  tone = 'neutral',
}: MessageCardProps) {
  const error = tone === 'error'
  const iconColor = useResolvedColor(error ? theme.status.error.text : theme.ui.mutedForeground)
  return (
    <Card style={[styles.card, error && styles.errorCard]} testID="message-card">
      <IconComponent size={28} color={iconColor} />
      <Text style={[styles.title, error && { color: theme.status.error.text }]}>{title}</Text>
      <CardDescription numberOfLines={2} style={styles.description}>
        {description}
      </CardDescription>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  errorCard: {
    borderColor: theme.status.error.border,
    backgroundColor: theme.status.error.bg,
  },
  title: {
    color: theme.ui.foreground,
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    textAlign: 'center',
  },
})
