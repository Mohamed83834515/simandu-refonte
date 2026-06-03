import type { Acteur } from '@/simadou/allTypes/acteur'
import type { CadreAnalytique, NiveauCadreAnalytique } from '@/simadou/allTypes/cadreAnalytique'
import type { Programme } from '@/simadou/allTypes/programme'
import {
  resolveActeurLabel,
  resolveRelationId,
} from '@/simadou/lib/resolveApiRelation'

export function resolveProgrammeCode(
  value: NiveauCadreAnalytique['programme'] | Programme | undefined
): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object') return value.code_programme ?? null
  return null
}

export function resolveProgrammeId(
  value: NiveauCadreAnalytique['programme'] | Programme | undefined
): number | null {
  return resolveRelationId(value, 'id_programme')
}

export function filterNiveauxByProgramme(
  niveaux: NiveauCadreAnalytique[],
  codeProgramme: string | undefined,
  programmeId?: number
): NiveauCadreAnalytique[] {
  if (!codeProgramme?.trim() && !programmeId) return []
  return niveaux.filter((n) => {
    const code = resolveProgrammeCode(n.programme)
    if (codeProgramme && code === codeProgramme) return true
    const id = resolveProgrammeId(n.programme)
    return programmeId != null && id === programmeId
  })
}

export function sortNiveauxCadreAnalytique(
  niveaux: NiveauCadreAnalytique[]
): NiveauCadreAnalytique[] {
  return [...niveaux].sort(
    (a, b) => Number(a.code_number_nca) - Number(b.code_number_nca)
  )
}

export function resolveNiveauCaNumber(
  value: CadreAnalytique['niveau_ca']
): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function resolveParentCaId(
  value: CadreAnalytique['parent_ca']
): number | null {
  return resolveRelationId(value, 'id_ca')
}

export function resolvePartenaireCaId(
  value: CadreAnalytique['partenaire_ca']
): number | null {
  return resolveRelationId(value, 'id_acteur')
}

export function resolvePartenaireCaLabel(
  value: CadreAnalytique['partenaire_ca'],
  acteurs?: Pick<Acteur, 'id_acteur' | 'nom_acteur' | 'code_acteur'>[]
): string {
  const nestedLabel = resolveActeurLabel(value)
  if (nestedLabel) return nestedLabel

  const id = resolveRelationId(value, 'id_acteur')
  if (id == null) return 'Non défini'

  const acteur = acteurs?.find((a) => a.id_acteur === id)
  if (acteur) {
    return acteur.code_acteur
      ? `${acteur.nom_acteur} (${acteur.code_acteur})`
      : acteur.nom_acteur
  }

  return 'Non défini'
}

/** Valeur initiale du select partenaire — uniquement si l’ID existe dans la liste. */
export function toPartenaireCaFormValue(
  value: CadreAnalytique['partenaire_ca'] | undefined,
  acteurs: Pick<Acteur, 'id_acteur'>[]
): number | null {
  const id = resolvePartenaireCaId(value ?? null)
  if (id == null) return null
  return acteurs.some((a) => a.id_acteur === id) ? id : null
}

export function buildCadreAnalytiqueParentOptions({
  cadres,
  niveauCodeNumber,
  excludeCadreId,
}: {
  cadres: CadreAnalytique[]
  niveauCodeNumber: number
  excludeCadreId?: number
}) {
  return cadres
    .filter((cadre) => {
      const cadreNiveau = resolveNiveauCaNumber(cadre.niveau_ca)
      return (
        cadreNiveau != null &&
        cadreNiveau === niveauCodeNumber - 1 &&
        cadre.id_ca !== excludeCadreId
      ) 
    })
    .map((cadre) => ({
      value: cadre.id_ca,
      label: `${cadre.code_ca} - ${cadre.intutile_ca}`,
    }))
}

export function getFixedCodeLengthForNiveau(
  niveaux: NiveauCadreAnalytique[],
  niveauCodeNumber: number,
  codeProgramme?: string
): number {
  const scoped = codeProgramme?.trim()
    ? filterNiveauxByProgramme(niveaux, codeProgramme)
    : niveaux

  const niveauConfig = scoped.find(
    (n) => Number(n.code_number_nca) === niveauCodeNumber
  )
  return Number(niveauConfig?.nombre_nca) || 2
}

export function getNiveauCadreAnalytiqueLibelle(
  niveaux: NiveauCadreAnalytique[],
  niveauCodeNumber: number,
  codeProgramme?: string
): string {
  const scoped = codeProgramme?.trim()
    ? filterNiveauxByProgramme(niveaux, codeProgramme)
    : niveaux

  const niveauConfig = scoped.find(
    (n) => Number(n.code_number_nca) === niveauCodeNumber
  )
  return niveauConfig?.libelle_nca ?? ''
}
