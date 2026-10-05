import IconChevronDown from '@tabler/icons-react-native/IconChevronDown'
import IconChevronUp from '@tabler/icons-react-native/IconChevronUp'
import { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { interaction, theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import { useLegalReferenceSpeedFormat } from '@/modules/legal/hooks/useLegalLimitsFormat'
import { LegalLimitCountrySheet } from '@/modules/legal/components/LegalLimitCountrySheet'
import {
  LEGAL_LIMIT_COUNTRIES,
  LEGAL_ROAD_STATUS_COLORS,
  LEGAL_ROAD_STATUS_LABELS,
  LEGAL_ROAD_STATUS_LEGEND,
  type LegalLimitCountry,
} from '@/modules/legal/lib/legalLimits'

const LIST_HEIGHT = 220

interface LegalLimitsMapOverlayProps {
  visible: boolean
  /** Height of the tab bar, so the panel sits above it and navigation stays reachable. */
  bottom: number
}

/** The legal limits layer over the Explore map: the status legend, the country list and sheet. */
export function LegalLimitsMapOverlay({ visible, bottom }: LegalLimitsMapOverlayProps) {
  const formatReferenceSpeed = useLegalReferenceSpeedFormat()
  const muted = useResolvedColor(theme.ui.mutedForeground)
  const [listOpen, setListOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<LegalLimitCountry | null>(null)

  // Leaving the layer drops the selection, so returning to it starts from the map rather than from
  // whatever country was last read.
  useEffect(() => {
    if (visible) return
    const frame = requestAnimationFrame(() => {
      setListOpen(false)
      setSelectedCountry(null)
    })
    return () => cancelAnimationFrame(frame)
  }, [visible])

  if (!visible) return null

  const Chevron = listOpen ? IconChevronDown : IconChevronUp

  return (
    <View pointerEvents="box-none" style={styles.interface}>
      <View testID="legal-limits-panel" style={[styles.panel, { bottom: bottom + 8 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={listOpen ? 'Hide legal limits list' : 'Show legal limits list'}
          onPress={() => setListOpen((open) => !open)}
          style={({ pressed }) => [styles.header, pressed && styles.pressed]}
        >
          <View style={styles.legend}>
            {LEGAL_ROAD_STATUS_LEGEND.map((status) => (
              <View key={status} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: LEGAL_ROAD_STATUS_COLORS[status] }]}
                />
                <Text style={styles.legendText}>{LEGAL_ROAD_STATUS_LABELS[status]}</Text>
              </View>
            ))}
          </View>
          <View style={styles.listToggle}>
            <Text style={styles.listToggleText}>
              {listOpen ? 'Hide countries' : 'Browse countries'}
            </Text>
            <Chevron size={18} color={muted} />
          </View>
        </Pressable>
        {listOpen ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          >
            {LEGAL_LIMIT_COUNTRIES.map((country) => (
              <Pressable
                key={country.code}
                accessibilityRole="button"
                accessibilityLabel={`${country.name} legal limits`}
                style={({ pressed }) => [styles.countryRow, pressed && styles.pressed]}
                onPress={() => setSelectedCountry(country)}
              >
                <View
                  style={[
                    styles.countryDot,
                    { backgroundColor: LEGAL_ROAD_STATUS_COLORS[country.status] },
                  ]}
                />
                <Text style={styles.countryName} numberOfLines={1}>
                  {country.name}
                </Text>
                <Text style={styles.countryStatus} numberOfLines={1}>
                  {LEGAL_ROAD_STATUS_LABELS[country.status]}
                </Text>
                <Text style={styles.countrySpeed}>
                  {formatReferenceSpeed(country.referenceSpeedKmh)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
      </View>
      <LegalLimitCountrySheet country={selectedCountry} onClose={() => setSelectedCountry(null)} />
    </View>
  )
}

const styles = StyleSheet.create({
  interface: {
    ...StyleSheet.absoluteFill,
    // Above the navigation sheets (45) and map controls, which sit in the same strip.
    zIndex: 50,
  },
  // One sheet just above the tab bar, matching the weather panel, so navigation stays reachable.
  panel: {
    position: 'absolute',
    left: 8,
    right: 8,
    zIndex: 30,
    backgroundColor: theme.ui.background,
    borderRadius: theme.radius.lg + 4,
    borderWidth: 1,
    borderColor: theme.ui.border,
    overflow: 'hidden',
  },
  // Tall enough to cover the Map Point add button beneath it.
  header: {
    minHeight: 92,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  listToggle: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: theme.radius.md,
    backgroundColor: theme.ui.muted,
  },
  listToggleText: { color: theme.ui.foreground, fontSize: 13, fontWeight: '600' },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: theme.ui.foreground,
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    maxHeight: LIST_HEIGHT,
    borderTopWidth: 1,
    borderTopColor: theme.ui.border,
  },
  listContent: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  countryRow: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countryDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  countryName: {
    flex: 1.1,
    color: theme.ui.foreground,
    fontSize: 13,
    fontWeight: '600',
  },
  countryStatus: {
    flex: 0.9,
    color: theme.ui.mutedForeground,
    fontSize: 12,
  },
  countrySpeed: {
    minWidth: 64,
    color: theme.ui.foreground,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
})
