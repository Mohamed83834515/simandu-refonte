import type { ProjetDecaissementAnnuelPoint } from '@/simadou/allTypes/projetStats'
import type { PtbaProjet } from '@/simadou/allTypes/ptbaProjet'

/**
 * Agrège les montants PTBA projet par année.
 * Si plusieurs versions existent pour la même année, ne conserve que celle
 * avec la date_validation la plus récente dans version_info.
 */
export function buildDecaissementAnnuelFromPtbas(
  ptbas: PtbaProjet[],
  budgetsAnnuels: { annee: number; budget_annuel: number }[]
): ProjetDecaissementAnnuelPoint[] {
  const grouped = new Map<number, PtbaProjet[]>()

  for (const ptba of ptbas) {
    const annee = ptba.version_info?.annee_ptba
    if (annee == null) continue

    const items = grouped.get(annee) ?? []
    items.push(ptba)
    grouped.set(annee, items)
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a - b)
    .map(([annee, items]) => {
      const latestValidation = items.reduce<string | undefined>(
        (best, ptba) => {
          const date = ptba.version_info?.date_validation
          if (!date) return best
          return best == null || date > best ? date : best
        },
        undefined
      )

      const filtered = latestValidation
        ? items.filter(
            (ptba) => ptba.version_info?.date_validation === latestValidation
          )
        : items

      return {
        annee,
        cible: filtered.reduce(
          (sum, ptba) => sum + (Number(ptba.cout_ptba) || 0),
          0
        ),
        realise:
          budgetsAnnuels.find((ba) => ba.annee == annee)?.budget_annuel || 0,
      }
    })
}
