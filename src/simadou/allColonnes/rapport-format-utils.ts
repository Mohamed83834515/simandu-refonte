export function formatRapportMontant(value: unknown): string {
  if (value == null || value === '') return '—'
  const montant = Number(value)
  if (!Number.isFinite(montant) || montant === 0) return '—'
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant)
}

export function parseRapportMontant(value: unknown): number | null {
  if (value == null || value === '') return null
  const montant = Number(value)
  if (!Number.isFinite(montant) || montant <= 0) return null
  return montant
}

export function computeTauxDecaissement(
  montantActivite: unknown,
  decaissement: unknown
): number | null {
  const montant = parseRapportMontant(montantActivite)
  const decaisse = parseRapportMontant(decaissement)
  if (montant == null || decaisse == null) return null

  const raw = (decaisse / montant) * 100
  if (!Number.isFinite(raw) || raw <= 0) return 0

  return Math.min(100, Math.round(raw * 100) / 100)
}

export function formatRapportTaux(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}
