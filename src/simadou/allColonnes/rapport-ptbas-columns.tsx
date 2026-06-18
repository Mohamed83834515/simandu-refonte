import { type ColumnDef } from '@tanstack/react-table'
import { buildColumns } from '@/Global/Tableaux/column-builder'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { RapportMontantCell } from '@/simadou/allColonnes/RapportMontantCell'
import { resolvePtbaActiviteId } from '@/simadou/allfonctionalities/rapport/rapportTableUtils'
import type { Ptba } from '../allTypes'

type RapportPtbasColumnsProps = {
  getResponsableLabel: (ptba: Ptba) => string | null
  tachesCountByActivite: Map<number, number>
  indicateursCountByActivite: Map<number, number>
  countsLoading?: boolean
  currencyCode?: string
}

function CountCell({
  value,
  loading,
}: {
  value: number
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className='mx-auto h-4 w-6 animate-pulse rounded bg-muted' />
    )
  }

  return (
    <div className='flex justify-center'>
      <span className='inline-flex min-w-8 items-center justify-center rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-semibold tabular-nums text-slate-700 dark:bg-slate-800 dark:text-slate-200'>
        {value}
      </span>
    </div>
  )
}

export function buildRapportPtbasColumns({
  getResponsableLabel,
  tachesCountByActivite,
  indicateursCountByActivite,
  countsLoading = false,
  currencyCode,
}: RapportPtbasColumnsProps): ColumnDef<Ptba>[] {
  const baseColumns = buildColumns<Ptba>([
    { type: 'text', key: 'code_activite_ptba', title: 'Code', sticky: true },
    { type: 'text', key: 'intitule_activite_ptba', title: 'Activité' },
  ])

  const tachesColumn: ColumnDef<Ptba> = {
    id: 'taches_count',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Tâches'
        className='w-full text-center'
      />
    ),
    cell: ({ row }) => {
      const activiteId = resolvePtbaActiviteId(row.original)
      return (
        <CountCell
          value={activiteId != null ? (tachesCountByActivite.get(activiteId) ?? 0) : 0}
          loading={countsLoading}
        />
      )
    },
    meta: { thClassName: 'text-center', className: 'text-center' },
    enableSorting: false,
    enableHiding: false,
  }

  const indicateursColumn: ColumnDef<Ptba> = {
    id: 'indicateurs_count',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Indicateurs'
        className='w-full text-center'
      />
    ),
    cell: ({ row }) => {
      const activiteId = resolvePtbaActiviteId(row.original)
      return (
        <CountCell
          value={
            activiteId != null
              ? (indicateursCountByActivite.get(activiteId) ?? 0)
              : 0
          }
          loading={countsLoading}
        />
      )
    },
    meta: { thClassName: 'text-center', className: 'text-center' },
    enableSorting: false,
    enableHiding: false,
  }

  const responsableColumn: ColumnDef<Ptba> = {
    id: 'responsable_ptba',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Responsable' />
    ),
    cell: ({ row }) => {
      const label = getResponsableLabel(row.original)
      return (
        <span className='text-sm'>
          {label ?? <span className='text-muted-foreground'>—</span>}
        </span>
      )
    },
    enableSorting: false,
    enableHiding: false,
  }

  const coutColumn: ColumnDef<Ptba> = {
    id: 'cout_row',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={
          currencyCode
            ? `Cout Activites (${currencyCode})`
            : 'Cout Activites'
        }
      />
    ),
    cell: ({ row }) => <RapportMontantCell value={row.original.cout_total_ptba} />,
    meta: { thClassName: 'text-center', className: 'text-center' },
    enableSorting: true,
    sortDescFirst: true,
    enableHiding: false,
  }

  return [
    ...baseColumns,
    tachesColumn,
    indicateursColumn,
    responsableColumn,
    coutColumn,
  ]
}
