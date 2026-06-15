import type { Acteur } from '@/simadou/allTypes/acteur'
import type { CadreStrategique } from '@/simadou/allTypes/cadreStrategique'
import type { CadreStrategiqueWriteData } from '@/simadou/schemas/cadreStrategiqueSchemas'
import {
  resolveNiveauCsNumber,
  resolveParentCsId,
  toPartenaireCsFormValue,
} from '@/simadou/lib/cadreStrategiqueUtils'

export function cadreStrategiqueToFormValues({
  cadre,
  programmeId,
  niveauCodeNumber,
  acteurs,
}: {
  cadre?: CadreStrategique | null
  programmeId: number
  niveauCodeNumber: number
  acteurs: Pick<Acteur, 'id_acteur'>[]
}): CadreStrategiqueWriteData {
  return {
    code_cs: cadre?.code_cs ?? '',
    intutile_cs: cadre?.intutile_cs ?? '',
    abgrege_cs: cadre?.abgrege_cs ?? '',
    parent_cs: resolveParentCsId(cadre?.parent_cs ?? null),
    partenaire_cs: toPartenaireCsFormValue(cadre?.partenaire_cs, acteurs),
    niveau_cs:
      (cadre ? resolveNiveauCsNumber(cadre.niveau_cs) : null) ?? niveauCodeNumber,
    programme_cs: programmeId,
  }
}
