// simadou/allfonctionalities/parametrage/unite-indicateur/AddUniteIndicateur.tsx
import { DynamicForm } from "@/Global/Forms/DynamicForm"
import { getUniteIndicateurFormConfig } from "@/simadou/allfieldsConfig/uniteIndicateurForm"
import { useSaveUniteIndicateur } from "@/simadou/allHooks/admin/uniteIndicateurHooks"
import { uniteIndicateurSchema } from "@/simadou/schemas/uniteIndicateurSchema"

type Props = {
  currentRow?: any | null
  onBack: () => void
  onSuccess: () => void
  onCancel: () => void
}

export default function AddUniteIndicateur({
  currentRow,
  onBack,
  onSuccess,
}: Props) {
  const isEdit = !!currentRow

  const formConfig = getUniteIndicateurFormConfig()

  const defaultValues = {
    unite_ui: currentRow?.unite_ui || "",
    definition_ui: currentRow?.definition_ui || "",
  }

  const mutation = useSaveUniteIndicateur(isEdit, currentRow, onSuccess)

  const handleSubmit = (data: any) => {
    mutation.mutate(data)
  }

  return (
    <DynamicForm
      config={formConfig}
      schema={uniteIndicateurSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isLoading={mutation.isPending}
      submitText={isEdit ? "Modifier" : "Ajouter"}
      loadingText="Enregistrement..."
      onCancel={onBack}
      cancelText='Retour'
    />
  )
}