import { ColumnDef, type Row } from '@tanstack/react-table'
import { GenericRowActions } from '@/Global/Tableaux/GenericRowActions'
import { buildColumns } from '@/Global/Tableaux/column-builder'
import { UserPen, Trash2, ClipboardList } from 'lucide-react'
import { Ptba } from '../allTypes'
import { getMoisOptions } from '../schemas/ptbaSchemas'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { Button } from '@/components/ui/button'

type PtbasDialogType = 'edit' | 'delete'

type PtbasRowActionsProps = {
    row: Row<Ptba>
    setOpen: (dialog: PtbasDialogType | null) => void
    setCurrentRow: React.Dispatch<React.SetStateAction<Ptba | null>>
}

function PtbasRowActions({
    row,
    setOpen,
    setCurrentRow,
}: PtbasRowActionsProps) {
    return (
        <GenericRowActions
            row={row}
            actions={[
                {
                    label: 'Modifier',
                    icon: <UserPen size={16} />,
                    onClick: (ptba) => {
                        setCurrentRow(ptba)
                        setOpen('edit')
                    },
                },
                {
                    label: 'Supprimer',
                    icon: <Trash2 size={16} />,
                    onClick: (ptba) => {
                        setCurrentRow(ptba)
                        setOpen('delete')
                    },
                    className: 'text-red-500!',
                    separator: true,
                },
            ]}
        />
    )
}

type Props = {
    value: string | string[] | null | undefined
    month: string
}

export function ChronogrammeMonthCell({ value, month }: Props) {
    const months = parseChronogramme(value)
    const isActive = months.includes(month)

    return (
        <div className="flex justify-center">
            {isActive ? (
                <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-sm shadow-green-200" />
            ) : (
                <div className="h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-700" />
            )}
        </div>
    )
}
// Personnaliser le rendu des colonnes mois
export const parseChronogramme = (value: unknown): string[] => {
    if (!value) return []

    if (Array.isArray(value)) {
        return value.map(v => String(v).trim()).filter(Boolean)
    }

    if (typeof value !== 'string') return []

    return value
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0)
}

export const buildPtbasColumns = (
    setOpen: (dialog: PtbasDialogType | null) => void,
    setCurrentRow: React.Dispatch<React.SetStateAction<Ptba | null>>,
    onOpenPlanification: (activite: Ptba) => void,
    currencyCode?:string
) => {
    const baseColumns = buildColumns<Ptba>([
        { type: "text", key: "code_activite_ptba", title: "Code", sticky: true },
        { type: "text", key: "intitule_activite_ptba", title: "Activité" },
    ])

    const actionsColumn: ColumnDef<Ptba> = {
        id: "actions",
        accessorKey: 'id_ptba',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Actions' />
        ),
        cell: (props) => (
            <PtbasRowActions
                {...props}
                setOpen={setOpen}
                setCurrentRow={setCurrentRow}
            />
        ),
        enableSorting: false,
        enableHiding: false,
    }
    const chronogrammeColumns: ColumnDef<Ptba>[] = getMoisOptions().map((mois) => ({
        id: `chronogramme_${mois.value}`,
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title={mois.label}
                className="text-center"
            />
        ),
        cell: ({ row }) => (
            <ChronogrammeMonthCell
                value={row.original?.chronogramme}
                month={mois.value}
            />
        ),
        meta: {
            className: "text-center",
        },
        enableSorting: false,
        enableHiding: false,
    }))

    const coutColumns: ColumnDef<Ptba> = {
        id: 'cout_row',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title={`Budget (${currencyCode})`}  />
        ),
        cell: ({ row }) => {
            const budget = row.original.cout_total_ptba
            if (!budget || budget === 0) {
                return (
                    <div className='flex justify-center'>
                        <span className='text-sm text-muted-foreground'>—</span>
                    </div>
                )
            }

            return (
                <div className='flex justify-center'>
                    <span className='inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold tabular-nums text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'>
                        {new Intl.NumberFormat('fr-FR').format(budget)}
                    </span>
                </div>
            )
        },
        meta: { thClassName: 'text-center', className: 'text-center' },
        enableSorting: true,
        sortDescFirst: true,
        enableHiding: false,
    }

    const planificationColumn: ColumnDef<Ptba> = {
        id: 'planification',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title='Planification'
                className='w-full text-center'
            />
        ),
        cell: ({ row }) => {
            const activite = row.original
            return (
                <div className='flex justify-center'>
                    <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        className='gap-2 border-blue-200 bg-blue-50 text-blue-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50'
                        onClick={() => onOpenPlanification(activite)}
                        aria-label='Ouvrir le suivi des tâches et indicateurs'
                        title='Suivi des tâches et indicateurs'
                    >
                        <ClipboardList className='h-4 w-4' />
                        <span className='text-xs font-medium'>Planifier</span>
                    </Button>
                </div>
            )
        },
        meta: {
            thClassName: 'text-center w-[100px]',
            className: 'text-center align-middle',
        },
        size: 100,
        enableSorting: false,
        enableHiding: false,
    }

    return [
        ...baseColumns,
        ...chronogrammeColumns,
        planificationColumn,
        coutColumns,
        actionsColumn,
    ]
}