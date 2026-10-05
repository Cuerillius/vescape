/**
 * Semantic color tokens for Vescape.
 *
 * New structure:
 *   - ui: shadcn/ui zinc tokens for surfaces, text and borders
 *   - palette: named hue swatches + mono + slate (raw map/chart swatches)
 *   - telemetry: single-color token per metric
 *   - map: user/target/building colors
 *   - status: semantic UI-state tokens (info/success/warning/error/favorite)
 *   - alpha: typed opacity helper for every translucent value
 *
 * Never hardcode a color that belongs to one of these categories directly in a
 * component. Add new tokens here first, then reference them via theme.*.
 */

import * as ReactNative from 'react-native'

export type ResolvedTheme = 'light' | 'dark'

const ReactNativeModule =
  (ReactNative as typeof ReactNative & { default?: typeof ReactNative }).default ?? ReactNative

/** Allowed opacity levels for every translucent color value. */
export type AlphaLevel = 0 | 0.03 | 0.1 | 0.12 | 0.3 | 0.4 | 0.6 | 0.7 | 0.75 | 0.8 | 0.85 | 1

export const ALPHA_RESOURCE_SUFFIX = {
  0: '000',
  0.03: '003',
  0.1: '010',
  0.12: '012',
  0.3: '030',
  0.4: '040',
  0.6: '060',
  0.7: '070',
  0.75: '075',
  0.8: '080',
  0.85: '085',
  1: '100',
} as const satisfies Record<AlphaLevel, string>

interface AdaptiveColorMetadata {
  resource: string
  dark: string
  light: string
}

/** Native-compatible theme token. Resolve it before passing it to a string-only renderer. */
export type ThemeColor = ReactNative.ColorValue

const adaptiveColorMetadata = new WeakMap<object, AdaptiveColorMetadata>()

function adaptiveColor(resource: string, dark: string, light: string): ThemeColor {
  const metadata: AdaptiveColorMetadata = { resource, dark, light }
  let color: unknown

  if (ReactNativeModule.Platform?.OS === 'ios') {
    color = ReactNativeModule.DynamicColorIOS({ dark, light })
  } else if (ReactNativeModule.Platform?.OS === 'android') {
    color = ReactNativeModule.PlatformColor(`@color/vescape_${resource}`)
  } else {
    return dark
  }

  adaptiveColorMetadata.set(color as object, metadata)
  return color as ReactNative.OpaqueColorValue
}

/** Resolve an adaptive native color to a renderer-safe string for the current appearance. */
export function resolveAdaptiveColor(color: ThemeColor, appearance: ResolvedTheme): string {
  if (typeof color === 'string') return color
  const metadata = adaptiveColorMetadata.get(color)
  if (!metadata) throw new Error('Cannot resolve an unregistered native theme color')
  return metadata[appearance]
}

function alpha(color: string, level: AlphaLevel): string
function alpha(color: ThemeColor, level: AlphaLevel): ThemeColor
function alpha(color: ThemeColor, level: AlphaLevel): ThemeColor {
  const colorValue = color as unknown
  const adaptive =
    typeof colorValue === 'object' && colorValue !== null
      ? adaptiveColorMetadata.get(colorValue)
      : undefined
  if (adaptive) {
    return adaptiveColor(
      `${adaptive.resource}_alpha_${ALPHA_RESOURCE_SUFFIX[level]}`,
      alpha(adaptive.dark, level),
      alpha(adaptive.light, level),
    )
  }

  if (typeof color !== 'string')
    throw new Error('Cannot apply alpha to an unregistered native theme color')

  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const [r, g, b] =
      hex.length === 3
        ? [
            Number.parseInt(hex[0] + hex[0], 16),
            Number.parseInt(hex[1] + hex[1], 16),
            Number.parseInt(hex[2] + hex[2], 16),
          ]
        : [
            Number.parseInt(hex.slice(0, 2), 16),
            Number.parseInt(hex.slice(2, 4), 16),
            Number.parseInt(hex.slice(4, 6), 16),
          ]
    return `rgba(${r},${g},${b},${level})`
  }

  if (color.startsWith('rgba')) {
    return color.replace(/,[^,]+\)$/, `,${level})`)
  }

  if (color.startsWith('rgb')) {
    return color.replace(')', `,${level})`).replace('rgb', 'rgba')
  }

  throw new Error(`Unsupported color format for alpha(): ${color}`)
}

