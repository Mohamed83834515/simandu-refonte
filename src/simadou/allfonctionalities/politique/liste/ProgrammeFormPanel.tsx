import { useMemo } from 'react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getProgrammeFormConfigForDialog } from '@/simadou/allfieldsConfig/programmeFormDialog'
import type { Programme } from '@/simadou/allTypes/programme'
import {
  programmeWriteSchema,
  type ProgrammeWriteData,
} from '@/simadou/schemas/programmeSchemas'
import {
  useCreateProgramme,
  useUpdateProgramme,
} from '@/simadou/allHooks/admin/programmeHooks'
import { programmeToFormValues } from './programmeFormUtils'

export default function ProgrammeFormPanel({
  programme,
  onClose,
  onSuccess,
}: {
  programme?: Programme | null
  onClose: () => void
  onSuccess: () => void
}) {
  const isEditing = !!programme?.id_programme
  const createMutation = useCreateProgramme()
  const updateMutation = useUpdateProgramme()

  const formConfig = useMemo(() => getProgrammeFormConfigForDialog(), [])
  const defaultValues = useMemo(
    () => programmeToFormValues(programme),
    [programme]
  )

  const onSubmit = (data: ProgrammeWriteData) => {
    const callbacks = {
      onSuccess: () => {
        toast.success(
          isEditing ? 'Programme mis à jour' : 'Programme créé'
        )
        onSuccess()
      },
      onError: (error: unknown) =>
        toast.error(
          getApiErrorMessage(
            error,
            isEditing
              ? 'Erreur lors de la modification'
              : 'Erreur lors de la création'
          )
        ),
    }

    if (isEditing && programme) {
      updateMutation.mutate(
        { id: programme.id_programme, data },
        callbacks
      )
      return
    }

    createMutation.mutate(data, callbacks)
  }

  return (
    <DynamicForm
      key={programme?.id_programme ?? 'new'}
      embedded
      config={formConfig}
      schema={programmeWriteSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitText={isEditing ? 'Mettre à jour' : 'Créer'}
      loadingText='Enregistrement…'
      isLoading={createMutation.isPending || updateMutation.isPending}
      onCancel={onClose}
      cancelText='Annuler'
    />
  )
}
