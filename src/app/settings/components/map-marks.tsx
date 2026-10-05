import IconMapPin from '@tabler/icons-react-native/IconMapPin'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Text } from '@/components/base/Text'
import { NewComponentHero } from '@/components/dev/NewComponentHero'
import { theme } from '@/constants/theme'
import { MapMarkFace } from '@/modules/map/components/MapMark'
import { getMapMarkSpec, MAP_MARK_GROUPS, type MapMarkKind } from '@/modules/map/constants/mapMarks'

/** Names the two states shown for each mark. */
function ColumnHeaders() {
  return (
    <View style={styles.cells}>
      {['Default', 'Selected'].map((state) => (
        <Text key={state} style={styles.stateText}>
          {state}
        </Text>
      ))}
    </View>
  )
}

function MarkRow({ kind }: { kind: MapMarkKind }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label} numberOfLines={1}>
        {getMapMarkSpec(kind).label}
      </Text>
      <View style={styles.cells}>
        {[false, true].map((selected) => (
          <View key={String(selected)} style={styles.cell}>
            <MapMarkFace kind={kind} selected={selected} />
          </View>
        ))}
      </View>
    </View>
  )
}

export default function NewMapMarksShowcase() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <NewComponentHero
          icon={IconMapPin}
          description="Every map mark, default and selected. Shape groups the kind, hue names it, the glyph says what it is."
        />
        {MAP_MARK_GROUPS.map((group) => (
          <View key={group.title} style={styles.group}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <ColumnHeaders />
            </View>
            <View style={styles.card}>
              {group.kinds.map((kind, index) => (
                <View key={kind}>
                  {index > 0 ? <View style={styles.separator} /> : null}
                  <MarkRow kind={kind} />
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 16, gap: 12 },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginRight: 15,
  },
  stateText: {
    width: 44,
    textAlign: 'center',
    color: theme.ui.mutedForeground,
    fontSize: 10,
    fontWeight: '700',
  },
  group: { gap: 6 },
  groupTitle: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
    marginBottom: 2,
  },
  card: {
    backgroundColor: theme.ui.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.ui.border,
    overflow: 'hidden',
  },
  separator: { height: StyleSheet.hairlineWidth * 2, backgroundColor: theme.ui.border },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 },
  label: { flex: 1, color: theme.ui.foreground, fontSize: 14, fontWeight: '600' },
  cells: { flexDirection: 'row', gap: 14 },
  cell: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
})
