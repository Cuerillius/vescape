import { useRouter } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import IconArrowLeft from '@tabler/icons-react-native/IconArrowLeft'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { theme } from '@/constants/theme'

interface HistoryChartsHeaderProps {
  title?: string
  subtitle?: string
}

/** The charts page's top row, in the ride screen's style: a floating back button and the ride's name bar. */
export function HistoryChartsHeader({ title, subtitle }: HistoryChartsHeaderProps) {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  return (
    <View style={[styles.row, { paddingTop: Math.max(insets.top, 8) }]}>
      <Button
        icon={IconArrowLeft}
        variant="floating"
        size="lg"
        testID="header-back"
        onPress={() => router.back()}
        accessibilityLabel="Back"
      />
      <View style={styles.bar}>
        {title ? (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  bar: {
    flex: 1,
    minWidth: 0,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
  },
  title: {
    color: theme.ui.foreground,
    fontSize: 13,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.ui.mutedForeground,
    fontSize: 11,
    fontWeight: '500',
  },
})
