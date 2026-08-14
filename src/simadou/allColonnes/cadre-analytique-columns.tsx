import { type ColumnDef } from '@tanstack/react-table'
import { List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/others/long-text'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type { Acteur } from '@/simadou/allTypes/acteur'
import type {
  CadreAnalytique,
  NiveauCadreAnalytique,
} from '@/simadou/allTypes/cadreAnalytique'
import {
  buildAggregatedBudgetByCadreId,
  buildChildCountByParentCaId,
  getLastNiveauCadreAnalytiqueId,
  getNextNiveauCadreAnalytique,
  resolvePartenaireCaIds,
} from '@/simadou/lib/cadreAnalytiqueUtils'
import { formatNumber } from '../allSercices/montantFormater'


export function buildCadreAnalytiqueColumns({
  cadres,
  niveaux = [],
  currentNiveauCodeNumber,
  acteurs = [],
  isLastLevel = false,
  onOpenIndicateurs,
  getIndicateurCount,
  onEdit,
  onDeleteRequest,
}: {
  cadres: CadreAnalytique[]
  niveaux?: NiveauCadreAnalytique[]
  currentNiveauCodeNumber: number
  acteurs?: Pick<Acteur, 'id_acteur' | 'nom_acteur' | 'code_acteur'>[]
  isLastLevel?: boolean
  onOpenIndicateurs?: (row: CadreAnalytique) => void
  getIndicateurCount?: (row: CadreAnalytique) => number
  onEdit: (row: CadreAnalytique) => void
  onDeleteRequest: (row: CadreAnalytique) => void
}): ColumnDef<CadreAnalytique>[] {
  const actionsColumn = buildEditDeleteActionsColumn({
    onEdit,
    onDeleteRequest,
  })

  const nextNiveau = getNextNiveauCadreAnalytique(niveaux, currentNiveauCodeNumber)
  const nextNiveauCodeNumber =
    nextNiveau != null ? Number(nextNiveau.code_number_nca) : null
  const childCountByParentId =
    nextNiveauCodeNumber != null
      ? buildChildCountByParentCaId(cadres, nextNiveauCodeNumber)
      : null

  const childCountColumn: ColumnDef<CadreAnalytique>[] =
    nextNiveau && childCountByParentId
      ? [
          {
            id: `children_${nextNiveau.id_nca}`,
            accessorFn: (row) => childCountByParentId.get(row.id_ca) ?? 0,
            header: ({ column }) => (
              <DataTableColumnHeader
                column={column}
                title={nextNiveau.libelle_nca}
                className='w-full justify-center'
              />
            ),
            cell: ({ row }) => (
              <div className='flex w-full justify-center'>
                <span className='tabular-nums text-sm'>
                  {childCountByParentId.get(row.original.id_ca) ?? 0}
                </span>
              </div>
            ),
            meta: {
              thClassName: '!text-center max-w-[11rem]',
              tdClassName: 'text-center max-w-[11rem]',
            },
            enableSorting: true,
            enableHiding: false,
          },
        ]
      : []

  const lastNiveauId = getLastNiveauCadreAnalytiqueId(niveaux)
  const aggregatedBudgetByCadreId =
    lastNiveauId != null
      ? buildAggregatedBudgetByCadreId(cadres, lastNiveauId)
      : new Map<number, number>()

  const budgetColumn: ColumnDef<CadreAnalytique> = {
    id: 'cout_axe',
    accessorFn: (row) =>
      aggregatedBudgetByCadreId.get(row.id_ca) ??
      (Number(row.cout_axe) || 0),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Budget GNF' />
    ),
    cell: ({ row }) => (
      <span className='whitespace-nowrap tabular-nums text-sm'>
        {formatNumber(
          aggregatedBudgetByCadreId.get(row.original.id_ca) ??
            row.original.cout_axe
        )}
      </span>
    ),
    enableHiding: false,
  }

  const indicateursColumn: ColumnDef<CadreAnalytique>[] =
    isLastLevel && onOpenIndicateurs
      ? [
          {
            id: 'planification_indicateur',
            header: ({ column }) => (
              <DataTableColumnHeader
                column={column}
                title='Indicateurs'
                className='text-center'
              />
            ),
            cell: ({ row }) => {
              const count = getIndicateurCount?.(row.original) ?? 0

              return (
                <div className='flex justify-center'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                    onClick={() => onOpenIndicateurs(row.original)}
                  >
                    <List className='h-4 w-4' />
                    Indicateurs ({count})
                  </Button>
                </div>
              )
            },
            meta: { thClassName: 'text-center', className: 'text-center' },
            size: 100,
            enableSorting: false,
            enableHiding: false,
          },
        ]
      : []

  return [
    {
      id: 'code_ca',
      accessorKey: 'code_ca',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Code' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-sm'>{row.original.code_ca}</span>
      ),
      enableHiding: false,
    },
    {
      id: 'intutile_ca',
      accessorKey: 'intutile_ca',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Libellé' />
      ),
      cell: ({ row }) => (
        <div>
          <div className='font-medium'>{row.original.intutile_ca}</div>
          {row.original.abgrege_ca ? (
            <div className='text-xs text-muted-foreground'>
              {row.original.abgrege_ca}
            </div>
          ) : null}
        </div>
      ),
      enableHiding: false,
    },
    budgetColumn,
    {
      id: 'partenaire_ca',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Acteur(s)' />
      ),
      cell: ({ row }) => {
        const ids = resolvePartenaireCaIds(row.original.partenaire_ca)
        if (ids.length === 0) {
          return (
            <LongText className='max-w-xs text-muted-foreground'>Non défini</LongText>
          )
        }

        return (
          <div className='space-y-1'>
            {ids.map((id) => {
              const acteur = acteurs.find((a) => a.id_acteur === id)
              if (!acteur) {
                return (
                  <LongText
                    key={id}
                    className='max-w-xs text-muted-foreground'
                  >
                    Non défini
                  </LongText>
                )
              }
              return (
                <div key={id}>
                  <LongText className='max-w-xs font-medium'>
                    {acteur.nom_acteur}
                  </LongText>
                  {acteur.code_acteur ? (
                    <div className='text-xs text-muted-foreground'>
                      {acteur.code_acteur}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    ...childCountColumn,
    ...indicateursColumn,
    actionsColumn,
  ]
}
