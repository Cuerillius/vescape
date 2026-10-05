import { LineLayer, MarkerView, ShapeSource } from '@rnmapbox/maps'
import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { theme } from '@/constants/theme'
import { makeTrailLineString } from '@/helpers/mapGeometry'
import { useResolvedAccentColors } from '@/hooks/useTheme'
import { rosterRiderColor } from '@/modules/group-ride/lib/riderColor'
import type { RosterRider } from '@/modules/group-ride/lib/roster'
import { MapMark } from '@/modules/map/components/MapMark'
import { MAP_DEFAULTS } from '@/modules/map/constants/mapStyles'

/** A rider's own chosen color, else a fallback tint by roster position; stale riders go muted. */
function useRiderTone(rider: RosterRider, index: number) {
  const accents = useResolvedAccentColors()
  return rosterRiderColor(rider, index, accents)
}

function ZincRiderTrail({ rider, index }: { rider: RosterRider; index: number }) {
  const color = useRiderTone(rider, index)
  const shape = useMemo(
    () =>
      rider.trail && rider.trail.length >= 2
        ? makeTrailLineString(rider.trail.map((p) => ({ longitude: p.lng, latitude: p.lat })))
        : null,
    [rider.trail],
  )
  if (!shape) return null

  return (
    <ShapeSource id={`zinc-rider-trail-source-${rider.id}`} shape={shape} lineMetrics>
      <LineLayer
        id={`zinc-rider-trail-line-${rider.id}`}
        style={{
          lineWidth: MAP_DEFAULTS.trailWidth,
          lineCap: 'round',
          lineJoin: 'round',
          lineGradient: [
            'interpolate',
            ['linear'],
            ['line-progress'],
            0,
            theme.alpha(color, 0),
            1,
            theme.alpha(color, 0.85),
          ],
        }}
      />
    </ShapeSource>
  )
}

function ZincRiderPresencePin({ rider, index }: { rider: RosterRider; index: number }) {
  const color = useRiderTone(rider, index)
  const heading = rider.presence?.heading ?? null
  if (!rider.presence) return null

  return (
    <MarkerView coordinate={[rider.presence.lng, rider.presence.lat]} allowOverlap>
      <View style={styles.marker}>
        <View style={[styles.dot, { backgroundColor: color }]}>
          {heading != null && (
            // Rotating a ring centered on the dot keeps the arrow orbiting the dot.
            <View style={[styles.headingRing, { transform: [{ rotate: `${heading}deg` }] }]}>
              <View style={[styles.headingArrow, { borderBottomColor: color }]} />
            </View>
          )}
        </View>
        <Text style={[styles.label, rider.stale && styles.labelStale]} numberOfLines={1}>
          {rider.name || 'Rider'}
        </Text>
      </View>
    </MarkerView>
  )
}

/** Group Ride on the zinc map: each rider's trail, presence dot, and Direction Point. */
export function ZincRiderLayers({ riders }: { riders: RosterRider[] }) {
  const accents = useResolvedAccentColors()
  return (
    <>
      {riders.map((rider, index) => (
        <ZincRiderTrail key={`trail-${rider.id}`} rider={rider} index={index} />
      ))}
      {riders.map((rider, index) => (
        <ZincRiderPresencePin key={`presence-${rider.id}`} rider={rider} index={index} />
      ))}
      {riders.map((rider, index) =>
        rider.presence?.target ? (
          <MapMark
            key={`target-${rider.id}`}
            id={`zinc-rider-target-${rider.id}`}
            kind="direction"
            coordinate={[rider.presence.target.lng, rider.presence.target.lat]}
            color={rosterRiderColor(rider, index, accents)}
          />
        ) : null,
      )}
    </>
  )
}

const styles = StyleSheet.create({
  marker: { alignItems: 'center', gap: 4 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.ui.background,
  },
  headingRing: {
    position: 'absolute',
    top: -10,
    left: -10,
    width: 32,
    height: 32,
    alignItems: 'center',
  },
  headingArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  label: {
    maxWidth: 96,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.ui.border,
    overflow: 'hidden',
    backgroundColor: theme.ui.card,
    color: theme.ui.foreground,
    fontSize: 11,
    fontWeight: '800',
  },
  labelStale: { color: theme.ui.faintForeground },
})
