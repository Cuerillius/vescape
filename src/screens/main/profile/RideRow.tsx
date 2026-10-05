import { StyleSheet, View } from 'react-native'
import IconChevronRight from '@tabler/icons-react-native/IconChevronRight'

import { Text } from '@/components/base/Text'
import { Card } from '@/components/ui/Card'
import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import { RouteSparkline } from '@/modules/history/components/RouteSparkline'
import type { RoutePoint } from '@/modules/history/lib/routePreview'

const PREVIEW_WIDTH = 74
const PREVIEW_HEIGHT = 52

interface RideRowProps {
  title: string
  subtitle: string
  /** A third, quieter line, e.g. the board the ride was on. */
  details?: string
  routePoints: RoutePoint[]
  /** The ride that is open elsewhere, e.g. the one being replayed: outlined. */
  selected?: boolean
  onPress: () => void
  testID?: string
}

/** One ride as a card: its route, when and how far, and a chevron into the ride. */
export function RideRow({
  title,
  subtitle,
  details,
  routePoints,
  selected = false,
  onPress,
  testID,
}: RideRowProps) {
  const mutedColor = useResolvedColor(theme.ui.mutedForeground)
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={title}
      style={selected ? styles.selected : undefined}
      testID={testID}
    >
      <View style={styles.row}>
        <View style={styles.preview}>
          <RouteSparkline
            points={routePoints}
            width={PREVIEW_WIDTH}
            height={PREVIEW_HEIGHT}
            color={theme.ui.foreground}
            endpoints
          />
        </View>
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
          {details ? (
            <Text style={styles.details} numberOfLines={1}>
              {details}
            </Text>
          ) : null}
        </View>
        <IconChevronRight size={18} color={mutedColor} />
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  selected: {
    borderColor: theme.ui.foreground,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    paddingRight: 14,
  },
  preview: {
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    backgroundColor: theme.ui.muted,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    color: theme.ui.foreground,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '500',
  },
  details: {
    color: theme.ui.faintForeground,
    fontSize: 12,
    fontWeight: '500',
  },
})
