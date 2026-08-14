import { type ColumnDef } from '@tanstack/react-table'
import { buildColumns } from '@/Global/Tableaux/column-builder'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import {
  computeRetardAccuse,
  getLatestObservation,
  getMostRecentDateRealisation,
} from '@/simadou/allColonnes/rapport-etat-activites-utils'
import { resolvePtbaActiviteId } from '@/simadou/allfonctionalities/rapport/rapportTableUtils'
import type { Ptba, SuiviAvancementContrat, TacheActivitePtba } from '@/simadou/allTypes'
import type { SuiviTacheActivite } from '@/simadou/allTypes/suiviTacheActivite'

type RapportEtatActivitesColumnHandlers = {
  tachesByActivite: Map<number, TacheActivitePtba[]>
  avancementByActivite: Map<number, number>
  suivisByActivite: Map<number, SuiviTacheActivite[]>
  observationsByActivite: Map<number, SuiviAvancementContrat[]>
  progressLoading: boolean
  isLoadingObservations: boolean
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

function LoadingCell() {
  return (
    <div className='h-4 max-w-[120px] animate-pulse rounded bg-muted' />
  )
}

export function buildRapportEtatActivitesColumns({
  tachesByActivite,
  avancementByActivite,
  suivisByActivite,
  observationsByActivite,
  progressLoading,
  isLoadingObservations,
}: RapportEtatActivitesColumnHandlers): ColumnDef<Ptba>[] {
  const baseColumns = buildColumns<Ptba>([
    {
      type: 'text',
      key: 'code_activite_ptba',
      title: 'Code',
      sticky: true,
    },
    {
      type: 'text',
      key: 'intitule_activite_ptba',
      title: 'Activité',
      maxWidth: 'max-w-md',
    },
    { type: 'plain', key: 'version_ptba', title: 'Version PTBA' },
  ])

  const statutColumn: ColumnDef<Ptba> = {
    id: 'statut',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Statut' />
    ),
    cell: ({ row }) => {
      const id = resolvePtbaActiviteId(row.original)
      if (id == null) {
        return <span className='text-xs text-muted-foreground'>—</span>
      }

      if (progressLoading || isLoadingObservations) {
        return <LoadingCell />
      }

      const observations = observationsByActivite.get(id) ?? []
      const dernier = getLatestObservation(observations)
      const etat = dernier?.etat_avancement?.trim()
      const hasTaches = (tachesByActivite.get(id) ?? []).length > 0
      const percent = avancementByActivite.get(id) ?? 0

      if (!etat && !hasTaches) {
        return <span className='text-xs text-muted-foreground'>—</span>
      }

      const etatLabel = etat || '—'
      const percentLabel = hasTaches ? `${percent}%` : '—'

      return (
        <span className='text-sm font-medium'>
          {etatLabel} ({percentLabel})
        </span>
      )
    },
    maxSize: 220,
    enableSorting: false,
    enableHiding: false,
  }

  const difficulteColumn: ColumnDef<Ptba> = {
    id: 'difficultes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Difficultés' />
    ),
    cell: ({ row }) => {
      const id = resolvePtbaActiviteId(row.original)
      if (id == null) {
        return <span className='text-xs text-muted-foreground'>—</span>
      }

      const observations = observationsByActivite.get(id) ?? []

      if (isLoadingObservations) {
        return <LoadingCell />
      }

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
    },
    maxSize: 200,
    enableSorting: false,
    enableHiding: false,
  }

  const delaiColumn: ColumnDef<Ptba> = {
    id: 'delai_realisation',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Délai de réalisation' />
    ),
    cell: ({ row }) => {
      const id = resolvePtbaActiviteId(row.original)
      if (id == null) {
        return <span className='text-xs text-muted-foreground'>—</span>
      }

      if (progressLoading) {
        return <LoadingCell />
      }

      const suivis = suivisByActivite.get(id) ?? []
      const latestDate = getMostRecentDateRealisation(suivis)

      return (
        <span className='whitespace-nowrap text-sm text-muted-foreground'>
          {formatDateRealisation(latestDate)}
        </span>
      )
    },
    meta: {
      thClassName: 'min-w-[120px]',
      className: 'min-w-[120px]',
    },
    enableSorting: false,
    enableHiding: false,
  }

  const retardColumn: ColumnDef<Ptba> = {
    id: 'retard_accuse',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Retard accusé (jours)'
        className='w-full text-center'
      />
    ),
    cell: ({ row }) => {
      const id = resolvePtbaActiviteId(row.original)
      if (id == null) {
        return <span className='text-xs text-muted-foreground'>—</span>
      }

      if (progressLoading) {
        return <LoadingCell />
      }

      const suivis = suivisByActivite.get(id) ?? []
      const hasTaches = (tachesByActivite.get(id) ?? []).length > 0
      const percent = avancementByActivite.get(id) ?? 0
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
    },
    meta: { thClassName: 'text-center', className: 'text-center' },
    enableSorting: false,
    enableHiding: false,
  }

  return [
    ...baseColumns,
    statutColumn,
    difficulteColumn,
    delaiColumn,
    retardColumn,
  ]
}
