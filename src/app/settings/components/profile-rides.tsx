import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconRoute from '@tabler/icons-react-native/IconRoute'

import { Text } from '@/components/base/Text'
import { NewComponentHero } from '@/components/dev/NewComponentHero'
import { NewShowcaseCard } from '@/components/dev/NewShowcaseCard'
import { NewChipRow, NewToggleRow } from '@/components/dev/NewShowcaseControls'
import { ToggleGroup } from '@/components/ui/ToggleGroup'
import { theme } from '@/constants/theme'
import type { RoutePoint } from '@/modules/history/lib/routePreview'
import { RideRow } from '@/screens/main/profile/RideRow'

const ROUTES: Record<string, RoutePoint[]> = {
  corners: [
    { latitude: 52, longitude: 18 },
    { latitude: 52.001, longitude: 18 },
    { latitude: 52.001, longitude: 18.0015 },
    { latitude: 52.0005, longitude: 18.0015 },
    { latitude: 52.0005, longitude: 18.002 },
  ],
  straight: [
    { latitude: 52, longitude: 18 },
    { latitude: 52, longitude: 18.002 },
  ],
  gap: [
    { latitude: 52, longitude: 18 },
    { latitude: 52.001, longitude: 18 },
    { latitude: 52.001, longitude: 18.0015, breakBefore: true },
    { latitude: 52.0005, longitude: 18.0015 },
  ],
  empty: [],
}

function RideRowShowcase() {
  const [route, setRoute] = useState('corners')
  const [details, setDetails] = useState(true)
  return (
    <NewShowcaseCard
      name="RideRow"
      controls={
        <>
          <NewChipRow
            label="route"
            options={Object.keys(ROUTES)}
            selected={route}
            onSelect={setRoute}
          />
          <NewToggleRow label="board line" value={details} onChange={setDetails} />
        </>
      }
    >
      <Text style={styles.caption}>
        One ride in a list: its route, when and how far, and the board it was on. A Favorite leads
        with its name instead.
      </Text>
      <View style={styles.stack}>
        <RideRow
          title="18:42 · Today"
          subtitle="48 min · 14.2 km · 38 km/h"
          details={details ? 'Preview board' : undefined}
          routePoints={ROUTES[route]!}
          onPress={() => {}}
        />
        <RideRow
          title="Morning ride"
          subtitle="08:10 · Yesterday"
          details="22 min · 6.8 km · 33 km/h"
          routePoints={ROUTES[route]!}
          onPress={() => {}}
        />
      </View>
    </NewShowcaseCard>
  )
}

function RideListShowcase() {
  const [mode, setMode] = useState<'rides' | 'favorites'>('rides')
  return (
    <NewShowcaseCard name="All rides view">
      <Text style={styles.caption}>
        What "All rides" and "See all" open: a full view over the Profile tab with a back button and
        a switch between rides and Favorites.
      </Text>
      <View style={styles.stack}>
        <ToggleGroup
          activeKey={mode}
          options={[
            { key: 'rides', label: 'Rides' },
            { key: 'favorites', label: 'Favorites' },
          ]}
          onSelect={setMode}
        />
        {mode === 'rides' ? (
          <>
            <RideRow
              title="18:42 · Today"
              subtitle="48 min · 14.2 km · 38 km/h"
              details="Preview board"
              routePoints={ROUTES.corners!}
              onPress={() => {}}
            />
            <RideRow
              title="08:10 · Yesterday"
              subtitle="22 min · 6.8 km · 33 km/h"
              details="Preview board"
              routePoints={ROUTES.gap!}
              onPress={() => {}}
            />
          </>
        ) : (
          <RideRow
            title="Evening ride"
            subtitle="18:42 · Today"
            details="31 min · 9.4 km · 36 km/h"
            routePoints={ROUTES.corners!}
            onPress={() => {}}
          />
        )}
      </View>
    </NewShowcaseCard>
  )
}

export default function NewComponentProfileRidesPage() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <NewComponentHero
          icon={IconRoute}
          description="Rides on the Profile tab: the ride row and the full list."
        />
        <RideRowShowcase />
        <RideListShowcase />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  caption: { color: theme.ui.mutedForeground, fontSize: 13, marginBottom: 10 },
  stack: { gap: 8 },
})
