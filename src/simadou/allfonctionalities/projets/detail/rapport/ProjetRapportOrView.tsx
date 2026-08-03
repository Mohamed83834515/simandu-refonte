import { useCallback, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { PtbaVersionSelect } from '@/simadou/allfonctionalities/ptba/PtbaVersionSelect'
import RapportExportButton from '@/simadou/allfonctionalities/rapport/RapportExportButton'
import { RapportExportProvider } from '@/simadou/allfonctionalities/rapport/RapportExportContext'
import { useRapportExportRegistration } from '@/simadou/allfonctionalities/rapport/useRapportExportRegistration'
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
import { cn } from '@/lib/utils'

function Chapter({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className='space-y-3'>
      <h3 className='border-b pb-1 text-base font-semibold tracking-tight'>
        {title}
      </h3>
      {children}
    </section>
  )
}

function SimpleTable({
  headers,
  rows,
  empty,
}: {
  headers: string[]
  rows: string[][]
  empty?: string
}) {
  if (rows.length === 0) {
    return (
      <p className='text-sm text-muted-foreground'>{empty ?? 'Aucune donnée.'}</p>
    )
  }
  return (
    <div className='overflow-x-auto rounded-md border'>
      <table className='w-full min-w-[640px] text-left text-sm'>
        <thead className='bg-muted/50'>
          <tr>
            {headers.map((h) => (
              <th key={h} className='px-3 py-2 font-medium'>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className='border-t'>
              {row.map((cell, j) => (
                <td key={j} className='px-3 py-1.5 align-top'>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MetaGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className='grid gap-3 sm:grid-cols-2'>
      {items.map((item) => (
        <div key={item.label} className='space-y-0.5'>
          <dt className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            {item.label}
          </dt>
          <dd className='text-sm'>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function ProjetRapportOrBody({ projet }: { projet: Projet }) {
  const data = useProjetRapportOrData(projet)

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
        return [
          String(year),
          String(items.length),
          String(realisees),
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

  if (data.isLoading) {
    return (
      <div className='flex justify-center py-16'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-lg font-semibold'>
            Rapport d&apos;or — {projet.sigle_projet}
          </h2>
          <p className='text-sm text-muted-foreground'>
            Synthèse exportable du projet (PDF / Word)
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <PtbaVersionSelect
            value={data.selectedVersionId}
            onChange={data.handleChangeVersion}
            options={data.filteredVersionOptions}
          />
          <RapportExportButton formats={['word', 'pdf']} />
        </div>
      </div>

      <Chapter title='Identité du projet'>
        <MetaGrid
          items={[
            { label: 'Intitulé', value: projet.intitule_projet || '—' },
            { label: 'Code', value: projet.code_projet || '—' },
            { label: 'Sigle', value: projet.sigle_projet || '—' },
            { label: 'Type', value: typeLabel },
            {
              label: 'Porteur',
              value:
                projet.partenaire_projet?.intutile_ds ||
                projet.partenaire_projet?.code_ds ||
                '—',
            },
            {
              label: 'Responsable',
              value: resolvePersonnelLabel(projet.responsable_projet) || '—',
            },
            {
              label: 'Démarrage',
              value: formatDateFr(projet.date_demarrage_projet),
            },
            {
              label: 'Clôture',
              value: formatDateFr(projet.date_cloture_projet),
            },
            {
              label: 'Durée',
              value: projet.duree_projet != null ? `${projet.duree_projet} mois` : '—',
            },
            {
              label: 'Budget',
              value: `${formatNumber(projet.budget_projet)} GNF`,
            },
            {
              label: 'Signataires',
              value:
                (projet.signataires_projet ?? [])
                  .map(
                    (a) =>
                      a.description_acteur || a.nom_acteur || a.code_acteur
                  )
                  .filter(Boolean)
                  .join(' ; ') || '—',
            },
            {
              label: "Partenaires d'exécution",
              value:
                (projet.partenaires_execution_projet ?? [])
                  .map(
                    (a) =>
                      a.description_acteur || a.nom_acteur || a.code_acteur
                  )
                  .filter(Boolean)
                  .join(' ; ') || '—',
            },
            {
              label: 'Zones',
              value:
                (projet.zone_projet ?? [])
                  .map((z) => z.intitule_loca || z.code_loca)
                  .filter(Boolean)
                  .join(' ; ') || '—',
            },
            {
              label: 'Statut',
              value: projet.is_cloture ? 'Clôturé' : 'En cours',
            },
          ]}
        />
      </Chapter>

      <Chapter title="1. Vue d'ensemble">
        <div className='grid gap-3 sm:grid-cols-3'>
          {[
            { label: 'Exécution physique', value: `${tauxGlobal} %` },
            {
              label: 'Budget décaissé',
              value: `${formatNumber(budgetDecaisse)} GNF`,
            },
            {
              label: 'Activités PTBA',
              value: String(data.allPtbas.length),
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className='rounded-lg border bg-muted/20 px-4 py-3'
            >
              <p className='text-xs text-muted-foreground'>{kpi.label}</p>
              <p className='mt-1 text-xl font-semibold'>{kpi.value}</p>
            </div>
          ))}
        </div>
      </Chapter>

      <Chapter title='2. Financement'>
        <SimpleTable
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
      </Chapter>

      <Chapter title='3. Plan analytique'>
        {sortedNiveauxActivite.length === 0 ? (
          <p className='text-sm text-muted-foreground'>Aucun niveau configuré.</p>
        ) : (
          <div className='space-y-5'>
            {sortedNiveauxActivite.map((niveau) => {
              const items = data.activites.filter(
                (a) =>
                  Number(a.niveau_activite_projet) ===
                  niveau.id_niveau_activite_projet
              )
              return (
                <div key={niveau.id_niveau_activite_projet} className='space-y-2'>
                  <h4 className='text-sm font-medium'>
                    Niveau {niveau.nombre_niveau_activite_projet} —{' '}
                    {niveau.libelle_niveau_activite_projet}
                    <span className='ml-2 text-muted-foreground'>
                      ({items.length})
                    </span>
                  </h4>
                  <SimpleTable
                    headers={['Code', 'Intitulé']}
                    rows={items.map((a) => [
                      a.code_activite_projet || '—',
                      a.intitule_activite_projet || '—',
                    ])}
                  />
                </div>
              )
            })}
          </div>
        )}
      </Chapter>

      <Chapter title='4. Cadre de résultats'>
        {sortedNiveauxCadre.length === 0 ? (
          <p className='text-sm text-muted-foreground'>Aucun niveau de cadre.</p>
        ) : (
          <div className='space-y-5'>
            {sortedNiveauxCadre.map((niveau) => {
              const items = data.cadres.filter(
                (c) => resolveNiveauCrId(c.niveau_cr) === niveau.id_ncr
              )
              return (
                <div key={niveau.id_ncr} className='space-y-2'>
                  <h4 className='text-sm font-medium'>
                    Niveau {niveau.nombre_ncr} — {niveau.libelle_ncr}
                    <span className='ml-2 text-muted-foreground'>
                      ({items.length})
                    </span>
                  </h4>
                  <SimpleTable
                    headers={['Code', 'Intitulé', 'Abrégé']}
                    rows={items.map((c) => [
                      c.code_cr || '—',
                      c.intutile_cr || '—',
                      c.abgrege_cr || '—',
                    ])}
                  />
                </div>
              )
            })}
          </div>
        )}
      </Chapter>

      <Chapter title='5. PTBA'>
        <div className='space-y-4'>
          <div>
            <h4 className='mb-2 text-sm font-medium'>Tableau croisé (années)</h4>
            <SimpleTable
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
          </div>
          <div>
            <h4 className='mb-2 text-sm font-medium'>Détail des activités</h4>
            <SimpleTable
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
        </div>
      </Chapter>

      <Chapter title='6. Suivi PTBA'>
        <SimpleTable
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
      </Chapter>

      <Chapter title='7. Documents'>
        <SimpleTable
          headers={['Dossier', 'Description']}
          rows={data.dossiers.map((d) => [
            d.nom_dossier || '—',
            d.description_dossier || '—',
          ])}
          empty='Aucun dossier.'
        />
      </Chapter>
    </div>
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
