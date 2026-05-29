import { type ColumnDef } from '@tanstack/react-table'
import { buildColumns } from '@/Global/Tableaux/column-builder'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type { ActiviteProjet } from '@/simadou/allTypes'

export function buildActiviteProjetColumns({
  showParent,
  getParentLabel,
  onEdit,
  onDeleteRequest,
}: {
  showParent: boolean
  getParentLabel: (row: ActiviteProjet) => string
  onEdit: (row: ActiviteProjet) => void
  onDeleteRequest: (row: ActiviteProjet) => void
}): ColumnDef<ActiviteProjet>[] {
  const baseColumns = buildColumns<ActiviteProjet>([
    { type: 'text', key: 'code_activite_projet', title: 'Code', sticky: true },
    {
      type: 'text',
      key: 'intitule_activite_projet',
      title: 'Intitulé',
      maxWidth: 'max-w-md',
    },
  ])

  const parentColumn: ColumnDef<ActiviteProjet> = {
    id: 'parent_activite_projet',
    accessorKey: 'parent_activite_projet',
    header: 'Parent',
    cell: ({ row }) => (
      <span className='text-muted-foreground'>{getParentLabel(row.original)}</span>
    ),
    enableSorting: false,
    enableHiding: false,
  }

  const actionsColumn = buildEditDeleteActionsColumn({
    onEdit,
    onDeleteRequest,
  })

  return showParent
    ? [...baseColumns, parentColumn, actionsColumn]
    : [...baseColumns, actionsColumn]
}
