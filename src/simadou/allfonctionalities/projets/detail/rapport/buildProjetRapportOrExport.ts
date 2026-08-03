import { formatNumber } from '@/simadou/allSercices/montantFormater'
import type { ActiviteProjet, NiveauActiviteProjet, Projet } from '@/simadou/allTypes'
import type { CadreResultat } from '@/simadou/allTypes/cadreResultat'
import type { DossierProjet } from '@/simadou/allTypes/dossierProjet'
import type { FinancementProjet } from '@/simadou/allTypes/financementProjet'
import type { NiveauCadreResultat } from '@/simadou/allTypes/niveauCadreResultat'
import type { PtbaProjet } from '@/simadou/allTypes/ptbaProjet'
import type { TacheActivitePtba } from '@/simadou/allTypes/tacheActivitePtba'
import type { VersionPtba } from '@/simadou/allTypes/versionPtba'
import {
  formatTypeFinancementLabel,
  resolveBailleurLabel,
} from '@/simadou/lib/financementProjetUtils'
import { resolveNiveauCrId, sortNiveauxCadreResultat } from '@/simadou/lib/cadreResultatUtils'
import { formatDateFr } from '@/simadou/lib/projetUtils'
import { resolvePersonnelLabel } from '@/simadou/lib/resolveApiRelation'
import type {
  RapportExportPreambleBlock,
  RapportExportRowMeta,
  RapportExportTableData,
} from '@/simadou/allfonctionalities/rapport/export/rapportExportTypes'

const COLS = [
  { id: 'a', header: 'Élément' },
  { id: 'b', header: 'Description' },
  { id: 'c', header: 'Info 1' },
  { id: 'd', header: 'Info 2' },
  { id: 'e', header: 'Info 3' },
  { id: 'f', header: 'Info 4' },
] as const

const EMPTY_ROW = ['', '', '', '', '', ''] as const

export type ProjetRapportOrExportInput = {
  projet: Projet
  financements: FinancementProjet[]
  niveauxActivite: NiveauActiviteProjet[]
  activites: ActiviteProjet[]
  niveauxCadre: NiveauCadreResultat[]
  cadres: CadreResultat[]
  dossiers: DossierProjet[]
  allPtbas: PtbaProjet[]
  ptbasVersion: PtbaProjet[]
  tauxGlobalData: { taux_an_activite?: number }[]
  tachesByActivite: Map<number, TacheActivitePtba[]>
  avancementByActivite: Map<number, number>
  selectedVersion: VersionPtba | null | undefined
}

function pushSection(
  rows: string[][],
  metas: RapportExportRowMeta[],
  label: string,
  niveau = 0
) {
  rows.push([label, ...EMPTY_ROW.slice(1)])
  metas.push({ type: 'section', niveau, label })
}

function pushData(rows: string[][], metas: RapportExportRowMeta[], cells: string[]) {
  const padded = [...cells]
  while (padded.length < 6) padded.push('')
  rows.push(padded.slice(0, 6))
  metas.push({ type: 'data', niveau: 1 })
}

function acteurLabel(acteur: { nom_acteur?: string; description_acteur?: string; code_acteur?: string } | null | undefined) {
  if (!acteur) return '—'
  return (
    acteur.description_acteur?.trim() ||
    acteur.nom_acteur?.trim() ||
    acteur.code_acteur ||
    '—'
  )
}

function formatMontant(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return formatNumber(value)
}

function resolveResponsablePtba(ptba: PtbaProjet): string {
  return (
    resolvePersonnelLabel(ptba.responsable_ptba) ||
    resolvePersonnelLabel(ptba.responsable) ||
    '—'
  )
}

function ptbaAnnee(ptba: PtbaProjet): number | null {
  const fromVersion = ptba.version_info?.annee_ptba
  if (typeof fromVersion === 'number' && Number.isFinite(fromVersion)) return fromVersion
  const raw = (ptba as { annee_ptba?: unknown }).annee_ptba
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  return null
}

