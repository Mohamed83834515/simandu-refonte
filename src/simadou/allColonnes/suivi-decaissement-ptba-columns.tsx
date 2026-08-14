import { type ColumnDef } from '@tanstack/react-table'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type { SuiviDecaissementPtba } from '@/simadou/allTypes/decaissementPtba'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Ptba } from '../allTypes'

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatMontant(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value))
}

export function buildSuiviDecaissementPtbaColumns({
  activite,
  onEdit,
  onDeleteRequest,
}: {
  activite: Ptba
  onEdit: (row: SuiviDecaissementPtba) => void
  onDeleteRequest: (row: SuiviDecaissementPtba) => void
}): ColumnDef<SuiviDecaissementPtba>[] {
  const actionsColumn = buildEditDeleteActionsColumn({
    onEdit,
    onDeleteRequest,
  })

  return [
    {
      id: 'code_activite_ptba',
      accessorKey: 'code_activite_ptba',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Code' />
      ),
      cell: () => <span>{activite.code_activite_ptba}</span>,
      enableHiding: false,
    },
    {
      id: 'intitule_activite_ptba',
      accessorKey: 'intitule_activite_ptba',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Activité' />
      ),
      cell: () => <span>{activite.intitule_activite_ptba}</span>,
      enableHiding: false,
    },
    {
      id: 'date_suivi_dec',
      accessorKey: 'date_suivi_dec',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Date' />
      ),
      cell: ({ row }) => (
        <span className='text-sm'>
          {formatDate(row.original.date_suivi_dec)}
        </span>
      ),
      enableHiding: false,
    },
    {
      id: 'observation',
      accessorKey: 'observation',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Observation' />
      ),
      cell: ({ row }) => (
        <span className='line-clamp-2 text-sm'>{row.original.observation}</span>
      ),
      enableHiding: false,
    },
    {
      id: 'montant_decaisse',
      accessorKey: 'montant_decaisse',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Montant' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-sm'>
          {formatMontant(row.original.montant_decaisse)}
        </span>
      ),
      enableHiding: false,
    },
    actionsColumn,
  ]
}

export function sumSuiviDecaissementMontant(
  rows: SuiviDecaissementPtba[]
): number {
  return rows.reduce(
    (total, row) => total + (Number(row.montant_decaisse) || 0),
    0
  )
}
