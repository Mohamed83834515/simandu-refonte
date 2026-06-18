/** Montants pour export — espaces normaux (évite le séparateur fr-FR U+202F affiché comme « / »). */
export function formatExportMontant(value: unknown): string {
  if (value == null || value === '') return '—'
  const montant = Number(value)
  if (!Number.isFinite(montant) || montant === 0) return '—'

  const rounded = Math.round(montant)
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/** Taux pour export — virgule décimale, sans séparateur de milliers. */
export function formatExportTaux(value: number): string {
  const rounded = Math.round(value * 100) / 100
  const [integer, decimal] = rounded.toString().split('.')
  return decimal != null ? `${integer},${decimal.padEnd(2, '0').slice(0, 2)}` : integer
}

export function formatExportDate(value: string | undefined | null): string {
  if (!value?.trim()) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const day = String(date.getDate()).padStart(2, '0')
  const month = date.toLocaleDateString('fr-FR', { month: 'long' })
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}
