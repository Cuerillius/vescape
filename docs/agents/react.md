# React Native

React Native UI conventions for this repo. Add component, styling, navigation, animation, and Expo Router guidance here when it becomes stable enough to apply across the app.

For visual design principles (colors, layout, typography, when to use cards), see [`docs/design.md`](../design.md).

## Colors

Every color must come from the `theme` object in `src/constants/theme.ts`. Never hardcode a hex or rgba value directly in a component.

Use `theme.ui` for the canvas, surfaces, separators, copy, and interactive surfaces. Use `theme.palette.<hue>` for adaptive accent text, icons, borders, and small tinted states rendered by React Native. Metric visuals use `theme.telemetry`. Raw `theme.palette.slate` values are fixed dark swatches for map JSON and other non-adaptive assets.

The adaptive ui, accent, and telemetry tokens are native color objects at runtime. Mapbox, Skia, Reanimated worklets, and string-valued state/options cannot consume them. Use the corresponding hooks from `src/hooks/useTheme.ts`: `useResolvedUiColors()`, `useResolvedAccentColors()`, and `useResolvedTelemetryColors()`. Pass only their plain string values into the renderer or data structure.

Type native-facing color props as `ThemeColor`; keep renderer inputs and persisted colors typed as `string`. Resolve individual tokens with `useResolvedColor`, or `resolveAdaptiveColor(color, appearance)` outside React. Resolve before building color-based grouping keys, too. Casting a token to `string` bypasses this boundary without converting its runtime value.

`theme.native.test.ts` exercises native-shaped Android/iOS colors in isolated processes, since the normal test preload uses strings. Its type assertions also prevent adaptive tokens from becoming string-compatible again.md`.

Filled actions use the resolved hue's `solid` background and `onSolid` content pair. Do not infer the foreground from `color`, `text`, or a fixed black/white value; the pair is contrast-checked separately for each appearance.

```tsx
import { theme } from '@/constants/theme'

// ✅ Good
backgroundColor: theme.ui.muted,
color: theme.telemetry.speed,

// ❌ Bad
backgroundColor: '#1e293b',
color: '#38bdf8',
```

## No barrel files

Do not create `index.ts` barrel files under `src/components/` or any of its subdirectories.

- Import components directly from their source file: `import { Foo } from '@/components/Foo'` or `import { Foo } from '@/components/settings/Foo'`.
- Barrel files add indirection, slow down TypeScript resolution, and create merge conflicts when multiple agents touch the same index file.

## Component Gallery

When creating or significantly changing a reusable UI component, add or update its showcase in
`src/app/settings/components/` in the same change.

- When asked to create a component, create a real component file under `src/components/` or the
  appropriate subdirectory such as `src/components/settings/`. Do not hide reusable UI as a
  function at the top of a screen file.
- Use `NewShowcaseCard` and the controls from `@/components/dev/NewShowcaseControls`.
- Include useful variants, states, and props that future agents/design checks need to see.
- Keep showcase data local and deterministic enough for quick visual inspection.
- Skip only components that are route-specific screens or tiny private sub-components with no reuse surface.

## Icons

Use **`@tabler/icons-react-native`** for icons. Do **not** use emoji or unicode characters as icon substitutes.

```tsx
import IconBolt from '@tabler/icons-react-native/IconBolt'
import type { Icon as TablerIcon } from '@tabler/icons-react-native'
import { theme } from '@/constants/theme'
;<IconBolt size={16} color={theme.ui.foreground} strokeWidth={2.5} />
```

- Import each icon from its own path (`@tabler/icons-react-native/Icon<Name>`) and keep Tabler's
  `Icon<Name>` name. Never value-import the package root: Metro does not tree-shake, so the barrel
  pulls all ~6,000 icons into the bundle (an icon barrel already exhausted Metro's open-file limit on
  Windows). Type-only imports such as `type Icon` from the root are fine. Per-icon types come from
  `src/types/tabler-icons.d.ts`, because the package's own `exports` types point at the wrong folder.
- Outline icons take `strokeWidth` (2 default, 2.5–3.25 for heavier marks). For a solid glyph use
  the `Icon<Name>Filled` variant, not a `fill` prop.
- `size` is typically `10`-`16` for inline or label icons, larger for standalone UI elements.

## Icon buttons

Use **`IconButton`** (`@/components/IconButton`) for all circular icon-only pressables. Do not build ad-hoc `Pressable` + icon combinations.

```tsx
import { IconButton } from '@/components/IconButton'
import IconArrowLeft from '@tabler/icons-react-native/IconArrowLeft'
import IconTrash from '@tabler/icons-react-native/IconTrash'