function buildPreamble(projet: Projet): RapportExportPreambleBlock[] {
  const signataires = (projet.signataires_projet ?? [])
    .map((a) => acteurLabel(a))
    .filter(Boolean)
  const partenaires = (projet.partenaires_execution_projet ?? [])
    .map((a) => acteurLabel(a))
    .filter(Boolean)
  const zones = (projet.zone_projet ?? [])
    .map((z) => z.intitule_loca || z.code_loca || '')
    .filter(Boolean)
  const typeLabel =
    projet.type_projet && typeof projet.type_projet === 'object'
      ? projet.type_projet.nom_type_projet || projet.type_projet.code_type_projet || '—'
      : '—'
  const responsable =
    resolvePersonnelLabel(projet.responsable_projet) || '—'
  const porteur = projet.partenaire_projet
    ? projet.partenaire_projet.intutile_ds ||
      projet.partenaire_projet.code_ds ||
      '—'
    : '—'

  return [
    { type: 'title', text: `Rapport d'or — ${projet.sigle_projet || projet.code_projet}` },
    { type: 'heading', text: 'Identité du projet' },
    { type: 'paragraph', text: `Intitulé : ${projet.intitule_projet || '—'}` },
    { type: 'paragraph', text: `Code : ${projet.code_projet || '—'} · Sigle : ${projet.sigle_projet || '—'}` },
    { type: 'paragraph', text: `Type : ${typeLabel}` },
    { type: 'paragraph', text: `Structure / partenaire porteur : ${porteur}` },
    { type: 'paragraph', text: `Responsable : ${responsable}` },
    {
      type: 'paragraph',
      text: `Dates : démarrage ${formatDateFr(projet.date_demarrage_projet)} · signature ${formatDateFr(projet.date_signature_projet)} · clôture ${formatDateFr(projet.date_cloture_projet)} · durée ${projet.duree_projet ?? '—'} mois`,
    },
    {
      type: 'paragraph',
      text: `Budget : ${formatMontant(projet.budget_projet)} GNF · Statut : ${projet.is_cloture ? 'Clôturé' : 'En cours'}`,
    },
    {
      type: 'list',
      text: `Signataires : ${signataires.length ? signataires.join(' ; ') : '—'}`,
    },
    {
      type: 'list',
      text: `Partenaires d'exécution : ${partenaires.length ? partenaires.join(' ; ') : '—'}`,
    },
    {
      type: 'list',
      text: `Zones : ${zones.length ? zones.join(' ; ') : '—'}`,
    },
  ]
}

function buildOverviewRows(
  rows: string[][],
  metas: RapportExportRowMeta[],
  input: ProjetRapportOrExportInput
) {
  const { projet, allPtbas, tauxGlobalData } = input
  const tauxGlobal =
    tauxGlobalData.length === 0
      ? 0
      : Math.round(
          tauxGlobalData.reduce(
            (s, v) => s + (Number(v.taux_an_activite) || 0),
            0
          ) / tauxGlobalData.length
        )
  const realisees = tauxGlobalData.filter(
    (v) => Number(v.taux_an_activite) >= 100
  ).length
  const budget = Number(projet.budget_projet) || 0
  const decaisse = allPtbas.reduce(
    (s, p) => s + (Number(p.montant_decaisse_ptba) || 0),
    0
  )
  const budgetPct = budget === 0 ? 0 : Math.round((decaisse / budget) * 100)
  const nbPtba = allPtbas.length
  const tauxExecMoyen =
    nbPtba === 0
      ? 0
      : Math.round(
          allPtbas.reduce((s, p) => s + (Number(p.taux_execution_ptba) || 0), 0) /
            nbPtba
        )

  pushSection(rows, metas, '1. Vue d’ensemble')
  pushData(rows, metas, [
    'Taux d’exécution physique',
    `${tauxGlobal} %`,
    `Activités suivies : ${tauxGlobalData.length}`,
    `Réalisées (≥100 %) : ${realisees}`,
    '',
    '',
  ])
  pushData(rows, metas, [
    'Budget / décaissement',
    `Budget ${formatMontant(budget)} GNF`,
    `Décaissé ${formatMontant(decaisse)} GNF`,
    `${budgetPct} %`,
    '',
    '',
  ])
  pushData(rows, metas, [
    'PTBA (toutes années)',
    `${nbPtba} activité(s)`,
    `Taux exéc. moyen ${tauxExecMoyen} %`,
    '',
    '',
    '',
  ])
}

function buildFinancementRows(
  rows: string[][],
  metas: RapportExportRowMeta[],
  projet: Projet,
  financements: FinancementProjet[]
) {
  const signatairesById = new Map(
    (projet.signataires_projet ?? []).map((a) => [a.id_acteur, a])
  )
  pushSection(rows, metas, '2. Financement')
  pushData(rows, metas, [
    'Code',
    'Intitulé',
    'Type',
    'Bailleur',
    'Montant (GNF)',
    "Date d'accord",
  ])
  if (financements.length === 0) {
    pushData(rows, metas, ['—', 'Aucun financement', '', '', '', ''])
    return
  }
  for (const f of financements) {
    pushData(rows, metas, [
      f.code_type || '—',
      f.intitule || '—',
      formatTypeFinancementLabel(f.type_financement),
      resolveBailleurLabel(f.bailleur, signatairesById),
      formatMontant(f.montant),
      formatDateFr(f.date_accord),
    ])
  }
}

