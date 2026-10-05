const HEX_COLOR = /^#([0-9a-f]{6})$/i

/** How much of a hue's saturation a mark keeps. The brand accents are tuned for UI chrome; on a map
 * they read neon, so marks wear a quieter version of the same hue. */
export const MAP_MARK_SATURATION = 0.5

/** Reds carry alarm (the route end, an error), so they keep more of their saturation. */
export const RED_MARK_SATURATION = 0.8

function hexToHsl(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16)
  const r = ((value >> 16) & 255) / 255
  const g = ((value >> 8) & 255) / 255
  const b = (value & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h =
    max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, s, l]
}

function hslToHex(h: number, s: number, l: number): string {
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const channel = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return `#${[0, 8, 4]
    .map((n) =>
      Math.round(channel(n) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

/** The hue with its saturation reduced; non-hex colors are returned unchanged. */
export function muteMarkColor(color: string, saturation = MAP_MARK_SATURATION): string {
  if (!HEX_COLOR.test(color)) return color
  const [h, s, l] = hexToHsl(color)
  return hslToHex(h, s * saturation, l)
}
