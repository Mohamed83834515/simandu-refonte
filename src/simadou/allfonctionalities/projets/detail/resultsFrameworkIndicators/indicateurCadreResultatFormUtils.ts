import type {
  CadreResultat,
  IndicateurCadreResultat,
  NiveauCadreResultat,
  Personnel,
} from '@/simadou/allTypes'
import { resolveNiveauCrId } from '@/simadou/lib/cadreResultatUtils'
import {
  resolveRelationCode,
  resolveRelationId,
} from '@/simadou/lib/resolveApiRelation'
import type { IndicateurCadreResultatCreateData } from '@/simadou/schemas/indicateursSchemas'

export function resolveFixedCodeCrFromCadre(cadre: CadreResultat): string {
  return cadre.code_cr
}

export function resolveNiveauIopFromCadre(
  cadre: CadreResultat,
  _niveaux: NiveauCadreResultat[] = []
): number | null {
  const populatedId = cadre.niveau?.id_ncr
  if (populatedId != null && Number.isFinite(Number(populatedId))) {
    return Number(populatedId)
  }

  return resolveNiveauCrId(cadre.niveau_cr)
}

export function resolveNiveauCrLabel(
  cadre: CadreResultat,
  niveaux: NiveauCadreResultat[]
): string | null {
  const populated = cadre.niveau
  if (populated?.libelle_ncr) {
    return `${populated.nombre_ncr} — ${populated.libelle_ncr}`
  }

  const niveauId = resolveNiveauCrId(cadre.niveau_cr)
  if (niveauId == null) return null

  const niveau = niveaux.find((n) => n.id_ncr === niveauId)
  if (!niveau) return null

  return `${niveau.nombre_ncr} — ${niveau.libelle_ncr}`
}

export function resolveResponsableIopForForm(
  indicateur?: IndicateurCadreResultat | null
): string {
  const responsableRaw = indicateur?.responsable_iop
  return (
    resolveRelationId(responsableRaw as unknown, 'id_personnel_perso')?.toString() ??
    (responsableRaw != null && responsableRaw !== '' ? String(responsableRaw) : '')
  )
}

export function resolveResponsableIopLabel(
  value: IndicateurCadreResultat['responsable_iop'] | unknown,
  personnels: Personnel[]
): string {
  if (value == null || value === '') return '—'

  if (typeof value === 'object') {
    const personnel = value as Personnel
    const label = [personnel.prenom_perso, personnel.nom_perso]
      .filter(Boolean)
      .join(' ')
    if (label) return label
  }

  if (typeof value === 'string' && Number.isNaN(Number(value))) return value

  const id = Number(value)
  if (!Number.isFinite(id)) return '—'

  const personnel = personnels.find((p) => Number(p.id_personnel_perso) === id)
  if (personnel) {
    return (
      [personnel.prenom_perso, personnel.nom_perso].filter(Boolean).join(' ') ||
      '—'
    )
  }

  return String(value)
}

export function indicateurCadreResultatToFormValues({
  indicateur,
  idProjet,
  fixedCadreCrCode,
  fixedNiveauIop,
  id_personnel,
}: {
  indicateur?: IndicateurCadreResultat | null
  idProjet: number
  fixedCadreCrCode?: string | null
  fixedNiveauIop?: number | null
  id_personnel: string
}): Partial<IndicateurCadreResultatCreateData> {
  return {
    niveau_iop:
      indicateur?.niveau_iop ??
      fixedNiveauIop ??
      undefined,
    code_indicateur_cr_iop: indicateur?.code_indicateur_cr_iop ?? '',
    code_cr_iop:
      fixedCadreCrCode ??
      resolveRelationCode(indicateur?.code_cr_iop, 'code_cr') ??
      '',
    intitule_indicateur_cr_iop: indicateur?.intitule_indicateur_cr_iop ?? '',
    periodicite_iop: indicateur?.periodicite_iop ?? '',
    source_iop: indicateur?.source_iop ?? '',
    responsable_iop: id_personnel, 
    description_iop: indicateur?.description_iop ?? '',
    structure_iop:
      resolveRelationId(indicateur?.structure_iop, 'id_acteur')?.toString() ||
      undefined,
    projet_iop:
      resolveRelationCode(indicateur?.projet_iop, 'code_projet') ??
      (indicateur ? undefined : String(idProjet)),
  }
}
export function buildIndicateurCadreResultatPayload({
  data,
  idProjet,
  fixedCadreCrCode,
  fixedNiveauIop,
}: {
  data: IndicateurCadreResultatCreateData
  idProjet: number
  fixedCadreCrCode?: string | null
  fixedNiveauIop?: number | null
}): IndicateurCadreResultatCreateData {
  return {
    ...data,
    niveau_iop: fixedNiveauIop ?? data.niveau_iop,
    code_cr_iop: fixedCadreCrCode ?? data.code_cr_iop,
    projet_iop: String(idProjet),
    responsable_iop: String(data.responsable_iop),
    structure_iop: data.structure_iop || undefined,
  }
}

export function filterIndicateursForCadreResultat(
  indicateurs: IndicateurCadreResultat[],
  cadre: CadreResultat,
  codeProjet?: string | null
): IndicateurCadreResultat[] {
  const cadreCode = cadre.code_cr

  return indicateurs.filter((indicateur) => {
    if (codeProjet) {
      const projetCode =
        resolveRelationCode(indicateur.projet_iop, 'code_projet') ??
        (typeof indicateur.projet_iop === 'string' ? indicateur.projet_iop : null)
      if (projetCode && projetCode !== codeProjet) return false
    }

    const linkedCode =
      resolveRelationCode(indicateur.code_cr_iop, 'code_cr') ??
      (typeof indicateur.code_cr_iop === 'string' ? indicateur.code_cr_iop : null)

    return linkedCode === cadreCode
  })
}
