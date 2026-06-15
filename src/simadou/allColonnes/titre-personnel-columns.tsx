import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type { TitrePersonnel } from '@/simadou/allTypes'

export function buildTitrePersonnelColumns({
  onEdit,
  onDeleteRequest,
}: {
  onEdit: (row: TitrePersonnel) => void
  onDeleteRequest: (row: TitrePersonnel) => void
}): ColumnDef<TitrePersonnel>[] {
  const actionsColumn = buildEditDeleteActionsColumn({
    onEdit,
    onDeleteRequest,
  })

  return [
    {
      accessorKey: 'libelle_titre',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Libellé' />
      ),
      cell: ({ row }) => (
        <span className='font-medium'>{row.original.libelle_titre}</span>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'description_titre',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Description' />
      ),
      cell: ({ row }) => (
        <span className='text-sm text-muted-foreground'>
          {row.original.description_titre?.trim() || '—'}
        </span>
      ),
      enableHiding: false,
    },
    actionsColumn,
  ]
}
