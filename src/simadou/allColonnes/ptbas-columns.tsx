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
        <div
            title={isActive ? month : undefined}
            className={
                isActive
                    ? 'absolute inset-0 bg-green-500 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.22)] dark:bg-green-600 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)]'
                    : 'absolute inset-0'
            }
        />
    )
}

const chronogrammeColumnMeta = {
    width: '1.75rem',
    maxWidth: '1.75rem',
    className:
        'relative !p-0 w-7 min-w-7 max-w-7 text-center align-middle border-r border-border',
    thClassName:
        '!px-0 !py-1.5 w-7 min-w-7 max-w-7 text-center border-r border-border',
    tdClassName:
        'relative !p-0 w-7 min-w-7 max-w-7 text-center align-middle border-r border-border',
} as const

const chronogrammeFirstColumnMeta = {
    ...chronogrammeColumnMeta,
    className: `${chronogrammeColumnMeta.className} border-l-2 border-l-border`,
    thClassName: `${chronogrammeColumnMeta.thClassName} border-l-2 border-l-border`,
    tdClassName: `${chronogrammeColumnMeta.tdClassName} border-l-2 border-l-border`,
} as const

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
    currencyCode: string | undefined,
    getResponsableLabel: (activite: Ptba) => string | null,
) => {
    const baseColumns = buildColumns<Ptba>([
        { type: "text", key: "code_activite_ptba", title: "Code", sticky: true, maxWidth: 'max-w-24' },
        { type: "text", key: "intitule_activite_ptba", title: "Activité", maxWidth: 'max-w-full' },
    ]).map((col) => {
        const key = 'accessorKey' in col ? col.accessorKey : undefined
        if (key === 'code_activite_ptba') {
            return {
                ...col,
                size: 96,
                meta: {
                    ...col.meta,
                    width: '5.5rem',
                    maxWidth: '7rem',
                    className: [col.meta?.className, 'w-24 max-w-28'].filter(Boolean).join(' '),
                    thClassName: 'w-24 max-w-28',
                    tdClassName: 'w-24 max-w-28',
                },
            }
        }
        if (key === 'intitule_activite_ptba') {
            return {
                ...col,
                size: 320,
                meta: {
                    width: '22rem',
                    maxWidth: '28rem',
                    className: 'w-80 max-w-md border-r-2 border-r-border',
                    thClassName: 'w-80 max-w-md border-r-2 border-r-border',
                    tdClassName: 'w-80 max-w-md border-r-2 border-r-border',
                },
            }
        }
        return col
    })

    const responsableColumn: ColumnDef<Ptba> = {
        id: "responsable",
        accessorKey: 'responsable',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Responsable' />
        ),
        cell: ({ row }) => {
            const activite = row.original;
            // const structure = row.original.partenaire_conserne_ptbab;
            const responsable_ptba = getResponsableLabel(activite);
            if (!responsable_ptba) return 'N/A'
            return <Button variant="ghost" className="text-left" size="sm">  {responsable_ptba}</Button>
        },
        enableSorting: false,
        enableHiding: false,
    }
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
    const chronogrammeColumns: ColumnDef<Ptba>[] = getMoisOptions().map((mois, index) => ({
        id: `chronogramme_${mois.value}`,
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title={mois.label}
                className="justify-center text-center text-[11px]"
            />
        ),
        cell: ({ row }) => (
            <ChronogrammeMonthCell
                value={row.original?.chronogramme}
                month={mois.value}
            />
        ),
        meta: { ...(index === 0 ? chronogrammeFirstColumnMeta : chronogrammeColumnMeta) },
        size: 28,
        enableSorting: false,
        enableHiding: false,
    }))

    const coutColumns: ColumnDef<Ptba> = {
        id: 'cout_row',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title={`Budget (${currencyCode})`} />
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
        responsableColumn,
        ...chronogrammeColumns,
        planificationColumn,
        coutColumns,
        actionsColumn,
    ]
}