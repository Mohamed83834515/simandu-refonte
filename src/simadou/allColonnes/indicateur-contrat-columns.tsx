import { type ColumnDef } from '@tanstack/react-table'
import { ClipboardList } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type { CadreLogiqueClcp } from '@/simadou/allTypes/cadreLogiqueClcp'
import type { IndicateurContrat } from '@/simadou/allTypes/indicateurContrat'
import { resolveClcpLabel } from '@/simadou/lib/indicateurContratUtils'

export function buildIndicateurContratColumns({
  cadres,
  onEdit,
  onDeleteRequest,
  onSuivi,
  hideClcpColumn = false,
}: {
  cadres: CadreLogiqueClcp[]
  onEdit: (row: IndicateurContrat) => void
  onDeleteRequest: (row: IndicateurContrat) => void
  onSuivi?: (row: IndicateurContrat) => void
  hideClcpColumn?: boolean
}): ColumnDef<IndicateurContrat>[] {
  const actionsColumn = buildEditDeleteActionsColumn({
    onEdit,
    onDeleteRequest,
  })

  const trimestreColumns: ColumnDef<IndicateurContrat>[] = [
    {
      id: 'cible_t1',
      accessorKey: 'cible_t1',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='T1' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-sm'>{row.original.cible_t1 || '—'}</span>
      ),
      enableHiding: false,
    },
    {
      id: 'cible_t2',
      accessorKey: 'cible_t2',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='T2' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-sm'>{row.original.cible_t2 || '—'}</span>
      ),
      enableHiding: false,
    },
    {
      id: 'cible_t3',
      accessorKey: 'cible_t3',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='T3' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-sm'>{row.original.cible_t3 || '—'}</span>
      ),
      enableHiding: false,
    },
    {
      id: 'cible_t4',
      accessorKey: 'cible_t4',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='T4' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-sm'>{row.original.cible_t4 || '—'}</span>
      ),
      enableHiding: false,
    },
  ]

  const suiviColumn: ColumnDef<IndicateurContrat> | null = onSuivi
    ? {
        id: 'suivi',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title='Suivi'
            className='text-center'
          />
        ),
        cell: ({ row }) => (
          <div className='flex justify-center'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='gap-2 border-yellow-200 bg-yellow-50 text-yellow-700 transition-all duration-200 hover:bg-yellow-100 hover:text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400 dark:hover:bg-yellow-950/50'
              onClick={() => onSuivi(row.original)}
              aria-label='Ouvrir le suivi'
              title="Suivi de l'indicateur"
            >
              <ClipboardList className='h-4 w-4' />
              <span className='text-xs font-medium'>Suivre</span>
            </Button>
          </div>
        ),
        meta: { thClassName: 'text-center', className: 'text-center' },
        size: 100,
        enableSorting: false,
        enableHiding: false,
      }
    : null

  return [
    {
      id: 'intitule_indicateur',
      accessorKey: 'intitule_indicateur',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Intitulé' />
      ),
      cell: ({ row }) => (
        <div className='font-medium'>{row.original.intitule_indicateur}</div>
      ),
      enableHiding: false,
    },
    ...(hideClcpColumn
      ? []
      : [
          {
            id: 'clcp',
            accessorKey: 'clcp',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title='Cadre logique' />
            ),
            cell: ({ row }) => (
              <span className='text-sm'>
                {resolveClcpLabel(row.original.clcp, cadres)}
              </span>
            ),
            enableHiding: false,
          } satisfies ColumnDef<IndicateurContrat>,
        ]),
    {
      id: 'valeur_reference',
      accessorKey: 'valeur_reference',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Valeur réf.' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-sm'>
          {row.original.valeur_reference}
        </span>
      ),
      enableHiding: false,
    },
    ...trimestreColumns,
    {
      id: 'moyen_verification',
      accessorKey: 'moyen_verification',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Moyen vérif.' />
      ),
      cell: ({ row }) => {
        const url = row.original.moyen_verification
        if (!url || typeof url !== 'string') return '—'
        return (
          <a
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-sm text-primary underline-offset-4 hover:underline'
          >
            Voir
          </a>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    ...(suiviColumn ? [suiviColumn] : []),
    actionsColumn,
  ]
}
