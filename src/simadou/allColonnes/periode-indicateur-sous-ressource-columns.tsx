import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type {
  DocumentationCmrEnregistrement,
  PeriodeSousRessourceEnregistrement,
  PeriodeSousRessourceType,
} from '@/simadou/allTypes/periodeIndicateurSousRessource'

export function buildPeriodeIndicateurSousRessourceColumns({
  resource,
  onEdit,
  onDeleteRequest,
}: {
  resource: PeriodeSousRessourceType
  onEdit: (row: PeriodeSousRessourceEnregistrement) => void
  onDeleteRequest: (row: PeriodeSousRessourceEnregistrement) => void
}): ColumnDef<PeriodeSousRessourceEnregistrement>[] {
  const commonColumns: ColumnDef<PeriodeSousRessourceEnregistrement>[] = [
    {
      accessorKey: 'source_donnees',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Source de données' />
      ),
      cell: ({ row }) => (
        <span className='line-clamp-2 max-w-xs'>
          {row.original.source_donnees || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'date_validation',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Date validation' />
      ),
      cell: ({ row }) => row.original.date_validation || '—',
    },
    {
      accessorKey: 'observation',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Observations' />
      ),
      cell: ({ row }) => (
        <span className='line-clamp-2 max-w-xs'>
          {row.original.observation || '—'}
        </span>
      ),
    },
  ]

  const documentationColumns: ColumnDef<PeriodeSousRessourceEnregistrement>[] =
    [
      {
        accessorKey: 'titre',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Titre' />
        ),
        cell: ({ row }) =>
          (row.original as DocumentationCmrEnregistrement).titre || '—',
      },
      {
        accessorKey: 'document',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Document' />
        ),
        cell: ({ row }) => (
          <span className='line-clamp-2 max-w-xs'>
            {(row.original as DocumentationCmrEnregistrement).document || '—'}
          </span>
        ),
      },
    ]

  const columns =
    resource === 'documentations'
      ? [...documentationColumns, ...commonColumns]
      : commonColumns

  return [
    ...columns,
    buildEditDeleteActionsColumn<PeriodeSousRessourceEnregistrement>({
      onEdit,
      onDeleteRequest,
    }),
  ]
}
