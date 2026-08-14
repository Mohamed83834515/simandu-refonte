import type { Acteur } from '@/simadou/allTypes/acteur'
import type { CadreStrategique } from '@/simadou/allTypes/cadreStrategique'
import type { CadreStrategiqueWriteData } from '@/simadou/schemas/cadreStrategiqueSchemas'
import { getApiErrorMessage } from '@/lib/api-error-message'
import {
  resolveNiveauCsNumber,
  resolveParentCsId,
  toPartenaireCsFormValue,
} from '@/simadou/lib/cadreStrategiqueUtils'

export function getCadreStrategiqueSaveErrorMessage(
  error: unknown,
  fallback = 'Erreur lors de la sauvegarde du cadre stratégique'
): string {
  const raw = getApiErrorMessage(error, fallback)

  if (
    raw.includes('programme_cs') &&
    raw.includes('code_cs') &&
    (raw.includes('unique') || raw.includes('ensemble unique'))
  ) {
    return 'Un cadre stratégique avec ce code existe déjà pour ce programme. Veuillez saisir un autre code.'
  }

  return raw
}

export function cadreStrategiqueToFormValues({
  cadre,
  programmeId,
  niveauCs,
  acteurs,
}: {
  cadre?: CadreStrategique | null
  programmeId: number
  niveauCs: number
  acteurs: Pick<Acteur, 'id_acteur'>[]
}): CadreStrategiqueWriteData {
  return {
    code_cs: cadre?.code_cs ?? '',
    intutile_cs: cadre?.intutile_cs ?? '',
    abgrege_cs: cadre?.abgrege_cs ?? '',
    parent_cs: resolveParentCsId(cadre?.parent_cs ?? null),
    partenaire_cs: toPartenaireCsFormValue(cadre?.partenaire_cs, acteurs),
    niveau_cs:
      (cadre ? resolveNiveauCsNumber(cadre.niveau_cs) : null) ?? niveauCs,
    programme_cs: programmeId,
  }
}