interface Hue<Color = string> {
  color: Color
  /** Alternate shade within the same hue — aliases `light`. */
  alt: Color
  light: Color
  text: Color
  bg: Color
  border: Color
}

export type AccentHue = Hue & {
  /** Filled action background. */
  solid: string
  /** Content drawn on `solid`. */
  onSolid: string
}

function hue(
  color: string,
  light: string,
  text: string,
  bg: string,
  border: string,
  solid: string,
  onSolid: string,
): AccentHue {
  return { color, alt: light, light, text, bg, border, solid, onSolid }
}

/** Plain strings for renderers and for semantic solid/on-solid action pairs. */
export const accentColors = {
  dark: {
    sky: hue('#38bdf8', '#7dd3fc', '#7dd3fc', '#0c2a3f', '#0369a1', '#0369a1', '#ffffff'),
    cyan: hue('#06b6d4', '#67e8f9', '#67e8f9', '#083344', '#0e7490', '#0e7490', '#ffffff'),
    blue: hue('#60a5fa', '#818cf8', '#bfdbfe', '#0f1d2e', '#1e3a5f', '#1d4ed8', '#ffffff'),
    green: hue('#22c55e', '#4ade80', '#4ade80', '#14532d', '#15803d', '#15803d', '#ffffff'),
    amber: hue('#f59e0b', '#fbbf24', '#fde68a', '#451a03', '#92400e', '#b45309', '#ffffff'),
    orange: hue('#f97316', '#fb923c', '#fdba74', '#431407', '#9a3412', '#c2410c', '#ffffff'),
    red: hue('#ef4444', '#f87171', '#fca5a5', '#7f1d1d', '#991b1b', '#b91c1c', '#ffffff'),
    yellow: hue('#facc15', '#fde047', '#fde047', '#422006', '#854d0e', '#a16207', '#ffffff'),
    purple: hue('#a855f7', '#a78bfa', '#d8b4fe', '#1e1338', '#7e22ce', '#7e22ce', '#ffffff'),
    fuchsia: hue('#c084fc', '#e879f9', '#f0abfc', '#4a0444', '#a21caf', '#a21caf', '#ffffff'),
    violet: hue('#7c6fef', '#8b5cf6', '#a78bfa', '#2e1065', '#5b21b6', '#5b21b6', '#ffffff'),
    teal: hue('#14b8a6', '#2dd4bf', '#99f6e4', '#042f2e', '#0f766e', '#0f766e', '#ffffff'),
    groupRide: hue('#10c69a', '#5eead4', '#7af0d6', '#04302a', '#0c8f74', '#0f766e', '#ffffff'),
    pink: hue('#ec4899', '#f472b6', '#fbcfe8', '#500724', '#be185d', '#be185d', '#ffffff'),
    beige: hue('#d6c2a5', '#e8dcc8', '#f5eee4', '#3a3026', '#8d7353', '#806549', '#ffffff'),
  },
  light: {
    sky: hue('#0284c7', '#0ea5e9', '#075985', '#e0f2fe', '#7dd3fc', '#0ea5e9', '#082f49'),
    cyan: hue('#0891b2', '#06b6d4', '#155e75', '#cffafe', '#67e8f9', '#22d3ee', '#083344'),
    blue: hue('#2563eb', '#3b82f6', '#1e40af', '#dbeafe', '#93c5fd', '#2563eb', '#ffffff'),
    green: hue('#16a34a', '#22c55e', '#166534', '#dcfce7', '#86efac', '#22c55e', '#052e16'),
    amber: hue('#d97706', '#f59e0b', '#92400e', '#fef3c7', '#fcd34d', '#f59e0b', '#451a03'),
    orange: hue('#ea580c', '#f97316', '#9a3412', '#ffedd5', '#fdba74', '#f97316', '#431407'),
    red: hue('#dc2626', '#ef4444', '#991b1b', '#fee2e2', '#fca5a5', '#dc2626', '#ffffff'),
    yellow: hue('#ca8a04', '#eab308', '#854d0e', '#fef9c3', '#fde047', '#facc15', '#422006'),
    purple: hue('#9333ea', '#a855f7', '#6b21a8', '#f3e8ff', '#d8b4fe', '#7c3aed', '#ffffff'),
    fuchsia: hue('#c026d3', '#d946ef', '#86198f', '#fae8ff', '#f0abfc', '#d946ef', '#2e064d'),
    violet: hue('#7c3aed', '#8b5cf6', '#5b21b6', '#ede9fe', '#c4b5fd', '#7c3aed', '#ffffff'),
    teal: hue('#0d9488', '#14b8a6', '#115e59', '#ccfbf1', '#5eead4', '#14b8a6', '#042f2e'),
    groupRide: hue('#0d9488', '#10b981', '#115e59', '#ccfbf1', '#5eead4', '#10b981', '#032e27'),
    pink: hue('#db2777', '#ec4899', '#9d174d', '#fce7f3', '#f9a8d4', '#ec4899', '#3f071f'),
    beige: hue('#8d7353', '#a68a66', '#614d37', '#f5eee4', '#d6c2a5', '#d6c2a5', '#3a3026'),
  },
} as const

