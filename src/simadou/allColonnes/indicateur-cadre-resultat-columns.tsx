import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/others/long-text'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type { IndicateurCadreResultat } from '@/simadou/allTypes'
import { resolveRelationCode } from '@/simadou/lib/resolveApiRelation'

function displayValue(value: string | null | undefined): string {
  if (value == null || value === '') return '—'
  return value
}

function resolveCodeCrIop(value: IndicateurCadreResultat['code_cr_iop']): string {
  return resolveRelationCode(value, 'code_cr') ?? '—'
}

export function buildIndicateurCadreResultatColumns({
  onEdit,
  onDeleteRequest,
  hideCadreColumn = false,
  getResponsableLabel,
}: {
  onEdit: (row: IndicateurCadreResultat) => void
  onDeleteRequest: (row: IndicateurCadreResultat) => void
  hideCadreColumn?: boolean
  getResponsableLabel?: (row: IndicateurCadreResultat) => string
}): ColumnDef<IndicateurCadreResultat>[] {
  const actionsColumn = buildEditDeleteActionsColumn({
    onEdit,
    onDeleteRequest,
  })

  return [
    {
      id: 'code_indicateur_cr_iop',
      accessorKey: 'code_indicateur_cr_iop',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Code Indicateur' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-sm'>
          {row.original.code_indicateur_cr_iop}
        </span>
      ),
      enableHiding: false,
    },
    ...(hideCadreColumn
      ? []
      : [
          {
            id: 'code_cr_iop',
            accessorKey: 'code_cr_iop',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title='Code CR' />
            ),
            cell: ({ row }) => (
              <span className='font-mono text-sm'>
                {resolveCodeCrIop(row.original.code_cr_iop)}
              </span>
            ),
            enableHiding: false,
          } satisfies ColumnDef<IndicateurCadreResultat>,
        ]),
    {
      id: 'intitule_indicateur_cr_iop',
      accessorKey: 'intitule_indicateur_cr_iop',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Intitulé' />
      ),
      cell: ({ row }) => (
        <div className='max-w-xs'>
          <div className='font-medium'>{row.original.intitule_indicateur_cr_iop}</div>
          {row.original.description_iop ? (
            <p
              className='mt-1 truncate text-xs text-muted-foreground'
              title={row.original.description_iop}
            >
              {row.original.description_iop}
            </p>
          ) : null}
        </div>
      ),
      enableHiding: false,
    },
    {
      id: 'niveau_iop',
      accessorKey: 'niveau_iop',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Niveau IOP' />
      ),
      cell: ({ row }) => {
        const niveau = row.original.niveau_iop
        if (niveau == null) return <span>—</span>
        return (
          <Badge variant='outline' className='font-normal'>
            Niveau {niveau}
          </Badge>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'periodicite_iop',
      accessorKey: 'periodicite_iop',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Périodicité' />
      ),
      cell: ({ row }) => (
        <span className='text-sm'>{displayValue(row.original.periodicite_iop)}</span>
      ),
      enableHiding: false,
    },
    {
      id: 'responsable_iop',
      accessorKey: 'responsable_iop',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Responsable' />
      ),
      cell: ({ row }) => (
        <LongText className='max-w-xs text-sm'>
          {getResponsableLabel
            ? getResponsableLabel(row.original)
            : displayValue(row.original.responsable_iop)}
        </LongText>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'source_iop',
      accessorKey: 'source_iop',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Source' />
      ),
      cell: ({ row }) => (
        <LongText className='max-w-xs text-sm'>
          {displayValue(row.original.source_iop)}
        </LongText>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    actionsColumn,
  ]
}
