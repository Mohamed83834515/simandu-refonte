import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getIndicateurPerformanceProjetFormConfigForDialog } from '@/simadou/allfieldsConfig/indicateurPerformanceProjetForm'
import {
  indicateurPerformanceFormSchema,
  type IndicateurPerformanceFormData,
} from '@/simadou/schemas/indicateurPerformanceProjetSchemas'
import type { ActiviteProjet, IndicateurPerformanceProjet } from '@/simadou/allTypes'
import { normalizeIndicateurPerformanceCibles } from '@/simadou/lib/indicateurPerformanceUtils'
import { useGetUnitesIndicateur } from '@/simadou/allHooks/admin/uniteIndicateurHooks'
import {
  useCreateIndicateurPerformanceProjet,
  useUpdateIndicateurPerformanceProjet,
} from '@/simadou/allHooks/admin/indicateurPerformanceProjetHooks'
import { useMe } from '@/simadou/allHooks/auth/authHooks'
import CiblesAnnuelles, { type CibleAnnuelleFormValue } from './CiblesAnnuelles'

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
  const [cibles, setCibles] = useState<CibleAnnuelleFormValue[]>([])

  const { data: unites = [], isLoading: isLoadingUnites } = useGetUnitesIndicateur()
  const { data: user } = useMe()

  const createMutation = useCreateIndicateurPerformanceProjet()
  const updateMutation = useUpdateIndicateurPerformanceProjet()

  const uniteOptions = useMemo(
    () =>
      unites.map((u) => ({
        value: u.id_unite,
        label: `${u.unite_ui} - ${u.definition_ui}`,
      })),
    [unites]
  )

  const defaultValues: IndicateurPerformanceFormData = useMemo(
    () => ({
      code_indicateur_performance: currentRow?.code_indicateur_performance ?? '',
      intitule_indicateur_tache: currentRow?.intitule_indicateur_tache ?? '',
      type_ind: currentRow?.type_ind === 0 ? 0 : 1,
      activite_projet: activite.id_activite_projet,
      unite_indicateur_performance:
        resolveUniteId(currentRow?.unite_indicateur_performance) ?? 1,
    }),
    [currentRow, activite]
  )

  const onSubmit = async (data: IndicateurPerformanceFormData) => {
    const payload: Record<string, unknown> = {
      activite_projet: activite.id_activite_projet,
      type_ind: data.type_ind,
      code_indicateur_performance: data.code_indicateur_performance,
      intitule_indicateur_tache: data.intitule_indicateur_tache,
      unite_indicateur_performance: data.unite_indicateur_performance,
    }

    if (cibles.length > 0) {
      const hasValues = cibles.some(
        (c) =>
          (c.valeur_cible && c.valeur_cible > 0) ||
          (c.budget_an && c.budget_an > 0)
      )
      if (hasValues) {
        payload.cibles = cibles.map((cible) => ({
          annee: cible.annee,
          valeur_cible_indcateur_performance: cible.valeur_cible,
          budget_an: cible.budget_an,
        }))
      }
    }

    if (user?.n_personnel) {
      payload.id_personnel = user.n_personnel
    }

    if (isEditing && currentRow) {
      updateMutation.mutate(
        { id: currentRow.id_indicateur_performance, data: payload as IndicateurPerformanceFormData },
        {
          onSuccess: () => {
            toast.success('Indicateur mis à jour')
            onSuccess()
          },
          onError: () => toast.error('Erreur'),
        }
      )
    } else {
      createMutation.mutate(payload as IndicateurPerformanceFormData, {
        onSuccess: () => {
          toast.success('Indicateur créé')
          onSuccess()
        },
        onError: () => toast.error('Erreur'),
      })
    }
  }

  const config = useMemo(
    () =>
      getIndicateurPerformanceProjetFormConfigForDialog({
        isEditing,
        uniteOptions,
        isLoadingUnites,
      }),
    [isEditing, uniteOptions, isLoadingUnites]
  )

  const existingCibles = useMemo(
    () => normalizeIndicateurPerformanceCibles(currentRow?.cibles),
    [currentRow]
  )

  return (
    <DynamicForm
      key={currentRow?.id_indicateur_performance ?? 'new'}
      embedded
      config={config}
      schema={indicateurPerformanceFormSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitText={isEditing ? 'Mettre à jour' : 'Enregistrer'}
      loadingText='Enregistrement…'
      isLoading={createMutation.isPending || updateMutation.isPending}
      onCancel={onClose}
      cancelText='Retour'
      renderAfter={
        <CiblesAnnuelles
          onCiblesChange={setCibles}
          initialCibles={existingCibles}
        />
      }
    />
  )
}
