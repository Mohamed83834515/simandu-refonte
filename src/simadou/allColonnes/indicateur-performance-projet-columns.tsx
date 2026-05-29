import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { buildColumns } from '@/Global/Tableaux/column-builder'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type { IndicateurPerformanceProjet } from '@/simadou/allTypes'

export function buildIndicateurPerformanceProjetColumns({
  getUniteLabel,
  getActiviteLabel,
  onEdit,
  onDeleteRequest,
}: {
  getUniteLabel: (row: IndicateurPerformanceProjet) => string
  getActiviteLabel: (row: IndicateurPerformanceProjet) => string
  onEdit: (row: IndicateurPerformanceProjet) => void
  onDeleteRequest: (row: IndicateurPerformanceProjet) => void
}): ColumnDef<IndicateurPerformanceProjet>[] {
  const baseColumns = buildColumns<IndicateurPerformanceProjet>([
    {
      type: 'text',
      key: 'code_indicateur_performance',
      title: 'Code',
      sticky: true,
    },
    {
      type: 'text',
      key: 'intitule_indicateur_tache',
      title: 'Intitulé',
      maxWidth: 'max-w-md',
    },
  ])

  const uniteColumn: ColumnDef<IndicateurPerformanceProjet> = {
    id: 'unite_indicateur_performance',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Unité' />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground'>{getUniteLabel(row.original)}</span>
    ),
    enableSorting: false,
    enableHiding: false,
  }

  const activiteColumn: ColumnDef<IndicateurPerformanceProjet> = {
    id: 'code_activite_projet',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Activité Projet' />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground'>{getActiviteLabel(row.original)}</span>
    ),
    enableSorting: false,
    enableHiding: false,
  }

  const actionsColumn = buildEditDeleteActionsColumn({
    onEdit,
    onDeleteRequest,
  })

  return [...baseColumns, uniteColumn, activiteColumn, actionsColumn]
}
