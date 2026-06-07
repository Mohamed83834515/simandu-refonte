// simadou/allfonctionalities/parametrage/categorie-acteur/AddCategorieActeur.tsx
import { DynamicForm } from "@/Global/Forms/DynamicForm"
import { getCategorieActeurFormConfig } from "@/simadou/allfieldsConfig/categorieActeurForm"
import { useSaveCategorieActeur } from "@/simadou/allHooks/admin/categorieActeurHooks"
import { CategorieActeur } from "@/simadou/allTypes/categorieActeur"
import { categorieActeurSchema } from "@/simadou/schemas/categorieShema"

type Props = {
  currentRow?: CategorieActeur | null
  onBack: () => void
  onSuccess: () => void
  onCancel: () => void
}

export default function AddCategorieActeur({
  currentRow,
  onBack,
  onSuccess,
}: Props) {
  const isEdit = !!currentRow

  const formConfig = getCategorieActeurFormConfig()

  const defaultValues = {
    code_cat: currentRow?.code_cat || "",
    nom_categorie: currentRow?.nom_categorie || "",
    id_categorie: currentRow?.id_categorie || 0,
  }

  const mutation = useSaveCategorieActeur(isEdit, currentRow, onSuccess)

  const handleSubmit = (data: CategorieActeur) => {
    mutation.mutate(data)
  }
  return (
    <DynamicForm
      config={formConfig}
      schema={categorieActeurSchema}
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