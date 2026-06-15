// services/formatService.ts

/**
 * Formate un nombre avec des points comme séparateurs de milliers
 * @param value - Le nombre à formater
 * @returns Chaîne formatée avec points comme séparateurs
 * 
 * @example
 * formatNumber(1234567) // "1.234.567"
 * formatNumber(1500000) // "1.500.000"
 * formatNumber(500) // "500"
 */
export const formatNumber = (value: number | string | null | undefined): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value ?? 0
  if (isNaN(num)) return '0'
  
  // Formatage avec points comme séparateurs
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/**
 * Alias pour formatNumber (pour les montants)
 */
export const formatMontant = formatNumber

/**
 * Parse une chaîne formatée avec points en nombre
 * @param formattedValue - Chaîne avec points (ex: "1.234.567")
 * @returns Nombre
 * 
 * @example
 * parseMontant("1.234.567") // 1234567
 * parseMontant("1.500.000") // 1500000
 */
export const parseMontant = (formattedValue: string): number => {
  if (!formattedValue) return 0
  // Enlève les points et remplace la virgule par un point si besoin
  const cleaned = formattedValue.replace(/\./g, '').replace(',', '.')
  const number = parseFloat(cleaned)
  return isNaN(number) ? 0 : number
}

/**
 * Formate un nombre avec points et ajoute "GNF" si demandé
 */
export const formatMontantAvecDevise = (value: number | string | null | undefined, includeDevise: boolean = false): string => {
  const formatted = formatNumber(value)
  return includeDevise ? `${formatted}` : formatted
}