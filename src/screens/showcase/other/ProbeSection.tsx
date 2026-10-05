import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { Card } from '@/components/ui/Card'
import { theme } from '@/constants/theme'

/** A captioned card holding one probe's controls. */
export function ProbeSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <Card>
        <View style={styles.body}>{children}</View>
      </Card>
    </View>
  )
}

/** Muted explanatory line inside a probe card. */
export function ProbeHint({ children }: { children: ReactNode }) {
  return <Text style={styles.hint}>{children}</Text>
}

export const probeStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fill: {
    flex: 1,
  },
})

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  title: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  body: {
    padding: 16,
    gap: 12,
  },
  hint: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
})
