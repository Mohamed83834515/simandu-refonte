import { type ColumnDef } from '@tanstack/react-table'
import { BarChart3 } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/others/long-text'
import { Button } from '@/components/ui/button'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type { CadreResultat } from '@/simadou/allTypes'
import {
  resolveParentCrCode,
  resolvePartenaireLabel,
  resolveProjetCr,
} from '@/simadou/lib/cadreResultatUtils'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'

function formatCoutAxe(value: number | undefined): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(value ?? 0)
}

function resolveParentCadre(
  row: CadreResultat,
  cadres: CadreResultat[]
): CadreResultat | null {
  const parent = row.parent_cr
  if (parent != null && typeof parent === 'object' && 'intutile_cr' in parent) {
    return parent as CadreResultat
  }

  const parentCode = resolveParentCrCode(row.parent_cr)
  if (parentCode) {
    return cadres.find((c) => c.code_cr === parentCode) ?? null
  }

  const parentId = resolveRelationId(parent, 'id_cr')
  if (parentId != null) {
    return cadres.find((c) => c.id_cr === parentId) ?? null
  }

  return null
}

export function buildCadreResultatColumns({
  cadres,
  onEdit,
  onDeleteRequest,
  onOpenIndicateurs,
  hideProjetColumn = false,
}: {
  cadres: CadreResultat[]
  onEdit: (row: CadreResultat) => void
  onDeleteRequest: (row: CadreResultat) => void
  onOpenIndicateurs?: (row: CadreResultat) => void
  hideProjetColumn?: boolean
}): ColumnDef<CadreResultat>[] {
  const actionsColumn = buildEditDeleteActionsColumn({
    onEdit,
    onDeleteRequest,
  })

  return [
    {
      id: 'code_cr',
      accessorKey: 'code_cr',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Code' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-sm'>{row.original.code_cr}</span>
      ),
      enableHiding: false,
    },
    {
      id: 'intutile_cr',
      accessorKey: 'intutile_cr',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Libellé' />
      ),
      cell: ({ row }) => (
        <div>
          <div className='font-medium'>{row.original.intutile_cr}</div>
          {row.original.abgrege_cr ? (
            <div className='text-xs text-muted-foreground'>
              {row.original.abgrege_cr}
            </div>
          ) : null}
        </div>
      ),
      enableHiding: false,
    },
    {
      id: 'cout_axe',
      accessorKey: 'cout_axe',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Coût axe' />
      ),
      cell: ({ row }) => (
        <span className='whitespace-nowrap tabular-nums text-sm'>
          {formatCoutAxe(row.original.cout_axe)}
        </span>
      ),
      enableHiding: false,
    },
    {
      id: 'parent_cr',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Parent' />
      ),
      cell: ({ row }) => {
        const parent = resolveParentCadre(row.original, cadres)
        if (!parent) {
          return <span className='text-sm italic text-muted-foreground'>Racine</span>
        }
        return (
          <div>
            <LongText className='max-w-xs font-medium'>{parent.intutile_cr}</LongText>
            <div className='text-xs text-muted-foreground'>{parent.code_cr}</div>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'partenaire_cr',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Partenaire' />
      ),
      cell: ({ row }) => {
        const label = resolvePartenaireLabel(row.original.partenaire_cr)
        return (
          <LongText
            className={
              label === 'Non défini'
                ? 'max-w-xs text-muted-foreground'
                : 'max-w-xs font-medium'
            }
          >
            {label}
          </LongText>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    ...(hideProjetColumn
      ? []
      : [
          {
            id: 'projet_cr',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title='Projet' />
            ),
            cell: ({ row }) => {
              const code = resolveProjetCr(row.original.projet_cr)
              return (
                <span className='font-mono text-sm'>
                  {code ?? '—'}
                </span>
              )
            },
            enableSorting: false,
            enableHiding: false,
          } satisfies ColumnDef<CadreResultat>,
        ]),
    ...(onOpenIndicateurs
      ? [
          {
            id: 'indicateurs',
            header: ({ column }) => (
              <DataTableColumnHeader
                column={column}
                title='Indicateurs'
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
                  onClick={() => onOpenIndicateurs(row.original)}
                  aria-label='Gérer les indicateurs de résultats'
                  title='Indicateurs de résultats'
                >
                  <BarChart3 className='h-4 w-4' />
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
          } satisfies ColumnDef<CadreResultat>,
        ]
      : []),
    actionsColumn,
  ]
}
