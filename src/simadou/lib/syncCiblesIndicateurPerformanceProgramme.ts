import cibleIndicateurPerformanceProgrammeService from '@/simadou/allSercices/cibleIndicateurPerformanceProgrammeService'
import type { CibleIndicateurPerformanceProgramme } from '@/simadou/allTypes/cibleIndicateurPerformanceProgramme'
import type { CibleAnnuelleProgrammeFormValue } from '@/simadou/lib/indicateurPerformanceProgrammeUtils'

export async function syncCiblesIndicateurPerformanceProgramme({
  indicateurId,
  programmeId,
  cibles,
  existingCibles = [],
}: {
  indicateurId: number
  programmeId: number
  cibles: CibleAnnuelleProgrammeFormValue[]
  existingCibles?: CibleIndicateurPerformanceProgramme[]
}) {
  for (const cible of cibles) {
    const hasValue =
      (cible.valeur_cible != null && cible.valeur_cible > 0) ||
      (cible.budget_an != null && cible.budget_an > 0)

    const existing =
      existingCibles.find((item) => item.annee === cible.annee) ??
      (cible.id_cible_indicateur_performance
        ? existingCibles.find(
            (item) =>
              item.id_cible_indicateur_performance ===
              cible.id_cible_indicateur_performance
          )
        : undefined)

    const payload = {
      annee: cible.annee,
      budget_an: cible.budget_an ?? 0,
      valeur_cible_indcateur_performance: String(cible.valeur_cible ?? 0),
      code_indicateur_performance: indicateurId,
      programme: programmeId,
    }

    if (existing?.id_cible_indicateur_performance && hasValue) {
      await cibleIndicateurPerformanceProgrammeService.update(
        existing.id_cible_indicateur_performance,
        payload
      )
      continue
    }

    if (existing?.id_cible_indicateur_performance && !hasValue) {
      await cibleIndicateurPerformanceProgrammeService.delete(
        existing.id_cible_indicateur_performance
      )
      continue
    }

    if (hasValue) {
      await cibleIndicateurPerformanceProgrammeService.create(payload)
    }
  }
}
