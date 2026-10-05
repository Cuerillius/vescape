import { WeatherHourlyStrip as WeatherHourlyStripView } from '@/modules/weather/components/WeatherViews'
import { useWeatherStore } from '@/modules/weather/store/weatherStore'

/** Store-bound container for the hourly forecast strip. */
export function WeatherHourlyStrip() {
  const weather = useWeatherStore((s) => s.weather)
  const hourly = weather?.hourly

  if (!hourly || hourly.length === 0) return null

  return (
    <WeatherHourlyStripView
      hours={hourly}
      sunriseMinuteOfDay={weather.sunriseMinuteOfDay}
      sunsetMinuteOfDay={weather.sunsetMinuteOfDay}
    />
  )
}
