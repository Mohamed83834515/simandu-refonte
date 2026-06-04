// import { create } from 'zustand'
// export const CHART_COLORS = {
//   rouge:   { stroke: '#CE1126', fill: '#CE1126', label: 'Rouge'   },
//   or:      { stroke: '#FCD116', fill: '#FCD116', label: 'Or'      },
//   vert:    { stroke: '#009460', fill: '#009460', label: 'Vert'    },
//   indigo:  { stroke: '#6366f1', fill: '#6366f1', label: 'Indigo'  },
//   emerald: { stroke: '#10b981', fill: '#10b981', label: 'Emerald' },
//   rose:    { stroke: '#f43f5e', fill: '#f43f5e', label: 'Rose'    },
//   amber:   { stroke: '#f59e0b', fill: '#f59e0b', label: 'Amber'   },
//   sky:     { stroke: '#0ea5e9', fill: '#0ea5e9', label: 'Sky'     },
//   violet:  { stroke: '#8b5cf6', fill: '#8b5cf6', label: 'Violet'  },
// } as const
// export const HEADER_COLORS = {
//   guinea_rouge: { bg: '#CE1126', text: '#FFFFFF', label: 'Guinée Rouge' },
//   guinea_or:    { bg: '#FCD116', text: '#1a1a1a', label: 'Guinée Or'   },
//   guinea_vert:  { bg: '#009460', text: '#FFFFFF', label: 'Guinée Vert' },
//   slate:        { bg: '#1e293b', text: '#f1f5f9', label: 'Slate'       },
//   blue:         { bg: '#1d4ed8', text: '#eff6ff', label: 'Blue'        },
//   violet:       { bg: '#7c3aed', text: '#f5f3ff', label: 'Violet'      },
//   teal:         { bg: '#0f766e', text: '#f0fdfa', label: 'Teal'        },
//   amber:        { bg: '#b45309', text: '#fffbeb', label: 'Amber'       },
//   rose:         { bg: '#be123c', text: '#fff1f2', label: 'Rose'        },
//   green:        { bg: '#166534', text: '#f0fdf4', label: 'Green'       },
//   gray:         { bg: '#374151', text: '#f9fafb', label: 'Gray'        },
// } as const
// export type ChartColorKey  = keyof typeof CHART_COLORS
// export type HeaderColorKey = keyof typeof HEADER_COLORS
// // ─── Defaults ─────────────────────────────────────────────────────────────────
// const DEFAULT_COLOR:        ChartColorKey  = 'rouge'
// const DEFAULT_COLOR2:       ChartColorKey  = 'or'
// const DEFAULT_HEADER_COLOR: HeaderColorKey = 'guinea_rouge'
// const CHART_STORAGE_KEY  = 'app-chart-color'
// const CHART_STORAGE_KEY2 = 'app-chart-color-2'
// const HEADER_STORAGE_KEY = 'app-header-color'
// // ─── CSS variable appliers ────────────────────────────────────────────────────
// const applyChartColor = (color: ChartColorKey) => {
//   document.documentElement.style.setProperty('--chart-color', CHART_COLORS[color].stroke)
// }
// const applyChartColor2 = (color: ChartColorKey) => {
//   document.documentElement.style.setProperty('--chart-color-2', CHART_COLORS[color].stroke)
// }
// const applyHeaderColor = (color: HeaderColorKey) => {
//   const { bg, text } = HEADER_COLORS[color]
//   document.documentElement.style.setProperty('--header-bg',   bg)
//   document.documentElement.style.setProperty('--header-text', text)
// }
// // ─── Store interface ──────────────────────────────────────────────────────────
// interface ColorState {
//   // Bar 1 (Desktop)
//   color:              ChartColorKey
//   defaultColor:       ChartColorKey
//   setColor:           (color: ChartColorKey) => void
//   resetColor:         () => void
//   // Bar 2 (Mobile)
//   color2:             ChartColorKey
//   defaultColor2:      ChartColorKey
//   setColor2:          (color: ChartColorKey) => void
//   resetColor2:        () => void
//   // Header
//   headerColor:        HeaderColorKey
//   defaultHeaderColor: HeaderColorKey
//   setHeaderColor:     (color: HeaderColorKey) => void
//   resetHeaderColor:   () => void
// }
// // ─── Store ────────────────────────────────────────────────────────────────────
// export const useColorStore = create<ColorState>(() => {
//   const color = (
//     localStorage.getItem(CHART_STORAGE_KEY) as ChartColorKey
//   ) ?? DEFAULT_COLOR
//   const color2 = (
//     localStorage.getItem(CHART_STORAGE_KEY2) as ChartColorKey
//   ) ?? DEFAULT_COLOR2
//   const headerColor = (
//     localStorage.getItem(HEADER_STORAGE_KEY) as HeaderColorKey
//   ) ?? DEFAULT_HEADER_COLOR
//   // Init CSS variables au démarrage
//   applyChartColor(color)
//   applyChartColor2(color2)
//   applyHeaderColor(headerColor)
//   return {
//     // Bar 1
//     color,
//     defaultColor: DEFAULT_COLOR,
//     setColor: (color) => {
//       localStorage.setItem(CHART_STORAGE_KEY, color)
//       applyChartColor(color)
//       useColorStore.setState({ color })
//     },
//     resetColor: () => {
//       localStorage.removeItem(CHART_STORAGE_KEY)
//       applyChartColor(DEFAULT_COLOR)
//       useColorStore.setState({ color: DEFAULT_COLOR })
//     },
//     // Bar 2
//     color2,
//     defaultColor2: DEFAULT_COLOR2,
//     setColor2: (color2) => {
//       localStorage.setItem(CHART_STORAGE_KEY2, color2)
//       applyChartColor2(color2)
//       useColorStore.setState({ color2 })
//     },
//     resetColor2: () => {
//       localStorage.removeItem(CHART_STORAGE_KEY2)
//       applyChartColor2(DEFAULT_COLOR2)
//       useColorStore.setState({ color2: DEFAULT_COLOR2 })
//     },
//     // Header
//     headerColor,
//     defaultHeaderColor: DEFAULT_HEADER_COLOR,
//     setHeaderColor: (headerColor) => {
//       localStorage.setItem(HEADER_STORAGE_KEY, headerColor)
//       applyHeaderColor(headerColor)
//       useColorStore.setState({ headerColor })
//     },
//     resetHeaderColor: () => {
//       localStorage.removeItem(HEADER_STORAGE_KEY)
//       applyHeaderColor(DEFAULT_HEADER_COLOR)
//       useColorStore.setState({ headerColor: DEFAULT_HEADER_COLOR })
//     },
//   }
// })
// export const useColor = useColorStore
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

