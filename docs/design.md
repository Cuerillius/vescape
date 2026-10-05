# Design Language

Visual design principles for the Vescape app. Follow these when building or modifying UI.

> **Every color in the app must come from the `theme` object in `src/constants/theme.ts`.**
> Never hardcode a hex value (`#...`), rgba literal, or any color string directly in a component file.
> If you need a new color, add a token to `theme.ts` first — then use it everywhere via `theme.*`.

> **No large solid bright fills — anywhere in the app.**
> Bright accent colours (`theme.*.color`) are for **thin borders, icons, and text**, not for filling large areas. Avoid `weight="fill"` glyphs, bright filled discs/badges/blocks, and bright-coloured backgrounds behind content. State and emphasis come from thin borders + coloured icons/text on the dark surface.
> Permitted fills: neutral surfaces (`theme.ui.card`/`muted`), tinted pill backgrounds (`theme.*.bg`), and the primary `Button`. Small bright accents (a thin underline, a dot, a 1–2px border) are fine; large bright planes are not.

## Theme

The app has adaptive light and dark appearances. The durable `themeMode` setting supports:

- `system` (default) — follows the phone appearance.
- `light` — always light.
- `dark` — always dark.
- `sun` — light between local sunrise and sunset, dark otherwise, using the current or last known GPS location. It falls back to the system appearance when no location is available.

App theme and map style are independent preferences. Selecting a map never changes `themeMode`. The Streets option renders One Dark in dark appearance and Outdoors in light appearance, including System and Sunrise & sunset transitions. Existing saved `onedark` and `outdoors` selections both represent Streets; theme changes do not rewrite the saved map choice. Satellite and Mapy.cz remain selected across appearance changes.

Surface, text, and border colors come from `theme.ui` (the shadcn zinc tokens), while accent UI colors come from `theme.palette.<hue>`. Both are backed by iOS dynamic colors and Android day/night resources, so values captured by `StyleSheet.create` still update when the active appearance changes. On Android, `plugins/withThemeRecreate.ts` drops `uiMode` from the main activity's `configChanges`: already-mounted views resolve a color resource once, so a theme switch recreates the activity (the JS runtime, navigation, stores and BLE survive) instead of leaving old colors on screen. `theme.palette.slate` remains a raw dark swatch for fixed dark map styles; do not use it for app surfaces or text.

The light appearance uses a pure-white canvas. Read-only content sits directly on that canvas and is separated with spacing, typography, or thin `theme.ui.border` rules rather than raised cards. Interactive controls use `theme.ui.muted` with a `theme.ui.border` outline in both appearances, making affordances obvious without shadows. Never use the fixed `theme.palette.slate.*` raw swatches for app chrome; they stay near-black in both appearances and are reserved for on-map/chart graphics.

Colored actions — `Button` accent/tune/success/destructive/groupRide, `IconButton` destructive/accent, the map-sheet primary `Ride it` / `Navigate` and `Cancel`, and map-sheet delete/save/vote buttons — carry their identity in the accent: the accent tints the surface beneath at `coloredAction.tint`, with accent-coloured text and border in the active appearance. They never use white-on-accent or a bright translucent fill alone.

Telemetry colors are appearance-specific. The light variants are darker than their dark-appearance counterparts so gauges, charts, routes, and small labels retain contrast against white. Use `theme.telemetry` for React Native styles and `useResolvedTelemetryColors()` for renderers.

Non-React-Native renderers and worklets use the plain-string palettes from `useResolvedUiColors()` and `useResolvedAccentColors()`; native adaptive color objects must not cross into Mapbox, Skia, Reanimated worklets, or string-valued state.

Android native `Switch` color props also receive resolved string colors. Its native color converter does not reliably resolve the adaptive resource-path value used by the rest of the React Native style system.

Satellite follows the effective app appearance with a navy backdrop in dark mode and a light backdrop in light mode. Home and Explore retain independent imagery-opacity preferences.

| Role                | Token                      |
| ------------------- | -------------------------- |
| Background          | `theme.ui.background`      |
| Card / surface      | `theme.ui.card`            |
| Control / inset     | `theme.ui.muted`           |
| Border / divider    | `theme.ui.border`          |
| Primary text / icon | `theme.ui.foreground`      |
| Secondary text      | `theme.ui.mutedForeground` |
| Dim text            | `theme.ui.faintForeground` |

