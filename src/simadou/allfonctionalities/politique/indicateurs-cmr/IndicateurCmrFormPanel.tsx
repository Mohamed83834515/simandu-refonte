import { useMemo } from 'react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { getIndicateurCmrFormConfigForDialog } from '@/simadou/allfieldsConfig/indicateurCmrForm'
import type { IndicateurCmr } from '@/simadou/allTypes'
import type { IndicateurStrategique } from '@/simadou/allTypes/indicateurStrategique'
import {
  indicateurCmrCreateSchema,
  type IndicateurCmrCreateData,
} from '@/simadou/schemas/indicateursSchemas'
import {
  useCreateIndicateurCmr,
  useUpdateIndicateurCmr,
} from '@/simadou/allHooks/admin/indicateurCmrHooks'
import { useGetDictionnaireIndicateurs } from '@/simadou/allHooks/admin/dictionnaireIndicateurHooks'
import {
  buildDictionnaireIndicateurSelectOptions,
  buildIndicateurStrategiqueSelectOptions,
  filterIndicateursStrategiqueByNiveau,
  indicateurCmrToFormValues,
  resolveReferentielCmrId,
  resolveResultatCmrId,
} from './indicateurCmrFormUtils'

export default function IndicateurCmrFormPanel({
  indicateur,
  niveauCodeNumber,
  indicateursStrategiques,
  onClose,
  onSuccess,
}: {
  indicateur?: IndicateurCmr | null
  niveauCodeNumber: number
  indicateursStrategiques: IndicateurStrategique[]
  onClose: () => void
  onSuccess: () => void
}) {
  const isEditing = !!indicateur
  const createMutation = useCreateIndicateurCmr()
  const updateMutation = useUpdateIndicateurCmr()
  const { data: dictionnaires = [], isLoading: isLoadingReferentiels } =
    useGetDictionnaireIndicateurs()

  const indicateursStrategiquesForNiveau = useMemo(
    () =>
      filterIndicateursStrategiqueByNiveau(
        indicateursStrategiques,
        niveauCodeNumber
      ),
    [indicateursStrategiques, niveauCodeNumber]
  )

  const referentielOptions = useMemo(
    () =>
      buildDictionnaireIndicateurSelectOptions(
        dictionnaires,
        resolveReferentielCmrId(indicateur)
      ),
    [dictionnaires, indicateur]
  )

  const indicateurStrategiqueOptions = useMemo(
    () =>
      buildIndicateurStrategiqueSelectOptions(
        indicateursStrategiquesForNiveau,
        resolveResultatCmrId(indicateur)
      ),
    [indicateursStrategiquesForNiveau, indicateur]
  )

  const formConfig = useMemo(
    () =>
      getIndicateurCmrFormConfigForDialog({
        referentielOptions,
        isLoadingReferentiels,
        indicateurStrategiqueOptions,
      }),
    [referentielOptions, isLoadingReferentiels, indicateurStrategiqueOptions]
  )

  const defaultValues = useMemo(
    () => indicateurCmrToFormValues(indicateur),
    [indicateur]
  )

  const onSubmit = (data: IndicateurCmrCreateData) => {
    const payload = {
      ...data,
      referentiel_cmr: data.referentiel_cmr ?? null,
    }

    const callbacks = {
      onSuccess: () => {
        toast.success(
          isEditing ? 'Indicateur CMR mis à jour' : 'Indicateur CMR créé'
        )
        onSuccess()
      },
      onError: (error: unknown) =>
        toast.error(
          getApiErrorMessage(
            error,
            isEditing ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création'
          )
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
      key={`${indicateur?.id_ref_ind_cmr ?? 'new'}-${niveauCodeNumber}`}
      config={formConfig}
      schema={indicateurCmrCreateSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitText={isEditing ? 'Mettre à jour' : 'Ajouter'}
      loadingText='Enregistrement…'
      isLoading={createMutation.isPending || updateMutation.isPending}
      onCancel={onClose}
      cancelText='Annuler'
    />
  )
}