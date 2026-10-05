import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconCloudStorm from '@tabler/icons-react-native/IconCloudStorm'
import type { WeatherHour, WeatherIconSlug } from 'vescape-core'

import { Text } from '@/components/base/Text'
import { NewComponentHero } from '@/components/dev/NewComponentHero'
import { NewShowcaseCard } from '@/components/dev/NewShowcaseCard'
import { NewChipRow, NewToggleRow } from '@/components/dev/NewShowcaseControls'
import { theme } from '@/constants/theme'
import {
  WeatherGlyph,
  WeatherHourlyStrip,
  WeatherPill,
  WeatherStat,
} from '@/modules/weather/components/WeatherViews'

/** Every slug native can resolve, so the showcase covers the whole contract. */
const ICONS: WeatherIconSlug[] = [
  'sun',
  'moon',
  'cloud-sun',
  'cloud-moon',
  'cloud',
  'cloud-fog',
  'cloud-rain',
  'cloud-snow',
  'cloud-lightning',
]

const LABELS: Record<WeatherIconSlug, string> = {
  sun: 'Clear sky',
  moon: 'Clear sky',
  'cloud-sun': 'Partly cloudy',
  'cloud-moon': 'Partly cloudy',
  cloud: 'Overcast',
  'cloud-fog': 'Fog',
  'cloud-rain': 'Rain',
  'cloud-snow': 'Snow',
  'cloud-lightning': 'Thunderstorm',
}

const SUNRISE_MINUTE = 5 * 60 + 12
const SUNSET_MINUTE = 21 * 60 + 34

const HOURS: [number, number, WeatherIconSlug, number][] = [
  [14, 21, 'sun', 0],
  [15, 22, 'cloud-sun', 10],
  [16, 20, 'cloud-rain', 60],
  [17, 18, 'cloud-lightning', 80],
  [18, 17, 'cloud', 30],
  [22, 13, 'cloud-moon', 0],
]

const MOCK_HOURLY: WeatherHour[] = HOURS.map(([hour, temperatureC, icon, probability]) => ({
  minuteOfDay: hour * 60,
  temperatureC,
  weatherCode: 0,
  icon,
  precipitationProbability: probability,
}))

export default function NewWeatherShowcase() {
  const [icon, setIcon] = useState<WeatherIconSlug>('cloud-rain')
  const [precip, setPrecip] = useState(true)
  const [expanded, setExpanded] = useState(true)
  const precipProbability = precip ? 40 : 0

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <NewComponentHero
          icon={IconCloudStorm}
          description="Condition glyphs, stat, pill and hourly strip, redrawn in Tabler on the zinc theme."
        />

        <NewShowcaseCard
          name="WeatherGlyph"
          controls={
            <>
              <NewChipRow
                label="condition"
                options={ICONS}
                selected={icon}
                onSelect={(slug) => setIcon(slug as WeatherIconSlug)}
              />
              <NewToggleRow label="precipitation" value={precip} onChange={setPrecip} />
            </>
          }
        >
          <View style={styles.row}>
            <WeatherGlyph icon={icon} size={32} tile />
            <View>
              <Text style={styles.primary}>{icon}</Text>
              <Text style={styles.secondary}>{LABELS[icon]}</Text>
            </View>
          </View>
        </NewShowcaseCard>

        <NewShowcaseCard name="WeatherStat">
          <View style={styles.row}>
            <WeatherStat icon={icon} temperature={21} precipProbability={precipProbability} />
            <WeatherStat
              icon={icon}
              temperature={21}
              precipProbability={precipProbability}
              size="md"
            />
          </View>
        </NewShowcaseCard>

        <NewShowcaseCard
          name="WeatherPill"
          controls={<NewToggleRow label="expanded" value={expanded} onChange={setExpanded} />}
        >
          <WeatherPill
            icon={icon}
            temperature={21}
            label={LABELS[icon]}
            precipProbability={precipProbability}
            sunriseMinuteOfDay={SUNRISE_MINUTE}
            sunsetMinuteOfDay={SUNSET_MINUTE}
            expanded={expanded}
            onPress={() => undefined}
          />
        </NewShowcaseCard>

        <NewShowcaseCard name="WeatherHourlyStrip">
          <WeatherHourlyStrip
            hours={MOCK_HOURLY}
            sunriseMinuteOfDay={SUNRISE_MINUTE}
            sunsetMinuteOfDay={SUNSET_MINUTE}
          />
        </NewShowcaseCard>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  primary: { color: theme.ui.foreground, fontSize: 13, fontWeight: '600' },
  secondary: { color: theme.ui.mutedForeground, fontSize: 12 },
})
