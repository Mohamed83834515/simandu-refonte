import { useMemo } from 'react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { getSuiviTacheActiviteProjetFormConfig } from '@/simadou/allfieldsConfig/suiviTacheActiviteProjetForm'
import {
  suiviTacheActiviteProjetSchema,
  type SuiviTacheActiviteProjetFormData,
} from '@/simadou/schemas/suiviTacheActiviteProjetSchemas'
import type { SuiviTacheActivite, TacheActivitePtba } from '@/simadou/allTypes'
import {
  useCreateSuiviTacheProjet,
  useUpdateSuiviTacheProjet,
} from '@/simadou/allHooks/admin/suiviPtbaProjetHooks'

type SuiviTacheActiviteFormProps = {
  tache: TacheActivitePtba
  suivi?: SuiviTacheActivite
  idActivite: number
  onClose: () => void
  onSuccess: () => void
}

export default function SuiviTacheActiviteProjetForm({
  tache,
  suivi,
  idActivite,
  onClose,
  onSuccess,
}: SuiviTacheActiviteFormProps) {
  const isEditing = !!suivi
  const formConfig = useMemo(() => getSuiviTacheActiviteProjetFormConfig(), [])

  const defaultValues = useMemo(
    (): SuiviTacheActiviteProjetFormData => ({
      date_reele: suivi?.date_reele?.slice(0, 10) || '',
      observation_suivi: suivi?.observation_suivi || '',
      proportion_realisee: suivi?.proportion_realisee ?? 0,
      valide: suivi?.valide ?? false,
    }),
    [suivi]
  )

  const createMutation = useCreateSuiviTacheProjet(idActivite)
  const updateMutation = useUpdateSuiviTacheProjet(idActivite)

  const onSubmit = (data: SuiviTacheActiviteProjetFormData) => {
    const payload = {
      ...data,
      id_activite_ptba: idActivite,
      id_groupe_tache: tache.id_groupe_tache,
    }

    if (isEditing && suivi) {
      updateMutation.mutate(
        { id: suivi.id_suivi_groupe_tache, data: payload },
        {
          onSuccess: () => {
            toast.success('Suivi mis à jour')
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
          toast.success('Suivi enregistré')
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
      key={`${tache.id_groupe_tache}-${suivi?.id_suivi_groupe_tache ?? 'new'}`}
      className='w-full'
      embedded
      config={formConfig}
      schema={suiviTacheActiviteProjetSchema}
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
