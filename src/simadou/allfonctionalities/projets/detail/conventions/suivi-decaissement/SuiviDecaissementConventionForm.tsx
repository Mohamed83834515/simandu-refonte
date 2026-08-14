import { useMemo } from 'react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { getSuiviDecaissementConventionFormConfig } from '@/simadou/allfieldsConfig/suiviDecaissementConventionForm'
import {
  suiviDecaissementConventionSchema,
  type SuiviDecaissementConventionFormData,
} from '@/simadou/schemas/suiviDecaissementConventionSchemas'
import type { SuiviDecaissementConvention } from '@/simadou/allTypes/suiviDecaissementConvention'
import {
  useCreateSuiviDecaissementConvention,
  useUpdateSuiviDecaissementConvention,
} from '@/simadou/allHooks/admin/suiviConventionHooks'

type Props = {
  idConvention: number
  suivi?: SuiviDecaissementConvention
  onClose: () => void
  onSuccess: () => void
}

export default function SuiviDecaissementConventionForm({
  idConvention,
  suivi,
  onClose,
  onSuccess,
}: Props) {
  const isEditing = !!suivi
  const config = useMemo(
    () => getSuiviDecaissementConventionFormConfig(isEditing),
    [isEditing]
  )

  const createMutation = useCreateSuiviDecaissementConvention(idConvention)
  const updateMutation = useUpdateSuiviDecaissementConvention(idConvention)

  const defaultValues = useMemo((): SuiviDecaissementConventionFormData => {
    return {
      date_suivi_dec:
        suivi?.date_suivi_dec?.slice(0, 10) ||
        new Date().toISOString().split('T')[0],
      montant_decaisse: suivi?.montant_decaisse ?? 0,
      observation: suivi?.observation ?? '',
      document_fichier: suivi?.document_fichier ?? null,
    }
  }, [suivi])

  const onSubmit = (data: SuiviDecaissementConventionFormData) => {
    const callbacks = {
      onSuccess: () => {
        toast.success(
          isEditing ? 'Décaissement mis à jour' : 'Décaissement ajouté'
        )
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
      updateMutation.mutate({ id: suivi.id_suivi_dec, data }, callbacks)
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
      schema={suiviDecaissementConventionSchema}
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
