import { type ColumnDef } from '@tanstack/react-table'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type { CadreResultat } from '@/simadou/allTypes'
import type { NiveauCadreResultat } from '@/simadou/allTypes/niveauCadreResultat'
import { resolveProjetCr } from '@/simadou/lib/cadreResultatUtils'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'
import { BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/others/long-text'
function resolveParentCadre(
  row: CadreResultat,
  cadres: CadreResultat[]
): CadreResultat | null {
  const parent = row.parent_cr

  if (parent && typeof parent === 'object' && 'intutile_cr' in parent) {
    return parent as CadreResultat
  }

  const parentId = resolveRelationId(parent, 'id_cr')

  if (parentId != null) {
    return cadres.find((c) => c.id_cr === parentId) ?? null
  }

  return null
}

/**
 * Récupère toute la hiérarchie des parents
 */
function resolveParentHierarchy(row: CadreResultat, cadres: CadreResultat[]) {
  const hierarchy: CadreResultat[] = []

  let current = resolveParentCadre(row, cadres)

  while (current) {
    hierarchy.push(current)

    current = resolveParentCadre(current, cadres)
  }

  return hierarchy
}

export function buildCadreResultatColumns({
  cadres,
  niveaux = [],
  currentNiveauId,
  onEdit,
  onDeleteRequest,
  onOpenIndicateurs,
  hideProjetColumn = false,
}: {
  cadres: CadreResultat[]

  niveaux?: NiveauCadreResultat[]

  currentNiveauId: number

  onEdit: (row: CadreResultat) => void

  onDeleteRequest: (row: CadreResultat) => void

  onOpenIndicateurs?: (row: CadreResultat) => void

  hideProjetColumn?: boolean
}): ColumnDef<CadreResultat>[] {
  const actionsColumn = buildEditDeleteActionsColumn({
    onEdit,
    onDeleteRequest,
  })

  /**
   * Niveaux parents
   *
   * Exemple:
   * Niveau 3 :
   * -> Niveau 2
   * -> Niveau 1
   *
   * Niveau 1 :
   * -> aucune colonne
   */
  const parentNiveaux = niveaux
    .filter(
      (n) =>
        n.nombre_ncr <
        (niveaux.find((x) => x.id_ncr === currentNiveauId)?.nombre_ncr ?? 0)
    )
    .sort((a, b) => a.nombre_ncr - b.nombre_ncr)

  const parentColumns = parentNiveaux.map(
    (niveauParent) =>
      ({
        id: `parent_${niveauParent.id_ncr}`,

        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={niveauParent.libelle_ncr}
          />
        ),

        cell: ({ row }) => {
          const hierarchy = resolveParentHierarchy(row.original, cadres)

          const parent = hierarchy.find(
            (item) => item.niveau_cr === niveauParent.id_ncr
          )

          if (!parent) {
            return <span className='text-muted-foreground italic'>Racine</span>
          }

          return (
            <div>
              <LongText className='max-w-xs font-medium'>
                {parent.intutile_cr}
              </LongText>

              <div className='text-xs text-muted-foreground'>
                {parent.code_cr}
              </div>
            </div>
          )
        },

        enableSorting: false,
        enableHiding: false,
      }) satisfies ColumnDef<CadreResultat>
  )

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

          {row.original.abgrege_cr && (
            <div className='text-xs text-muted-foreground'>
              {row.original.abgrege_cr}
            </div>
          )}
        </div>
      ),

      enableHiding: false,
    },

    /**
     * Parents dynamiques
     */
    ...parentColumns,

    ...(hideProjetColumn
      ? []
      : [
          {
            id: 'projet_cr',

            header: ({ column }) => (
              <DataTableColumnHeader column={column} title='Projet' />
            ),

            cell: ({ row }) => (
              <span className='font-mono text-sm'>
                {resolveProjetCr(row.original.projet_cr) ?? '—'}
              </span>
            ),

            enableSorting: false,
            enableHiding: false,
          } satisfies ColumnDef<CadreResultat>,
        ]),

    ...(onOpenIndicateurs
      ? [
          {
            id: 'indicateurs',

            header: ({ column }) => (
              <DataTableColumnHeader column={column} title='Indicateurs' />
            ),

            cell: ({ row }) => (
              <div className='flex justify-center'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => onOpenIndicateurs(row.original)}
                >
                  <BarChart3 className='h-4 w-4' />
                  Planifier
                </Button>
              </div>
            ),

            enableSorting: false,
            enableHiding: false,
          } satisfies ColumnDef<CadreResultat>,
        ]
      : []),

    actionsColumn,
  ]
}
