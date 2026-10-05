import IconRefresh from '@tabler/icons-react-native/IconRefresh'
import { StyleSheet, View } from 'react-native'
import { refreshWeather } from 'vescape-core'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { theme } from '@/constants/theme'
import { WeatherHourlyStrip } from '@/modules/weather/components/WeatherHourlyStrip'
import { WeatherRadarTimeline } from '@/modules/weather/components/WeatherRadarTimeline'
import { useRainViewerRadarStore } from '@/modules/weather/store/rainViewerRadarStore'

interface WeatherMapOverlayProps {
  visible: boolean
  /** Height of the tab bar, so the forecast panel sits above it and navigation stays reachable. */
  bottom: number
}

/** The weather layer's chrome over the Explore map: radar timeline and hourly strip. */
export function WeatherMapOverlay({ visible, bottom }: WeatherMapOverlayProps) {
  const radarLoading = useRainViewerRadarStore((s) => s.loading)
  const radarError = useRainViewerRadarStore((s) => s.error)
  const refreshRadar = useRainViewerRadarStore((s) => s.fetch)

  if (!visible) return null

  return (
    <View pointerEvents="box-none" style={styles.weatherInterface}>
      <View testID="weather-panel" style={[styles.weatherPanel, { bottom: bottom + 8 }]}>
        {radarError ? <Text style={styles.radarError}>{radarError}</Text> : null}
        <View style={styles.radarRow}>
          <View style={styles.radarTimeline}>
            <WeatherRadarTimeline />
          </View>
          <Button
            icon={IconRefresh}
            variant="outline"
            onPress={() => {
              refreshWeather()
              refreshRadar(true)
            }}
            disabled={radarLoading}
            accessibilityLabel="Refresh weather"
          />
        </View>
        <WeatherHourlyStrip />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  weatherInterface: {
    ...StyleSheet.absoluteFill,
    // Above the navigation sheets (45) and map controls, which sit in the same strip.
    zIndex: 50,
  },
  radarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radarTimeline: {
    flex: 1,
  },
  radarError: {
    color: theme.status.error.text,
    fontSize: 11,
    marginTop: 4,
  },
  // One sheet of forecast controls sitting just above the tab bar, so navigation stays reachable.
  weatherPanel: {
    position: 'absolute',
    left: 8,
    right: 8,
    zIndex: 30,
    gap: 8,
    padding: 10,
    backgroundColor: theme.ui.background,
    borderRadius: theme.radius.lg + 4,
    borderWidth: 1,
    borderColor: theme.ui.border,
  },
})
