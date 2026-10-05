import React from 'react'
import { StyleSheet, View } from 'react-native'
import IconChevronRight from '@tabler/icons-react-native/IconChevronRight'

import { Text } from '@/components/base/Text'
import { Card, CardDescription } from '@/components/ui/Card'
import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

interface Props {
  id: string
  name: string
  rssi: number
  onPress: () => void
}

export const DeviceRow = React.memo(function DeviceRow({ id, name, rssi, onPress }: Props) {
  const mutedColor = useResolvedColor(theme.ui.mutedForeground)
  const signalColor =
    rssi > -60
      ? theme.palette.green.text
      : rssi > -75
        ? theme.palette.yellow.color
        : theme.status.error.text

  return (
    <Card onPress={onPress} accessibilityLabel={name} testID={`device-row-${id}`}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <CardDescription>{id}</CardDescription>
        </View>
        <Text style={[styles.rssi, { color: signalColor }]}>{rssi} dBm</Text>
        <IconChevronRight size={18} color={mutedColor} />
      </View>
    </Card>
  )
})

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
    color: theme.ui.foreground,
    fontSize: 15,
    fontWeight: '600',
  },
  rssi: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
})
