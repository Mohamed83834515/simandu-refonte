import type {
  ProjetDashboardRow,
  ProjetDashboardSource,
  ProjetDashboardStatut,
  ProjetProgrammeDashboardStats,
} from '@/simadou/allTypes/dashboardProjet'
import type { Projet } from '@/simadou/allTypes/projet'
import { computeDateCloture } from '@/simadou/lib/projetUtils'

function computeDelaiConsommePercent(
  dateDebut: Date | null,
  dateCloture: Date | null,
  referenceDate = new Date()
): number {
  if (
    !dateDebut ||
    !dateCloture ||
    Number.isNaN(dateDebut.getTime()) ||
    dateCloture.getTime() <= dateDebut.getTime()
  ) {
    return 0
  }

  if (dateCloture.getTime() <= referenceDate.getTime()) return 100

  return Math.round(
    ((referenceDate.getTime() - dateDebut.getTime()) /
      (dateCloture.getTime() - dateDebut.getTime())) *
      100
  )
}

function resolveProjetDashboardStatut(
  projet: ProjetDashboardSource,
  dateCloture: Date | null,
  delaiConsomme: number,
  avancement: number,
  referenceDate = new Date()
): ProjetDashboardStatut {
  const isClotureDepassee =
    dateCloture != null && dateCloture.getTime() < referenceDate.getTime()

  if (isClotureDepassee && avancement < 100) return 'retard'
  if (avancement < 30 && delaiConsomme > 70) return 'critique'
  if (isClotureDepassee && avancement >= 100) return 'clôturé'
  if (projet.statut_projet?.toLowerCase() === 'suspendu') return 'suspendu'
  return 'actif'
}

export function buildProjetDashboardRow(
  projet: ProjetDashboardSource,
  referenceDate = new Date()
): ProjetDashboardRow {
  const dateDebut = projet.date_demarrage_projet
    ? new Date(projet.date_demarrage_projet)
    : null
  const dateCloture = computeDateCloture(projet)
  const delaiConsomme = computeDelaiConsommePercent(
    dateDebut,
    dateCloture,
    referenceDate
  )
  const avancement = projet.taux_execution_ptba ?? 60
  const budget_projet = projet.budget_projet || 0;
  const decaissement_projet = projet.montant_total_decaisse || 0;
  const taux_decaisser = budget_projet !== 0 ? (decaissement_projet * 100) / budget_projet : 0;
  const partenairesNoms = (projet.signataires_projet ?? [])
    .map((partenaire) => partenaire.code_acteur?.trim())
    .filter(Boolean)

  return {
    id: projet.id_projet,
    sigle: projet.sigle_projet ?? '—',
    nom_projet: projet.intitule_projet ?? '—',
    logo: projet.logo_projet,
    date_demarrage: projet.date_demarrage_projet ?? '',
    date_fin: projet.date_demarrage_projet && projet.duree_projet
        ? new Date(new Date(projet.date_demarrage_projet).setMonth(
            new Date(projet.date_demarrage_projet).getMonth() + projet.duree_projet
          )).toISOString().split('T')[0]
        : '',
    date_cloture: dateCloture ? dateCloture.toISOString().split('T')[0] : '',
    delai_consomme: delaiConsomme,
    budget_prevu: Number(budget_projet ?? 0),
    montant_decaisse: Number(decaissement_projet ?? 0),
    taux_decaissement: taux_decaisser  ,
    taux_avancement_technique: avancement,
    bailleur: partenairesNoms.join('/ ') || '—',
    statut: resolveProjetDashboardStatut(
      projet,
      dateCloture,
      delaiConsomme,
      avancement,
      referenceDate
    ),
  }
}

export function buildProjetDashboardRows(
  projets: ProjetDashboardSource[]
): ProjetDashboardRow[] {
  return projets.map((projet) => buildProjetDashboardRow(projet))
}

export function buildProjetProgrammeDashboardStats(
  projets: Projet[],
  referenceDate = new Date()
): ProjetProgrammeDashboardStats {
  const total = projets.length
  const enRetard = projets.filter((projet) => {
    if (!projet.date_demarrage_projet) return false
    const dateFinPrevue = computeDateCloture(projet)
    return dateFinPrevue != null && dateFinPrevue < referenceDate
  }).length

  const critiques = Math.floor(projets.length * 0.25)

  return {
    total,
    enRetard,
    pourcentageRetard: total > 0 ? Math.round((enRetard / total) * 100) : 0,
    critiques,
    pourcentageCritique:
      total > 0 ? Math.round((critiques / total) * 100) : 0,
  }
}
