import { useMemo } from 'react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getApiErrorMessage } from '@/lib/api-error-message'
import type { Ptba, TacheActivitePtba } from '@/simadou/allTypes'
import {
  tacheActivitePtbaProjetSchema,
  type TacheActivitePtbaProjetFormData,
} from '@/simadou/schemas/tacheActivitePtbaSchemas'
import { getTacheActivitePtbaFormConfigForDialog } from '@/simadou/allfieldsConfig/tacheActivitePtbaForm'
import { useMe } from '@/simadou/allHooks/auth/authHooks'
import {
  useCreateTacheActiviteProjet,
  useUpdateTacheActiviteProjet,
} from '@/simadou/allHooks/admin/tacheActiviteProjetHooks'
import {
  buildTacheActivitePtbaProjetPayload,
  resolvePersonnelFormValue,
  resolveResponsableTextFormValue,
} from '@/simadou/lib/tacheActivitePtbaUtils'

interface TacheActivitePtbaFormProps {
  tache?: TacheActivitePtba
  activite: Ptba
  onClose: () => void
  onSuccess: () => void
}

export default function TacheActiviteProjetForm({
  tache,
  activite,
  onClose,
  onSuccess,
}: TacheActivitePtbaFormProps) {
  const isEditing = !!tache
  const { data: user } = useMe()
  const formConfig = useMemo(
    () =>
      getTacheActivitePtbaFormConfigForDialog({
        personnelOptions: [],
        responsableAsText: true,
      }),
    []
  )
  const idActivite = activite.id_ptba
  const defaultValues = useMemo(
    (): TacheActivitePtbaProjetFormData => ({
      intutile_tache_gt: tache?.intutile_tache_gt || '',
      proportion_gt: Number(tache?.proportion_gt || 0),
      code_tache_gt: tache?.code_tache_gt || '',
      date_debut_gt: tache?.date_debut_gt || '',
      date_fin_gt: tache?.date_fin_gt || '',
      n_lot_gt: tache?.n_lot_gt || 1,
      observation_gt: tache?.observation_gt || '',
      id_personnel_gt:
        resolvePersonnelFormValue(tache?.id_personnel_gt) ?? user?.n_personnel,
      responsable_gt: resolveResponsableTextFormValue(tache?.responsable_gt),
      id_activite: Number(idActivite),
    }),
    [tache, idActivite, user?.n_personnel]
  )

  const createMutation = useCreateTacheActiviteProjet(idActivite)
  const updateMutation = useUpdateTacheActiviteProjet(idActivite)

  const onSubmit = (data: TacheActivitePtbaProjetFormData) => {
    const payload = buildTacheActivitePtbaProjetPayload(data, Number(idActivite))

    if (isEditing && tache?.id_groupe_tache) {
      updateMutation.mutate(
        { id: tache.id_groupe_tache, data: payload },
        {
          onSuccess: () => {
            toast.success('Tache mise à jour avec succès')
            onSuccess()
          },
          onError: (error: unknown) =>
            toast.error(
              getApiErrorMessage(error, 'Erreur lors de la mise à jour')
            ),
        }
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Tache Planifiée avec succès')
          onSuccess()
        },
        onError: (error: unknown) =>
          toast.error(
            getApiErrorMessage(error, "Erreur lors de l'enregistrement")
          ),
      })
    }
  }

  return (
    <DynamicForm
      key={`${tache?.id_groupe_tache ?? 'new'}`}
      config={formConfig}
      schema={tacheActivitePtbaProjetSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitText={isEditing ? 'Mettre à jour' : 'Enregistrer'}
      loadingText='Enregistrement…'
      isLoading={createMutation.isPending || updateMutation.isPending}
      onCancel={onClose}
      cancelText='Retour'
    />
  )
}
