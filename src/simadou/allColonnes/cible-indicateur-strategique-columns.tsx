import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type { CibleIndicateurStrategique } from '@/simadou/allTypes/cibleIndicateurStrategique'
import type { UGL } from '@/simadou/allTypes'
import {
  formatAnneeCible,
  formatValeurCible,
} from '@/simadou/schemas/cibleCmrProjetSchema'
import { resolveRelationCode } from '@/simadou/lib/resolveApiRelation'

function resolveUglLabel(
  row: CibleIndicateurStrategique,
  ugls: UGL[]
): string {
  const code =
    resolveRelationCode(row.code_ug, 'code_ugl') ??
    (typeof row.code_ug === 'string' ? row.code_ug : null)

  const nestedNom = resolveRelationCode(row.code_ug, 'nom_ugl')
  const nestedCode = resolveRelationCode(row.code_ug, 'code_ugl')

  if (nestedNom) {
    return nestedCode ? `${nestedCode} — ${nestedNom}` : nestedNom
  }

  const fromList = code ? ugls.find((u) => u.code_ugl === code) : undefined
  if (fromList) {
    return fromList.code_ugl
      ? `${fromList.code_ugl} — ${fromList.nom_ugl}`
      : fromList.nom_ugl
  }

  return code ?? 'Non défini'
}

export function buildCibleIndicateurStrategiqueColumns({
  onEdit,
  onDeleteRequest,
  ugls = [],
}: {
  onEdit: (row: CibleIndicateurStrategique) => void
  onDeleteRequest: (row: CibleIndicateurStrategique) => void
  ugls?: UGL[]
}): ColumnDef<CibleIndicateurStrategique>[] {
  const actionsColumn = buildEditDeleteActionsColumn({
    onEdit,
    onDeleteRequest,
  })

  return [
    {
      id: 'code_ug',
      accessorFn: (row) => resolveUglLabel(row, ugls),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='UGL' />
      ),
      cell: ({ row }) => (
        <span
          className='max-w-xs truncate text-sm'
          title={String(row.getValue('code_ug') ?? '')}
        >
          {String(row.getValue('code_ug') ?? '—')}
        </span>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'annee',
      accessorKey: 'annee',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Année' />
      ),
      cell: ({ row }) => (
        <span className='font-medium tabular-nums'>
          {formatAnneeCible(row.original.annee)}
        </span>
      ),
      enableHiding: false,
    },
    {
      id: 'valeur_cible_indcateur_istr',
      accessorKey: 'valeur_cible_indcateur_istr',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Valeur cible' />
      ),
      cell: ({ row }) => (
        <span className='font-semibold tabular-nums'>
          {formatValeurCible(
            Number(row.original.valeur_cible_indcateur_istr ?? 0)
          )}
        </span>
      ),
      enableHiding: false,
    },
    actionsColumn,
  ]
}