export type ResolvedAccentColors = (typeof accentColors)[ResolvedTheme]

type AccentName = keyof (typeof accentColors)['dark']

function adaptiveHue(name: AccentName): Hue<ThemeColor> {
  const dark = accentColors.dark[name]
  const light = accentColors.light[name]
  const resourceName = name === 'groupRide' ? 'group_ride' : name
  return {
    color: adaptiveColor(`accent_${resourceName}_color`, dark.color, light.color),
    alt: adaptiveColor(`accent_${resourceName}_light`, dark.light, light.light),
    light: adaptiveColor(`accent_${resourceName}_light`, dark.light, light.light),
    text: adaptiveColor(`accent_${resourceName}_text`, dark.text, light.text),
    bg: adaptiveColor(`accent_${resourceName}_bg`, dark.bg, light.bg),
    border: adaptiveColor(`accent_${resourceName}_border`, dark.border, light.border),
  }
}

export const palette = {
  mono: { black: '#000000', white: '#ffffff' },
  slate: {
    color: '#64748b',
    alt: '#94a3b8',
    light: '#94a3b8',
    text: '#cbd5e1',
    bg: '#111827',
    surface: '#1e293b',
    surfaceDeep: '#0f172a',
    border: '#334155',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    textDim: '#475569',
    mapBuildingDark: '#3e4451',
    mapBuildingLight: '#e5e7eb',
  },
  sky: {
    ...adaptiveHue('sky'),
    snow: adaptiveColor('accent_sky_snow', '#bae6fd', '#0284c7'),
  },
  cyan: adaptiveHue('cyan'),
  blue: adaptiveHue('blue'),
  green: adaptiveHue('green'),
  amber: adaptiveHue('amber'),
  orange: adaptiveHue('orange'),
  red: adaptiveHue('red'),
  yellow: adaptiveHue('yellow'),
  purple: {
    ...adaptiveHue('purple'),
    thunder: adaptiveColor('accent_purple_thunder', '#c084fc', '#9333ea'),
  },
  fuchsia: adaptiveHue('fuchsia'),
  violet: {
    ...adaptiveHue('violet'),
    moon: adaptiveColor('accent_violet_moon', '#a78bfa', '#7c3aed'),
  },
  teal: adaptiveHue('teal'),
  groupRide: adaptiveHue('groupRide'),
  pink: adaptiveHue('pink'),
  beige: adaptiveHue('beige'),
} as const

/**
 * shadcn/ui zinc tokens for the rebuilt UI kit in `src/components/ui/`. Monochrome by design:
 * hierarchy comes from 1px borders, muted text and the card/background step, not from hue.
 */
export const uiColors = {
  dark: {
    background: '#09090b',
    foreground: '#fafafa',
    card: '#18181b',
    muted: '#27272a',
    mutedForeground: '#a1a1aa',
    faintForeground: '#71717a',
    border: '#27272a',
    primary: '#fafafa',
    primaryForeground: '#18181b',
  },
  light: {
    background: '#ffffff',
    foreground: '#09090b',
    card: '#ffffff',
    muted: '#f4f4f5',
    mutedForeground: '#71717a',
    faintForeground: '#a1a1aa',
    border: '#e4e4e7',
    primary: '#18181b',
    primaryForeground: '#fafafa',
  },
} as const

