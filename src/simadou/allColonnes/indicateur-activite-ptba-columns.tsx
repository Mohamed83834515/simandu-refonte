import { type ColumnDef, type Row } from '@tanstack/react-table'
import { Trash2, UserPen } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/data-table'
import { cn } from '@/lib/utils'
import { GenericRowActions } from '@/Global/Tableaux/GenericRowActions'
import type { IndicateurActivitePtba } from '@/simadou/allTypes'

export type IndicateurActivitePtbaTableRow = IndicateurActivitePtba

const colWide = 'max-w-[240px] whitespace-normal'

type DialogType = 'delete'

type RowActionsProps = {
  row: Row<IndicateurActivitePtba>
  setOpen: (dialog: DialogType | null) => void
  onEdit: (row: IndicateurActivitePtba) => void
  setCurrentRow: React.Dispatch<
    React.SetStateAction<IndicateurActivitePtba | null>
  >
}

function IndicateurActivitePtbaRowActions({
  row,
  onEdit,
  setOpen,
  setCurrentRow,
}: RowActionsProps) {
  return (
    <GenericRowActions
      row={row}
      actions={[
        {
          label: 'Modifier',
          icon: <UserPen size={16} />,
          onClick: onEdit,
        },
        {
          label: 'Supprimer',
          icon: <Trash2 size={16} />,
          onClick: (indicateur: IndicateurActivitePtba) => {
            setCurrentRow(indicateur)
            setOpen('delete')
          },
          className: 'text-red-500!',
          separator: true,
        },
      ]}
    />
  )
}

export function buildIndicateurActivitePtbaColumns(
  setOpen: (dialog: DialogType | null) => void,
  setCurrentRow: React.Dispatch<
    React.SetStateAction<IndicateurActivitePtba | null>
  >,
  onEdit: (row: IndicateurActivitePtba) => void
): ColumnDef<IndicateurActivitePtba>[] {
  return [
    {
      id: 'code_indicateur_activite',
      accessorKey: 'code_indicateur_activite',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Code' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-sm'>
          {row.original.code_indicateur_activite}
        </span>
      ),
      meta: { thClassName: 'ps-4', className: 'ps-4' },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'intitule_indicateur_tache',
      accessorKey: 'intitule_indicateur_tache',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Intitulé indicateur' />
      ),
      cell: ({ row }) => {
        const indicateur = row.original
        return (
          <div className={cn('flex items-start gap-2.5', colWide)}>
            <span className='mt-0.5 shrink-0 text-sm font-semibold text-muted-foreground'>
              {row.index + 1}.
            </span>
            <p className='min-w-0 font-medium leading-snug'>
              {indicateur.intitule_indicateur_tache}
            </p>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'abrege_unite',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Unité' />
      ),
      cell: ({ row }) => {
        const unite = row.original.abrege_unite
        const label =
          typeof unite === 'object' && unite
            ? unite.unite_ui
            : typeof unite === 'number'
              ? String(unite)
              : '—'
        return <span className='text-muted-foreground'>{label}</span>
      },
      meta: { thClassName: 'text-center', className: 'text-center' },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Actions' />
      ),
      cell: (props) => (
        <IndicateurActivitePtbaRowActions
          {...props}
          onEdit={onEdit}
          setOpen={setOpen}
          setCurrentRow={setCurrentRow}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { thClassName: 'text-center pe-4', className: 'text-center pe-4' },
    },
  ]
}