## shadcn UI Kit

The whole app is built in a shadcn/ui style on `theme.ui`; the old `neutral`/`control` token sets are gone.

- Tokens: `theme.ui` (zinc `background`, `foreground`, `card`, `muted`, `mutedForeground`, `border`,
  `primary`, `primaryForeground`) and `theme.radius` (`md` 8 for controls, `lg` 12 for cards, `full`
  for pills).
- Primitives live in `src/components/ui/`: `Card` (+ `CardTitle`, `CardDescription`), `Button`
  (`primary` / `secondary` / `outline` / `ghost` / `floating`, square when icon-only), `Badge`,
  `Progress`, `Accordion`, `Drawer`, `Separator`, `Switch`, `SegmentedControl` (and `SegmentedMenu`, which
  folds into one). Previews are under Settings → Components, which also covers the tokens,
  the navbar, the map, and the dashboard and metric components.
- `/control/<metric>` detail screens use `MetricDetailScreen`: a live hero with headroom to the
  configured limit, and under it one `Accordion` (one row open at a time, the chart open first) with
  the live window ("Last 5 min"), Alerts and Limits. Closed rows carry a one-line summary. The rest
  is flat, with spacing and hairlines doing the grouping.
- The kit is monochrome. Hierarchy comes from a 1px `ui.border`, the `card` step over `background`,
  and `mutedForeground` captions. Accent hues appear only as state: a status dot, a destructive
  tint, or the hot duty arc.
- Captions sit above values in sentence case (`CardDescription`), not as uppercase eyebrows.

## Layout Principles

- **No decorative boxes or elevation.** Cards wrap only interactive groups (rows with inputs, switches, buttons). Do not wrap static info or labels in bordered containers, and do not use shadows to make hierarchy.
- **Flat rows.** Settings-style rows are icon + label + control, no background box around the icon.
- **Breathing room.** Use padding and gap, not borders, to separate content sections.
- **Section titles** are uppercase, small (`12–13px`), muted (`theme.ui.mutedForeground`), with letter-spacing.

## Semantic Colors

Use `src/constants/theme.ts` for all accent colors. Never hardcode a hex value, `rgba(...)` literal, or any color string directly in a component.

`theme.tune` aliases the purple palette for Tune Profile actions and entry points.

The theme is organized into domains:

### `palette`

Each accent hue has two appearance-specific palettes. Use `color` for icons and thin emphasis, `text` for foreground text, `bg`/`border` for tinted controls, and the `solid`/`onSolid` pair for filled actions such as primary buttons. Never place a guessed black or white label over an accent fill.

Named hue swatches. Every hue exposes `.color`, `.alt` (alias of `.light`), `.light`, `.text`, `.bg`, and `.border`.

| Hue       | Purpose                                        |
| --------- | ---------------------------------------------- |
| `cyan`    | Brand / primary accents                        |
| `sky`     | Board data, version, distance, speed           |
| `green`   | GPS, Android platform, success, battery        |
| `purple`  | Time, iOS platform, profiles                   |
| `amber`   | Weather sun, diagnostic indicators             |
| `orange`  | Warnings, motor and controller temperatures    |
| `red`     | Destructive actions, errors                    |
| `yellow`  | Stars, achievements, gauges                    |
| `blue`    | Currents, info states                          |
| `fuchsia` | Roll telemetry                                 |
| `pink`    | Balance pitch telemetry                        |
| `violet`  | Map trail / marker accents                     |
| `slate`   | Neutral surfaces, text, borders, map buildings |
| `mono`    | Pure black and white                           |

### `telemetry`

Appearance-specific tokens for every metric. Use these for charts, sparklines, gauges, and live readouts so the same metric keeps its identity while meeting the contrast needs of dark and white canvases.

