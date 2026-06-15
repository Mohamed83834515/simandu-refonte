import { useMemo } from 'react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { getIndicateurCmrFormConfigForDialog } from '@/simadou/allfieldsConfig/indicateurCmrForm'
import type { IndicateurCadreResultat } from '@/simadou/allTypes'
import type { IndicateurCmrProjet } from '@/simadou/allTypes/indicateurCmrProjet'
import {
  indicateurCmrCreateSchema,
  type IndicateurCmrCreateData,
} from '@/simadou/schemas/indicateursSchemas'
import {
  useCreateIndicateurCmrProjet,
  useUpdateIndicateurCmrProjet,
} from '@/simadou/allHooks/admin/indicateurCmrHooks'
import { useGetDictionnaireIndicateurs } from '@/simadou/allHooks/admin/dictionnaireIndicateurHooks'
import {
  buildDictionnaireIndicateurSelectOptions,
  buildIndicateurCadreResultatSelectOptions,
  filterIndicateursCadreResultatByNiveau,
  indicateurCmrProjetToFormValues,
  resolveReferentielCmrId,
  resolveResultatCmrProjetId,
} from './indicateurCmrProjetFormUtils'

export default function IndicateurCmrProjetFormPanel({
  indicateur,
  codeProjet,
  niveauNombre,
  indicateursCadreResultat,
  onClose,
  onSuccess,
}: {
  indicateur?: IndicateurCmrProjet | null
  codeProjet: string
  niveauNombre: number
  indicateursCadreResultat: IndicateurCadreResultat[]
  onClose: () => void
  onSuccess: () => void
}) {
  const isEditing = !!indicateur
  const createMutation = useCreateIndicateurCmrProjet(codeProjet)
  const updateMutation = useUpdateIndicateurCmrProjet()
  const { data: dictionnaires = [], isLoading: isLoadingReferentiels } =
    useGetDictionnaireIndicateurs()

  const indicateursCadreResultatForNiveau = useMemo(
    () =>
      filterIndicateursCadreResultatByNiveau(
        indicateursCadreResultat,
        niveauNombre,
        codeProjet
      ),
    [indicateursCadreResultat, niveauNombre, codeProjet]
  )

  const referentielOptions = useMemo(
    () =>
      buildDictionnaireIndicateurSelectOptions(
        dictionnaires,
        resolveReferentielCmrId(indicateur)
      ),
    [dictionnaires, indicateur]
  )

  const resultatCmrOptions = useMemo(
    () =>
      buildIndicateurCadreResultatSelectOptions(
        indicateursCadreResultatForNiveau,
        resolveResultatCmrProjetId(indicateur)
      ),
    [indicateursCadreResultatForNiveau, indicateur]
  )

  const formConfig = useMemo(
    () =>
      getIndicateurCmrFormConfigForDialog({
        referentielOptions,
        isLoadingReferentiels,
        indicateurStrategiqueOptions: resultatCmrOptions,
      }),
    [referentielOptions, isLoadingReferentiels, resultatCmrOptions]
  )

  const defaultValues = useMemo(
    () => indicateurCmrProjetToFormValues(indicateur),
    [indicateur]
  )

  const onSubmit = (data: IndicateurCmrCreateData) => {
    const payload = {
      ...data,
      referentiel_cmr: data.referentiel_cmr ?? null,
      code_projet: codeProjet,
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
      updateMutation.mutate(
        { id: indicateur.id_ref_ind_cmr, data: payload },
        callbacks
      )
      return
    }

    createMutation.mutate(payload, callbacks)
  }

  return (
    <DynamicForm
      key={`${indicateur?.id_ref_ind_cmr ?? 'new'}-${niveauNombre}`}
      config={formConfig}
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
