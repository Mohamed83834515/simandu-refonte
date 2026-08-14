import { useMemo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { GenericTable } from '@/Global/Generic/Generictable'
import { useActiveProgrammeCode } from '@/hooks/use-active-programme'
import { TableCell, TableRow } from '@/components/ui/table'
import type { CadreAnalytique, Ptba, TacheActivitePtba } from '@/simadou/allTypes'
import { tauxAvancementGlobalTaches } from '@/simadou/allTypes/suiviTacheActivite'
import {
  computeRetardAccuse,
  getLatestObservation,
  getMostRecentDateRealisation,
} from '@/simadou/allColonnes/rapport-etat-activites-utils'
import { useObservationsByActiviteIds } from '@/simadou/allHooks/admin/rapportHooks'
import { useGetCadresAnalytique } from '@/simadou/allHooks/admin/cadreAnalytiqueHooks'
import { useGetPtbas } from '@/simadou/allHooks/admin/ptbaHooks'
import { usePtbaVersionSelection } from '@/simadou/allHooks/admin/versionHooks'
import { useSuiviPtbaActivitesProgress } from '@/simadou/allHooks/admin/suiviPtbaHooks'
import { PtbaVersionSelect } from '@/simadou/allfonctionalities/ptba/PtbaVersionSelect'
import {
  EMPTY_PTBA_LIST,
  resolvePtbaActiviteId,
} from '@/simadou/allfonctionalities/rapport/rapportTableUtils'
import { resolveCadreAnalytiqueFormValue } from '@/simadou/lib/ptbaFormUtils'
import {
  buildRapportEtatActivitesExportRows,
  getRapportEtatActivitesExportColumns,
} from '@/simadou/allfonctionalities/rapport/export/rapportExportRowBuilders'
import { useRapportExportRegistration } from '@/simadou/allfonctionalities/rapport/useRapportExportRegistration'
import { type RapportExportRowMeta } from '@/simadou/allfonctionalities/rapport/export/rapportExportTypes'

const route = getRouteApi('/_authenticated/rapport/etat-des-activites/')

type TreeRow = {
  type: 'cadre' | 'activite'
  label?: string
  niveau: number
  ptba?: Ptba
  activiteId?: number
}

function formatDateRealisation(value: string | undefined | null): string {
  if (!value?.trim()) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function ListeRapportEtatActivites() {
  const codeProgramme = useActiveProgrammeCode()
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { selectedVersionId, handleChangeVersion, versionOptions } =
    usePtbaVersionSelection(codeProgramme)

  const { data: ptbas } = useGetPtbas(Number(selectedVersionId) || 0)
  const ptbaList = ptbas ?? EMPTY_PTBA_LIST
  const { data: cadresAnalytiques = [] } = useGetCadresAnalytique()

  // Le endpoint `/versions-ptbas/{id}/ptbas-programmes/` renvoie déjà les
  // activités de la version sélectionnée : aucun re-filtrage côté client.
  const filteredPtbas = ptbaList

  const activiteIds = useMemo(
    () =>
      filteredPtbas
        .map((ptba) => resolvePtbaActiviteId(ptba))
        .filter((id): id is number => id != null),
    [filteredPtbas]
  )

  const {
    tachesByActivite,
    suivisByActivite,
    isLoading: progressLoading,
  } = useSuiviPtbaActivitesProgress(activiteIds)

  const { observationsByActivite, isLoading: isLoadingObservations } =
    useObservationsByActiviteIds(activiteIds)

  // ✅ On ne conserve que les tâches validées (valide = true).
  const valideTachesByActivite = useMemo(() => {
    const map = new Map<number, TacheActivitePtba[]>()
    tachesByActivite.forEach((taches, id) => {
      map.set(
        id,
        taches.filter((tache) => tache.valide === true)
      )
    })
    return map
  }, [tachesByActivite])

  // ✅ Avancement recalculé uniquement sur les tâches validées.
  const valideAvancementByActivite = useMemo(() => {
    const map = new Map<number, number>()
    activiteIds.forEach((id) => {
      map.set(
        id,
        tauxAvancementGlobalTaches(
          valideTachesByActivite.get(id) ?? [],
          suivisByActivite.get(id) ?? []
        )
      )
    })
    return map
  }, [activiteIds, valideTachesByActivite, suivisByActivite])

  const isLoading = progressLoading || isLoadingObservations

  const columns: ColumnDef<TreeRow>[] = [
    {
      id: 'code',
      header: 'Code',
      accessorFn: (row) => row.ptba?.code_activite_ptba ?? '',
    },
    {
      id: 'activite',
      header: 'Activité',
      accessorFn: (row) => row.ptba?.intitule_activite_ptba ?? '',
    },
    { id: 'statut', header: 'Statut', accessorFn: () => '' },
    { id: 'difficultes', header: 'Difficultés', accessorFn: () => '' },
    { id: 'delai', header: 'Délai de réalisation', accessorFn: () => '' },
    { id: 'retard', header: 'Retard accusé (jours)', accessorFn: () => '' },
  ]

  const rows = useMemo(() => {
    const ptbasByCadre = new Map<number, Ptba[]>()

    filteredPtbas.forEach((ptba) => {
      const id = resolveCadreAnalytiqueFormValue(
        ptba.cadre_analytique,
        cadresAnalytiques
      )
      if (id == null) return
      if (!ptbasByCadre.has(id)) ptbasByCadre.set(id, [])
      ptbasByCadre.get(id)!.push(ptba)
    })

    const result: TreeRow[] = []

    function children(parentId: number) {
      return cadresAnalytiques.filter((c) => {
        if (typeof c.parent_ca === 'object' && c.parent_ca) {
          return c.parent_ca.id_ca === parentId
        }
        return c.parent_ca === parentId
      })
    }

    function cadreHasPtba(cadre: CadreAnalytique): boolean {
      const activites = ptbasByCadre.get(cadre.id_ca) ?? []
      if (activites.length > 0) return true
      return children(cadre.id_ca).some(cadreHasPtba)
    }

    function parcourir(cadre: CadreAnalytique, niveau: number) {
      if (!cadreHasPtba(cadre)) return

      result.push({
        type: 'cadre',
        label: cadre.intutile_ca,
        niveau,
      })

      children(cadre.id_ca).forEach((c) => parcourir(c, niveau + 1))

      const activites = ptbasByCadre.get(cadre.id_ca) ?? []

      activites.forEach((ptba) => {
        result.push({
          type: 'activite',
          niveau,
          ptba,
          activiteId: resolvePtbaActiviteId(ptba),
        })
      })
    }

    cadresAnalytiques
      .filter((c) => c.parent_ca === null)
      .filter(cadreHasPtba)
      .forEach((c) => parcourir(c, 0))

    return result
  }, [cadresAnalytiques, filteredPtbas])

  // ── Rendu des cellules d'état (par activité) ──────────────────────────────
  const renderStatut = (id: number) => {
    const dernier = getLatestObservation(observationsByActivite.get(id) ?? [])
    const etat = dernier?.etat_avancement?.trim()
    const hasTaches = (valideTachesByActivite.get(id) ?? []).length > 0
    const percent = valideAvancementByActivite.get(id) ?? 0

    if (!etat && !hasTaches) {
      return <span className='text-xs text-muted-foreground'>—</span>
    }

    return (
      <span className='text-sm font-medium'>
        {etat || '—'} ({hasTaches ? `${percent}%` : '—'})
      </span>
    )
  }

  const renderDifficultes = (id: number) => {
    const observations = observationsByActivite.get(id) ?? []
    if (observations.length === 0) {
      return <span className='text-xs text-muted-foreground'>—</span>
    }
    const dernier = getLatestObservation(observations)
    const difficultes = dernier?.difficultes_rencontrees?.trim()

    return (
      <span className='text-sm text-amber-600 dark:text-amber-400'>
        {difficultes && difficultes !== 'N/A' ? difficultes : '—'}
      </span>
    )
  }

  const renderDelai = (id: number) => {
    const suivis = suivisByActivite.get(id) ?? []
    const latestDate = getMostRecentDateRealisation(suivis)

    return (
      <span className='whitespace-nowrap text-sm text-muted-foreground'>
        {formatDateRealisation(latestDate)}
      </span>
    )
  }

  const renderRetard = (id: number) => {
    const suivis = suivisByActivite.get(id) ?? []
    const hasTaches = (valideTachesByActivite.get(id) ?? []).length > 0
    const percent = valideAvancementByActivite.get(id) ?? 0
    const latestDate = getMostRecentDateRealisation(suivis)
    const retard = computeRetardAccuse(latestDate, { hasTaches, percent })

    if (retard.kind === 'none') {
      return <span className='text-xs text-muted-foreground'>—</span>
    }

    if (retard.kind === 'today') {
      return (
        <div className='flex justify-center'>
          <span className='text-sm text-muted-foreground'>Aujourd&apos;hui</span>
        </div>
      )
    }

    if (retard.kind === 'until') {
      return (
        <div className='flex justify-center'>
          <span
            className='inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-sm font-medium tabular-nums text-sky-700 dark:bg-sky-950/30 dark:text-sky-400'
            title={`Dans ${retard.days} jour${retard.days > 1 ? 's' : ''}`}
          >
            {retard.days} j restant{retard.days > 1 ? 's' : ''}
          </span>
        </div>
      )
    }

    return (
      <div className='flex justify-center'>
        <span
          className='inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-sm font-semibold tabular-nums text-red-700 dark:bg-red-950/30 dark:text-red-400'
          title={`Dépassé de ${retard.days} jour${retard.days > 1 ? 's' : ''}`}
        >
          {retard.days} j de retard
        </span>
      </div>
    )
  }

  useRapportExportRegistration({
    isLoading,
    buildExportTable: () => {
      const handlers = {
        tachesByActivite: valideTachesByActivite,
        avancementByActivite: valideAvancementByActivite,
        suivisByActivite,
        observationsByActivite,
      }

      const exportRows: string[][] = []
      const rowMetas: RapportExportRowMeta[] = []

      rows.forEach((r) => {
        if (r.type === 'cadre') {
          exportRows.push([r.label ?? '', '', '', '', '', ''])
          rowMetas.push({ type: 'section', niveau: r.niveau, label: r.label })
        } else if (r.ptba) {
          exportRows.push(
            buildRapportEtatActivitesExportRows([r.ptba], handlers)[0]
          )
          rowMetas.push({
            type: 'data',
            groupKey:
              r.activiteId != null ? String(r.activiteId) : undefined,
          })
        }
      })

      return {
        columns: getRapportEtatActivitesExportColumns(),
        rows: exportRows,
        rowMetas,
        visibleColumnIds: [
          'code',
          'activite',
          'statut',
          'difficultes',
          'delai',
          'retard',
        ],
      }
    },
  })

  if (isLoading) {
    return (
      <div className='flex justify-center py-16'>
        <Loader2 className='animate-spin' />
      </div>
    )
  }

  return (
    <div className='overflow-x-auto'>
      <GenericTable<TreeRow>
        data={rows}
        columns={columns}
        search={search}
        navigate={navigate}
        showSearch={false}
        showViewOptions={false}
        showPagination={false}
        defaultPageSize={Math.max(rows.length, 1)}
        toolbarEndSlot={
          <PtbaVersionSelect
            options={versionOptions}
            value={selectedVersionId}
            onChange={handleChangeVersion}
          />
        }
        customRowRenderer={(row, i, { rowClassName, cellClassName }) => {
          if (row.type === 'cadre') {
            const emptyColumns = row.niveau
            const spanColumns = columns.length - emptyColumns

            return (
              <TableRow className={`${rowClassName} font-bold`} key={i}>
                {Array.from({ length: emptyColumns }).map((_, index) => (
                  <TableCell key={index} className={cellClassName()} />
                ))}
                <TableCell colSpan={spanColumns} className={cellClassName()}>
                  {row.label}
                </TableCell>
              </TableRow>
            )
          }

          const id = row.activiteId

          return (
            <TableRow className={rowClassName} key={i}>
              <TableCell className={cellClassName(0)}>
                {row.ptba?.code_activite_ptba}
              </TableCell>
              <TableCell className={cellClassName(1)}>
                {row.ptba?.intitule_activite_ptba}
              </TableCell>
              <TableCell className={cellClassName(2)}>
                {id != null ? (
                  renderStatut(id)
                ) : (
                  <span className='text-xs text-muted-foreground'>—</span>
                )}
              </TableCell>
              <TableCell className={cellClassName(3)}>
                {id != null ? (
                  renderDifficultes(id)
                ) : (
                  <span className='text-xs text-muted-foreground'>—</span>
                )}
              </TableCell>
              <TableCell className={cellClassName(4)}>
                {id != null ? (
                  renderDelai(id)
                ) : (
                  <span className='text-xs text-muted-foreground'>—</span>
                )}
              </TableCell>
              <TableCell className={cellClassName(5)}>
                {id != null ? (
                  renderRetard(id)
                ) : (
                  <span className='text-xs text-muted-foreground'>—</span>
                )}
              </TableCell>
            </TableRow>
          )
        }}
      />
    </div>
  )
}
