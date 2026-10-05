import { useFont } from '@shopify/react-native-skia'
import type { FontWeight, MonoWeight } from '@/constants/theme'

/** Metro needs static `require` calls, so every Geist weight is mapped explicitly. */
const fontSources: Record<FontWeight, number> = {
  '300': require('../../assets/fonts/Geist-300.ttf'),
  '400': require('../../assets/fonts/Geist-400.ttf'),
  '500': require('../../assets/fonts/Geist-500.ttf'),
  '600': require('../../assets/fonts/Geist-600.ttf'),
  '700': require('../../assets/fonts/Geist-700.ttf'),
  '800': require('../../assets/fonts/Geist-800.ttf'),
  '900': require('../../assets/fonts/Geist-900.ttf'),
}

const monoSources: Record<MonoWeight, number> = {
  '500': require('../../assets/fonts/GeistTabular-500.ttf'),
  '600': require('../../assets/fonts/GeistTabular-600.ttf'),
  '700': require('../../assets/fonts/GeistTabular-700.ttf'),
  '800': require('../../assets/fonts/GeistTabular-800.ttf'),
}

/** App font (Geist) as a Skia `SkFont` for canvas text. Returns null until loaded. */
export const useSkiaFont = (weight: FontWeight, size: number) => useFont(fontSources[weight], size)

/** Readout font (Geist with tabular digits) as a Skia `SkFont`. Returns null until loaded. */
export const useSkiaMonoFont = (weight: MonoWeight, size: number) =>
  useFont(monoSources[weight], size)
