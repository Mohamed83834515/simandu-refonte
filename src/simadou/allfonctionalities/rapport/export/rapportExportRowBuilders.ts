import { computeTauxDecaissement } from '@/simadou/allColonnes/rapport-format-utils'
import {
  computeRetardAccuse,
  formatRetardAccuseLabel,
  getLatestObservation,
  getMostRecentDateRealisation,
} from '@/simadou/allColonnes/rapport-etat-activites-utils'
import type {
  Ptba,
  SuiviAvancementContrat,
  TacheActivitePtba,
} from '@/simadou/allTypes'
import type { SuiviTacheActivite } from '@/simadou/allTypes/suiviTacheActivite'
import { resolvePtbaActiviteId } from '@/simadou/allfonctionalities/rapport/rapportTableUtils'
import {
  formatExportDate,
  formatExportMontant,
  formatExportTaux,
} from './rapportExportFormatters'
import type { RapportExportColumn } from './rapportExportTypes'

export function getRapportPtbaExportColumns(currencyCode?: string): RapportExportColumn[] {
  return [
    { id: 'code', header: 'Code', width: 16 },
    { id: 'activite', header: 'Activité', width: 40 },
    { id: 'taches', header: 'Tâches', width: 12 },
    { id: 'indicateurs', header: 'Indicateurs', width: 14 },
    { id: 'responsable', header: 'Responsable', width: 24 },
    {
      id: 'cout',
      header: currencyCode ? `Coût activités (${currencyCode})` : 'Coût activités',
      width: 22,
    },
  ]
}

export function buildRapportPtbaExportRows(
  ptbas: Ptba[],
  handlers: {
    getResponsableLabel: (ptba: Ptba) => string | null
    tachesCountByActivite: Map<number, number>
    indicateursCountByActivite: Map<number, number>
  }
): string[][] {
  return ptbas.map((ptba) => {
    const activiteId = resolvePtbaActiviteId(ptba)
    const taches =
      activiteId != null ? (handlers.tachesCountByActivite.get(activiteId) ?? 0) : 0
    const indicateurs =
      activiteId != null
        ? (handlers.indicateursCountByActivite.get(activiteId) ?? 0)
        : 0

    return [
      ptba.code_activite_ptba?.trim() || '—',
      ptba.intitule_activite_ptba?.trim() || '—',
      String(taches),
      String(indicateurs),
      handlers.getResponsableLabel(ptba)?.trim() || '—',
      formatExportMontant(ptba.cout_total_ptba),
    ]
  })
}

export function getRapportEtatActivitesExportColumns(): RapportExportColumn[] {
  return [
    { id: 'code', header: 'Code', width: 16 },
    { id: 'activite', header: 'Activité', width: 36 },
    { id: 'statut', header: 'Statut', width: 24 },
    { id: 'difficultes', header: 'Difficultés', width: 28 },
    { id: 'delai', header: 'Délai de réalisation', width: 22 },
    { id: 'retard', header: 'Retard accusé (jours)', width: 22 },
  ]
}

export function buildRapportEtatActivitesExportRows(
  ptbas: Ptba[],
  handlers: {
    tachesByActivite: Map<number, TacheActivitePtba[]>
    avancementByActivite: Map<number, number>
    suivisByActivite: Map<number, SuiviTacheActivite[]>
    observationsByActivite: Map<number, SuiviAvancementContrat[]>
  }
): string[][] {
  return ptbas.map((ptba) => {
    const id = resolvePtbaActiviteId(ptba)
    if (id == null) {
      return [
        ptba.code_activite_ptba?.trim() || '—',
        ptba.intitule_activite_ptba?.trim() || '—',
        '—',
        '—',
        '—',
        '—',
      ]
    }

    const observations = handlers.observationsByActivite.get(id) ?? []
    const dernier = getLatestObservation(observations)
    const etat = dernier?.etat_avancement?.trim()
    const hasTaches = (handlers.tachesByActivite.get(id) ?? []).length > 0
    const percent = handlers.avancementByActivite.get(id) ?? 0
    const statut =
      !etat && !hasTaches
        ? '—'
        : `${etat || '—'} (${hasTaches ? `${percent}%` : '—'})`

    const difficultesRaw = dernier?.difficultes_rencontrees?.trim()
    const difficultes =
      difficultesRaw && difficultesRaw !== 'N/A' ? difficultesRaw : '—'

    const suivis = handlers.suivisByActivite.get(id) ?? []
    const latestDate = getMostRecentDateRealisation(suivis)
    const retard = computeRetardAccuse(latestDate, { hasTaches, percent })

    return [
      ptba.code_activite_ptba?.trim() || '—',
      ptba.intitule_activite_ptba?.trim() || '—',
      statut,
      difficultes,
      formatExportDate(latestDate),
      formatRetardAccuseLabel(retard),
    ]
  })
}

export function getRapportDecaissementExportColumns(
  currencyCode?: string
): RapportExportColumn[] {
  return [
    { id: 'code', header: 'Code', width: 16 },
    { id: 'activite', header: 'Activité', width: 36 },
    {
      id: 'montant',
      header: currencyCode
        ? `Montant de l'activité (${currencyCode})`
        : "Montant de l'activité",
      width: 24,
    },
    {
      id: 'decaissement',
      header: currencyCode ? `Décaissement (${currencyCode})` : 'Décaissement',
      width: 24,
    },
    { id: 'taux', header: 'Taux', width: 14 },
  ]
}

export function buildRapportDecaissementExportRows(
  ptbas: Ptba[],
  decaissementByActivite: Map<number, number>
): string[][] {
  return ptbas.map((ptba) => {
    const activiteId = resolvePtbaActiviteId(ptba)
    const decaissement =
      activiteId != null ? decaissementByActivite.get(activiteId) : undefined
    const taux = computeTauxDecaissement(ptba.cout_total_ptba, decaissement)

    return [
      ptba.code_activite_ptba?.trim() || '—',
      ptba.intitule_activite_ptba?.trim() || '—',
      formatExportMontant(ptba.cout_total_ptba),
      formatExportMontant(decaissement),
      taux == null ? '—' : `${formatExportTaux(taux)} %`,
    ]
  })
}
