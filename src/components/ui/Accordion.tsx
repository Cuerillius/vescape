import { useState, type ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import IconChevronDown from '@tabler/icons-react-native/IconChevronDown'
import IconChevronUp from '@tabler/icons-react-native/IconChevronUp'
import type { Icon as TablerIcon } from '@tabler/icons-react-native'

import { Text } from '@/components/base/Text'
import { interaction, theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

export interface AccordionItem {
  key: string
  title: string
  /** Current state at a glance, shown while the row is closed — "Normal", "Peak 85%". */
  summary?: string
  icon?: TablerIcon
  content: ReactNode
  testID?: string
}

interface AccordionProps {
  items: AccordionItem[]
  /** Key of the row open on first render. Defaults to the first row. */
  defaultOpenKey?: string
}

/**
 * Flat list of rows where one is open at a time. Rows sit under hairline rules rather than in
 * cards, so the stack reads as one quiet list and content only takes room when it is wanted.
 */
export function Accordion({ items, defaultOpenKey }: AccordionProps) {
  const [openKey, setOpenKey] = useState<string | null>(defaultOpenKey ?? items[0]?.key ?? null)
  const iconColor = useResolvedColor(theme.ui.foreground)
  const chevronColor = useResolvedColor(theme.ui.mutedForeground)

  return (
    <View>
      {items.map((item) => {
        const open = item.key === openKey
        const Chevron = open ? IconChevronUp : IconChevronDown
        const IconComponent = item.icon
        return (
          <View key={item.key} style={styles.item}>
            <Pressable
              onPress={() => setOpenKey(open ? null : item.key)}
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              android_ripple={interaction.ripple}
              style={styles.row}
              testID={item.testID}
            >
              {IconComponent ? <IconComponent size={18} color={iconColor} strokeWidth={2} /> : null}
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              {item.summary && !open ? (
                <Text style={styles.summary} numberOfLines={1}>
                  {item.summary}
                </Text>
              ) : null}
              <Chevron size={16} color={chevronColor} strokeWidth={2.5} />
            </Pressable>
            {open ? <View style={styles.body}>{item.content}</View> : null}
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  item: {
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    borderTopColor: theme.ui.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  title: {
    flex: 1,
    color: theme.ui.foreground,
    fontSize: 15,
    fontWeight: '600',
  },
  summary: {
    flexShrink: 1,
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '500',
  },
  body: {
    paddingBottom: 16,
    gap: 16,
  },
})