| Token            | Source hue             |
| ---------------- | ---------------------- |
| `speed`          | Speed / distance blue  |
| `duty`           | Duty-cycle teal        |
| `motorCurrent`   | Motor-current blue     |
| `battCurrent`    | Battery-current blue   |
| `motorTemp`      | Motor-temperature red  |
| `controllerTemp` | Controller-temp orange |
| `battVoltage`    | Battery green          |
| `footpad1`       | Footpad neutral 1      |
| `footpad2`       | Footpad neutral 2      |
| `pitch`          | Pitch purple           |
| `roll`           | Roll fuchsia           |
| `balancePitch`   | Balance-pitch pink     |

### `map`

| Token           | Purpose              |
| --------------- | -------------------- |
| `user`          | Current GPS position |
| `target`        | Destination / target |
| `buildingDark`  | Dark map buildings   |
| `buildingLight` | Light map buildings  |

### `status`

Semantic UI-state tokens. Each exposes `.color`, `.text`, `.bg`, and `.border`.

| Token      | Meaning                |
| ---------- | ---------------------- |
| `info`     | Informational callouts |
| `success`  | Success / connected    |
| `warning`  | Warnings               |
| `error`    | Errors / destructive   |
| `favorite` | Favorites / stars      |

### `alpha`

Every translucent value (overlays, backdrops, zone tints, glow gradients, vignettes) must be created with `theme.alpha(color, level)` using one of the typed levels:

```ts
type AlphaLevel = 0 | 0.12 | 0.3 | 0.4 | 0.6 | 0.7 | 0.8 | 0.85 | 1
```

Neutral row icons use `theme.ui.mutedForeground`.

## Icons

Use Tabler icons (`@tabler/icons-react-native`), outline by default. Each icon gets a distinct accent color from `theme` — do not reuse the same color for adjacent icons.

Board Warnings use `EngineIcon` everywhere. VESC faults use `WarningDiamondIcon` with
`theme.status.caution`, the yellow status palette. The Edit Board battery entry uses
`theme.settingsIcon.battery`, green. Yellow in these controls is reserved for warnings and alerts.
Empty-state placeholders, including "No faults" and "No warnings", use the default gray
`theme.ui.mutedForeground` icon, not the feature's warning accent.

Icon sizing:

- `14` — inline metadata, header stats
- `16–18` — row icons in settings/lists
- `20` — row icons inside icon boxes (legacy card rows)

## Status & Selection Indicators

A specific application of the no-bright-fills rule. Status and selection states (checklist steps, radios, progress milestones) use **thin-bordered outline circles**:

- Wrap the indicator in a generous circle (`40–44px`, `borderWidth: 1.5`, transparent background). State is carried by the **thin border colour + the icon colour**, both from `theme.*` — done in `gps`, active in `wheel`, error in `error`, idle in `theme.ui.border`/`textMuted`.
- Never a `weight="fill"` disc or filled dot — a bright filled glyph reads as a heavy blob on the dark surface.
- **Bigger is calmer.** Prefer large outline circles with breathing room over small dense glyphs.

## Cards

Use cards (`backgroundColor: theme.ui.card`, `borderRadius: 12`, `borderColor: theme.ui.border`) only for grouping interactive elements (switches, steppers, pressable rows). A card groups related controls — not labels or read-only info.

Inside cards, separate rows with a thin `theme.ui.border` line indented past the icon (`marginLeft: 58`).

**Corner sheets (Drawer) in light theme use a translucent white body** — free-floating fields on that surface read as unfinished. Group a sheet's interactive content in the same card boxes used on the settings screens (`Card` from `src/components/ui/`), with the sheet's mode switch (e.g. tab pills) and primary action sitting outside the card.

## Info Headers

For screen headers showing metadata (version, OS, DB size), use centered text without card wrappers:

- App name large and bold
- Stats in a horizontal row with colored icons + small muted text
- No background, no border — sits directly on screen background

## Typography

The app has **one typeface: Geist**, shipped as official static per-weight files (`assets/fonts/Geist-300.ttf` … `Geist-900.ttf`, OFL, see `Geist-OFL.txt`) and loaded in `src/app/_layout.tsx` via `expo-font`'s `useFonts` before the `Stack` mounts. The splash stays visible until the fonts are ready on cold start. Static files with correct embedded family, style, and PostScript names are required: Android does not move a custom variable font's `wght` axis, while iOS relies on the embedded names to distinguish registered faces.

