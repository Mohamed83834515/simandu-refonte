import type { IndicateurCmrProjet } from '@/simadou/allTypes/indicateurCmrProjet'
import { resolveRelationCode, resolveRelationId } from '@/simadou/lib/resolveApiRelation'

export function resolveIndicateurCmrProjetCode(
  indicateur: Pick<IndicateurCmrProjet, 'code_projet'> & Record<string, unknown>
): string | null {
  const raw = indicateur.code_projet ?? indicateur.projet ?? indicateur.projet_cmr
  if (raw == null || raw === '') return null
  if (typeof raw === 'string') return raw.trim() || null
  if (typeof raw === 'number') return null
  return resolveRelationCode(raw, 'code_projet')
}

export function resolveIndicateurCmrProjetId(
  indicateur: Pick<IndicateurCmrProjet, 'code_projet'> & Record<string, unknown>
): number | null {
  const raw = indicateur.code_projet ?? indicateur.projet ?? indicateur.projet_cmr
  if (raw == null || raw === '') return null
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  return resolveRelationId(raw, 'id_projet')
}

export function matchesIndicateurCmrProjet(
  indicateur: IndicateurCmrProjet,
  codeProjet: string,
  idProjet?: number | null
): boolean {
  const code = resolveIndicateurCmrProjetCode(indicateur)
  if (code != null) return code === codeProjet

  if (idProjet != null) {
    const projetId = resolveIndicateurCmrProjetId(indicateur)
    if (projetId != null) return projetId === idProjet
  }

  // L'API peut omettre le projet sur la liste après création.
  return false
}

export function normalizeIndicateurCmrProjetFromApi(
  raw: Record<string, unknown>
): IndicateurCmrProjet {
  const rawResultat = raw.resultat_cmr ?? raw.Resultat_cmr
  const rawId =
    raw.id_ref_ind_cmr ??
    raw.id_indicateur_cmr_projet ??
    raw.id_indicateur_cmr_projet_id

  const codeProjet =
    raw.code_projet ?? raw.projet ?? raw.projet_cmr ?? null

  return {
    ...(raw as IndicateurCmrProjet),
    id_ref_ind_cmr: Number(rawId),
    code_projet: codeProjet as IndicateurCmrProjet['code_projet'],
    ...(rawResultat !== undefined && rawResultat !== null
      ? { resultat_cmr: rawResultat as IndicateurCmrProjet['resultat_cmr'] }
      : {}),
  }
}

export function withIndicateurCmrProjetCode(
  indicateur: IndicateurCmrProjet,
  codeProjet: string
): IndicateurCmrProjet {
  if (resolveIndicateurCmrProjetCode(indicateur)) return indicateur
  return { ...indicateur, code_projet: codeProjet }
}
