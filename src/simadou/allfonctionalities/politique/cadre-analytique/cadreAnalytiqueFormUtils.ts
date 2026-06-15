import type { Acteur } from '@/simadou/allTypes/acteur'
import type { CadreAnalytique } from '@/simadou/allTypes/cadreAnalytique'
import type { CadreAnalytiqueWriteData } from '@/simadou/schemas/cadreAnalytiqueSchemas'
import {
  resolveNiveauCaNumber,
  resolveParentCaId,
  toPartenaireCaFormValue,
} from '@/simadou/lib/cadreAnalytiqueUtils'

export function cadreAnalytiqueToFormValues({
  cadre,
  programmeId,
  niveauCodeNumber,
  acteurs,
}: {
  cadre?: CadreAnalytique | null
  programmeId: number
  niveauCodeNumber: number
  acteurs: Pick<Acteur, 'id_acteur'>[]
}): CadreAnalytiqueWriteData {
  return {
    code_ca: cadre?.code_ca ?? '',
    intutile_ca: cadre?.intutile_ca ?? '',
    abgrege_ca: cadre?.abgrege_ca ?? '',
    cout_axe: cadre?.cout_axe ?? 0,
    parent_ca: resolveParentCaId(cadre?.parent_ca ?? null),
    partenaire_ca: toPartenaireCaFormValue(cadre?.partenaire_ca, acteurs),
    niveau_ca:
      (cadre ? resolveNiveauCaNumber(cadre.niveau_ca) : null) ??
      niveauCodeNumber,
    programme_ca: programmeId,
  }
}
