import { formatNumber } from '@/simadou/allSercices/montantFormater'
import type { ActiviteProjet, Projet } from '@/simadou/allTypes'
import type { CadreResultat } from '@/simadou/allTypes/cadreResultat'
import type { DossierProjet } from '@/simadou/allTypes/dossierProjet'
import type { FinancementProjet } from '@/simadou/allTypes/financementProjet'
import type { IndicateurPerformanceProjet } from '@/simadou/allTypes/indicateurPerformanceProjet'
import type { NiveauCadreResultat } from '@/simadou/allTypes/niveauCadreResultat'
import type { Personnel } from '@/simadou/allTypes/personnel'
import type { PtbaProjet } from '@/simadou/allTypes/ptbaProjet'
import type { UniteIndicateur } from '@/simadou/allTypes/uniteIndicateur'
import {
  formatTypeFinancementLabel,
  resolveBailleurLabel,
} from '@/simadou/lib/financementProjetUtils'
import { resolveNiveauCrId, sortNiveauxCadreResultat } from '@/simadou/lib/cadreResultatUtils'
import { computeDateFin, formatDateFr } from '@/simadou/lib/projetUtils'
import { resolvePersonnelLabel } from '@/simadou/lib/resolveApiRelation'
import { RAPPORT_EXPORT_THEME as theme } from '@/simadou/allfonctionalities/rapport/export/rapportExportTheme'
import type {
  RapportExportFicheSection,
  RapportExportFicheTable,
  RapportExportTableData,
} from '@/simadou/allfonctionalities/rapport/export/rapportExportTypes'
import { buildPlanAnalytiqueArboTable } from './buildPlanAnalytiqueArborescence'

export type ProjetRapportOrExportInput = {
  projet: Projet
  financements: FinancementProjet[]
  activites: ActiviteProjet[]
  indicateursPerformance: IndicateurPerformanceProjet[]
  unitesIndicateur: UniteIndicateur[]
  niveauxCadre: NiveauCadreResultat[]
  cadres: CadreResultat[]
  dossiers: DossierProjet[]
  allPtbas: PtbaProjet[]
  tauxGlobalData: { taux_an_activite?: number }[]
  personnelsById?: Map<number, Personnel>
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

function formatDateCloture(projet: Projet): string {
  if (!projet.date_cloture_projet) return 'Non clôturé'
  const formatted = formatDateFr(projet.date_cloture_projet)
  return formatted === '—' ? 'Non clôturé' : formatted
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
    activites,
    indicateursPerformance,
    unitesIndicateur,
    niveauxCadre,
    cadres,
    dossiers,
    allPtbas,
    tauxGlobalData,
    personnelsById,
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

  const responsableLabel =
    resolvePersonnelLabel(projet.responsable_projet, personnelsById) || '—'

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
      // Moyenne des taux d'exécution PTBA (= taux d'avancement technique).
      const tauxAvancementTechnique =
        items.length === 0
          ? 0
          : Math.round(
              items.reduce(
                (s, p) => s + (Number(p.taux_execution_ptba) || 0),
                0
              ) / items.length
            )
      const tauxDecaissement =
        items.length === 0
          ? 0
          : Math.round(
              items.reduce(
                (s, p) => s + (Number(p.taux_decaissement_ptba) || 0),
                0
              ) / items.length
            )
      return [
        String(year),
        String(items.length),
        String(yearRealisees),
        String(enCours),
        formatMontant(cout),
        formatMontant(yearDecaisse),
        `${tauxAvancementTechnique} %`,
        `${tauxDecaissement} %`,
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
            ['Responsable', responsableLabel],
            [
              'Date de démarrage',
              formatDateFr(projet.date_demarrage_projet),
            ],
            ['Date de fin', computeDateFin(projet)],
            ['Date de clôture', formatDateCloture(projet)],
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
        'Arborescence des activités du plan analytique avec budget et indicateurs de performance.',
      tables: [
        buildPlanAnalytiqueArboTable(
          activites,
          indicateursPerformance,
          unitesIndicateur
        ),
      ],
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
        'Synthèse croisée des activités PTBA par année (volumes, coûts, avancement et décaissement).',
      tables: [
        {
          title: 'Tableau croisé (années)',
          description:
            'Répartition des activités PTBA par année, avec taux d’avancement technique et taux de décaissement.',
          headers: [
            'Année',
            'Nb activités',
            'Réalisées',
            'En cours',
            'Coût total (GNF)',
            'Décaissé (GNF)',
            "Taux d'avancement technique",
            'Décaissement',
          ],
          rows: croiseRows.length
            ? croiseRows
            : [['—', 'Aucun PTBA daté', '', '', '', '', '', '']],
        },
      ],
    },
    {
      title: '6. Documents',
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
