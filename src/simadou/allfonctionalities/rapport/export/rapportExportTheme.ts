/** Couleurs institutionnelles (drapeau + identité visuelle de l'application). */
export const RAPPORT_EXPORT_THEME = {
  green: '009460',
  red: 'CE1126',
  yellow: 'FCD116',
  greenDark: '006B47',
  greenLight: 'E8F5F0',
  greenMuted: 'F4FAF8',
  white: 'FFFFFF',
  text: '1A1A1A',
  textMuted: '5C6670',
  border: 'D1D9E0',
} as const

export function hexArgb(hex: string): string {
  return `FF${hex.replace('#', '').toUpperCase()}`
}
