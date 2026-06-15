import { Row, type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { cn } from '@/lib/utils'
import type { TacheActivitePtba } from '@/simadou/allTypes'
import { GenericRowActions } from '@/Global/Tableaux/GenericRowActions'
import { Trash2, UserPen } from 'lucide-react'

export type TachePtbaTableRow = TacheActivitePtba

const colWide = 'max-w-[220px] whitespace-normal'

function formatDateRealisation(value: string | undefined | null): string {
    if (!value?.trim()) return '—'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

type TacheActiviteDialogType = 'delete'

export function buildTachePtbaColumns(
    setOpen: (dialog: TacheActiviteDialogType | null) => void,
    setCurrentRow: React.Dispatch<React.SetStateAction<TacheActivitePtba | null>>,
    onEdit: (tache: TacheActivitePtba) => void,
    getResponsableLabel?: (tache: TacheActivitePtba) => string
): ColumnDef<TacheActivitePtba>[] {
    const tacheColumn: ColumnDef<TachePtbaTableRow> = {
        id: 'intutile_tache_gt',
        accessorKey: 'intutile_tache_gt',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Tâches' />
        ),
        cell: ({ row }) => {
            const tache = row.original
            return (
                <div className={cn('flex items-start gap-2.5', colWide)}>
                    <span className='mt-0.5 shrink-0 text-sm font-semibold text-muted-foreground'>
                        {row.index + 1}.
                    </span>
                    <div className='min-w-0 space-y-0.5'>
                        <p className='font-medium leading-snug'>{tache.intutile_tache_gt}</p>
                        {tache.code_tache_gt && (
                            <p className='text-xs text-muted-foreground'>
                                {tache.code_tache_gt}
                            </p>
                        )}
                    </div>
                </div>
            )
        },
        meta: { thClassName: 'ps-4', className: 'ps-4' },
        enableSorting: false,
        enableHiding: false,
    }

    const lotColumn: ColumnDef<TachePtbaTableRow> = {
        id: 'lot',
        accessorKey: 'n_lot_gt',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Lot' />
        ),
        cell: ({ row }) => (
            <span className='tabular-nums'>{row.original.n_lot_gt}</span>
        ),
        meta: { thClassName: 'text-center', className: 'text-center' },
        enableSorting: false,
        enableHiding: false,
    }

    const proportionColumn: ColumnDef<TachePtbaTableRow> = {
        id: 'proportion',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='P%' />
        ),
        cell: ({ row }) => {
            const raw = row.original.proportion_gt?.trim()
            if (!raw) {
                return <span className='text-muted-foreground'>—</span>
            }
            const label = raw.endsWith('%') ? raw : `${raw}%`
            return <span className='font-semibold tabular-nums'>{label}</span>
        },
        meta: { thClassName: 'text-center', className: 'text-center' },
        enableSorting: false,
        enableHiding: false,
    }

    const dateDebutColumn: ColumnDef<TachePtbaTableRow> = {
        id: 'date_debut_gt',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Date de début' />
        ),
        cell: ({ row }) => {
            const tache = row.original
            return (
                <span className='whitespace-nowrap text-muted-foreground'>
                    {formatDateRealisation(tache.date_debut_gt)}
                </span>
            )
        },
        meta: {
            thClassName: 'min-w-[120px] text-center',
            className: 'min-w-[120px] text-center',
        },
        enableSorting: false,
        enableHiding: false,
    }
    const dateFinColumn: ColumnDef<TachePtbaTableRow> = {
        id: 'date_fin_gt',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Date de fin' />
        ),
        cell: ({ row }) => {
            const tache = row.original
            return (
                <span className='whitespace-nowrap text-muted-foreground'>
                    {formatDateRealisation(tache.date_fin_gt)}
                </span>
            )
        },
        meta: {
            thClassName: 'min-w-[120px] text-center',
            className: 'min-w-[120px] text-center',
        },
        enableSorting: false,
        enableHiding: false,
    }

    const responsableColumn: ColumnDef<TachePtbaTableRow> = {
        id: 'responsable_gt',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Responsable' />
        ),
        cell: ({ row }) => {
            const tache = row.original
            const label = getResponsableLabel?.(tache)?.trim()
            return (
                <span className='whitespace-nowrap text-muted-foreground'>
                    {label || 'Non défini'}
                </span>
            )
        },
        meta: { thClassName: 'text-center', className: 'text-center' },
        enableSorting: false,
        enableHiding: false,
    }

    const ActionColumn: ColumnDef<TachePtbaTableRow> = {
        id: 'actions',
        accessorKey: 'id_groupe_tache',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Actions' />
        ),
        cell: (props) => (
            <TacheActivteRowActions
                {...props}
                onEdit={onEdit}
                setOpen={setOpen}
                setCurrentRow={setCurrentRow || null}
            />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { thClassName: 'text-center', className: 'text-center' },
    }

    return [
        tacheColumn,
        lotColumn,
        proportionColumn,
        dateDebutColumn,
        dateFinColumn,
        responsableColumn,
        ActionColumn,
    ]
}

type TacheActivteDialogType =  'delete'
type TacheActivteRowActionsProps = {
    row: Row<TacheActivitePtba>
    setOpen: (dialog: TacheActivteDialogType | null) => void
    onEdit: (row_tache: TacheActivitePtba) => void
    setCurrentRow: React.Dispatch<React.SetStateAction<TacheActivitePtba | null>>
}
function TacheActivteRowActions({
    row,
    onEdit,
    setOpen,
    setCurrentRow,
}: TacheActivteRowActionsProps) {
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
                    onClick: (tache: TacheActivitePtba) => {
                        setCurrentRow(tache)
                        setOpen('delete')
                    },
                    className: 'text-red-500!',
                    separator: true,
                },
            ]}
        />
    )
}
