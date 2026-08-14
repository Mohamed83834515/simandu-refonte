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
  // ✅ 1. Créer un Map pour regrouper les PTBA par année
  const ptbaByAnnee = new Map<number, PtbaProjet[]>()

  for (const ptba of ptbas) {
    // ✅ Récupérer l'année et s'assurer que c'est un nombre
    let annee: number | null = null
    
    const versionAnnee = ptba.version_info?.annee_ptba
    if (typeof versionAnnee === 'number') {
      annee = versionAnnee
    } else if (typeof ptba.annee_ptba === 'number') {
      annee = ptba.annee_ptba
    } else if (typeof ptba.annee === 'number') {
      annee = ptba.annee
    }
    
    // ✅ Si l'année est un objet ou une string, essayer de la convertir
    if (annee === null) {
      const rawAnnee = ptba.version_info?.annee_ptba ?? ptba.annee_ptba ?? ptba.annee ?? null
      if (rawAnnee !== null && rawAnnee !== undefined) {
        const parsed = Number(rawAnnee)
        if (!isNaN(parsed) && parsed > 0) {
          annee = parsed
        }
      }
    }
    
    if (annee == null || isNaN(annee)) continue

    const items = ptbaByAnnee.get(annee) ?? []
    items.push(ptba)
    ptbaByAnnee.set(annee, items)
  }

  // ✅ 2. Créer un Set de toutes les années présentes dans les budgetsAnnuels
  const allAnnees = new Set<number>()
  for (const ba of budgetsAnnuels) {
    if (typeof ba.annee === 'number' && !isNaN(ba.annee)) {
      allAnnees.add(ba.annee)
    }
  }

  // ✅ 3. Ajouter aussi les années des PTBA
  for (const annee of ptbaByAnnee.keys()) {
    if (typeof annee === 'number' && !isNaN(annee)) {
      allAnnees.add(annee)
    }
  }

  // ✅ 4. Construire le résultat pour toutes les années
  return Array.from(allAnnees)
    .sort((a, b) => a - b)
    .map((annee) => {
      const items = ptbaByAnnee.get(annee) ?? []
      
      // ✅ Si pas d'items, retourner 0 pour realise
      if (items.length === 0) {
        return {
          annee,
          realise: 0,
          cible: budgetsAnnuels.find((ba) => ba.annee === annee)?.budget_annuel || 0,
        }
      }

      // ✅ Trouver la dernière validation pour cette année
      const latestValidation = items.reduce<string | undefined>(
        (best, ptba) => {
          let date: string | null = null
          
          // ✅ Vérifier si la date existe et est une string
          if (ptba.version_info?.date_validation && typeof ptba.version_info.date_validation === 'string') {
            date = ptba.version_info.date_validation
          } else if (ptba.date_validation && typeof ptba.date_validation === 'string') {
            date = ptba.date_validation
          }
          
          if (!date) return best
          return best == null || date > best ? date : best
        },
        undefined
      )

      // ✅ Filtrer les PTBA avec la dernière validation (si elle existe)
      const filtered = latestValidation
        ? items.filter((ptba) => {
            const date = ptba.version_info?.date_validation ?? ptba.date_validation
            return date === latestValidation
          })
        : items

      return {
        annee,
        realise: filtered.reduce(
          (sum, ptba) => {
            const montant = Number(ptba.montant_decaisse_ptba)
            return sum + (isNaN(montant) ? 0 : montant)
          },
          0
        ),
        cible: budgetsAnnuels.find((ba) => ba.annee === annee)?.budget_annuel || 0,
      }
    })
}