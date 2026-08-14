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
            download={label}
            className='group inline-flex items-center gap-2 rounded-lg border border-transparent px-2 py-1 text-sm font-medium text-emerald-600 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-400 dark:hover:border-emerald-800/30 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-300'
          >
            <span className='rounded bg-emerald-100 p-1 text-emerald-600 transition-colors group-hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:group-hover:bg-emerald-800/40'>
              <ExternalLink className='h-3.5 w-3.5 shrink-0' />
            </span>
            <span className='truncate max-w-[200px]'>{label}</span>
            <span className='text-[10px] font-normal text-emerald-400 opacity-0 transition-all group-hover:opacity-100 dark:text-emerald-500'>
              télécharger
            </span>
          </a>
        )
      },
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