function buildPlanAnalytiqueRows(
  rows: string[][],
  metas: RapportExportRowMeta[],
  niveaux: NiveauActiviteProjet[],
  activites: ActiviteProjet[]
) {
  pushSection(rows, metas, '3. Plan analytique')
  const sorted = [...niveaux]
    .map((n) => ({
      ...n,
      id_niveau_activite_projet: Number(n.id_niveau_activite_projet),
      nombre_niveau_activite_projet: Number(n.nombre_niveau_activite_projet),
    }))
    .filter((n) => Number.isFinite(n.id_niveau_activite_projet))
    .sort(
      (a, b) =>
        a.nombre_niveau_activite_projet - b.nombre_niveau_activite_projet
    )

  if (sorted.length === 0) {
    pushData(rows, metas, ['—', 'Aucun niveau configuré', '', '', '', ''])
    return
  }

  for (const niveau of sorted) {
    pushSection(
      rows,
      metas,
      `Niveau ${niveau.nombre_niveau_activite_projet} — ${niveau.libelle_niveau_activite_projet}`,
      1
    )
    const items = activites.filter(
      (a) =>
        Number(a.niveau_activite_projet) === niveau.id_niveau_activite_projet
    )
    if (items.length === 0) {
      pushData(rows, metas, ['—', 'Aucune élément', '', '', '', ''])
      continue
    }
    for (const a of items) {
      pushData(rows, metas, [
        a.code_activite_projet || '—',
        a.intitule_activite_projet || '—',
        a.budget != null ? formatMontant(Number(a.budget)) : '',
        '',
        '',
        '',
      ])
    }
  }
}

function buildCadreResultatsRows(
  rows: string[][],
  metas: RapportExportRowMeta[],
  niveaux: NiveauCadreResultat[],
  cadres: CadreResultat[]
) {
  pushSection(rows, metas, '4. Cadre de résultats')
  const sorted = sortNiveauxCadreResultat(niveaux)
  if (sorted.length === 0) {
    pushData(rows, metas, ['—', 'Aucun niveau de cadre', '', '', '', ''])
    return
  }
  for (const niveau of sorted) {
    pushSection(
      rows,
      metas,
      `Niveau ${niveau.nombre_ncr} — ${niveau.libelle_ncr}`,
      1
    )
    const items = cadres.filter(
      (c) => resolveNiveauCrId(c.niveau_cr) === niveau.id_ncr
    )
    if (items.length === 0) {
      pushData(rows, metas, ['—', 'Aucun élément', '', '', '', ''])
      continue
    }
    for (const c of items) {
      pushData(rows, metas, [
        c.code_cr || '—',
        c.intutile_cr || '—',
        c.abgrege_cr || '',
        '',
        '',
        '',
      ])
    }
  }
}

function buildPtbaRows(
  rows: string[][],
  metas: RapportExportRowMeta[],
  allPtbas: PtbaProjet[],
  tachesByActivite: Map<number, TacheActivitePtba[]>
) {
  pushSection(rows, metas, '5. PTBA')

  // Synoptique global
  pushSection(rows, metas, '5.a Synthèse synoptique', 1)
  const responsables = new Set<string>()
  for (const p of allPtbas) {
    const label = resolveResponsablePtba(p)
    if (label && label !== '—') responsables.add(label)
  }
  const totalTaches = [...tachesByActivite.values()].reduce(
    (s, list) => s + list.length,
    0
  )
  pushData(rows, metas, [
    'Nombre d’activités PTBA',
    String(allPtbas.length),
    'Nombre de tâches (version courante)',
    String(totalTaches),
    'Responsables distincts',
    String(responsables.size),
  ])
  if (responsables.size > 0) {
    pushData(rows, metas, [
      'Liste des responsables',
      [...responsables].join(' ; '),
      '',
      '',
      '',
      '',
    ])
  }

  // Croisé années × rubriques
  pushSection(rows, metas, '5.b Tableau croisé (années × rubriques)', 1)
  pushData(rows, metas, [
    'Année',
    'Nb activités',
    'Réalisées (≥100 %)',
    'En cours',
    'Coût total (GNF)',
    'Décaissé (GNF)',
  ])

  const byYear = new Map<number, PtbaProjet[]>()
  for (const p of allPtbas) {
    const year = ptbaAnnee(p)
    if (year == null) continue
    const list = byYear.get(year) ?? []
    list.push(p)
    byYear.set(year, list)
  }
  const years = [...byYear.keys()].sort((a, b) => a - b)
  if (years.length === 0) {
    pushData(rows, metas, ['—', 'Aucune PTBA daté', '', '', '', ''])
  } else {
    for (const year of years) {
      const items = byYear.get(year) ?? []
      const realisees = items.filter(
        (p) => (Number(p.taux_execution_ptba) || 0) >= 100
      ).length
      const enCours = items.filter((p) => {
        const t = Number(p.taux_execution_ptba) || 0
        return t >= 1 && t < 100
      }).length
      const cout = items.reduce(
        (s, p) => s + (Number(p.cout_ptba ?? p.cout_total_ptba) || 0),
        0
      )
      const decaisse = items.reduce(
        (s, p) => s + (Number(p.montant_decaisse_ptba) || 0),
        0
      )
      pushData(rows, metas, [
        String(year),
        String(items.length),
        String(realisees),
        String(enCours),
        formatMontant(cout),
        formatMontant(decaisse),
      ])
    }
  }

  // Détail activités
  pushSection(rows, metas, '5.c Détail des activités PTBA', 1)
  pushData(rows, metas, [
    'Code',
    'Intitulé',
    'Année',
    'Responsable',
    'Taux exéc. %',
    'Coût (GNF)',
  ])
  if (allPtbas.length === 0) {
    pushData(rows, metas, ['—', 'Aucune activité PTBA', '', '', '', ''])
    return
  }
  for (const p of allPtbas) {
    pushData(rows, metas, [
      p.code_activite_ptba || '—',
      p.intitule_activite_ptba || '—',
      ptbaAnnee(p) != null ? String(ptbaAnnee(p)) : '—',
      resolveResponsablePtba(p),
      String(Number(p.taux_execution_ptba) || 0),
      formatMontant(Number(p.cout_ptba ?? p.cout_total_ptba) || 0),
    ])
  }
}