<IconButton icon={IconArrowLeft} onPress={handleBack} />
<IconButton icon={IconTrash} destructive onPress={handleDelete} disabled={!canDelete} />
<IconButton icon={IconRefresh} size="lg" loading={syncing} onPress={handleSync} />
```

- `size`: `'sm'` (default, 38×38 — headers, overlays) | `'lg'` (54×54 — bottom/content area)
- `destructive` shifts border to red-tinted and auto-tints icon to `theme.error.text` — no manual color needed
- `loading` disables the button and shows an `ActivityIndicator` in the icon color
- `style` accepts layout-level `ViewStyle` (position, margin, bottom/top/left/right)
- The default surface uses `theme.ui.muted`, `theme.ui.border`, and `theme.ui.foreground`; destructive state changes the accent without abandoning the muted interaction language.

## Switches

Use **`Switch`** (`@/components/ui/Switch`) for every boolean toggle. React Native's `Switch` is
not used anywhere in the app — its platform sizes disagree.

```tsx
import { Switch } from '@/components/ui/Switch'

;<Switch value={enabled} onValueChange={setEnabled} accessibilityLabel="Lights" />
```

- It is a monochrome shadcn-style pill: the thumb rides to the primary-filled end when on.
- `value` is a plain `boolean`; `disabled` dims it.

For one-of-several choices, put **`RadioIndicator`** (`@/components/controls/RadioIndicator`) on
the row that owns the press.

## Buttons

Use **`Button`** (`@/components/Button`) for all tappable button actions. Do not build ad-hoc `Pressable` + `Text` combinations for buttons.

```tsx
import { Button } from '@/components/Button'
import IconTrash from '@tabler/icons-react-native/IconTrash'

<Button label="Save" onPress={handleSave} />
<Button label="Cancel" variant="secondary" onPress={handleCancel} />
<Button label="Delete" variant="destructive" icon={IconTrash} onPress={handleDelete} />
<Button label="Saving…" loading={isSaving} onPress={handleSave} />
```

- `variant`: `'primary'` (default, blue fill) | `'secondary'` (ghost/outline) | `'destructive'` (red fill)
- `size`: `'md'` (default, h40) | `'sm'` (h32)
- `icon`: Tabler `Icon` type — rendered left of the label
- `loading` disables the button and shows an `ActivityIndicator`
- `style` accepts layout-level `ViewStyle` (e.g. `flex: 1`, margins) — do not use it for visual overrides

## Confirmation dialogs

Use **`ConfirmModal`** (`@/components/ConfirmModal`) instead of `Alert.alert` for all confirmation prompts. `Alert.alert` renders a plain OS dialog that looks out of place in the dark-themed UI.

```tsx
import { ConfirmModal } from '@/components/ConfirmModal'

const [confirmVisible, setConfirmVisible] = useState(false)

<ConfirmModal
  visible={confirmVisible}
  title="Delete item"
  message="This cannot be undone."
  confirmLabel="Delete"
  destructive
  onConfirm={() => { deleteItem(); setConfirmVisible(false) }}
  onCancel={() => setConfirmVisible(false)}
/>
```

- Drive visibility with state (`useState<boolean>` or `useState<T | null>` when you need to remember _what_ to confirm).
- Set `destructive` for irreversible actions — it renders the confirm button in red.
- `confirmLabel` and `cancelLabel` default to "Confirm" / "Cancel"; override when a specific verb is clearer.
