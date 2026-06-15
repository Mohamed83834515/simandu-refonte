// simadou/allColonnes/localite-columns.tsx
import { buildColumns } from '@/Global/Tableaux/column-builder'
import { DataTableColumnHeader } from '@/components/data-table'
import { GenericRowActions } from '@/Global/Tableaux/GenericRowActions'
import type { Localite } from '@/simadou/allTypes/localite'
import type { NiveauLocalite } from '@/simadou/allTypes/niveauLocalite'
import { UserPen, Trash2 } from 'lucide-react'

function getNiveauIdFromLocalite(loc: Localite): number | null {
  if (!loc.niveau_loca) return null
  if (typeof loc.niveau_loca === 'object') return loc.niveau_loca.id_nlc ?? null
  return loc.niveau_loca
}

function resolveParentLocaliteId(
  parent: Localite['parent_loca'] | Record<string, unknown> | null | undefined
): number | null {
  if (parent == null) return null
  if (typeof parent === 'number') return parent
  if (typeof parent === 'object' && 'id_loca' in parent) {
    const id = (parent as { id_loca?: number }).id_loca
    return id != null ? id : null
  }
  return null
}

export function getNextNiveauLocalite(
  niveaux: NiveauLocalite[],
  currentNiveauNombre: number
): NiveauLocalite | null {
  const sorted = [...niveaux].sort((a, b) => a.nombre_nlc - b.nombre_nlc)
  const index = sorted.findIndex((n) => n.nombre_nlc === currentNiveauNombre)
  if (index < 0 || index >= sorted.length - 1) return null
  return sorted[index + 1] ?? null
}

export function buildChildCountByParentId(
  allLocalites: Localite[],
  nextNiveauId: number
): Map<number, number> {
  const counts = new Map<number, number>()
  for (const loc of allLocalites) {
    if (getNiveauIdFromLocalite(loc) !== nextNiveauId) continue
    const parentId = resolveParentLocaliteId(loc.parent_loca)
    if (parentId == null) continue
    counts.set(parentId, (counts.get(parentId) ?? 0) + 1)
  }
  return counts
}

export const buildLocaliteColumns = (
  niveaux: NiveauLocalite[],
  currentNiveauNombre: number,
  allLocalites: Localite[],
  onEdit: (row: Localite) => void,
  onDeleteRequest: (row: Localite) => void
) => {
  const parentNiveaux = niveaux
    .filter((n: any) => n.nombre_nlc < currentNiveauNombre)
    .sort((a: any, b: any) => b.nombre_nlc - a.nombre_nlc)

  const getParentHierarchy = (row: any) => {
    const hierarchy: any[] = []
    let currentParent = row.parent_loca
    while (currentParent && typeof currentParent === 'object') {
      hierarchy.push(currentParent)
      currentParent = currentParent.parent_loca
    }
    return hierarchy
  }

  const baseColumns = buildColumns([
    {
      type: "text",
      key: "code_national_loca",
      title: "Code",
    },
    {
      type: "text",
      key: "intitule_loca",
      title: "Libellé",
    },
  ])

  const parentColumns = parentNiveaux.map((parent: any) => ({
    id: `parent_${parent.id_nlc}`,
    header: parent.libelle_nlc,
    cell: ({ row }: any) => {
      const hierarchy = getParentHierarchy(row.original)
      const parentIndex = parentNiveaux.findIndex((p: any) => p.id_nlc === parent.id_nlc)
      return hierarchy[parentIndex]?.intitule_loca || '-'
    },
  }))

  const nextNiveau = getNextNiveauLocalite(niveaux, currentNiveauNombre)
  const childCountByParentId =
    nextNiveau?.id_nlc != null
      ? buildChildCountByParentId(allLocalites, nextNiveau.id_nlc)
      : null

  const childCountColumn =
    nextNiveau && childCountByParentId
      ? [
          {
            id: `children_${nextNiveau.id_nlc}`,
            accessorFn: (row: Localite) =>
              childCountByParentId.get(row.id_loca) ?? 0,
            header: ({ column }: any) => (
              <DataTableColumnHeader
                column={column}
                title={nextNiveau.libelle_nlc}
                className='w-full justify-center'
              />
            ),
            cell: ({ row }: { row: { original: Localite } }) => (
              <div className='flex w-full justify-center'>
                <span className='tabular-nums text-sm'>
                  {childCountByParentId.get(row.original.id_loca) ?? 0}
                </span>
              </div>
            ),
            meta: {
              thClassName: '!text-center max-w-[11rem]',
              tdClassName: 'text-center max-w-[11rem]',
            },
            enableSorting: true,
          },
        ]
      : []

  const actionColumn = {
    id: "actions",
    header: "Actions",
    cell: ({ row }: any) => (
      <GenericRowActions
        row={row}
        actions={[
          {
            label: "Modifier",
            icon: <UserPen size={16} />,
            onClick: () => onEdit(row.original),
          },
          {
            label: "Supprimer",
            icon: <Trash2 size={16} />,
            className: "text-red-500!",
            separator: true,
            onClick: () => onDeleteRequest(row.original),
          },
        ]}
      />
    ),
  }

  return [...baseColumns, ...parentColumns, ...childCountColumn, actionColumn]
}