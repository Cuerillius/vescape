import IconCloud from '@tabler/icons-react-native/IconCloud'

import { StyleSheet } from 'react-native'

import { Button } from '@/components/ui/Button'
import { theme } from '@/constants/theme'
import { WEATHER_BUTTON_ICONS } from '@/modules/weather/components/WeatherViews'
import { useWeatherStore } from '@/modules/weather/store/weatherStore'

interface WeatherMapButtonProps {
  active: boolean
  onPress: () => void
}

/**
 * The map's weather toggle: always the current condition's glyph, and while the layer is on it
 * unfolds into the temperature, condition and rain chance.
 */
export function WeatherMapButton({ active, onPress }: WeatherMapButtonProps) {
  const weather = useWeatherStore((s) => s.weather)
  const icon = weather ? WEATHER_BUTTON_ICONS[weather.icon] : IconCloud
  const rain = weather?.precipitationProbability
  const label =
    active && weather
      ? `${weather.temperatureC}° · ${weather.label}${rain ? ` · ${rain}%` : ''}`
      : undefined

  return (
    <Button
      icon={icon}
      label={label}
      variant="floating"
      size="lg"
      style={active ? styles.active : undefined}
      testID="map-mode-weather"
      accessibilityLabel={active ? 'Hide weather' : 'Show weather'}
      onPress={onPress}
    />
  )
}

const styles = StyleSheet.create({
  // A layer that is on: tapping the button again goes back to the plain map.
  active: {
    borderColor: theme.ui.foreground,
    backgroundColor: theme.ui.muted,
  },
})
