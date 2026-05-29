import { type ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/others/long-text'
import type { Projet } from '@/simadou/allTypes/projet'

export function buildProjetsColumns(
  onDetail: (projet: Projet) => void
): ColumnDef<Projet>[] {
  return [
    {
      id: 'code_projet',
      accessorKey: 'code_projet',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Code' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-xs font-semibold text-muted-foreground'>
          #{row.original.code_projet}
        </span>
      ),
      meta: { thClassName: 'ps-4', className: 'ps-4' },
      enableHiding: false,
    },
    {
      id: 'sigle_projet',
      accessorKey: 'sigle_projet',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Sigle' />
      ),
      cell: ({ row }) => (
        <span className='font-semibold'>{row.original.sigle_projet}</span>
      ),
      enableHiding: false,
    },
    {
      id: 'intitule_projet',
      accessorKey: 'intitule_projet',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Intitulé' />
      ),
      cell: ({ row }) => (
        <LongText className='max-w-md text-muted-foreground'>
          {row.original.intitule_projet}
        </LongText>
      ),
      enableHiding: false,
    },
    {
      id: 'duree_projet',
      accessorKey: 'duree_projet',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Durée' />
      ),
      cell: ({ row }) => (
        <span className='tabular-nums text-muted-foreground'>
          {row.original.duree_projet} mois
        </span>
      ),
      enableHiding: false,
    },
    {
      id: 'partenaire_projet',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Partenaire' />
      ),
      cell: ({ row }) => (
        <span className='text-muted-foreground'>
          {row.original.partenaire_projet?.nom_acteur?.trim() || '—'}
        </span>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'actions',
      header: () => (
        <span className='text-xs font-medium text-muted-foreground'>Actions</span>
      ),
      cell: ({ row }) => (
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='h-8 gap-1.5 border-primary/20 bg-primary/10 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground'
          onClick={(e) => {
            e.stopPropagation()
            onDetail(row.original)
          }}
        >
          <Eye className='h-3.5 w-3.5' />
          Détails
        </Button>
      ),
      meta: { thClassName: 'text-center pe-4', className: 'text-center pe-4' },
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
