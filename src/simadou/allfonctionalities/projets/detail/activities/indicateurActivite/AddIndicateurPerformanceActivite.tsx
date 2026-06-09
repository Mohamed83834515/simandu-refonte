import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getIndicateurPerformanceProjetFormConfigForDialog } from '@/simadou/allfieldsConfig/indicateurPerformanceProjetForm'
import {
    indicateurPerformanceFormSchema,
    type IndicateurPerformanceFormData,
} from '@/simadou/schemas/indicateurPerformanceProjetSchemas'
import type { ActiviteProjet, IndicateurPerformanceProjet } from '@/simadou/allTypes'
import { useGetUnitesIndicateur } from '@/simadou/allHooks/admin/uniteIndicateurHooks'
import {
    useCreateIndicateurPerformanceProjet,
    useUpdateIndicateurPerformanceProjet,
} from '@/simadou/allHooks/admin/indicateurPerformanceProjetHooks'
import { useMe } from '@/simadou/allHooks/auth/authHooks'
import CiblesAnnuelles from './CiblesAnnuelles'

type AddIndicateurPerformanceProps = {
    currentRow?: IndicateurPerformanceProjet | null
    activite: ActiviteProjet
    onClose: () => void
    onSuccess: () => void
}

function resolveUniteId(v: unknown): number | null {
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) return v
    if (v && typeof v === 'object' && 'id_unite' in v) {
        const id = Number((v as { id_unite: number }).id_unite)
        return Number.isFinite(id) && id > 0 ? id : null
    }
    return null
}

export default function AddIndicateurPerformance({
    currentRow,
    activite,
    onClose,
    onSuccess,
}: AddIndicateurPerformanceProps) {
    const isEditing = !!currentRow
    const [cibles, setCibles] = useState<any[]>([])

    const { data: unites = [], isLoading: isLoadingUnites } = useGetUnitesIndicateur()
    const { data: user } = useMe()

    const createMutation = useCreateIndicateurPerformanceProjet()
    const updateMutation = useUpdateIndicateurPerformanceProjet()

    const uniteOptions = useMemo(
        () =>
            unites.map((u) => ({
                value: u.id_unite,
                label: `${u.unite_ui} — ${u.definition_ui}`,
            })),
        [unites]
    )

    const defaultValues: IndicateurPerformanceFormData = useMemo(
        () => ({
            code_indicateur_performance: currentRow?.code_indicateur_performance ?? '',
            intitule_indicateur_tache: currentRow?.intitule_indicateur_tache ?? '',
            code_activite_projet: activite.code_activite_projet,
            unite_indicateur_performance: resolveUniteId(currentRow?.unite_indicateur_performance) ?? 1,
        }),
        [currentRow, activite]
    )

    const form = useForm<IndicateurPerformanceFormData>({
        resolver: zodResolver(indicateurPerformanceFormSchema),
        defaultValues,
        mode: 'onChange',
    })

    const onSubmit = async (data: IndicateurPerformanceFormData) => {
        const payload: any = {
            code_activite_projet: activite.code_activite_projet,
            code_indicateur_performance: data.code_indicateur_performance,
            intitule_indicateur_tache: data.intitule_indicateur_tache,
            unite_indicateur_performance: data.unite_indicateur_performance,
        }

        // Ajouter les cibles si elles existent
        if (cibles.length > 0) {
            const hasValues = cibles.some(c => c.valeur_cible && c.valeur_cible > 0)
            if (hasValues) {
                payload.cibles = cibles.map(cible => ({
                    annee: cible.annee,
                    valeur_cible: cible.valeur_cible,
                }))
            }
        }

        if (user?.n_personnel) {
            payload.id_personnel = user.n_personnel
        }

        if (isEditing && currentRow) {
            updateMutation.mutate(
                { id: currentRow.id_indicateur_performance, data: payload },
                { onSuccess: () => { toast.success('Indicateur mis à jour'); onSuccess() }, onError: () => toast.error('Erreur') }
            )
        } else {
            createMutation.mutate(payload,
                { onSuccess: () => { toast.success('Indicateur créé'); onSuccess() }, onError: () => toast.error('Erreur') }
            )
        }
    }

    const config = useMemo(
        () => getIndicateurPerformanceProjetFormConfigForDialog({ isEditing, uniteOptions, isLoadingUnites }),
        [isEditing, uniteOptions, isLoadingUnites]
    )

    return (
        <FormProvider {...form}>
            <DynamicForm
                config={config}
                schema={indicateurPerformanceFormSchema}
                defaultValues={defaultValues}
                onSubmit={onSubmit}
                submitText={isEditing ? 'Mettre à jour' : 'Créer'}
                loadingText='Enregistrement…'
                isLoading={createMutation.isPending || updateMutation.isPending}
                onCancel={onClose}
                cancelText='Retour'
                renderAfter={<CiblesAnnuelles onCiblesChange={setCibles} />}
            />
        </FormProvider>
    )
}