function buildSuiviPtbaRows(
  rows: string[][],
  metas: RapportExportRowMeta[],
  ptbasVersion: PtbaProjet[],
  tachesByActivite: Map<number, TacheActivitePtba[]>,
  avancementByActivite: Map<number, number>,
  selectedVersion: VersionPtba | null | undefined
) {
  const versionLabel = selectedVersion
    ? `${selectedVersion.annee_ptba}${selectedVersion.version_ptba ? ` — ${selectedVersion.version_ptba}` : ''}`
    : '—'

  pushSection(rows, metas, `6. Suivi PTBA (version ${versionLabel})`)
  pushData(rows, metas, [
    'Code',
    'Intitulé',
    'Nb tâches',
    'Avancement %',
    'Taux exéc. %',
    'Décaissé (GNF)',
  ])
  if (ptbasVersion.length === 0) {
    pushData(rows, metas, ['—', 'Aucune activité pour cette version', '', '', '', ''])
    return
  }
  for (const p of ptbasVersion) {
    const taches = tachesByActivite.get(p.id_ptba) ?? []
    const avancement = avancementByActivite.get(p.id_ptba)
    pushData(rows, metas, [
      p.code_activite_ptba || '—',
      p.intitule_activite_ptba || '—',
      String(taches.length),
      avancement != null ? String(Math.round(avancement)) : '—',
      String(Number(p.taux_execution_ptba) || 0),
      formatMontant(Number(p.montant_decaisse_ptba) || 0),
    ])
  }
}

function buildDocumentsRows(
  rows: string[][],
  metas: RapportExportRowMeta[],
  dossiers: DossierProjet[]
) {
  pushSection(rows, metas, '7. Documents')
  pushData(rows, metas, [
    'Dossier',
    'Description',
    '',
    '',
    '',
    '',
  ])
  if (dossiers.length === 0) {
    pushData(rows, metas, ['—', 'Aucun dossier', '', '', '', ''])
    return
  }
  for (const d of dossiers) {
    pushData(rows, metas, [
      d.nom_dossier || '—',
      d.description_dossier || '—',
      '',
      '',
      '',
      '',
    ])
  }
}

export function buildProjetRapportOrExport(
  input: ProjetRapportOrExportInput
): RapportExportTableData {
  const rows: string[][] = []
  const rowMetas: RapportExportRowMeta[] = []

  buildOverviewRows(rows, rowMetas, input)
  buildFinancementRows(rows, rowMetas, input.projet, input.financements)
  buildPlanAnalytiqueRows(
    rows,
    rowMetas,
    input.niveauxActivite,
    input.activites
  )
  buildCadreResultatsRows(rows, rowMetas, input.niveauxCadre, input.cadres)
  buildPtbaRows(rows, rowMetas, input.allPtbas, input.tachesByActivite)
  buildSuiviPtbaRows(
    rows,
    rowMetas,
    input.ptbasVersion,
    input.tachesByActivite,
    input.avancementByActivite,
    input.selectedVersion
  )
  buildDocumentsRows(rows, rowMetas, input.dossiers)

  return {
    columns: [...COLS],
    rows,
    rowMetas,
    visibleColumnIds: COLS.map((c) => c.id),
    preamble: buildPreamble(input.projet),
  }
}
