import type { Projet } from '@/simadou/allTypes'
import { getProjetYearRangeFromMonths } from '@/simadou/lib/projetYearRange'

export type PtbaVersionOption = {
  label: string
  value: string
}

/** Années de durée du projet (démarrage + durée en mois). */
export function getProjetPtbaYears(projet: Projet): number[] {
  return getProjetYearRangeFromMonths(projet)
}

/**
 * Options version dont l'année (`annee_ptba` en tête du label) est dans la durée du projet.
 */
export function filterVersionOptionsByProjetYears(
  options: PtbaVersionOption[],
  projetYears: number[]
): PtbaVersionOption[] {
  if (projetYears.length === 0) return []
  const years = new Set(projetYears)
  return options.filter((option) => {
    const yearMatch = option.label.match(/\d{4}/)
    if (!yearMatch) return false
    return years.has(Number(yearMatch[0]))
  })
}

/** Version affichée / utilisée pour le fetch : sélection valide, sinon première option. */
export function resolveActiveVersionOption(
  options: PtbaVersionOption[],
  selectedVersionId: string | null
): PtbaVersionOption | null {
  if (options.length === 0) return null
  return (
    options.find((option) => option.value === selectedVersionId) ??
    options[0] ??
    null
  )
}

export function resolveVersionIdNumber(
  versionId: string | null | undefined
): number {
  if (!versionId) return 0
  const parsed = Number(versionId)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}
