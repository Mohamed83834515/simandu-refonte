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
import { RAPPORT_EXPORT_THEME as theme } from '@/simadou/allfonctionalities/rapport/export/rapportExportTheme'
import type {
  RapportExportFicheSection,
  RapportExportFicheTable,
  RapportExportTableData,
} from '@/simadou/allfonctionalities/rapport/export/rapportExportTypes'

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
  generatedBy?: string
}

function acteurLabel(acteur: {
  nom_acteur?: string
  description_acteur?: string
  code_acteur?: string
} | null | undefined) {
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
  if (typeof fromVersion === 'number' && Number.isFinite(fromVersion)) {
    return fromVersion
  }
  const raw = (ptba as { annee_ptba?: unknown }).annee_ptba
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  return null
}

function formatGeneratedAtLabel(date = new Date()) {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function sortedNiveauxActivite(niveaux: NiveauActiviteProjet[]) {
  return [...niveaux]
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
}

function buildPlanAnalytiqueTable(
  niveaux: NiveauActiviteProjet[],
  activites: ActiviteProjet[]
): RapportExportFicheTable {
  const sorted = sortedNiveauxActivite(niveaux)
  const rows: string[][] = []
  for (const niveau of sorted) {
    const niveauLabel =
      niveau.libelle_niveau_activite_projet?.trim() ||
      `Niveau ${niveau.nombre_niveau_activite_projet}`
    const items = activites.filter(
      (a) =>
        Number(a.niveau_activite_projet) === niveau.id_niveau_activite_projet
    )
    if (items.length === 0) {
      rows.push([niveauLabel, '— : Aucun élément'])
      continue
    }
    for (const a of items) {
      rows.push([
        niveauLabel,
        `${a.code_activite_projet || '—'} : ${a.intitule_activite_projet || '—'}`,
      ])
    }
  }
  return {
    title: 'Détail par niveau',
    description:
      'Éléments du plan analytique regroupés par niveau (colonne de gauche fusionnée).',
    headers: ['Niveau', 'Élément'],
    rows: rows.length ? rows : [['—', 'Aucun niveau configuré']],
    mergeFirstColumn: true,
    boldPrefixSeparator: ' : ',
  }
}

function buildCadreTable(
  niveaux: NiveauCadreResultat[],
  cadres: CadreResultat[]
): RapportExportFicheTable {
  const sorted = sortNiveauxCadreResultat(niveaux)
  const rows: string[][] = []
  for (const niveau of sorted) {
    const niveauLabel =
      niveau.libelle_ncr?.trim() || `Niveau ${niveau.nombre_ncr}`
    const items = cadres.filter(
      (c) => resolveNiveauCrId(c.niveau_cr) === niveau.id_ncr
    )
    if (items.length === 0) {
      rows.push([niveauLabel, '— : Aucun élément', ''])
      continue
    }
    for (const c of items) {
      rows.push([
        niveauLabel,
        `${c.code_cr || '—'} : ${c.intutile_cr || '—'}`,
        c.abgrege_cr || '',
      ])
    }
  }
  return {
    title: 'Chaîne de résultats',
    description:
      'Cadre de résultats regroupé par niveau (colonne de gauche fusionnée).',
    headers: ['Niveau', 'Élément', 'Abrégé'],
    rows: rows.length ? rows : [['—', 'Aucun niveau de cadre', '']],
    mergeFirstColumn: true,
    boldPrefixSeparator: ' : ',
  }
}

/**
 * Construit le payload d’export du rapport d’or au format « fiche de synthèse »
 * (PDF/Word portrait verts institutionnels).
 */
export function buildProjetRapportOrExport(
  input: ProjetRapportOrExportInput
): RapportExportTableData {
  const {
    projet,
    financements,
    niveauxActivite,
    activites,
    niveauxCadre,
    cadres,
    dossiers,
    allPtbas,
    ptbasVersion,
    tauxGlobalData,
    tachesByActivite,
    avancementByActivite,
    selectedVersion,
    generatedBy,
  } = input

  const typeLabel =
    projet.type_projet && typeof projet.type_projet === 'object'
      ? projet.type_projet.nom_type_projet ||
      projet.type_projet.code_type_projet ||
      '—'
      : '—'

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

  const signatairesById = new Map(
    (projet.signataires_projet ?? []).map((a) => [a.id_acteur, a])
  )

  const versionLabel = selectedVersion
    ? `${selectedVersion.annee_ptba}${selectedVersion.version_ptba ? ` — ${selectedVersion.version_ptba}` : ''}`
    : '—'

  const byYear = new Map<number, PtbaProjet[]>()
  for (const p of allPtbas) {
    const year = ptbaAnnee(p)
    if (year == null) continue
    const list = byYear.get(year) ?? []
    list.push(p)
    byYear.set(year, list)
  }
  const croiseRows = [...byYear.keys()]
    .sort((a, b) => a - b)
    .map((year) => {
      const items = byYear.get(year) ?? []
      const yearRealisees = items.filter(
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
      const yearDecaisse = items.reduce(
        (s, p) => s + (Number(p.montant_decaisse_ptba) || 0),
        0
      )
      return [
        String(year),
        String(items.length),
        String(yearRealisees),
        String(enCours),
        formatMontant(cout),
        formatMontant(yearDecaisse),
      ]
    })

  const green = `#${theme.green}`
  const greenDark = `#${theme.greenDark}`

  const sections: RapportExportFicheSection[] = [
    {
      title: 'Identité du projet',
      narrative:
        'Informations générales d’identification, de portage et de couverture du projet.',
      tables: [
        {
          title: 'Fiche identité',
          headers: ['Rubrique', 'Valeur'],
          rows: [
            ['Intitulé', projet.intitule_projet || '—'],
            ['Code', projet.code_projet || '—'],
            ['Sigle', projet.sigle_projet || '—'],
            ['Type', typeLabel],
            [
              'Porteur',
              projet.partenaire_projet?.intutile_ds ||
              projet.partenaire_projet?.code_ds ||
              '—',
            ],
            [
              'Responsable',
              resolvePersonnelLabel(projet.responsable_projet) || '—',
            ],
            ['Démarrage', formatDateFr(projet.date_demarrage_projet)],
            ['Clôture', formatDateFr(projet.date_cloture_projet)],
            [
              'Durée',
              projet.duree_projet != null
                ? `${projet.duree_projet} mois`
                : '—',
            ],
            ['Budget', `${formatMontant(projet.budget_projet)} GNF`],
            [
              'Signataires',
              (projet.signataires_projet ?? [])
                .map((a) => acteurLabel(a))
                .filter(Boolean)
                .join(' ; ') || '—',
            ],
            [
              'Partenaires d’exécution',
              (projet.partenaires_execution_projet ?? [])
                .map((a) => acteurLabel(a))
                .filter(Boolean)
                .join(' ; ') || '—',
            ],
            [
              'Zones',
              (projet.zone_projet ?? [])
                .map((z) => z.intitule_loca || z.code_loca)
                .filter(Boolean)
                .join(' ; ') || '—',
            ],
            ['Statut', projet.is_cloture ? 'Clôturé' : 'En cours'],
          ],
        },
      ],
    },
    {
      title: '2. Financement',
      narrative:
        'Sources de financement du projet (type, bailleur, montants et dates d’accord).',
      tables: [
        {
          title: 'Détail chiffré — financements',
          headers: [
            'Code',
            'Intitulé',
            'Type',
            'Bailleur',
            'Montant (GNF)',
            "Date d'accord",
          ],
          rows:
            financements.length === 0
              ? [['—', 'Aucun financement', '', '', '', '']]
              : financements.map((f) => [
                f.code_type || '—',
                f.intitule || '—',
                formatTypeFinancementLabel(f.type_financement),
                resolveBailleurLabel(f.bailleur, signatairesById),
                formatMontant(f.montant),
                formatDateFr(f.date_accord),
              ]),
        },
      ],
    },
    {
      title: '3. Plan analytique',
      narrative:
        'Éléments du plan analytique regroupés par niveau (colonne de gauche fusionnée).',
      tables: [buildPlanAnalytiqueTable(niveauxActivite, activites)],
    },
    {
      title: '4. Cadre de résultats',
      narrative:
        'Chaîne de résultats du projet, regroupée par niveau (colonne de gauche fusionnée).',
      tables: [buildCadreTable(niveauxCadre, cadres)],
    },
    {
      title: '5. PTBA',
      narrative:
        'Plan de travail budgétisé annuel — synthèse croisée par année et détail des activités.',
      tables: [
        {
          title: 'Tableau croisé (années)',
          description:
            'Répartition des activités PTBA par année (volumes, coûts, décaissements).',
          headers: [
            'Année',
            'Nb activités',
            'Réalisées',
            'En cours',
            'Coût total (GNF)',
            'Décaissé (GNF)',
          ],
          rows: croiseRows.length
            ? croiseRows
            : [['—', 'Aucun PTBA daté', '', '', '', '']],
        },
        {
          title: 'Détail des activités PTBA',
          description:
            'Liste détaillée des activités PTBA (code, responsable, taux et coût).',
          headers: [
            'Code',
            'Intitulé',
            'Année',
            'Responsable',
            'Taux exéc. %',
            'Coût (GNF)',
          ],
          rows:
            allPtbas.length === 0
              ? [['—', 'Aucune activité PTBA', '', '', '', '']]
              : allPtbas.map((p) => [
                p.code_activite_ptba || '—',
                p.intitule_activite_ptba || '—',
                ptbaAnnee(p) != null ? String(ptbaAnnee(p)) : '—',
                resolveResponsablePtba(p),
                String(Number(p.taux_execution_ptba) || 0),
                formatMontant(
                  Number(p.cout_ptba ?? p.cout_total_ptba) || 0
                ),
              ]),
        },
      ],
    },
    {
      title: `6. Suivi PTBA (version ${versionLabel})`,
      narrative:
        'Suivi d’avancement des activités pour la version PTBA sélectionnée.',
      tables: [
        {
          title: 'Avancement par activité',
          headers: [
            'Code',
            'Intitulé',
            'Nb tâches',
            'Avancement %',
            'Taux exéc. %',
            'Décaissé (GNF)',
          ],
          rows:
            ptbasVersion.length === 0
              ? [['—', 'Aucune activité pour cette version', '', '', '', '']]
              : ptbasVersion.map((p) => {
                const taches = tachesByActivite.get(p.id_ptba) ?? []
                const avancement = avancementByActivite.get(p.id_ptba)
                return [
                  p.code_activite_ptba || '—',
                  p.intitule_activite_ptba || '—',
                  String(taches.length),
                  avancement != null
                    ? String(Math.round(avancement))
                    : '—',
                  String(Number(p.taux_execution_ptba) || 0),
                  formatMontant(Number(p.montant_decaisse_ptba) || 0),
                ]
              }),
        },
      ],
    },
    {
      title: '7. Documents',
      narrative:
        'Inventaire des dossiers documentaires rattachés au projet.',
      tables: [
        {
          title: 'Dossiers',
          headers: ['Dossier', 'Description'],
          rows:
            dossiers.length === 0
              ? [['—', 'Aucun dossier']]
              : dossiers.map((d) => [
                d.nom_dossier || '—',
                d.description_dossier || '—',
              ]),
        },
      ],
    },
  ]

  const title = `${projet.sigle_projet || projet.code_projet} — ${projet.intitule_projet || 'Rapport d’or'}`

  return {
    columns: [{ id: 'a', header: 'Rapport' }],
    rows: [[title]],
    fiche: {
      badge: 'Rapport d’or',
      title,
      generatedBy,
      generatedAtLabel: formatGeneratedAtLabel(),
      contextItems: [
        { label: 'Code', value: projet.code_projet || '—' },
        { label: 'Type', value: typeLabel },
        {
          label: 'Statut',
          value: projet.is_cloture ? 'Clôturé' : 'En cours',
        },
      ],
      kpis: [
        {
          label: 'Exécution physique',
          value: `${tauxGlobal} %`,
          accent: green,
        },
        {
          label: 'Budget décaissé',
          value: `${formatMontant(decaisse)} GNF`,
          accent: greenDark,
        },
        {
          label: 'Part décaissée',
          value: `${budgetPct} %`,
          accent: green,
        },
        {
          label: 'Activités PTBA',
          value: String(allPtbas.length),
          accent: greenDark,
        },
      ],
      narrative: `Le projet affiche un taux d’exécution physique de ${tauxGlobal} % (${realisees} activité(s) réalisée(s) sur ${tauxGlobalData.length} suivie(s)). Budget ${formatMontant(budget)} GNF, décaissement ${formatMontant(decaisse)} GNF (${budgetPct} %).`,
      sections,
      footerCode: 'MMAFP-RAPPORT-OR',
    },
  }
}
