import { useMemo } from 'react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { getSuiviDecaissementPtbaProjetFormConfig } from '@/simadou/allfieldsConfig/suiviDecaissementPtbaProjetForm'
import {
  suiviDecaissementPtbaProjetSchema,
  type SuiviDecaissementPtbaProjetFormData,
} from '@/simadou/schemas/suiviDecaissementPtbaProjetSchemas'
import type { SuiviDecaissementPtbaProjet } from '@/simadou/allTypes/suiviDecaissementPtbaProjet'
import {
  useCreateSuiviDecaissementProjet,
  useUpdateSuiviDecaissementProjet,
} from '@/simadou/allHooks/admin/suiviPtbaProjetHooks'

type Props = {
  idActivite: number
  suivi?: SuiviDecaissementPtbaProjet
  onClose: () => void
  onSuccess: () => void
}

export default function SuiviDecaissementPtbaProjetForm({
  idActivite,
  suivi,
  onClose,
  onSuccess,
}: Props) {
  const isEditing = !!suivi
  const config = useMemo(() => getSuiviDecaissementPtbaProjetFormConfig(), [])
  const createMutation = useCreateSuiviDecaissementProjet(idActivite)
  const updateMutation = useUpdateSuiviDecaissementProjet(idActivite)

  const defaultValues = useMemo(
    (): SuiviDecaissementPtbaProjetFormData => ({
      date_suivi_dec:
        suivi?.date_suivi_dec?.slice(0, 10) ||
        new Date().toISOString().split('T')[0],
      observation: suivi?.observation ?? '',
      montant_decaisse: suivi?.montant_decaisse ?? 0,
    }),
    [suivi]
  )

  const onSubmit = (data: SuiviDecaissementPtbaProjetFormData) => {
    const callbacks = {
      onSuccess: () => {
        toast.success(isEditing ? 'Décaissement mis à jour' : 'Décaissement ajouté')
        onSuccess()
      },
      onError: (error: unknown) =>
        toast.error(
          getApiErrorMessage(
            error,
            isEditing ? 'Erreur lors de la mise à jour' : "Erreur lors de l'ajout"
          )
        ),
    }

    if (isEditing && suivi) {
      updateMutation.mutate(
        {
          id: suivi.id_suivi_dec,
          data,
          existing: {
            periode_suivi_dec: suivi.periode_suivi_dec,
            taux_dollars_jour: suivi.taux_dollars_jour,
          },
        },
        callbacks
      )
      return
    }

    createMutation.mutate(data, callbacks)
  }

  return (
    <DynamicForm
      key={suivi?.id_suivi_dec ?? 'new'}
      className='w-full'
      embedded
      config={config}
      schema={suiviDecaissementPtbaProjetSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitText={isEditing ? 'Modifier' : 'Ajouter'}
      loadingText='Enregistrement…'
      isLoading={createMutation.isPending || updateMutation.isPending}
      onCancel={onClose}
      cancelText='Retour'
    />
  )
}
