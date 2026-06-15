import { create } from 'zustand'

export const CHART_COLORS = {
  rouge: { stroke: '#CE1126', fill: '#CE1126', label: 'Rouge' },
  vert: { stroke: '#009460', fill: '#009460', label: 'Vert' },
  blanc: { stroke: '#FFFFFF', fill: '#FFFFFF', label: 'Blanc' },
  noir: { stroke: '#000000', fill: '#000000', label: 'Noir' },
} as const

export const HEADER_COLORS = {
  guinea_rouge: { bg: '#CE1126', text: '#FFFFFF', label: 'Guinée Rouge' },
  guinea_vert: { bg: '#009460', text: '#FFFFFF', label: 'Guinée Vert' },
  guinea_white: { bg: '#FFFFFF', text: '#000000', label: 'Guinée Blanc' },
  slate: { bg: '#1e293b', text: '#f1f5f9', label: 'Slate' },
} as const

export type ChartColorKey = keyof typeof CHART_COLORS
export type HeaderColorKey = keyof typeof HEADER_COLORS

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_COLOR: ChartColorKey = 'rouge'
const DEFAULT_COLOR2: ChartColorKey = 'vert'
const DEFAULT_HEADER_COLOR: HeaderColorKey = 'guinea_vert'

const CHART_STORAGE_KEY = 'app-chart-color'
const CHART_STORAGE_KEY2 = 'app-chart-color-2'
const HEADER_STORAGE_KEY = 'app-header-color'

// ─── Helper pour valider la couleur ────────────────────────────────────────────

const isValidChartColor = (color: string): color is ChartColorKey => {
  return color in CHART_COLORS
}

const isValidHeaderColor = (color: string): color is HeaderColorKey => {
  return color in HEADER_COLORS
}

// ─── CSS variable appliers ────────────────────────────────────────────────────

const applyChartColor = (color: ChartColorKey) => {
  const chartColor = CHART_COLORS[color]
  if (chartColor) {
    document.documentElement.style.setProperty('--chart-color', chartColor.stroke)
  } else {
    document.documentElement.style.setProperty('--chart-color', CHART_COLORS[DEFAULT_COLOR].stroke)
  }
}

const applyChartColor2 = (color: ChartColorKey) => {
  const chartColor = CHART_COLORS[color]
  if (chartColor) {
    document.documentElement.style.setProperty('--chart-color-2', chartColor.stroke)
  } else {
    document.documentElement.style.setProperty('--chart-color-2', CHART_COLORS[DEFAULT_COLOR2].stroke)
  }
}

const applyHeaderColor = (color: HeaderColorKey) => {
  const headerColor = HEADER_COLORS[color]
  if (headerColor) {
    document.documentElement.style.setProperty('--header-bg', headerColor.bg)
    document.documentElement.style.setProperty('--header-text', headerColor.text)
  } else {
    document.documentElement.style.setProperty('--header-bg', HEADER_COLORS[DEFAULT_HEADER_COLOR].bg)
    document.documentElement.style.setProperty('--header-text', HEADER_COLORS[DEFAULT_HEADER_COLOR].text)
  }
}

// ─── Store interface ──────────────────────────────────────────────────────────

interface ColorState {
  // Bar 1 (Desktop)
  color: ChartColorKey
  defaultColor: ChartColorKey
  setColor: (color: ChartColorKey) => void
  resetColor: () => void

  // Bar 2 (Mobile)
  color2: ChartColorKey
  defaultColor2: ChartColorKey
  setColor2: (color: ChartColorKey) => void
  resetColor2: () => void

  // Header
  headerColor: HeaderColorKey
  defaultHeaderColor: HeaderColorKey
  setHeaderColor: (color: HeaderColorKey) => void
  resetHeaderColor: () => void
}

// ─── Fonction pour récupérer la couleur stockée en toute sécurité ─────────────

const getStoredChartColor = (key: string, defaultValue: ChartColorKey): ChartColorKey => {
  const stored = localStorage.getItem(key)
  if (stored && isValidChartColor(stored)) {
    return stored
  }
  return defaultValue
}

const getStoredHeaderColor = (): HeaderColorKey => {
  const stored = localStorage.getItem(HEADER_STORAGE_KEY)
  if (stored && isValidHeaderColor(stored)) {
    return stored
  }
  return DEFAULT_HEADER_COLOR
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useColorStore = create<ColorState>(() => {

  const color = getStoredChartColor(CHART_STORAGE_KEY, DEFAULT_COLOR)
  const color2 = getStoredChartColor(CHART_STORAGE_KEY2, DEFAULT_COLOR2)
  const headerColor = getStoredHeaderColor()

  // Init CSS variables au démarrage
  applyChartColor(color)
  applyChartColor2(color2)
  applyHeaderColor(headerColor)

  return {
    // Bar 1
    color,
    defaultColor: DEFAULT_COLOR,
    setColor: (color) => {
      if (!isValidChartColor(color)) {
        console.warn(`Invalid chart color: ${color}, using default ${DEFAULT_COLOR}`)
        color = DEFAULT_COLOR
      }
      localStorage.setItem(CHART_STORAGE_KEY, color)
      applyChartColor(color)
      useColorStore.setState({ color })
    },
    resetColor: () => {
      localStorage.removeItem(CHART_STORAGE_KEY)
      applyChartColor(DEFAULT_COLOR)
      useColorStore.setState({ color: DEFAULT_COLOR })
    },

    // Bar 2
    color2,
    defaultColor2: DEFAULT_COLOR2,
    setColor2: (color2) => {
      if (!isValidChartColor(color2)) {
        console.warn(`Invalid chart color2: ${color2}, using default ${DEFAULT_COLOR2}`)
        color2 = DEFAULT_COLOR2
      }
      localStorage.setItem(CHART_STORAGE_KEY2, color2)
      applyChartColor2(color2)
      useColorStore.setState({ color2 })
    },
    resetColor2: () => {
      localStorage.removeItem(CHART_STORAGE_KEY2)
      applyChartColor2(DEFAULT_COLOR2)
      useColorStore.setState({ color2: DEFAULT_COLOR2 })
    },

    // Header
    headerColor,
    defaultHeaderColor: DEFAULT_HEADER_COLOR,
    setHeaderColor: (headerColor) => {
      if (!isValidHeaderColor(headerColor)) {
        console.warn(`Invalid header color: ${headerColor}, using default ${DEFAULT_HEADER_COLOR}`)
        headerColor = DEFAULT_HEADER_COLOR
      }
      localStorage.setItem(HEADER_STORAGE_KEY, headerColor)
      applyHeaderColor(headerColor)
      useColorStore.setState({ headerColor })
    },
    resetHeaderColor: () => {
      localStorage.removeItem(HEADER_STORAGE_KEY)
      applyHeaderColor(DEFAULT_HEADER_COLOR)
      useColorStore.setState({ headerColor: DEFAULT_HEADER_COLOR })
    },
  }
})

export const useColor = useColorStore