// ─── CSS variable appliers ────────────────────────────────────────────────────

const applyChartColor = (color: ChartColorKey) => {
  document.documentElement.style.setProperty(
    '--chart-color',
    CHART_COLORS[color].stroke
  )
}

const applyChartColor2 = (color: ChartColorKey) => {
  document.documentElement.style.setProperty(
    '--chart-color-2',
    CHART_COLORS[color].stroke
  )
}

const applyHeaderColor = (color: HeaderColorKey) => {
  const { bg, text } = HEADER_COLORS[color]
  document.documentElement.style.setProperty('--header-bg', bg)
  document.documentElement.style.setProperty('--header-text', text)
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

// ─── Store ────────────────────────────────────────────────────────────────────

export const useColorStore = create<ColorState>(() => {
  const color =
    (localStorage.getItem(CHART_STORAGE_KEY) as ChartColorKey) ?? DEFAULT_COLOR
  const color2 =
    (localStorage.getItem(CHART_STORAGE_KEY2) as ChartColorKey) ??
    DEFAULT_COLOR2
  const headerColor =
    (localStorage.getItem(HEADER_STORAGE_KEY) as HeaderColorKey) ??
    DEFAULT_HEADER_COLOR

  // Init CSS variables au démarrage
  applyChartColor(color)
  applyChartColor2(color2)
  applyHeaderColor(headerColor)

  return {
    // Bar 1
    color,
    defaultColor: DEFAULT_COLOR,
    setColor: (color) => {
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
