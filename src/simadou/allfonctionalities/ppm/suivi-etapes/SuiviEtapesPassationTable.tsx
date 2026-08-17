import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { GenericTable } from '@/Global/Generic/Generictable'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import { getApiErrorMessage } from '@/lib/api-error-message'
import type { EtapePassation } from '@/simadou/allTypes/etapePassation'
import { buildSuiviEtapePassationColumns } from '@/simadou/allColonnes/suivi-etape-passation-columns'
import {
    useGetGroupesEtapesPassation,
    useSaveEtapePassation,
} from '@/simadou/allHooks/admin/etapePassationHooks'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'
import {
    calculateEtapesDurations,
    calculateGlobalDurations,
    parseDateOnly,
    getTodayDate,
} from '@/simadou/lib/suiviEtapesCalcul'
import SuiviEtapesSummary from './SuiviEtapesSummary'

type SuiviEtapesPassationTableProps = {
    etapes: EtapePassation[]
    idPpm: number
}

export default function SuiviEtapesPassationTable({
    etapes,
    idPpm,
}: SuiviEtapesPassationTableProps) {
    const { search, navigate } = useEmbeddedTableState()

    const { data: groupes = [] } =
        useGetGroupesEtapesPassation()

    const groupesById = useMemo(
        () =>
            new Map(
                groupes.map((g) => [
                    g.id_groupe_etape,
                    g,
                ])
            ),
        [groupes]
    )

    /**
     * On conserve l'ordre des étapes fourni par l'API.
     *
     * L'ordre des étapes représente l'ordre métier :
     * étape 1 → étape 2 → étape 3 → ...
     */
    const orderedEtapes = useMemo(
        () => [...etapes],
        [etapes]
    )

    /**
     * Calcul des durées entre chaque étape.
     */
    const etapesDurations = useMemo(
        () => calculateEtapesDurations(orderedEtapes),
        [orderedEtapes]
    )

    /**
     * Calcul des durées globales du PPM.
     */
    const globalDurations = useMemo(
        () => calculateGlobalDurations(orderedEtapes),
        [orderedEtapes]
    )

    const [draft, setDraft] =
        useState<Record<number, string>>({})

    const saveMutation = useSaveEtapePassation(idPpm)

    const onDraftChange = useCallback(
        (idEtape: number, value: string) => {
            setDraft((prev) => ({
                ...prev,
                [idEtape]: value,
            }))
        },
        []
    )

    const onValidate = useCallback(
        (row: EtapePassation) => {
            const dateRealise =
                draft[row.id_etape] ??
                row.date_realise ??
                ''

            const currentDate = parseDateOnly(dateRealise)

            /**
             * Une date réalisée ne peut pas être dans le futur.
             */
            if (currentDate) {
                const today = parseDateOnly(getTodayDate())

                if (today && currentDate > today) {
                    toast.error(
                        "La date de réalisation ne peut pas être dans le futur."
                    )
                    return
                }
            }

            const currentIndex =
                orderedEtapes.findIndex(
                    (etape) =>
                        etape.id_etape === row.id_etape
                )

            const previousEtape =
                currentIndex > 0
                    ? orderedEtapes[currentIndex - 1]
                    : null

            const nextEtape =
                currentIndex >= 0 &&
                    currentIndex < orderedEtapes.length - 1
                    ? orderedEtapes[currentIndex + 1]
                    : null

            /**
             * Vérification de la date prévue par rapport
             * à l'étape précédente.
             */
            const currentDatePrevue =
                parseDateOnly(row.date_prevu)

            const previousDatePrevue =
                parseDateOnly(
                    previousEtape?.date_prevu
                )

            if (
                currentDatePrevue &&
                previousDatePrevue &&
                currentDatePrevue < previousDatePrevue
            ) {
                toast.error(
                    `La date prévue de "${row.etape}" doit être postérieure ou égale à celle de l'étape précédente.`
                )
                return
            }

            /**
             * Vérification de la date prévue par rapport
             * à l'étape suivante.
             */
            const nextDatePrevue = parseDateOnly(
                nextEtape?.date_prevu
            )

            if (
                currentDatePrevue &&
                nextDatePrevue &&
                currentDatePrevue > nextDatePrevue
            ) {
                toast.error(
                    `La date prévue de "${row.etape}" doit être antérieure ou égale à celle de l'étape suivante.`
                )
                return
            }

            /**
             * Vérification de la date réalisée par rapport
             * à l'étape réalisée précédente.
             */
            const previousDateRealise =
                parseDateOnly(
                    previousEtape?.date_realise
                )

            if (
                currentDate &&
                previousDateRealise &&
                currentDate < previousDateRealise
            ) {
                toast.error(
                    `La date réalisée de "${row.etape}" doit être postérieure ou égale à celle de l'étape précédente.`
                )
                return
            }

            /**
             * Vérification de la date réalisée par rapport
             * à l'étape suivante déjà réalisée.
             */
            const nextDateRealise = parseDateOnly(
                nextEtape?.date_realise
            )

            if (
                currentDate &&
                nextDateRealise &&
                currentDate > nextDateRealise
            ) {
                toast.error(
                    `La date réalisée de "${row.etape}" doit être antérieure ou égale à celle de l'étape suivante.`
                )
                return
            }

            const groupeId = resolveRelationId(
                row.groupe_etape,
                'id_groupe_etape'
            )

            saveMutation.mutate(
                {
                    id: row.id_etape,
                    data: {
                        etape: row.etape,
                        date_prevu: row.date_prevu || null,
                        date_realise: dateRealise || null,
                        groupe_etape: groupeId,
                        ppm: idPpm,
                    },
                },
                {
                    onSuccess: () =>
                        setDraft((prev) => {
                            const next = { ...prev }

                            delete next[row.id_etape]

                            return next
                        }),

                    onError: (error) =>
                        toast.error(
                            getApiErrorMessage(
                                error,
                                "Erreur lors de la validation de l'étape"
                            )
                        ),
                }
            )
        },
        [
            draft,
            idPpm,
            orderedEtapes,
            saveMutation,
        ]
    )

    const isSaving = useCallback(
        (idEtape: number) =>
            saveMutation.isPending &&
            saveMutation.variables?.id === idEtape,
        [
            saveMutation.isPending,
            saveMutation.variables,
        ]
    )

    const columns = useMemo(
        () =>
            buildSuiviEtapePassationColumns(
                groupesById,
                draft,
                onDraftChange,
                onValidate,
                isSaving
            ),
        [
            groupesById,
            draft,
            onDraftChange,
            onValidate,
            isSaving,
            etapesDurations,
        ]
    )

    return (
        <div className='space-y-4'>
            <GenericTable<EtapePassation>
                data={orderedEtapes}
                columns={columns}
                search={search}
                navigate={navigate}
                searchKey='etape'
                searchPlaceholder='Filtrer les étapes...'
                defaultPageSize={5}
                showViewOptions={false}
                emptyMessage='Aucune étape pour ce PPM'
            />

            <SuiviEtapesSummary
                dureePrevue={
                    globalDurations.dureePrevue
                }
                dureeConsommee={
                    globalDurations.dureeConsommee
                }
                ecart={globalDurations.ecart}
                derniereEtapeRealisee={
                    globalDurations.derniereEtapeRealisee
                }
            />
        </div>
    )
}