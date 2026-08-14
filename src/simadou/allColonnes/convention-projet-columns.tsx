import type { ColumnDef } from '@tanstack/react-table'
import { ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type { Convention } from '@/simadou/allTypes/convention'
import { formatNumber } from '@/simadou/allSercices/montantFormater'

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('fr-FR')
}

export function buildConventionProjetColumns({
  onEdit,
  onDeleteRequest,
  onOpenSuivi,
}: {
  onEdit: (row: Convention) => void
  onDeleteRequest: (row: Convention) => void
  onOpenSuivi: (row: Convention) => void
}): ColumnDef<Convention>[] {
  return [
    {
      id: 'code_convention',
      accessorKey: 'code_convention',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Code' />
      ),
      cell: ({ row }) => (
        <div className='font-medium'>{row.original.code_convention}</div>
      ),
    },
    {
      id: 'intutile_conv',
      accessorKey: 'intutile_conv',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Intitulé' />
      ),
      cell: ({ row }) => <div>{row.original.intutile_conv} ({row.original.reference_conv})</div>,
    },
    {
      id: 'montant_conv',
      accessorKey: 'montant_conv',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Montant (GNF)'
          className='justify-center'
        />
      ),
      cell: ({ row }) => (
        <div className='w-full text-center font-mono tabular-nums'>
          {formatNumber(row.original.montant_conv)}
        </div>
      ),
      meta: { thClassName: 'text-center', className: 'text-center' },
    },
    {
      id: 'date_signature_conv',
      accessorKey: 'date_signature_conv',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Date signature' />
      ),
      cell: ({ row }) => (
        <div>{formatDate(row.original.date_signature_conv)}</div>
      ),
    },
    {
      id: 'document_fichier',
      accessorKey: 'document_fichier',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Document' />
      ),
      cell: ({ row }) => {
        const url = row.original.document_fichier
        if (!url) return <span className='text-xs text-muted-foreground'>—</span>
        return (
          <a
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-xs text-primary underline'
          >
            Voir
          </a>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'suivi',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Suivis des resultats'
          className='w-full text-center'
        />
      ),
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='gap-2 border-yellow-200 bg-yellow-50 text-yellow-700 transition-all duration-200 hover:bg-yellow-100 hover:text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400 dark:hover:bg-yellow-950/50'
            onClick={() => onOpenSuivi(row.original)}
            aria-label='Ouvrir le suivi de la convention'
            title='Suivi décaissement et observations'
          >
            <ClipboardList className='h-4 w-4' />
            <span className='text-xs font-medium'>Suivre</span>
          </Button>
        </div>
      ),
      meta: {
        thClassName: 'text-center w-[100px]',
        className: 'text-center align-middle',
      },
      size: 100,
      enableSorting: false,
      enableHiding: false,
    },
    buildEditDeleteActionsColumn<Convention>({
      onEdit,
      onDeleteRequest,
    }),
  ]
}
