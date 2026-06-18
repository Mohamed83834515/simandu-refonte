import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/others/long-text'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type { Acteur } from '@/simadou/allTypes/acteur'
import type {
  CadreAnalytique,
  NiveauCadreAnalytique,
} from '@/simadou/allTypes/cadreAnalytique'
import {
  buildChildCountByParentCaId,
  getNextNiveauCadreAnalytique,
  resolvePartenaireCaIds,
} from '@/simadou/lib/cadreAnalytiqueUtils'
import { formatNumber } from '../allSercices/montantFormater'


export function buildCadreAnalytiqueColumns({
  cadres,
  niveaux = [],
  currentNiveauCodeNumber,
  acteurs = [],
  onEdit,
  onDeleteRequest,
}: {
  cadres: CadreAnalytique[]
  niveaux?: NiveauCadreAnalytique[]
  currentNiveauCodeNumber: number
  acteurs?: Pick<Acteur, 'id_acteur' | 'nom_acteur' | 'code_acteur'>[]
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
    {
      id: 'cout_axe',
      accessorKey: 'cout_axe',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Budget GNF' />
      ),
      cell: ({ row }) => (
        <span className='whitespace-nowrap tabular-nums text-sm'>
          {formatNumber(row.original.cout_axe)}
        </span>
      ),
      enableHiding: false,
    },
    
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
    actionsColumn,
  ]
}
