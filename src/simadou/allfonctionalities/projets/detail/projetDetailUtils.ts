import type { Projet } from '@/simadou/allTypes/projet'
import {
  computeDateCloture,
  computeDateClotureIso,
  computeDateFin,
  computeDureeConsommee,
  formatDateFr,
} from '@/simadou/lib/projetUtils'

export {
  computeDateCloture,
  computeDateClotureIso,
  computeDateFin,
  computeDureeConsommee,
  formatDateFr,
}

export function resolveProjetRouteId(projet: Projet): string {
  return projet.code_projet || String(projet.id_projet)
}

export function buildDossierProjetPath(projet: Projet, dossierId: number): string {
  return `/projet-programme/projets/${resolveProjetRouteId(projet)}/dossiers/${dossierId}`
}

export function openDossierProjetInNewTab(projet: Projet, dossierId: number) {
  const path = buildDossierProjetPath(projet, dossierId)
  const url = `${window.location.origin}${path}`
  window.open(url, '_blank', 'noopener,noreferrer')
}
