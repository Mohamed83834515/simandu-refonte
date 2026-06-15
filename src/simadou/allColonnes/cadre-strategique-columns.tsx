import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/others/long-text'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type { Acteur } from '@/simadou/allTypes/acteur'
import type { CadreStrategique } from '@/simadou/allTypes/cadreStrategique'
import type { NiveauCadreStrategique } from '@/simadou/allTypes/niveauCadreStrategique'
import {
  buildChildCountByParentCsId,
  getNextNiveauCadreStrategique,
  resolvePartenaireCsIds,
} from '@/simadou/lib/cadreStrategiqueUtils'

export function buildCadreStrategiqueColumns({
  cadres,
  niveaux = [],
  currentNiveauCodeNumber,
  acteurs = [],
  onEdit,
  onDeleteRequest,
}: {
  cadres: CadreStrategique[]
  niveaux?: NiveauCadreStrategique[]
  currentNiveauCodeNumber: number
  acteurs?: Pick<Acteur, 'id_acteur' | 'nom_acteur' | 'code_acteur'>[]
  onEdit: (row: CadreStrategique) => void
  onDeleteRequest: (row: CadreStrategique) => void
}): ColumnDef<CadreStrategique>[] {
  const actionsColumn = buildEditDeleteActionsColumn({
    onEdit,
    onDeleteRequest,
  })

  const nextNiveau = getNextNiveauCadreStrategique(
    niveaux,
    currentNiveauCodeNumber
  )
  const nextNiveauCodeNumber =
    nextNiveau != null ? Number(nextNiveau.code_number_nsc) : null
  const childCountByParentId =
    nextNiveauCodeNumber != null
      ? buildChildCountByParentCsId(cadres, nextNiveauCodeNumber)
      : null

  const childCountColumn: ColumnDef<CadreStrategique>[] =
    nextNiveau && childCountByParentId
      ? [
          {
            id: `children_${nextNiveau.id_nsc}`,
            accessorFn: (row) => childCountByParentId.get(row.id_cs) ?? 0,
            header: ({ column }) => (
              <DataTableColumnHeader
                column={column}
                title={nextNiveau.libelle_nsc}
                className='w-full justify-center'
              />
            ),
            cell: ({ row }) => (
              <div className='flex w-full justify-center'>
                <span className='tabular-nums text-sm'>
                  {childCountByParentId.get(row.original.id_cs) ?? 0}
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
      id: 'code_cs',
      accessorKey: 'code_cs',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Code' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-sm'>{row.original.code_cs}</span>
      ),
      enableHiding: false,
    },
    {
      id: 'intutile_cs',
      accessorKey: 'intutile_cs',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Libellé' />
      ),
      cell: ({ row }) => (
        <div>
          <div className='font-medium'>{row.original.intutile_cs}</div>
          {row.original.abgrege_cs ? (
            <div className='text-xs text-muted-foreground'>
              {row.original.abgrege_cs}
            </div>
          ) : null}
        </div>
      ),
      enableHiding: false,
    },
    {
      id: 'partenaire_cs',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Acteur(s)' />
      ),
      cell: ({ row }) => {
        const ids = resolvePartenaireCsIds(row.original.partenaire_cs)
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
