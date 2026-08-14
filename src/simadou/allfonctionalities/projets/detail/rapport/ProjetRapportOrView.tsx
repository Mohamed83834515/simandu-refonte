import { useCallback, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { PtbaVersionSelect } from '@/simadou/allfonctionalities/ptba/PtbaVersionSelect'
import RapportExportButton from '@/simadou/allfonctionalities/rapport/RapportExportButton'
import { RapportExportProvider } from '@/simadou/allfonctionalities/rapport/RapportExportContext'
import { useRapportExportRegistration } from '@/simadou/allfonctionalities/rapport/useRapportExportRegistration'
import { RAPPORT_EXPORT_THEME as theme } from '@/simadou/allfonctionalities/rapport/export/rapportExportTheme'
import { formatNumber } from '@/simadou/allSercices/montantFormater'
import type { Projet } from '@/simadou/allTypes'
import {
  formatTypeFinancementLabel,
  resolveBailleurLabel,
} from '@/simadou/lib/financementProjetUtils'
import { resolveNiveauCrId, sortNiveauxCadreResultat } from '@/simadou/lib/cadreResultatUtils'
import { formatDateFr } from '@/simadou/lib/projetUtils'
import { resolvePersonnelLabel } from '@/simadou/lib/resolveApiRelation'
import { buildProjetRapportOrExport } from './buildProjetRapportOrExport'
import { useProjetRapportOrData } from './useProjetRapportOrData'
import {
  FicheNiveauTable,
  FicheSection,
  FicheSynthese,
  FicheTable,
  type FicheNiveauGroup,
} from './fiche/FicheSynthese'
import { useFicheGeneratedBy } from './fiche/useFicheGeneratedBy'
import { cn } from '@/lib/utils'

function ProjetRapportOrBody({ projet }: { projet: Projet }) {
  const data = useProjetRapportOrData(projet)
  const generatedBy = useFicheGeneratedBy()

  const exportInput = useMemo(
    () => ({
      projet: data.projet,
      financements: data.financements,
      niveauxActivite: data.niveauxActivite,
      activites: data.activites,
      niveauxCadre: data.niveauxCadre,
      cadres: data.cadres,
      dossiers: data.dossiers,
      allPtbas: data.allPtbas,
      ptbasVersion: data.ptbasVersion,
      tauxGlobalData: data.tauxGlobalData,
      tachesByActivite: data.tachesByActivite,
      avancementByActivite: data.avancementByActivite,
      selectedVersion: data.selectedVersion,
      generatedBy,
    }),
    [
      data.projet,
      data.financements,
      data.niveauxActivite,
      data.activites,
      data.niveauxCadre,
      data.cadres,
      data.dossiers,
      data.allPtbas,
      data.ptbasVersion,
      data.tauxGlobalData,
      data.tachesByActivite,
      data.avancementByActivite,
      data.selectedVersion,
      generatedBy,
    ]
  )

  const buildExportTable = useCallback(
    () => buildProjetRapportOrExport(exportInput),
    [exportInput]
  )

  useRapportExportRegistration({
    buildExportTable,
    isLoading: data.isLoading,
  })

  const signatairesById = useMemo(
    () =>
      new Map(
        (projet.signataires_projet ?? []).map((a) => [a.id_acteur, a])
      ),
    [projet.signataires_projet]
  )

  const sortedNiveauxActivite = useMemo(
    () =>
      [...data.niveauxActivite]
        .map((n) => ({
          ...n,
          id_niveau_activite_projet: Number(n.id_niveau_activite_projet),
          nombre_niveau_activite_projet: Number(n.nombre_niveau_activite_projet),
        }))
        .filter((n) => Number.isFinite(n.id_niveau_activite_projet))
        .sort(
          (a, b) =>
            a.nombre_niveau_activite_projet - b.nombre_niveau_activite_projet
        ),
    [data.niveauxActivite]
  )

  const sortedNiveauxCadre = useMemo(
    () => sortNiveauxCadreResultat(data.niveauxCadre),
    [data.niveauxCadre]
  )

  const planAnalytiqueGroups = useMemo<FicheNiveauGroup[]>(
    () =>
      sortedNiveauxActivite.map((niveau) => ({
        key: String(niveau.id_niveau_activite_projet),
        label:
          niveau.libelle_niveau_activite_projet?.trim() ||
          `Niveau ${niveau.nombre_niveau_activite_projet}`,
        items: data.activites
          .filter(
            (a) =>
              Number(a.niveau_activite_projet) ===
              niveau.id_niveau_activite_projet
          )
          .map((a) => ({
            code: a.code_activite_projet || '—',
            label: a.intitule_activite_projet || '—',
          })),
      })),
    [sortedNiveauxActivite, data.activites]
  )

  const cadreGroups = useMemo<FicheNiveauGroup[]>(
    () =>
      sortedNiveauxCadre.map((niveau) => ({
        key: String(niveau.id_ncr),
        label: niveau.libelle_ncr?.trim() || `Niveau ${niveau.nombre_ncr}`,
        items: data.cadres
          .filter((c) => resolveNiveauCrId(c.niveau_cr) === niveau.id_ncr)
          .map((c) => ({
            code: c.code_cr || '—',
            label: c.intutile_cr || '—',
            extra: c.abgrege_cr || '',
          })),
      })),
    [sortedNiveauxCadre, data.cadres]
  )

  const tauxGlobal = useMemo(() => {
    if (!data.tauxGlobalData.length) return 0
    return Math.round(
      data.tauxGlobalData.reduce(
        (s, v) => s + (Number(v.taux_an_activite) || 0),
        0
      ) / data.tauxGlobalData.length
    )
  }, [data.tauxGlobalData])

  const budgetDecaisse = useMemo(
    () =>
      data.allPtbas.reduce(
        (s, p) => s + (Number(p.montant_decaisse_ptba) || 0),
        0
      ),
    [data.allPtbas]
  )

  const budget = Number(projet.budget_projet) || 0
  const budgetPct =
    budget === 0 ? 0 : Math.round((budgetDecaisse / budget) * 100)
  const realisees = data.tauxGlobalData.filter(
    (v) => Number(v.taux_an_activite) >= 100
  ).length

  const croiseRows = useMemo(() => {
    const byYear = new Map<number, typeof data.allPtbas>()
    for (const p of data.allPtbas) {
      const year = p.version_info?.annee_ptba
      if (typeof year !== 'number') continue
      const list = byYear.get(year) ?? []
      list.push(p)
      byYear.set(year, list)
    }
    return [...byYear.keys()]
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
        const decaisse = items.reduce(
          (s, p) => s + (Number(p.montant_decaisse_ptba) || 0),
          0
        )
        return [
          String(year),
          String(items.length),
          String(yearRealisees),
          String(enCours),
          formatNumber(cout),
          formatNumber(decaisse),
        ]
      })
  }, [data.allPtbas])

  const typeLabel =
    projet.type_projet && typeof projet.type_projet === 'object'
      ? projet.type_projet.nom_type_projet || '—'
      : '—'

  const green = `#${theme.green}`
  const greenDark = `#${theme.greenDark}`

  if (data.isLoading) {
    return (
      <div className='flex justify-center py-16'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <FicheSynthese
      badge="Rapport d'or"
      title={`${projet.sigle_projet || projet.code_projet} — ${projet.intitule_projet || ''}`}
      generatedBy={generatedBy}
      contextItems={[
        { label: 'Code', value: projet.code_projet || '—' },
        { label: 'Type', value: typeLabel },
        {
          label: 'Statut',
          value: projet.is_cloture ? 'Clôturé' : 'En cours',
        },
      ]}
      kpis={[
        {
          label: 'Exécution physique',
          value: `${tauxGlobal} %`,
          accent: green,
        },
        {
          label: 'Budget décaissé',
          value: `${formatNumber(budgetDecaisse)} GNF`,
          accent: greenDark,
        },
        {
          label: 'Part décaissée',
          value: `${budgetPct} %`,
          accent: green,
        },
        {
          label: 'Activités PTBA',
          value: String(data.allPtbas.length),
          accent: greenDark,
        },
      ]}
      narrative={`Le projet affiche un taux d’exécution physique de ${tauxGlobal} % (${realisees} activité(s) réalisée(s) sur ${data.tauxGlobalData.length} suivie(s)). Budget ${formatNumber(budget)} GNF, décaissement ${formatNumber(budgetDecaisse)} GNF (${budgetPct} %).`}
      actions={
        <div className='flex flex-wrap items-center gap-2'>
          <PtbaVersionSelect
            value={data.selectedVersionId}
            onChange={data.handleChangeVersion}
            options={data.filteredVersionOptions}
          />
          <RapportExportButton formats={['word', 'pdf']} />
        </div>
      }
    >
      <FicheSection
        title='Identité du projet'
        narrative='Informations générales d’identification, de portage et de couverture du projet.'
      >
        <FicheTable
          title='Fiche identité'
          headers={['Rubrique', 'Valeur']}
          rows={[
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
            ['Budget', `${formatNumber(projet.budget_projet)} GNF`],
            [
              'Signataires',
              (projet.signataires_projet ?? [])
                .map(
                  (a) =>
                    a.description_acteur || a.nom_acteur || a.code_acteur
                )
                .filter(Boolean)
                .join(' ; ') || '—',
            ],
            [
              "Partenaires d'exécution",
              (projet.partenaires_execution_projet ?? [])
                .map(
                  (a) =>
                    a.description_acteur || a.nom_acteur || a.code_acteur
                )
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
            [
              'Statut',
              projet.is_cloture ? 'Clôturé' : 'En cours',
            ],
          ]}
        />
      </FicheSection>

      <FicheSection
        title='2. Financement'
        narrative='Sources de financement du projet (type, bailleur, montants et dates d’accord).'
      >
        <FicheTable
          title='Détail chiffré — financements'
          headers={[
            'Code',
            'Intitulé',
            'Type',
            'Bailleur',
            'Montant (GNF)',
            "Date d'accord",
          ]}
          rows={data.financements.map((f) => [
            f.code_type || '—',
            f.intitule || '—',
            formatTypeFinancementLabel(f.type_financement),
            resolveBailleurLabel(f.bailleur, signatairesById),
            formatNumber(f.montant),
            formatDateFr(f.date_accord),
          ])}
          empty='Aucun financement.'
        />
      </FicheSection>

      <FicheSection
        title='3. Plan analytique'
        narrative='Éléments du plan analytique regroupés par niveau (colonne de gauche fusionnée).'
      >
        <FicheNiveauTable
          title='Détail par niveau'
          groups={planAnalytiqueGroups}
          empty='Aucun niveau configuré.'
        />
      </FicheSection>

      <FicheSection
        title='4. Cadre de résultats'
        narrative='Chaîne de résultats du projet, regroupée par niveau (colonne de gauche fusionnée).'
      >
        <FicheNiveauTable
          title='Chaîne de résultats'
          groups={cadreGroups}
          empty='Aucun niveau de cadre.'
          showExtra
          extraHeader='Abrégé'
        />
      </FicheSection>

      <FicheSection
        title='5. PTBA'
        narrative='Plan de travail budgétisé annuel — synthèse croisée par année et détail des activités.'
      >
        <div className='space-y-6'>
          <FicheTable
            title='Tableau croisé (années)'
            description='Répartition des activités PTBA par année (volumes, coûts, décaissements).'
            headers={[
              'Année',
              'Nb activités',
              'Réalisées',
              'En cours',
              'Coût total',
              'Décaissé',
            ]}
            rows={croiseRows}
            empty='Aucun PTBA daté.'
          />
          <FicheTable
            title='Détail des activités'
            description='Liste détaillée des activités PTBA (code, taux, coût et décaissement).'
            headers={[
              'Code',
              'Intitulé',
              'Année',
              'Taux exéc. %',
              'Coût',
              'Décaissé',
            ]}
            rows={data.allPtbas.map((p) => [
              p.code_activite_ptba || '—',
              p.intitule_activite_ptba || '—',
              p.version_info?.annee_ptba != null
                ? String(p.version_info.annee_ptba)
                : '—',
              String(Number(p.taux_execution_ptba) || 0),
              formatNumber(Number(p.cout_ptba ?? p.cout_total_ptba) || 0),
              formatNumber(Number(p.montant_decaisse_ptba) || 0),
            ])}
          />
        </div>
      </FicheSection>

      <FicheSection
        title='6. Suivi PTBA'
        narrative='Suivi d’avancement des activités pour la version PTBA sélectionnée.'
      >
        <FicheTable
          title='Avancement par activité'
          headers={[
            'Code',
            'Intitulé',
            'Nb tâches',
            'Avancement %',
            'Taux exéc. %',
            'Décaissé',
          ]}
          rows={data.ptbasVersion.map((p) => [
            p.code_activite_ptba || '—',
            p.intitule_activite_ptba || '—',
            String((data.tachesByActivite.get(p.id_ptba) ?? []).length),
            data.avancementByActivite.has(p.id_ptba)
              ? String(Math.round(data.avancementByActivite.get(p.id_ptba)!))
              : '—',
            String(Number(p.taux_execution_ptba) || 0),
            formatNumber(Number(p.montant_decaisse_ptba) || 0),
          ])}
          empty='Aucune activité pour la version sélectionnée.'
        />
      </FicheSection>

      <FicheSection
        title='7. Documents'
        narrative='Inventaire des dossiers documentaires rattachés au projet.'
      >
        <FicheTable
          title='Dossiers'
          headers={['Dossier', 'Description']}
          rows={data.dossiers.map((d) => [
            d.nom_dossier || '—',
            d.description_dossier || '—',
          ])}
          empty='Aucun dossier.'
        />
      </FicheSection>
    </FicheSynthese>
  )
}

export default function ProjetRapportOrView({
  projet,
  className,
}: {
  projet: Projet
  className?: string
}) {
  return (
    <RapportExportProvider
      pageTitle={`Rapport d'or — ${projet.sigle_projet || projet.code_projet}`}
    >
      <div className={cn('space-y-4', className)}>
        <ProjetRapportOrBody projet={projet} />
      </div>
    </RapportExportProvider>
  )
}
