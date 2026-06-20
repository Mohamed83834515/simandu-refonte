import { type ColumnDef, type Row } from '@tanstack/react-table'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/data-table'
import { GenericRowActions } from '@/Global/Tableaux/GenericRowActions'

function ViewEditDeleteRowActions<T>({
  row,
  onView,
  onEdit,
  onDeleteRequest,
}: {
  row: Row<T>
  onView?: (row: T) => void
  onEdit?: (row: T) => void
  onDeleteRequest?: (row: T) => void
}) {
  const actions = [
    ...(onView
      ? [
          {
            label: 'Voir',
            icon: <Eye size={16} />,
            onClick: onView,
          },
        ]
      : []),
    ...(onEdit
      ? [
          {
            label: 'Modifier',
            icon: <Pencil size={16} />,
            onClick: onEdit,
          },
        ]
      : []),
    ...(onDeleteRequest
      ? [
          {
            label: 'Supprimer',
            icon: <Trash2 size={16} />,
            onClick: onDeleteRequest,
            className: 'text-red-500!',
            separator: true,
          },
        ]
      : []),
  ]

  return <GenericRowActions row={row} actions={actions} />
}

export function buildEditDeleteActionsColumn<T>({
  onView,
  onEdit,
  onDeleteRequest,
}: {
  onView?: (row: T) => void
  onEdit?: (row: T) => void
  onDeleteRequest?: (row: T) => void
}): ColumnDef<T> {
  return {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Actions' />
    ),
    cell: ({ row }) => (
      <ViewEditDeleteRowActions
        row={row}
        onView={onView}
        onEdit={onEdit}
        onDeleteRequest={onDeleteRequest}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }
}