Every `Text` instance renders through the wrapper at `src/components/base/Text.tsx`, which reads `fontWeight` from the style and resolves it to the matching family via `theme.font(weight)` (default `'400'`). Import `Text` from `@/components/base/Text` — never import `Text` from `react-native` directly for UI text.

- `theme.font(weight)` in `src/constants/theme.ts` is the single source of truth for per-file aliases (`'Geist-500'` etc.). Components keep writing plain `fontWeight: '600'` and rely on the wrapper; never inline `'Geist…'` in a component or style.
- Numeric readouts use **Geist Tabular** via `theme.mono(weight)` (`assets/fonts/GeistTabular-500.ttf` … `-800.ttf`). It is Geist with its own tabular (`tnum`) digits remapped as the default digits, generated from the matching Geist weight with fontTools (cmap for `0`–`9` pointed at the `tnum` substitutes, family renamed). Geist's default digits are proportional, and Skia cannot apply OpenType features to plain text, so this is what keeps live values from shifting width as they tick. Rebuild these files from a new Geist release the same way. The platform `fontFamily: 'monospace'` alias is still used for developer-facing code and log text (event log, raw settings).
- Live values (anything driven by a shared value rather than a React render) go through `MonoValue` / `TickText` in `src/components/base/`, which draw on Skia. Never render a live value into a non-editable `TextInput` through `animatedProps` — a test in `src/components/base/liveReadouts.test.ts` fails if that pattern comes back.
- Every canvas is a separate native surface, so do not mount one per readout. When the parent already draws on Skia, put a **`MonoText`** node in that canvas instead of a `MonoValue` — that is how the gauges draw their value and unit, and how `BmsCellVoltages` fits every cell row onto one canvas. `MonoValue` is `MonoText` plus a canvas, for readouts that sit on plain views.
- Bars and indicators driven by live values belong on the same canvas as the numbers. An animated percentage `width` is a layout prop: it runs a Yoga pass per frame per row, which is what the cell rows used to do.
- A Skia canvas does **not** grow to fit its text the way a `Text`/`TextInput` box does. Give `MonoValue` a `width`, or a parent with a definite width plus `alignSelf: 'stretch'`, or the readout collapses or clips. Canvases drawn at a measured size use `useCanvasSize` on a host view (`onLayout` is unsupported on a Fabric canvas).
- Stack header titles (and any style fed to a native component that bypasses the wrapper) must set `fontFamily: theme.font('600')` explicitly — see `src/app/_layout.tsx` `headerTitleStyle` — and must not set `fontWeight`.
- `fontVariant: ['tabular-nums']` aligns numeric columns in regular `Text`.

Watch companions still use Raleway for labels and JetBrains Mono for numeric readouts: Wear OS copies `Raleway-500/600` and `JetBrainsMono-500/600` from `assets/fonts/` (`plugins/withWearMirror.ts`) and watchOS bundles its own copies. They move to Geist when the watch UI is rebuilt. Their native typography helpers keep watch-specific sizes; system symbols and the watchOS system clock keep the platform font.

Typography roles:

| Role          | Size  | Weight | Token                      |
| ------------- | ----- | ------ | -------------------------- |
| Screen title  | 20    | 700    | `theme.ui.foreground`      |
| Row label     | 15    | 600    | `theme.ui.foreground`      |
| Row hint      | 12    | 500    | `theme.ui.mutedForeground` |
| Section title | 12–13 | 700    | `theme.ui.mutedForeground` |
| Metadata      | 12    | 500    | `theme.ui.mutedForeground` |
| Stepper value | 15    | 700    | `theme.ui.foreground`      |

Roles are defined in `src/components/base/Text.tsx`.

> Any `Text` without an explicit `fontWeight` resolves to Geist `400` (Regular) — see the wrapper at `src/components/base/Text.tsx`.

## Avoid

- Wrapping non-interactive content in cards or bordered boxes
- Using the same icon color for adjacent items
- Solid bright fills for status/selection (filled check discs, `weight="fill"` dots) — use thin-bordered outline circles instead
- `Alert.alert` — use `ConfirmModal` instead
- Ad-hoc `Pressable` + `Text` — use `Button` or `IconButton`
- Emoji or unicode as icon substitutes
