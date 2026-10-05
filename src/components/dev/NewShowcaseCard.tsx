import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { theme } from '@/constants/theme'

interface NewShowcaseCardProps {
  name: string
  children: ReactNode
  controls?: ReactNode
}

/** `ShowcaseCard`, restyled on the zinc `theme.ui` tokens for the rebuilt-kit showcase. */
export function NewShowcaseCard({ name, children, controls }: NewShowcaseCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{name}</Text>
      <View style={styles.preview}>{children}</View>
      {controls ? <View style={styles.controls}>{controls}</View> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.ui.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.ui.border,
    overflow: 'hidden',
  },
  name: {
    color: theme.ui.mutedForeground,
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'monospace',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  preview: {
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  controls: {
    borderTopWidth: 1,
    borderTopColor: theme.ui.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
})
