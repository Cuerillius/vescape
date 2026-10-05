import IconArrowDown from '@tabler/icons-react-native/IconArrowDown'
import IconArrowUp from '@tabler/icons-react-native/IconArrowUp'
import IconCloud from '@tabler/icons-react-native/IconCloud'
import IconCloudFog from '@tabler/icons-react-native/IconCloudFog'
import IconCloudRain from '@tabler/icons-react-native/IconCloudRain'
import IconCloudSnow from '@tabler/icons-react-native/IconCloudSnow'
import IconCloudStorm from '@tabler/icons-react-native/IconCloudStorm'
import IconDroplet from '@tabler/icons-react-native/IconDroplet'
import IconMoonStars from '@tabler/icons-react-native/IconMoonStars'
import IconSun from '@tabler/icons-react-native/IconSun'
import IconSunrise from '@tabler/icons-react-native/IconSunrise'
import IconSunset from '@tabler/icons-react-native/IconSunset'
import type { ComponentType } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import type { WeatherHour, WeatherIconSlug } from 'vescape-core'

import { Text } from '@/components/base/Text'
import { interaction, theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import { formatHour, weatherIconColor } from '@/modules/weather/lib/weather'

type TablerIcon = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>

// Tabler has no half-sun/half-moon cloud glyphs, so partly-cloudy slugs borrow the plain cloud.
const ICONS: Record<WeatherIconSlug, TablerIcon> = {
  sun: IconSun,
  moon: IconMoonStars,
  'cloud-sun': IconCloud,
  'cloud-moon': IconCloud,
  cloud: IconCloud,
  'cloud-fog': IconCloudFog,
  'cloud-rain': IconCloudRain,
  'cloud-snow': IconCloudSnow,
  'cloud-lightning': IconCloudStorm,
}

/** Mono everywhere except the conditions a rider acts on: rain and thunderstorm. */
const TINTED_CONDITIONS = new Set<WeatherIconSlug>(['cloud-rain', 'cloud-lightning'])

interface WeatherGlyphProps {
  icon: WeatherIconSlug
  size?: number
  /** Draws the glyph on a muted tile instead of bare. */
  tile?: boolean
}

/** The monochrome Tabler pictogram for a condition slug. Native picks the slug. */
export function WeatherGlyph({ icon, size = 20, tile }: WeatherGlyphProps) {
  const color = useResolvedColor(
    TINTED_CONDITIONS.has(icon) ? weatherIconColor(icon) : theme.ui.foreground,
  )
  const Glyph = ICONS[icon]
  const glyph = <Glyph size={size} color={color} strokeWidth={1.75} />
  if (!tile) return glyph
  const tileSize = size + 20
  return (
    <View
      style={[styles.tile, { width: tileSize, height: tileSize, backgroundColor: theme.ui.muted }]}
    >
      {glyph}
    </View>
  )
}

/** `Button`-shaped icons per condition, so a button can carry the glyph and its tint. */
export const WEATHER_BUTTON_ICONS = Object.fromEntries(
  (Object.keys(ICONS) as WeatherIconSlug[]).map((slug) => [
    slug,
    function WeatherButtonIcon({ size }: { size: number; color: string }) {
      return <WeatherGlyph icon={slug} size={size} />
    },
  ]),
) as Record<WeatherIconSlug, ComponentType<{ size: number; color: string }>>

function PrecipLabel({ percent, size }: { percent: number; size: number }) {
  const color = useResolvedColor(theme.ui.mutedForeground)
  return (
    <View style={styles.inline}>
      <IconDroplet size={size} color={color} strokeWidth={2} />
      <Text style={[styles.precip, { fontSize: size }]}>{percent}%</Text>
    </View>
  )
}

interface WeatherStatProps {
  icon: WeatherIconSlug
  temperature: number
  precipProbability?: number | null
  size?: 'sm' | 'md'
}

/** Inline condition glyph, temperature and rain chance. */
export function WeatherStat({
  icon,
  temperature,
  precipProbability,
  size = 'sm',
}: WeatherStatProps) {
  const md = size === 'md'
  return (
    <View style={styles.inline}>
      <WeatherGlyph icon={icon} size={md ? 18 : 15} />
      <Text style={[styles.temp, { fontSize: md ? 14 : 12 }]}>{temperature}°</Text>
      {precipProbability ? <PrecipLabel percent={precipProbability} size={md ? 12 : 11} /> : null}
    </View>
  )
}

interface WeatherPillProps {
  icon: WeatherIconSlug
  temperature: number
  label: string
  precipProbability?: number | null
  sunriseMinuteOfDay?: number | null
  sunsetMinuteOfDay?: number | null
  expanded?: boolean
  onPress?: () => void
}

function SunTime({ minute, rising }: { minute: number; rising: boolean }) {
  const color = useResolvedColor(theme.ui.mutedForeground)
  const SunIcon = rising ? IconSunrise : IconSunset
  const Arrow = rising ? IconArrowUp : IconArrowDown
  return (
    <View style={styles.inline}>
      <SunIcon size={15} color={color} strokeWidth={1.75} />
      <Arrow size={11} color={color} strokeWidth={2.25} />
      <Text style={styles.sunTime}>{formatHour(minute)}</Text>
    </View>
  )
}

/** Map weather summary: a compact pill, or an expanded card with the sun times. */
export function WeatherPill({
  icon,
  temperature,
  label,
  precipProbability,
  sunriseMinuteOfDay,
  sunsetMinuteOfDay,
  expanded,
  onPress,
}: WeatherPillProps) {
  if (!expanded) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Weather, ${temperature}°, ${label}`}
        onPress={onPress}
        android_ripple={interaction.ripple}
        style={({ pressed }) => [styles.pill, pressed && { opacity: interaction.pressedOpacity }]}
      >
        <WeatherStat
          icon={icon}
          temperature={temperature}
          precipProbability={precipProbability}
          size="md"
        />
      </Pressable>
    )
  }
  return (
    <View style={styles.card}>
      <WeatherGlyph icon={icon} size={26} tile />
      <View style={styles.cardBody}>
        <View style={styles.cardHeadline}>
          <Text style={styles.cardTemp}>{temperature}°</Text>
          {precipProbability ? <PrecipLabel percent={precipProbability} size={13} /> : null}
        </View>
        <Text style={styles.cardLabel}>{label}</Text>
      </View>
      {sunriseMinuteOfDay != null && sunsetMinuteOfDay != null ? (
        <View style={styles.sunTimes}>
          <SunTime minute={sunriseMinuteOfDay} rising />
          <SunTime minute={sunsetMinuteOfDay} rising={false} />
        </View>
      ) : null}
    </View>
  )
}

type StripItem =
  | { kind: 'hour'; hour: WeatherHour }
  | { kind: 'sun'; minuteOfDay: number; rising: boolean }

/** The forecast hours with sunrise and sunset slotted in at the time they happen. */
function stripItems(
  hours: WeatherHour[],
  sunriseMinuteOfDay?: number | null,
  sunsetMinuteOfDay?: number | null,
): StripItem[] {
  const items: StripItem[] = hours.map((hour) => ({ kind: 'hour', hour }))
  const first = hours[0]?.minuteOfDay
  const last = hours.at(-1)?.minuteOfDay
  if (first == null || last == null) return items
  const events = [
    { minuteOfDay: sunriseMinuteOfDay, rising: true },
    { minuteOfDay: sunsetMinuteOfDay, rising: false },
  ]
  for (const event of events) {
    const minute = event.minuteOfDay
    if (minute == null || minute < first || minute >= last + 60) continue
    const at = items.findIndex(
      (item) => (item.kind === 'hour' ? item.hour.minuteOfDay : item.minuteOfDay) > minute,
    )
    items.splice(at < 0 ? items.length : at, 0, {
      kind: 'sun',
      minuteOfDay: minute,
      rising: event.rising,
    })
  }
  return items
}

function SunStripItem({ minuteOfDay, rising }: { minuteOfDay: number; rising: boolean }) {
  const color = useResolvedColor(theme.ui.mutedForeground)
  const SunIcon = rising ? IconSunrise : IconSunset
  return (
    <View style={styles.hour}>
      <Text style={styles.hourLabel}>{formatHour(minuteOfDay)}</Text>
      <SunIcon size={22} color={color} strokeWidth={1.75} />
      <Text style={styles.sunLabel}>{rising ? 'Sunrise' : 'Sunset'}</Text>
    </View>
  )
}

interface WeatherHourlyStripProps {
  hours: WeatherHour[]
  sunriseMinuteOfDay?: number | null
  sunsetMinuteOfDay?: number | null
}

/**
 * Horizontal hourly forecast: hour, condition glyph, temperature and rain chance per column, with
 * sunrise and sunset in between.
 */
export function WeatherHourlyStrip({
  hours,
  sunriseMinuteOfDay,
  sunsetMinuteOfDay,
}: WeatherHourlyStripProps) {
  const items = stripItems(hours, sunriseMinuteOfDay, sunsetMinuteOfDay)
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}
      style={styles.stripScroll}
    >
      {items.map((item) =>
        item.kind === 'sun' ? (
          <SunStripItem key={`sun-${item.minuteOfDay}`} {...item} />
        ) : (
          <View
            key={item.hour.minuteOfDay}
            style={[styles.hour, item.hour === hours[0] && styles.hourNow]}
          >
            <Text style={styles.hourLabel}>{formatHour(item.hour.minuteOfDay)}</Text>
            <WeatherGlyph icon={item.hour.icon} size={22} />
            <Text style={styles.temp}>{item.hour.temperatureC}°</Text>
            {item.hour.precipitationProbability > 0 ? (
              <Text style={[styles.precip, styles.hourPrecip]}>
                {item.hour.precipitationProbability}%
              </Text>
            ) : null}
          </View>
        ),
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  tile: { alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.md },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  temp: { color: theme.ui.foreground, fontWeight: '600' },
  precip: { color: theme.ui.mutedForeground, fontWeight: '600' },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: theme.ui.card,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.ui.border,
    paddingHorizontal: 12,
    height: 36,
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.ui.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.ui.border,
    padding: 10,
  },
  cardBody: { flex: 1, gap: 1 },
  cardHeadline: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  cardTemp: { color: theme.ui.foreground, fontSize: 22, fontWeight: '700' },
  cardLabel: { color: theme.ui.mutedForeground, fontSize: 12, fontWeight: '500' },
  sunTimes: { gap: 4, alignItems: 'flex-start' },
  sunTime: {
    color: theme.ui.mutedForeground,
    fontSize: 11,
    minWidth: 34,
    textAlign: 'right',
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  stripScroll: { flexGrow: 0 },
  strip: { gap: 4 },
  hour: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
  },
  hourNow: { backgroundColor: theme.ui.muted },
  hourLabel: {
    color: theme.ui.mutedForeground,
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  hourPrecip: { fontSize: 10 },
  sunLabel: { color: theme.ui.mutedForeground, fontSize: 10, fontWeight: '600' },
})
