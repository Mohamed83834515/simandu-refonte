import type { PartBailleur } from '@/simadou/allTypes/partBailleur'
import {
  resolveRelationCode,
  resolveRelationId,
} from '@/simadou/lib/resolveApiRelation'

export function resolvePartBailleurRecordId(
  part: PartBailleur | null | undefined
): number | null {
  if (!part) return null
  const raw = part as unknown as Record<string, unknown>
  const candidates = [raw.id_part_bailleur, raw.id, part.id_part]
  for (const value of candidates) {
    const id = Number(value)
    if (Number.isFinite(id) && id > 0) return id
  }
  return null
}

export function resolvePartActivitePtbaId(
  part: PartBailleur | null | undefined
): number | null {
  if (!part) return null
  return (
    resolveRelationId(part.activite_ptba, 'id_ptba') ??
    resolveRelationId(part.activite_ptba, 'id_activite_ptba') ??
    resolveRelationId(part.activite_ptba, 'id')
  )
}

export function resolvePartProjetId(
  part: PartBailleur | null | undefined
): number | null {
  if (!part) return null
  return (
    resolveRelationId(part.projet, 'id_projet') ??
    resolveRelationId(part.projet, 'id')
  )
}

export function partMatchesProjet(
  part: PartBailleur,
  idProjet: number,
  codeProjet?: string
): boolean {
  const id = resolvePartProjetId(part)
  if (id != null && id === idProjet) return true
  if (!codeProjet?.trim()) return false
  const code = resolveRelationCode(part.projet, 'code_projet')
  if (code != null && code.trim() === codeProjet.trim()) return true
  const projetRef = part.projet as unknown
  if (typeof projetRef === 'string' && projetRef.trim() === codeProjet.trim()) {
    return true
  }
  return false
}

export function resolvePartRegionId(
  part: PartBailleur | null | undefined
): number | null {
  if (!part) return null
  return (
    resolveRelationId(part.region, 'id_loca') ??
    resolveRelationId(part.region, 'id')
  )
}

export function resolvePartTypePartId(
  part: PartBailleur | null | undefined
): number | null {
  if (!part) return null
  return (
    resolveRelationId(part.type_part, 'id_part') ??
    resolveRelationId(part.type_part, 'id')
  )
}

export function partMatchesAnnee(
  partAnnee: number | string | null | undefined,
  versionPtbaId: number,
  anneePtbaYear?: number
): boolean {
  const stored = Number(partAnnee)
  if (!Number.isFinite(stored)) return false
  if (stored === versionPtbaId) return true
  if (anneePtbaYear != null && stored === anneePtbaYear) return true
  return false
}

export function filterPartsForActiviteGrid(
  parts: PartBailleur[],
  activitePtbaId: number,
  projetId: number,
  versionPtbaId: number,
  codeProjet?: string,
  anneePtbaYear?: number
): PartBailleur[] {
  return parts.filter((part) => {
    if (resolvePartActivitePtbaId(part) !== activitePtbaId) return false
    if (!partMatchesProjet(part, projetId, codeProjet)) return false
    if (!partMatchesAnnee(part.annee, versionPtbaId, anneePtbaYear)) return false
    if (resolvePartRegionId(part) == null) return false
    if (resolvePartTypePartId(part) == null) return false
    return true
  })
}

/** Repli quand l'API stocke `annee` sous un format différent de la version PTBA. */
export function filterPartsForActiviteGridRelaxed(
  parts: PartBailleur[],
  activitePtbaId: number,
  projetId: number,
  codeProjet?: string
): PartBailleur[] {
  return parts.filter((part) => {
    if (resolvePartActivitePtbaId(part) !== activitePtbaId) return false
    if (!partMatchesProjet(part, projetId, codeProjet)) return false
    if (resolvePartRegionId(part) == null) return false
    if (resolvePartTypePartId(part) == null) return false
    return true
  })
}
