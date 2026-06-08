import type { Ptba } from '@/simadou/allTypes'
import type { IndicateurTache } from '@/simadou/allTypes/indicateurTache'
import indicateurActivitePtbaService from '@/simadou/allSercices/indicateurActivitePtbaService'

/**
 * Le suivi API référence `indicateur_activite` via `code_indicateur_activite`
 * (table indicateur_activite_ptba), pas `code_indicateur_ptba` (indicateurs-taches).
 * Crée l'enregistrement manquant si besoin.
 */
export async function ensureIndicateurActivitePtbaCode(
  activite: Ptba,
  indicateur: IndicateurTache
): Promise<string> {
  const code = indicateur.code_indicateur_ptba?.trim()
  if (!code) {
    throw new Error("Code indicateur manquant")
  }

  const existing = await indicateurActivitePtbaService.getForActivite(activite)
  const intitule = indicateur.intitule_indicateur_tache.trim().toLowerCase()

  const match = existing.find((item) => {
    if (item.code_indicateur_activite === code) return true
    return item.intitule_indicateur_tache.trim().toLowerCase() === intitule
  })

  if (match?.code_indicateur_activite) {
    return match.code_indicateur_activite
  }

  const created = await indicateurActivitePtbaService.create({
    code_indicateur_activite: code,
    intitule_indicateur_tache: indicateur.intitule_indicateur_tache,
    activite_ptba: activite.code_activite_ptba,
    abrege_unite: indicateur.unite_ind_tache || null,
    code_indicateur_performance: null,
  })

  return created.code_indicateur_activite
}
