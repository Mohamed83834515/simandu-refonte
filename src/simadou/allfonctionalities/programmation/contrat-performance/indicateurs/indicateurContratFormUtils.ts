import type { CadreLogiqueClcp } from '@/simadou/allTypes/cadreLogiqueClcp'
import type { IndicateurContrat } from '@/simadou/allTypes/indicateurContrat'
import type { IndicateurContratFormData } from '@/simadou/schemas/indicateurContratSchemas'
import { resolveClcpId } from '@/simadou/lib/indicateurContratUtils'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'

export function indicateurContratToFormValues({
  indicateur,
  cadresForNiveau,
  idPersonnel,
}: {
  indicateur?: IndicateurContrat | null
  cadresForNiveau: CadreLogiqueClcp[]
  idPersonnel?: number
}): IndicateurContratFormData {
  const defaultClcp =
    resolveClcpId(indicateur?.clcp) ?? cadresForNiveau[0]?.id_clc ?? 0

  return {
    clcp: defaultClcp,
    intitule_indicateur: indicateur?.intitule_indicateur ?? '',
    valeur_reference: indicateur?.valeur_reference ?? 0,
    cible_t1: indicateur?.cible_t1 ?? '',
    cible_t2: indicateur?.cible_t2 ?? '',
    cible_t3: indicateur?.cible_t3 ?? '',
    cible_t4: indicateur?.cible_t4 ?? '',
    moyen_verification: indicateur?.moyen_verification ?? null,
    etat: indicateur?.etat ?? true,
    unite:
      resolveRelationId(indicateur?.unite, 'id_unite') ??
      (typeof indicateur?.unite === 'number' ? indicateur.unite : 0),
    id_personnel: idPersonnel,
  }
}

export function buildIndicateurContratPayload({
  data,
  idPersonnel,
  existingMoyenVerification,
}: {
  data: IndicateurContratFormData
  idPersonnel: number
  existingMoyenVerification?: string | null
}) {
  const moyenVerification =
    data.moyen_verification instanceof File
      ? data.moyen_verification
      : (data.moyen_verification ?? existingMoyenVerification ?? null)

  return {
    intitule_indicateur: data.intitule_indicateur,
    valeur_reference: data.valeur_reference,
    cible_t1: String(data.cible_t1),
    cible_t2: String(data.cible_t2),
    cible_t3: String(data.cible_t3),
    cible_t4: String(data.cible_t4),
    moyen_verification: moyenVerification,
    etat: data.etat ?? true,
    clcp: data.clcp,
    unite: data.unite,
    id_personnel: idPersonnel,
  }
}
