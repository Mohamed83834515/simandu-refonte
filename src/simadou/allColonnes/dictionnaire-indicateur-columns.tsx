import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type { DictionnaireIndicateur } from '@/simadou/allTypes'

function safeText(v: unknown): string {
  return typeof v === 'string' && v.trim() ? v : '—'
}

export function buildDictionnaireIndicateurColumns({
  onView,
  onEdit,
  onDeleteRequest,
}: {
  onView?: (row: DictionnaireIndicateur) => void
  onEdit: (row: DictionnaireIndicateur) => void
  onDeleteRequest: (row: DictionnaireIndicateur) => void
}): ColumnDef<DictionnaireIndicateur>[] {
  const actionsColumn = buildEditDeleteActionsColumn({
    onView,
    onEdit,
    onDeleteRequest,
  })

  return [
    {
      accessorKey: 'code_ref_ind',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Code' />
      ),
      cell: ({ row }) => (
        <span className='whitespace-nowrap font-mono text-sm'>
          {safeText(row.original.code_ref_ind)}
        </span>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'intitule_ref_ind',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Intitulé' />
      ),
      cell: ({ row }) => (
        <span className='block max-w-[28rem] truncate font-medium'>
          {safeText(row.original.intitule_ref_ind)}
        </span>
      ),
      enableHiding: false,
    },
    {
      id: 'echelle',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Échelle' />
      ),
      cell: ({ row }) => (
        <span className='text-sm'>
          {row.original.echelle?.nom_type_zone ?? 'Non défini'}
        </span>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'typologie',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Typologie' />
      ),
      cell: ({ row }) => (
        <span className='text-sm'>
          {row.original.typologie?.trim() || 'Non défini'}
        </span>
      ),
      enableHiding: false,
    },
    {
      id: 'unite',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Unité' />
      ),
      cell: ({ row }) => (
        <span className='text-sm'>
          {row.original.unite_cmr
            ? `${row.original.unite_cmr.unite_ui} — ${row.original.unite_cmr.definition_ui}`
            : 'Non défini'}
        </span>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'fonction_agregat_cmr',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Agrégation' />
      ),
      cell: ({ row }) => (
        <span className='text-sm'>
          {row.original.fonction_agregat_cmr || 'Non défini'}
        </span>
      ),
      enableHiding: false,
    },
    {
      id: 'seuils',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Seuils' />
      ),
      cell: ({ row }) => {
        const min = row.original.seuil_minimum
        const max = row.original.seuil_maximum
        if (min != null && max != null) {
          return (
            <span className='text-sm tabular-nums'>
              {min} — {max}
            </span>
          )
        }
        if (min != null) return <span className='text-sm'>Min: {min}</span>
        if (max != null) return <span className='text-sm'>Max: {max}</span>
        return <span className='text-sm'>Non défini</span>
      },
      enableSorting: false,
      enableHiding: false,
    },
    actionsColumn,
  ]
}
