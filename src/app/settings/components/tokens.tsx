import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconPalette from '@tabler/icons-react-native/IconPalette'

import { Text } from '@/components/base/Text'
import { NewComponentHero } from '@/components/dev/NewComponentHero'
import { NewShowcaseCard } from '@/components/dev/NewShowcaseCard'
import { theme, uiColors } from '@/constants/theme'
import { useThemeStore } from '@/hooks/useTheme'

function ColorSwatch({ name, color }: { name: string; color: string }) {
  return (
    <View style={styles.swatchRow}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <Text style={styles.swatchName}>{name}</Text>
      <Text style={styles.swatchValue}>{color.toUpperCase()}</Text>
    </View>
  )
}

function TokensShowcase() {
  const appearance = useThemeStore((state) => state.resolvedTheme)
  const palette = uiColors[appearance]
  return (
    <NewShowcaseCard name="theme.ui">
      <Text style={styles.caption}>
        The zinc tokens the rebuilt kit is built on — currently resolved for {appearance} mode.
      </Text>
      <View style={styles.swatchGrid}>
        {Object.entries(palette).map(([name, color]) => (
          <ColorSwatch key={name} name={name} color={color} />
        ))}
      </View>
    </NewShowcaseCard>
  )
}

const RADII = Object.entries(theme.radius)
const STATUSES = ['info', 'success', 'caution', 'warning', 'error'] as const

function RadiusShowcase() {
  return (
    <NewShowcaseCard name="theme.radius">
      <View style={styles.radiusRow}>
        {RADII.map(([name, radius]) => (
          <View key={name} style={styles.radiusItem}>
            <View style={[styles.radiusBox, { borderRadius: Math.min(radius, 28) }]} />
            <Text style={styles.swatchName}>{name}</Text>
            <Text style={styles.swatchValue}>{radius}</Text>
          </View>
        ))}
      </View>
    </NewShowcaseCard>
  )
}

function StatusShowcase() {
  return (
    <NewShowcaseCard name="theme.status">
      <Text style={styles.caption}>
        Hue appears only as state: a status dot, a destructive tint, a warning bar.
      </Text>
      <View style={styles.swatchGrid}>
        {STATUSES.map((name) => (
          <View key={name} style={styles.swatchRow}>
            <View style={[styles.swatch, { backgroundColor: theme.status[name].color }]} />
            <Text style={styles.swatchName}>{name}</Text>
            <Text style={[styles.statusText, { color: theme.status[name].text }]}>Aa</Text>
          </View>
        ))}
      </View>
    </NewShowcaseCard>
  )
}

function TypeShowcase() {
  return (
    <NewShowcaseCard name="Geist / Geist Tabular">
      <Text style={styles.caption}>
        Text is Geist. Live numbers use Geist Tabular (theme.mono), so digits keep their width as
        they tick.
      </Text>
      <View style={styles.typeRows}>
        <Text style={styles.typeSample}>1111 / 8888</Text>
        <Text style={[styles.typeSample, styles.typeTabular]}>1111 / 8888</Text>
      </View>
    </NewShowcaseCard>
  )
}

export default function NewComponentTokensPage() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <NewComponentHero
          icon={IconPalette}
          description="Monochrome by design: hierarchy comes from borders, muted text, and the card/background step, not hue."
        />
        <TokensShowcase />
        <RadiusShowcase />
        <StatusShowcase />
        <TypeShowcase />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  caption: { color: theme.ui.mutedForeground, fontSize: 13 },
  swatchGrid: { gap: 6, marginTop: 10 },
  swatchRow: { minHeight: 28, flexDirection: 'row', alignItems: 'center', gap: 8 },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.ui.border,
  },
  swatchName: { flex: 1, color: theme.ui.foreground, fontSize: 12, fontWeight: '600' },
  radiusRow: { flexDirection: 'row', gap: 16, marginTop: 10 },
  radiusItem: { alignItems: 'center', gap: 4 },
  radiusBox: {
    width: 56,
    height: 56,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.muted,
  },
  statusText: { fontSize: 14, fontWeight: '700' },
  typeRows: { gap: 4, marginTop: 10 },
  typeSample: { color: theme.ui.foreground, fontSize: 28, fontWeight: '700' },
  typeTabular: { fontFamily: theme.mono('700') },
  swatchValue: { color: theme.ui.mutedForeground, fontFamily: 'monospace', fontSize: 10 },
})