export const ui = {
  background: adaptiveColor('ui_background', uiColors.dark.background, uiColors.light.background),
  foreground: adaptiveColor('ui_foreground', uiColors.dark.foreground, uiColors.light.foreground),
  card: adaptiveColor('ui_card', uiColors.dark.card, uiColors.light.card),
  muted: adaptiveColor('ui_muted', uiColors.dark.muted, uiColors.light.muted),
  mutedForeground: adaptiveColor(
    'ui_muted_foreground',
    uiColors.dark.mutedForeground,
    uiColors.light.mutedForeground,
  ),
  /** Quieter than `mutedForeground`, for secondary marks beside hero text. */
  faintForeground: adaptiveColor(
    'ui_faint_foreground',
    uiColors.dark.faintForeground,
    uiColors.light.faintForeground,
  ),
  border: adaptiveColor('ui_border', uiColors.dark.border, uiColors.light.border),
  primary: adaptiveColor('ui_primary', uiColors.dark.primary, uiColors.light.primary),
  primaryForeground: adaptiveColor(
    'ui_primary_foreground',
    uiColors.dark.primaryForeground,
    uiColors.light.primaryForeground,
  ),
} as const

/** Corner radii of the shadcn kit: controls, cards, and pills. */
export const radius = {
  md: 8,
  lg: 12,
  full: 999,
} as const

/** Colored-action surface: the accent tints the surface beneath at `tint`, with accent-coloured text and border. */
export const coloredAction = {
  tint: 0.12,
} as const

export const telemetryColors = {
  dark: {
    speed: accentColors.dark.sky.color,
    duty: accentColors.dark.teal.color,
    motorCurrent: accentColors.dark.blue.light,
    battCurrent: accentColors.dark.blue.color,
    controllerTemp: accentColors.dark.orange.color,
    motorTemp: accentColors.dark.red.color,
    battVoltage: accentColors.dark.green.light,
    footpad1: uiColors.dark.mutedForeground,
    footpad2: uiColors.dark.faintForeground,
    pitch: accentColors.dark.purple.light,
    roll: accentColors.dark.fuchsia.color,
    balancePitch: accentColors.dark.fuchsia.light,
    altitude: accentColors.dark.amber.color,
    gpsAccuracy: accentColors.dark.green.light,
  },
  light: {
    speed: accentColors.light.sky.color,
    duty: accentColors.light.teal.color,
    motorCurrent: accentColors.light.blue.color,
    battCurrent: accentColors.light.blue.light,
    controllerTemp: accentColors.light.orange.color,
    motorTemp: accentColors.light.red.color,
    battVoltage: accentColors.light.green.color,
    footpad1: uiColors.light.foreground,
    footpad2: uiColors.light.mutedForeground,
    pitch: accentColors.light.purple.color,
    roll: accentColors.light.fuchsia.color,
    balancePitch: accentColors.light.pink.color,
    altitude: accentColors.light.amber.color,
    gpsAccuracy: accentColors.light.green.color,
  },
} as const

export type ResolvedTelemetryColors = (typeof telemetryColors)[ResolvedTheme]
export type TelemetryColorName = keyof ResolvedTelemetryColors

function adaptiveTelemetry(name: TelemetryColorName): ThemeColor {
  const resourceName = name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
  return adaptiveColor(
    `telemetry_${resourceName}`,
    telemetryColors.dark[name],
    telemetryColors.light[name],
  )
}

export const telemetry = {
  speed: adaptiveTelemetry('speed'),
  duty: adaptiveTelemetry('duty'),
  motorCurrent: adaptiveTelemetry('motorCurrent'),
  battCurrent: adaptiveTelemetry('battCurrent'),
  controllerTemp: adaptiveTelemetry('controllerTemp'),
  motorTemp: adaptiveTelemetry('motorTemp'),
  battVoltage: adaptiveTelemetry('battVoltage'),
  footpad1: adaptiveTelemetry('footpad1'),
  footpad2: adaptiveTelemetry('footpad2'),
  pitch: adaptiveTelemetry('pitch'),
  roll: adaptiveTelemetry('roll'),
  balancePitch: adaptiveTelemetry('balancePitch'),
  altitude: adaptiveTelemetry('altitude'),
  gpsAccuracy: adaptiveTelemetry('gpsAccuracy'),
} as const

export const map = {
  user: accentColors.dark.purple.color,
  target: accentColors.dark.green.color,
  buildingDark: palette.slate.mapBuildingDark,
  buildingLight: palette.slate.mapBuildingLight,
} as const

