import { useMemo } from 'react'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getTitrePersonnelFormConfig } from '@/simadou/allfieldsConfig/titrePersonnelForm'
import type { TitrePersonnel } from '@/simadou/allTypes'
import {
  useCreateTitrePersonnel,
  useUpdateTitrePersonnel,
} from '@/simadou/allHooks/admin/titrePersonnelHooks'
import {
  titrePersonnelSchema,
  type TitrePersonnelFormData,
} from '@/simadou/schemas/titrePersonnelSchema'

export default function TitrePersonnelFormPanel({
  titre,
  onClose,
  onSuccess,
}: {
  titre?: TitrePersonnel | null
  onClose: () => void
  onSuccess: () => void
}) {
  const isEditing = !!titre?.id_titre

  const formConfig = useMemo(() => getTitrePersonnelFormConfig(), [])

  const defaultValues = useMemo(
    (): TitrePersonnelFormData => ({
      libelle_titre: titre?.libelle_titre ?? '',
      description_titre: titre?.description_titre ?? '',
    }),
    [titre]
  )

  const createMutation = useCreateTitrePersonnel()
  const updateMutation = useUpdateTitrePersonnel()
  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = (data: TitrePersonnelFormData) => {
    if (isEditing && titre) {
      updateMutation.mutate({ id: titre.id_titre, data }, { onSuccess })
      return
    }
    createMutation.mutate(data, { onSuccess })
  }

  return (
    <DynamicForm
      key={titre?.id_titre ?? 'new'}
      embedded
      config={formConfig}
      schema={titrePersonnelSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitText={isEditing ? 'Mettre à jour' : 'Créer'}
      loadingText='Enregistrement…'
      isLoading={isPending}
      onCancel={onClose}
      cancelText='Annuler'
    />
  )
}
