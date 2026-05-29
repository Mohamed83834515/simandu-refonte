import type { Projet } from '@/simadou/allTypes/projet'

export function formatDateFr(value: string | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('fr-FR')
}

export function computeDateFin(projet: Projet): string {
  const start = projet.date_demarrage_projet
    ? new Date(projet.date_demarrage_projet)
    : null
  if (!start || Number.isNaN(start.getTime())) return '—'
  const end = new Date(start)
  end.setMonth(end.getMonth() + (projet.duree_projet || 0))
  return end.toLocaleDateString('fr-FR')
}

export function computeDureeConsommee(projet: Projet) {
  const start = projet.date_demarrage_projet
    ? new Date(projet.date_demarrage_projet)
    : new Date()
  const now = new Date()
  const elapsedMs = Math.max(0, now.getTime() - start.getTime())
  const elapsedMonths = Math.round(elapsedMs / (1000 * 60 * 60 * 24 * 30.44))
  const totalMonths = projet.duree_projet || 1
  const percent = Math.min(100, Math.round((elapsedMonths / totalMonths) * 100))
  return { elapsedMonths, totalMonths, percent }
}
