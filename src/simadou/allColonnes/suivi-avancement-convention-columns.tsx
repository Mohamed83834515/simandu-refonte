import { type ColumnDef, type Row } from '@tanstack/react-table'
import { Pencil, Trash2 } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/data-table'
import { buildColumns } from '@/Global/Tableaux/column-builder'
import { GenericRowActions } from '@/Global/Tableaux/GenericRowActions'
import type { SuiviAvancementConvention } from '@/simadou/allTypes/suiviAvancementConvention'

type AvancementDialogType = 'delete'

type AvancementRowActionsProps = {
  row: Row<SuiviAvancementConvention>
  onEdit: (row: SuiviAvancementConvention) => void
  setOpen: (dialog: AvancementDialogType | null) => void
  setCurrentRow: React.Dispatch<
    React.SetStateAction<SuiviAvancementConvention | null>
  >
}

function formatDate(value: string | null | undefined): string {
  if (value == null || value === '') return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function truncate(value: string | null | undefined, max = 120): string {
  const t = value?.trim()
  if (!t) return '—'
  return t.length > max ? `${t.slice(0, max)}…` : t
}

function AvancementRowActions({
  row,
  onEdit,
  setOpen,
  setCurrentRow,
}: AvancementRowActionsProps) {
  return (
    <GenericRowActions
      row={row}
      actions={[
        {
          label: 'Modifier',
          icon: <Pencil size={16} />,
          onClick: onEdit,
        },
        {
          label: 'Supprimer',
          icon: <Trash2 size={16} />,
          onClick: (suivi) => {
            setCurrentRow(suivi)
            setOpen('delete')
          },
          className: 'text-red-500!',
          separator: true,
        },
      ]}
    />
  )
}

export function buildSuiviAvancementConventionColumns(
  onEdit: (row: SuiviAvancementConvention) => void,
  setOpen: (dialog: AvancementDialogType | null) => void,
  setCurrentRow: React.Dispatch<
    React.SetStateAction<SuiviAvancementConvention | null>
  >
): ColumnDef<SuiviAvancementConvention>[] {
  const dateColumn: ColumnDef<SuiviAvancementConvention> = {
    id: 'date_suivi',
    accessorKey: 'date_suivi',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date' />
    ),
    cell: ({ row }) => (
      <span className='whitespace-nowrap'>
        {formatDate(row.original.date_suivi)}
      </span>
    ),
    enableSorting: true,
    enableHiding: false,
  }

  const baseColumns = buildColumns<SuiviAvancementConvention>([
    {
      type: 'plain',
      key: 'statut_activite',
      title: 'Statut',
      sortable: false,
    },
    {
      type: 'plain',
      key: 'etat_avancement',
      title: 'État avancement',
      sortable: false,
    },
  ])

  const observationColumn: ColumnDef<SuiviAvancementConvention> = {
    id: 'observation',
    accessorKey: 'observation',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Observation' />
    ),
    cell: ({ row }) => (
      <span className='max-w-[180px]'>
        {truncate(row.original.observation, 160)}
      </span>
    ),
    enableSorting: false,
    enableHiding: false,
  }

  const actionsColumn = buildColumns<SuiviAvancementConvention>([
    {
      type: 'actions',
      cell: (props) => (
        <AvancementRowActions
          {...props}
          onEdit={onEdit}
          setOpen={setOpen}
          setCurrentRow={setCurrentRow}
        />
      ),
    },
  ])[0]

  const statutColumn: ColumnDef<SuiviAvancementConvention> = {
    ...baseColumns[0],
    cell: ({ row }) => truncate(row.original.statut_activite, 80),
  }
  const etatAvancementColumn: ColumnDef<SuiviAvancementConvention> = {
    ...baseColumns[1],
    cell: ({ row }) => truncate(row.original.etat_avancement),
  }

  return [
    dateColumn,
    statutColumn,
    etatAvancementColumn,
    observationColumn,
    actionsColumn,
  ]
}
