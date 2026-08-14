import { type ColumnDef } from '@tanstack/react-table'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type { CadreLogiqueClcp } from '@/simadou/allTypes/cadreLogiqueClcp'
import type { NiveauConfigClcp } from '@/simadou/allTypes/niveauConfigClcp'
import {
  getNiveauClcpLabel,
  resolveNiveauClcId,
  resolveParentClcId,
} from '@/simadou/lib/cadreLogiqueClcpUtils'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/others/long-text'

function resolveParentCadre(
  row: CadreLogiqueClcp,
  cadres: CadreLogiqueClcp[]
): CadreLogiqueClcp | null {
  const parent = row.parent_clc
  if (parent && typeof parent === 'object' && 'intitule_clc' in parent) {
    return parent as CadreLogiqueClcp
  }
  const parentId = resolveParentClcId(parent)
  if (parentId != null) {
    return cadres.find((c) => c.id_clc === parentId) ?? null
  }
  return null
}

function resolveParentHierarchy(
  row: CadreLogiqueClcp,
  cadres: CadreLogiqueClcp[]
) {
  const hierarchy: CadreLogiqueClcp[] = []
  let current = resolveParentCadre(row, cadres)
  while (current) {
    hierarchy.push(current)
    current = resolveParentCadre(current, cadres)
  }
  return hierarchy
}

export function buildCadreLogiqueClcpColumns({
  cadres,
  niveaux = [],
  currentNiveauId,
  onEdit,
  onDeleteRequest,
}: {
  cadres: CadreLogiqueClcp[]
  niveaux?: NiveauConfigClcp[]
  currentNiveauId: number
  onEdit: (row: CadreLogiqueClcp) => void
  onDeleteRequest: (row: CadreLogiqueClcp) => void
}): ColumnDef<CadreLogiqueClcp>[] {
  const actionsColumn = buildEditDeleteActionsColumn({
    onEdit,
    onDeleteRequest,
  })

  const parentNiveaux = niveaux
    .filter(
      (n) =>
        n.nombre_ncl <
        (niveaux.find((x) => x.id_niveau_ncl === currentNiveauId)?.nombre_ncl ??
          0)
    )
    .sort((a, b) => a.nombre_ncl - b.nombre_ncl)

  const parentColumns = parentNiveaux.map(
    (niveauParent) =>
      ({
        id: `parent_${niveauParent.id_niveau_ncl}`,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={getNiveauClcpLabel(niveauParent)}
          />
        ),
        cell: ({ row }) => {
          const hierarchy = resolveParentHierarchy(row.original, cadres)
          const parent = hierarchy.find(
            (item) => resolveNiveauClcId(item.niveau_clc) === niveauParent.id_niveau_ncl
          )
          if (!parent) {
            return <span className='text-muted-foreground italic'>Racine</span>
          }
          return (
            <div>
              <LongText className='max-w-xs font-medium'>
                {parent.intitule_clc}
              </LongText>
              <div className='text-xs text-muted-foreground'>
                {parent.code_clc}
              </div>
            </div>
          )
        },
        enableSorting: false,
        enableHiding: false,
      }) satisfies ColumnDef<CadreLogiqueClcp>
  )

  return [
    {
      id: 'code_clc',
      accessorKey: 'code_clc',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Code' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-sm'>{row.original.code_clc}</span>
      ),
      enableHiding: false,
    },
    {
      id: 'intitule_clc',
      accessorKey: 'intitule_clc',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Intitulé' />
      ),
      cell: ({ row }) => (
        <div className='font-medium'>{row.original.intitule_clc}</div>
      ),
      enableHiding: false,
    },
    ...parentColumns,
    actionsColumn,
  ]
}
