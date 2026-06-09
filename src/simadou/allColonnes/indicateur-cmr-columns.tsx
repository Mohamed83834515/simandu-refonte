import { type ColumnDef } from '@tanstack/react-table'
import { ClipboardList } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/others/long-text'
import { Button } from '@/components/ui/button'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type { IndicateurCmr } from '@/simadou/allTypes'
import { resolveRelationCode } from '@/simadou/lib/resolveApiRelation'

function displayValue(value: string | null | undefined, fallback = '—'): string {
  if (value == null || value === '') return fallback
  return value
}

function resolveUniteLabel(value: IndicateurCmr['unite_cmr']): string {
  return resolveRelationCode(value, 'unite_ui') ?? '—'
}

export function buildIndicateurCmrColumns({
  onView,
  onEdit,
  onDeleteRequest,
  onOpenCibles,
}: {
  onView?: (row: IndicateurCmr) => void
  onEdit: (row: IndicateurCmr) => void
  onDeleteRequest: (row: IndicateurCmr) => void
  onOpenCibles?: (row: IndicateurCmr) => void
}): ColumnDef<IndicateurCmr>[] {
  const actionsColumn = buildEditDeleteActionsColumn({
    onView,
    onEdit,
    onDeleteRequest,
  })

  return [
    {
      id: 'code_ref_ind',
      accessorKey: 'code_ref_ind',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Code' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-sm'>{row.original.code_ref_ind}</span>
      ),
      enableHiding: false,
    },
    {
      id: 'intitule_ref_ind',
      accessorKey: 'intitule_ref_ind',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Intitulé' />
      ),
      cell: ({ row }) => (
        <div className='max-w-xs'>
          <div className='font-medium'>{row.original.intitule_ref_ind}</div>
          {row.original.resultat_cmr ? (
            <p
              className='mt-1 truncate text-xs text-muted-foreground'
              title={row.original.resultat_cmr}
            >
              Résultat: {row.original.resultat_cmr}
            </p>
          ) : null}
        </div>
      ),
      enableHiding: false,
    },
    {
      id: 'unite_cmr',
      accessorKey: 'unite_cmr',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Unité' />
      ),
      cell: ({ row }) => (
        <span className='text-sm'>{resolveUniteLabel(row.original.unite_cmr)}</span>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'annee_reference',
      accessorKey: 'annee_reference',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Année réf.' />
      ),
      cell: ({ row }) => (
        <span className='text-sm tabular-nums'>{row.original.annee_reference}</span>
      ),
      enableHiding: false,
    },
    ...(onOpenCibles
      ? []
      : [
          {
            id: 'cible_cmr',
            accessorKey: 'cible_cmr',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title='Cible' />
            ),
            cell: ({ row }) => (
              <span className='text-sm'>{displayValue(row.original.cible_cmr)}</span>
            ),
            enableHiding: false,
          } satisfies ColumnDef<IndicateurCmr>,
        ]),
    {
      id: 'fonction_agregat_cmr',
      accessorKey: 'fonction_agregat_cmr',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Fonction agrégation' />
      ),
      cell: ({ row }) => (
        <span className='text-sm'>
          {displayValue(row.original.fonction_agregat_cmr, 'Non définie')}
        </span>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'responsable_collecte_cmr',
      accessorKey: 'responsable_collecte_cmr',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Responsable' />
      ),
      cell: ({ row }) => (
        <LongText className='max-w-xs text-sm'>
          {displayValue(row.original.responsable_collecte_cmr)}
        </LongText>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'reference_cmr',
      accessorKey: 'reference_cmr',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Référence' />
      ),
      cell: ({ row }) => (
        <LongText className='max-w-xs text-sm'>
          {displayValue(row.original.reference_cmr)}
        </LongText>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    ...(onOpenCibles
      ? [
          {
            id: 'cibles',
            header: ({ column }) => (
              <DataTableColumnHeader
                column={column}
                title='Cibles'
                className='flex w-full justify-center'
              />
            ),
            cell: ({ row }) => (
              <div className='flex justify-center'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='gap-2 border-blue-200 bg-blue-50 text-blue-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50'
                  onClick={() => onOpenCibles(row.original)}
                  aria-label='Gérer les cibles CMR'
                  title='Cibles CMR'
                >
                  <ClipboardList className='h-4 w-4' />
                  <span className='text-xs font-medium'>Planifier</span>
                </Button>
              </div>
            ),
            meta: {
              thClassName: 'text-center w-[120px] pe-12',
              className: 'text-center align-middle pe-12',
            },
            size: 120,
            enableSorting: false,
            enableHiding: false,
          } satisfies ColumnDef<IndicateurCmr>,
        ]
      : []),
    actionsColumn,
  ]
}