export const status = {
  info: {
    color: palette.blue.color,
    text: palette.blue.text,
    bg: palette.blue.bg,
    border: palette.blue.border,
  },
  success: {
    color: palette.green.color,
    text: palette.green.text,
    bg: palette.green.bg,
    border: palette.green.border,
  },
  caution: {
    color: palette.yellow.color,
    text: palette.yellow.text,
    bg: palette.yellow.bg,
    border: palette.yellow.border,
  },
  warning: {
    color: palette.orange.color,
    text: palette.orange.text,
    bg: palette.orange.bg,
    border: palette.orange.border,
  },
  error: {
    color: palette.red.color,
    text: palette.red.text,
    bg: palette.red.bg,
    border: palette.red.border,
  },
  favorite: {
    color: palette.yellow.color,
    text: palette.yellow.text,
    bg: palette.yellow.bg,
    border: palette.yellow.border,
  },
  upgrade: {
    color: palette.purple.color,
    text: palette.purple.text,
    bg: palette.purple.bg,
    border: palette.purple.border,
  },
} as const

/** Tune Profile actions and entry points. */
export const tune = palette.purple

/** Board lights control — warm headlight accent. */
export const light = {
  accent: palette.amber.color,
} as const

/** Icon accent shared by every entry point for a settings destination. */
export const settingsIcon = {
  battery: palette.green.color,
  account: palette.cyan.color,
  sync: palette.cyan.color,
  update: status.upgrade.color,
  database: status.warning.color,
  link: palette.purple.color,
  automation: palette.sky.color,
  liveTelemetry: telemetry.speed,
  diagnostics: status.warning.color,
  map: palette.sky.color,
  sounds: palette.pink.color,
  watch: palette.amber.color,
  privacyZones: palette.green.color,
  filters: palette.purple.color,
  graphs: palette.cyan.color,
  advanced: ui.mutedForeground,
  dev: palette.yellow.color,
  about: palette.cyan.color,
} as const

/** Banner callouts — flat row, accent icon + neutral text. */
export const banner = {
  info: { icon: status.info.color },
  warning: { icon: status.warning.color },
  error: { icon: status.error.color },
} as const

/** Weather condition icon colors — derived from palette. */
export const weather = {
  sun: palette.amber.light,
  partly: palette.amber.color,
  moon: palette.violet.moon,
  moonPartly: palette.violet.color,
  cloud: palette.slate.light,
  fog: palette.slate.text,
  rain: palette.blue.color,
  snow: palette.sky.snow,
  thunder: palette.purple.thunder,
} as const

/** Privacy zone tints — derived from palette via alpha(). */
export const zone = {
  bg: alpha(palette.green.color, 0.12),
  border: alpha(palette.green.color, 0.6),
  borderDim: alpha(palette.slate.color, 0.6),
} as const

/** Shared press/touch interaction tokens. */
export const interaction = {
  /** Android ripple for bounded pressables (cards, cells). */
  ripple: {
    color: alpha(ui.mutedForeground, 0.12),
    borderless: false,
    foreground: true,
  },
  /** Android ripple for icon-only pressables with no visible bounds. */
  rippleBorderless: {
    color: alpha(ui.mutedForeground, 0.12),
    borderless: true,
    foreground: true,
  },
  /** iOS/cross-platform pressed background for list rows and sheet items. */
  pressedBg: ui.card,
  /** iOS/cross-platform pressed opacity for metric cells and icon buttons. */
  pressedOpacity: 0.55,
} as const

/** Weights shipped as static Geist instances in `assets/fonts/`. Android ignores the
 *  `wght` variation axis of a custom variable font (it renders the file's default
 *  instance), so each weight is its own font file and family name. */
export type FontWeight = '300' | '400' | '500' | '600' | '700' | '800' | '900'

/** App-wide UI font family (Geist) for a given weight. Load via `useFonts` in
 *  `src/app/_layout.tsx` before first render. */
export const font = (weight: FontWeight = '400') => `Geist-${weight}`

export type MonoWeight = '500' | '600' | '700' | '800'

/** Numeric readout family: Geist with its tabular (`tnum`) digits baked in as the defaults, so
 *  live values never shift width as they tick, including in Skia where OpenType features are
 *  unavailable. Same typeface as `font`; only the digit widths differ. */
export const mono = (weight: MonoWeight = '700') => `GeistTabular-${weight}`

export const theme = {
  palette,
  ui,
  radius,
  telemetry,
  map,
  status,
  tune,
  light,
  settingsIcon,
  alpha,
  coloredAction,
  banner,
  weather,
  zone,
  interaction,
  font,
  mono,
} as const
