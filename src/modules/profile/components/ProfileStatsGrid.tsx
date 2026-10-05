import { StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { Card } from '@/components/ui/Card'
import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import type { ProfileStatItem } from '@/modules/profile/hooks/useProfileStatItems'

interface ProfileStatsGridProps {
  items: ProfileStatItem[]
  testID?: string
}

/** Riding totals as small cards, two per row: a caption with its glyph over the figure. */
export function ProfileStatsGrid({ items, testID }: ProfileStatsGridProps) {
  const mutedColor = useResolvedColor(theme.ui.mutedForeground)
  return (
    <View style={styles.grid} testID={testID}>
      {items.map((item) => {
        const ItemIcon = item.icon
        return (
          <Card
            key={item.key}
            style={styles.tile}
            accessibilityLabel={`${item.label}, ${item.value}`}
          >
            <View style={styles.caption}>
              <ItemIcon size={15} color={mutedColor} />
              <Text style={styles.label} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
            <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
              {item.value}
            </Text>
          </Card>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  // Two per row: half the width less half the gap.
  tile: {
    width: '48.5%',
    flexGrow: 1,
    padding: 14,
    gap: 8,
  },
  caption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    flexShrink: 1,
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '500',
  },
  value: {
    color: theme.ui.foreground,
    fontFamily: theme.mono('700'),
    fontSize: 24,
    letterSpacing: -0.4,
  },
})
