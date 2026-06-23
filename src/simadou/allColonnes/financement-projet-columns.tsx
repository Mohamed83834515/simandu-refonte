import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type { Acteur } from '@/simadou/allTypes/acteur'
import type { FinancementProjet } from '@/simadou/allTypes/financementProjet'
import {
  formatTypeFinancementLabel,
  resolveBailleurLabel,
} from '@/simadou/lib/financementProjetUtils'

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('fr-FR')
}

function formatMontant(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value))
}

export function buildFinancementProjetColumns({
  signatairesById,
  onEdit,
  onDeleteRequest,
}: {
  signatairesById: Map<number, Acteur>
  onEdit: (row: FinancementProjet) => void
  onDeleteRequest: (row: FinancementProjet) => void
}): ColumnDef<FinancementProjet>[] {
  return [
    {
      id: 'code_type',
      accessorKey: 'code_type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Code' />
      ),
      cell: ({ row }) => row.original.code_type || '—',
    },
    {
      id: 'intitule',
      accessorKey: 'intitule',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Intitulé' />
      ),
      cell: ({ row }) => (
        <span className='line-clamp-1 max-w-[14rem] text-sm'>
          {row.original.intitule || '—'}
        </span>
      ),
    },
    {
      id: 'type_financement',
      accessorKey: 'type_financement',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Type' />
      ),
      cell: ({ row }) =>
        formatTypeFinancementLabel(row.original.type_financement),
    },
    {
      id: 'bailleur',
      accessorKey: 'bailleur',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Bailleur' />
      ),
      cell: ({ row }) =>
        resolveBailleurLabel(row.original.bailleur, signatairesById),
    },
    {
      id: 'montant',
      accessorKey: 'montant',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Montant' />
      ),
      cell: ({ row }) => formatMontant(row.original.montant),
    },
    {
      id: 'date_accord',
      accessorKey: 'date_accord',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date d'accord" />
      ),
      cell: ({ row }) => formatDate(row.original.date_accord),
    },
    {
      id: 'observation',
      accessorKey: 'observation',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Observation' />
      ),
      cell: ({ row }) => (
        <span className='line-clamp-1 max-w-[12rem] text-sm text-muted-foreground'>
          {row.original.observation?.trim() || '—'}
        </span>
      ),
    },
    buildEditDeleteActionsColumn<FinancementProjet>({
      onEdit,
      onDeleteRequest,
    }),
  ]
}
