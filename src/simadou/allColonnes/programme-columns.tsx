import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/others/long-text'
import { Badge } from '@/components/ui/badge'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type { Programme } from '@/simadou/allTypes/programme'

function formatPeriode(debut: string, fin: string): string {
  const yearDebut = debut?.slice(0, 4) ?? '—'
  const yearFin = fin?.slice(0, 4) ?? '—'
  return `${yearDebut} – ${yearFin}`
}

export function buildProgrammeColumns({
  onEdit,
  onDeleteRequest,
}: {
  onEdit: (row: Programme) => void
  onDeleteRequest: (row: Programme) => void
}): ColumnDef<Programme>[] {
  const actionsColumn = buildEditDeleteActionsColumn({
    onEdit,
    onDeleteRequest,
  })

  return [
    {
      id: 'code_programme',
      accessorKey: 'code_programme',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Code' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-sm'>{row.original.code_programme}</span>
      ),
      enableHiding: false,
    },
    {
      id: 'sigle_programme',
      accessorKey: 'sigle_programme',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Sigle' />
      ),
      cell: ({ row }) => <span className='text-sm'>{row.original.sigle_programme}</span>,
      enableHiding: false,
    },
    {
      id: 'nom_programme',
      accessorKey: 'nom_programme',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Libellé' />
      ),
      cell: ({ row }) => (
        <LongText className='max-w-md font-medium'>
          {row.original.nom_programme}
        </LongText>
      ),
      enableHiding: false,
    },
    {
      id: 'periode',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Période' />
      ),
      cell: ({ row }) => (
        <span className='whitespace-nowrap text-sm tabular-nums'>
          {formatPeriode(
            row.original.annee_debut_programme,
            row.original.annee_fin_programme
          )}
        </span>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'actif_programme',
      accessorKey: 'actif_programme',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Statut' />
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.actif_programme ? 'default' : 'secondary'}>
          {row.original.actif_programme ? 'Actif' : 'Inactif'}
        </Badge>
      ),
      enableHiding: false,
    },
    actionsColumn,
  ]
}
