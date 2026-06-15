import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { buildColumns } from '@/Global/Tableaux/column-builder'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type { IndicateurStrategique } from '@/simadou/allTypes/indicateurStrategique'

export function buildIndicateurStrategiqueColumns({
  getResponsableLabel,
  getValeurCible,
  onOpenCibles,
  onEdit,
  onDeleteRequest,
}: {
  getResponsableLabel: (row: IndicateurStrategique) => string
  getValeurCible: (row: IndicateurStrategique) => number
  onOpenCibles: (row: IndicateurStrategique) => void
  onEdit: (row: IndicateurStrategique) => void
  onDeleteRequest: (row: IndicateurStrategique) => void
}): ColumnDef<IndicateurStrategique>[] {
  const baseColumns = buildColumns<IndicateurStrategique>([
    {
      type: 'text',
      key: 'code_indicateur_istr',
      title: 'Code',
      sticky: true,
    },
    {
      type: 'text',
      key: 'intitule_indicateur_istr',
      title: 'Intitulé',
      maxWidth: 'max-w-md',
    },
  ])

  const cibleColumn: ColumnDef<IndicateurStrategique> = {
    id: 'valeur_cible',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Valeur cible' />
    ),
    cell: ({ row }) => (
      <Badge
        variant='secondary'
        className='cursor-pointer tabular-nums'
        onClick={() => onOpenCibles(row.original)}
      >
        {getValeurCible(row.original)}
      </Badge>
    ),
    enableSorting: false,
    enableHiding: false,
  }

  const responsableColumn: ColumnDef<IndicateurStrategique> = {
    id: 'responsable_istr',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Responsable' />
    ),
    cell: ({ row }) => (
      <span className='text-sm text-muted-foreground'>
        {getResponsableLabel(row.original)}
      </span>
    ),
    enableSorting: false,
    enableHiding: false,
  }

  const actionsColumn = buildEditDeleteActionsColumn({
    onEdit,
    onDeleteRequest,
  })

  return [...baseColumns, cibleColumn, responsableColumn, actionsColumn]
}
