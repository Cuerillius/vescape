import type { ResolvedTheme } from '@/constants/theme'

/**
 * Swisstopo's Light Base Map colors per role, plus a dark counterpart tuned to sit next to One
 * Dark. Both the Swiss vector overlay and the Swiss-styled Streets read these roles, so the two
 * options can never drift apart.
 */
export interface SwisstopoPalette {
  land: string
  grass: string
  forest: string
  glacier: string
  wetland: string
  sand: string
  water: string
  waterway: string
  waterLabel: string
  building: string
  buildingOutline: string
  roadMinor: string
  roadMinorCasing: string
  roadMajor: string
  roadMajorCasing: string
  motorway: string
  motorwayCasing: string
  /** Single-stroke road colors for styles that draw roads without a casing. */
  streetLine: string
  majorLine: string
  motorwayLine: string
  path: string
  rail: string
  boundary: string
  label: string
  labelMuted: string
  labelHalo: string
  /** Peaks, glaciers and other relief annotations. */
  relief: string
}

export const SWISSTOPO_PALETTES: Record<ResolvedTheme, SwisstopoPalette> = {
  light: {
    land: '#fcfcfc',
    grass: '#e3eadc',
    forest: '#bad2ac',
    glacier: '#cde8f4',
    wetland: '#cce5f5',
    sand: '#f0dabc',
    water: '#c7e0f5',
    waterway: '#8ac3e5',
    waterLabel: '#2f86bc',
    building: '#cfd2d9',
    buildingOutline: '#a8adb8',
    roadMinor: '#ffffff',
    roadMinorCasing: '#8c8c8c',
    roadMajor: '#ffffff',
    roadMajorCasing: '#505050',
    motorway: '#ffe08a',
    motorwayCasing: '#aa881e',
    streetLine: '#c9c9c9',
    majorLine: '#9a9a9a',
    motorwayLine: '#e0a82e',
    path: '#737373',
    rail: '#ff3232',
    boundary: '#d7a6d7',
    label: '#404040',
    labelMuted: '#6b6b6b',
    labelHalo: 'rgba(242, 242, 242, 0.85)',
    relief: '#303030',
  },
  dark: {
    land: '#171e2b',
    grass: '#1c2b2b',
    forest: '#1b3a30',
    glacier: '#23405a',
    wetland: '#17354a',
    sand: '#3a3326',
    water: '#0c2a3f',
    waterway: '#1d5a86',
    waterLabel: '#5fa8d6',
    building: '#283244',
    buildingOutline: '#3b4a60',
    roadMinor: '#3a4558',
    roadMinorCasing: '#0f1522',
    roadMajor: '#4a5870',
    roadMajorCasing: '#0f1522',
    motorway: '#a6842f',
    motorwayCasing: '#2d2410',
    streetLine: '#3a4558',
    majorLine: '#4a5870',
    motorwayLine: '#a6842f',
    path: '#6b7a90',
    rail: '#d94a4a',
    boundary: '#8d6a99',
    label: '#c9cfda',
    labelMuted: '#8a97aa',
    labelHalo: '#171e2b',
    relief: '#aab4c3',
  },
}
