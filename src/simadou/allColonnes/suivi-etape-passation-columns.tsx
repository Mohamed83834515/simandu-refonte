import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import type { EtapePassation } from '@/simadou/allTypes/etapePassation'
import type { GroupeEtapePassation } from '@/simadou/allTypes/groupeEtapePassation'
import { Loader2, XCircle, Eye } from 'lucide-react'
import { diffDays } from '@/simadou/lib/suiviEtapesCalcul'
import { GenericRowActions } from '@/Global/Tableaux/GenericRowActions'
import EtapeSourcesCell from '../allfonctionalities/ppm/etapes/EtapeSourcesCell'

type GroupeMap = Map<number, GroupeEtapePassation>

function formatDate(date?: string | null): string {
    if (!date) return '—'

    const value = date.slice(0, 10)
    const [year, month, day] = value.split('-')

    if (!year || !month || !day) {
        return date
    }

    return `${day}/${month}/${year}`
}

// function formatDuration(value: number | null): string {
//     if (value === null) return '—'

//     return `${value} j`
// }

// function getEcartClass(ecart: number | null): string {
//     if (ecart === null) {
//         return 'text-muted-foreground'
//     }

//     if (ecart > 0) {
//         return 'font-semibold text-red-600'
//     }

//     if (ecart < 0) {
//         return 'font-semibold text-green-600'
//     }

//     return 'font-semibold text-green-600'
// }

// function getEcartLabel(ecart: number | null): string {
//     if (ecart === null) return '—'

//     if (ecart > 0) {
//         return `+${ecart} j`
//     }

//     return `${ecart} j`
// }

export const buildSuiviEtapePassationColumns = (
    groupesById: GroupeMap,
    draft: Record<number, string>,
    onDraftChange: (
        idEtape: number,
        value: string
    ) => void,
    onValidate: (row: EtapePassation) => void,
    onCancel: (row: EtapePassation) => void,
    isSaving: (idEtape: number) => boolean,
): ColumnDef<EtapePassation>[] => [
        {
            id: 'etape',
            accessorKey: 'etape',
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title='Étape'
                />
            ),
            cell: ({ row }) => (
                <div className='font-medium'>
                    {row.original.etape}
                </div>
            ),
        },

        {
            id: 'groupe_etape',
            accessorKey: 'groupe_etape',
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Groupe d'étape"
                />
            ),
            cell: ({ row }) => {
                const value = row.original.groupe_etape

                if (
                    typeof value === 'object' &&
                    value !== null
                ) {
                    const objectValue =
                        value as Record<string, unknown>

                    const label =
                        objectValue.intitule_groupe_etape ??
                        objectValue.libelle_groupe_etape ??
                        objectValue.nom_groupe_etape

                    if (
                        typeof label === 'string' &&
                        label.trim()
                    ) {
                        return <div>{label}</div>
                    }
                }

                const id =
                    typeof value === 'object' &&
                        value !== null
                        ? Number(
                            (
                                value as Record<
                                    string,
                                    unknown
                                >
                            ).id_groupe_etape
                        )
                        : Number(value)

                const groupe = groupesById.get(id)

                return (
                    <div>
                        {groupe?.intitule_groupe_etape ??
                            '—'}
                    </div>
                )
            },
        },

        {
            id: 'date_prevu',
            accessorKey: 'date_prevu',
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title='Date prévue'
                />
            ),
            cell: ({ row }) => (
                <div className='whitespace-nowrap'>
                    {formatDate(row.original.date_prevu)}
                </div>
            ),
        },

        // {
        //     id: 'duree_prevue',
        //     header: ({ column }) => (
        //         <DataTableColumnHeader
        //             column={column}
        //             title='Durée prévue'
        //         />
        //     ),
        //     cell: ({ row }) => {
        //         const calcul =
        //             etapesDurations.get(
        //                 row.original.id_etape
        //             )

        //         return (
        //             <div className='text-center tabular-nums'>
        //                 {formatDuration(
        //                     calcul?.dureePrevue ?? null
        //                 )}
        //             </div>
        //         )
        //     },
        //     meta: {
        //         thClassName: 'text-center',
        //         className: 'text-center',
        //     },
        //     enableSorting: false,
        // },

        {
            id: 'date_realise',
            accessorKey: 'date_realise',
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title='Date réalisée'
                />
            ),
            cell: ({ row }) => {
                const id = row.original.id_etape

                const value =
                    draft[id] ??
                    row.original.date_realise ??
                    ''

                return (
                    <div className='min-w-[180px]'>
                        <input
                            type='date'
                            value={value}
                            onChange={(event) =>
                                onDraftChange(
                                    id,
                                    event.target.value
                                )
                            }
                            className='h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'
                        />
                    </div>
                )
            },
        },

        // {
        //     id: 'duree_realisee',
        //     header: ({ column }) => (
        //         <DataTableColumnHeader
        //             column={column}
        //             title='Durée réalisée'
        //         />
        //     ),
        //     cell: ({ row }) => {
        //         const calcul =
        //             etapesDurations.get(
        //                 row.original.id_etape
        //             )

        //         return (
        //             <div className='text-center tabular-nums'>
        //                 {formatDuration(
        //                     calcul?.dureeRealisee ?? null
        //                 )}
        //             </div>
        //         )
        //     },
        //     meta: {
        //         thClassName: 'text-center',
        //         className: 'text-center',
        //     },
        //     enableSorting: false,
        // },

        {
            id: 'ecart',
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title='Écart'
                />
            ),
            cell: ({ row }) => {
                const { date_prevu, date_realise } = row.original

                if (!date_prevu || !date_realise) {
                    return (
                        <div className='text-center text-muted-foreground'>
                            —
                        </div>
                    )
                }

                const ecart = diffDays(
                    date_prevu,
                    date_realise
                )

                if (ecart === null) {
                    return (
                        <div className='text-center text-muted-foreground'>
                            —
                        </div>
                    )
                }

                return (
                    <div
                        className={`text-center font-semibold ${ecart > 0
                            ? 'text-red-600'
                            : 'text-green-600'
                            }`}
                    >
                        {ecart > 0 ? `+${ecart} j` : `${ecart} j`}
                    </div>
                )
            },
            meta: {
                thClassName: 'text-center',
                className: 'text-center',
            },
            enableSorting: false,
        },

        {
            id: 'fichiers',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Fichiers' />
            ),
            cell: ({ row }) => <EtapeSourcesCell idEtape={row.original.id_etape} />,
            enableSorting: false,
        },

        {
            id: 'action',
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title='Action'
                    className='justify-center'
                />
            ),
            cell: ({ row }) => {
                const saving = isSaving(
                    row.original.id_etape
                )

                return (
                    <div className='flex justify-center'>
                        <GenericRowActions
                            row={row}
                            actions={[
                                {
                                    label: 'Suivre',
                                    icon: saving ? (
                                        <Loader2
                                            size={16}
                                            className='animate-spin'
                                        />
                                    ) : (
                                        <Eye size={16} />
                                    ),
                                    onClick: () => {
                                        if (!saving) {
                                            onValidate(row.original)
                                        }
                                    },
                                },

                                {
                                    label: 'Annuler',
                                    icon: (
                                        <XCircle
                                            size={16}
                                        />
                                    ),
                                    onClick: () => {
                                        if (!saving) {
                                            onCancel(row.original)
                                        }
                                    },
                                    className:
                                        'text-red-500!',
                                    separator: true,
                                },
                            ]}
                        />
                    </div>
                )
            },

            meta: {
                thClassName: 'text-center',
                className: 'text-center',
            },
            enableSorting: false,
            enableHiding: false,
        },
    ]