import type { Projet } from '@/simadou/allTypes'

export function getProjetYearRangeFromMonths(projet?: Projet | null): number[] {
  if (!projet?.date_demarrage_projet) return []

  const dateDebut = new Date(projet.date_demarrage_projet)
  const anneeDebut = dateDebut.getFullYear()
  if (!Number.isFinite(anneeDebut)) return []

  const dureeMois = projet.duree_projet || 1
  const dateFin = new Date(dateDebut)
  dateFin.setMonth(dateFin.getMonth() + dureeMois)
  const anneeFin = dateFin.getFullYear()

  const annees: number[] = []
  for (let annee = anneeDebut; annee <= anneeFin; annee++) {
    annees.push(annee)
  }

  return annees
}
