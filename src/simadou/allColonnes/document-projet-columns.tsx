import type { ColumnDef } from '@tanstack/react-table'
import { ExternalLink, Trash2, UserPen } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { GenericRowActions } from '@/Global/Tableaux/GenericRowActions'
import type { DocumentProjet } from '@/simadou/allTypes/documentProjet'
import {
  resolveDocumentFileName,
  resolveDocumentUrl,
} from '@/simadou/lib/documentProjetUtils'

type DocumentProjetDialogType = 'delete'

export function buildDocumentProjetColumns(
  setOpen: (dialog: DocumentProjetDialogType | null) => void,
  setCurrentRow: React.Dispatch<React.SetStateAction<DocumentProjet | null>>,
  onEdit: (row: DocumentProjet) => void
): ColumnDef<DocumentProjet>[] {
  return [
    {
      id: 'document',
      accessorKey: 'document',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Document' />
      ),
      cell: ({ row }) => {
        const href = resolveDocumentUrl(row.original.document)
        const label = resolveDocumentFileName(row.original.document)

        if (!href) {
          return <span className='text-sm text-muted-foreground'>—</span>
        }

        return (
          <a
            href={href}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline'
          >
            <ExternalLink className='h-4 w-4 shrink-0' />
            {label}
          </a>
        )
      },
    },
    {
      id: 'description_document',
      accessorKey: 'description_document',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Description' />
      ),
      cell: ({ row }) => (
        <div className='max-w-md truncate text-sm'>
          {row.original.description_document?.trim() || '—'}
        </div>
      ),
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Actions' />
      ),
      cell: ({ row }) => (
        <GenericRowActions
          row={row}
          actions={[
            {
              label: 'Modifier',
              icon: <UserPen size={16} />,
              onClick: onEdit,
            },
            {
              label: 'Supprimer',
              icon: <Trash2 size={16} />,
              onClick: () => {
                setCurrentRow(row.original)
                setOpen('delete')
              },
              className: 'text-red-500!',
              separator: true,
            },
          ]}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
