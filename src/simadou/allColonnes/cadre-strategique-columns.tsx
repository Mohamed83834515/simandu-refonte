import { type ColumnDef } from '@tanstack/react-table'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type { Acteur } from '@/simadou/allTypes/acteur'
import type { CadreStrategique } from '@/simadou/allTypes/cadreStrategique'
import type { NiveauCadreStrategique } from '@/simadou/allTypes/niveauCadreStrategique'
import { resolvePartenaireCsIds } from '@/simadou/lib/cadreStrategiqueUtils'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/others/long-text'

export function buildCadreStrategiqueColumns({
  cadres,
  niveaux = [],
  currentNiveauId,
  acteurs = [],
  onEdit,
  onDeleteRequest,
}: {
  cadres: CadreStrategique[]
  niveaux?: NiveauCadreStrategique[]
  currentNiveauId: number
  acteurs?: Pick<Acteur, 'id_acteur' | 'nom_acteur' | 'code_acteur'>[]
  onEdit: (row: CadreStrategique) => void
  onDeleteRequest: (row: CadreStrategique) => void
}): ColumnDef<CadreStrategique>[] {
  const actionsColumn = buildEditDeleteActionsColumn({
    onEdit,
    onDeleteRequest,
  })

  /**
   * Niveaux parents uniquement
   * Exemple:
   * niveau 3 => colonnes niveau 2 et niveau 1
   * niveau 1 => aucune colonne
   */
  const parentNiveaux = niveaux
    .filter(
      (n) =>
        n.nombre_nsc <
        (niveaux.find((x) => x.id_nsc === currentNiveauId)?.nombre_nsc ?? 0)
    )
    .sort((a, b) => a.nombre_nsc - b.nombre_nsc)

  /**
   * Récupération de la hiérarchie parent
   */
  const getParentHierarchy = (row: CadreStrategique) => {
    const hierarchy: CadreStrategique[] = []

    let current = row.parent_cs

    while (current) {
      const parent = cadres.find((c) => c.id_cs === current)

      if (!parent) {
        break
      }

      hierarchy.push(parent)

      current = parent.parent_cs
    }

    return hierarchy
  }

  const parentColumns: ColumnDef<CadreStrategique>[] = parentNiveaux.map(
    (parentNiveau) => ({
      id: `parent_${parentNiveau.id_nsc}`,

      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={parentNiveau.libelle_nsc}
        />
      ),

      cell: ({ row }) => {
        const hierarchy = getParentHierarchy(row.original)

        /**
         * Exemple:
         * niveau 3:
         * hierarchy[0] = niveau 2
         * hierarchy[1] = niveau 1
         */
        const parent = hierarchy.find(
          (p) => p.niveau_cs === parentNiveau.id_nsc
        )

        return parent ? (
          <div>
            <LongText className='max-w-xs font-medium'>
              {parent.intutile_cs}
            </LongText>

            <div className='text-xs text-muted-foreground'>
              {parent.code_cs}
            </div>
          </div>
        ) : (
          '-'
        )
      },

      enableSorting: false,
      enableHiding: false,
    })
  )

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

          {row.original.abgrege_cs && (
            <div className='text-xs text-muted-foreground'>
              {row.original.abgrege_cs}
            </div>
          )}
        </div>
      ),
    },

    ...parentColumns,

    {
      id: 'partenaire_cs',
      header: 'Acteur(s)',

      cell: ({ row }) => {
        const ids = resolvePartenaireCsIds(row.original.partenaire_cs)

        return (
          <div>
            {ids.map((id) => {
              const acteur = acteurs.find((a) => a.id_acteur === id)

              return <LongText key={id}>{acteur?.nom_acteur ?? '-'}</LongText>
            })}
          </div>
        )
      },
    },

    actionsColumn,
  ]
}
