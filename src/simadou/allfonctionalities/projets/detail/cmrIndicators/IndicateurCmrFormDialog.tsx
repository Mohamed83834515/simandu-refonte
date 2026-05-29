import { useMemo } from 'react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getIndicateurCmrFormConfigForDialog } from '@/simadou/allfieldsConfig/indicateurCmrForm'
import type { IndicateurCmr } from '@/simadou/allTypes'
import {
  indicateurCmrCreateSchema,
  type IndicateurCmrCreateData,
} from '@/simadou/schemas/indicateursSchemas'
import {
  useCreateIndicateurCmr,
  useUpdateIndicateurCmr,
} from '@/simadou/allHooks/admin/indicateurCmrHooks'
import { useGetUnitesIndicateur } from '@/simadou/allHooks/admin/uniteIndicateurHooks'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'

export default function IndicateurCmrFormDialog({
  indicateur,
  onClose,
  onSuccess,
}: {
  indicateur?: IndicateurCmr | null
  onClose: () => void
  onSuccess: () => void
}) {
  const isEditing = !!indicateur
  const createMutation = useCreateIndicateurCmr()
  const updateMutation = useUpdateIndicateurCmr()
  const { data: unites = [], isLoading: isLoadingUnites } = useGetUnitesIndicateur()

  const uniteOptions = useMemo(
    () =>
      unites.map((u) => ({
        value: u.id_unite,
        label: `${u.unite_ui} — ${u.definition_ui}`,
      })),
    [unites]
  )

  const config = useMemo(
    () =>
      getIndicateurCmrFormConfigForDialog({
        uniteOptions,
        isLoadingUnites,
      }),
    [uniteOptions, isLoadingUnites]
  )

  const defaultValues = useMemo(
    (): IndicateurCmrCreateData => ({
      code_ref_ind: indicateur?.code_ref_ind ?? '',
      resultat_cmr: indicateur?.resultat_cmr ?? '',
      intitule_ref_ind: indicateur?.intitule_ref_ind ?? '',
      reference_cmr: indicateur?.reference_cmr ?? '',
      annee_reference: indicateur?.annee_reference ?? new Date().getFullYear(),
      responsable_collecte_cmr: indicateur?.responsable_collecte_cmr ?? '',
      cible_cmr: indicateur?.cible_cmr ?? '',
      fonction_agregat_cmr: indicateur?.fonction_agregat_cmr ?? '',
      unite_cmr: resolveRelationId(indicateur?.unite_cmr, 'id_unite'),
    }),
    [indicateur]
  )

  const onSubmit = (data: IndicateurCmrCreateData) => {
    const payload = {
      ...data,
      unite_cmr: data.unite_cmr || null,
    }

    const callbacks = {
      onSuccess: () => {
        toast.success(isEditing ? 'Indicateur CMR mis à jour' : 'Indicateur CMR créé')
        onSuccess()
      },
      onError: () =>
        toast.error(
          isEditing ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création'
        ),
    }

    if (isEditing && indicateur) {
      updateMutation.mutate({ id: indicateur.id_ref_ind_cmr, data: payload }, callbacks)
      return
    }

    createMutation.mutate(payload, callbacks)
  }

  return (
    <DynamicForm
      key={indicateur?.id_ref_ind_cmr ?? 'new'}
      config={config}
      schema={indicateurCmrCreateSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitText={isEditing ? 'Modifier' : 'Créer'}
      loadingText='Enregistrement…'
      isLoading={createMutation.isPending || updateMutation.isPending}
      onCancel={onClose}
      cancelText='Annuler'
    />
  )
}
