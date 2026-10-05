import { StyleSheet, View } from 'react-native'

import { LayerTile } from '@/components/ui/LayerTile'
import { IS_MAPY_CONFIGURED } from '@/config/mapy'
import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import { MAP_STYLES, type MapStyleKey } from '@/modules/map/constants/mapStyles'
import { mapStyleForTheme } from '@/modules/map/lib/mapTheme'

interface MapStyleListProps {
  activeKey: MapStyleKey
  onSelect: (key: MapStyleKey) => void
}

function StyleIcon({
  Icon,
  active,
}: {
  Icon: (typeof MAP_STYLES)[number]['Icon']
  active: boolean
}) {
  const color = useResolvedColor(active ? theme.ui.foreground : theme.ui.mutedForeground)
  return <Icon size={28} color={color} />
}

/** One tile per basemap, the active one outlined. */
export function MapStyleList({ activeKey, onSelect }: MapStyleListProps) {
  const availableStyles = IS_MAPY_CONFIGURED
    ? MAP_STYLES
    : MAP_STYLES.filter((style) => style.key !== 'mapy')
  const effectiveActiveKey =
    activeKey === 'mapy' && !IS_MAPY_CONFIGURED ? MAP_STYLES[0].key : mapStyleForTheme(activeKey)

  return (
    <View style={styles.row}>
      {availableStyles.map((style) => {
        const active = style.key === effectiveActiveKey
        return (
          <LayerTile
            key={style.key}
            label={style.label}
            accessibilityLabel={`Basemap: ${style.label}`}
            selected={active}
            onPress={() => onSelect(style.key)}
          >
            <StyleIcon Icon={style.Icon} active={active} />
          </LayerTile>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
})
