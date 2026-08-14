import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getNatureMarcheFormConfig } from '@/simadou/allfieldsConfig/natureMarcheForm'
import { useSaveNatureMarche } from '@/simadou/allHooks/admin/natureMarcheHooks'
import type { NatureMarche } from '@/simadou/allTypes/natureMarche'
import {
  natureMarcheSchema,
  type NatureMarcheFormData,
} from '@/simadou/schemas/natureMarcheSchema'

type Props = {
  currentRow?: NatureMarche | null
  onBack: () => void
  onSuccess: () => void
  onCancel: () => void
}

export default function AddNatureMarche({
  currentRow,
  onBack,
  onSuccess,
}: Props) {
  const isEdit = !!currentRow
  const mutation = useSaveNatureMarche(isEdit, currentRow, onSuccess)

  const defaultValues: NatureMarcheFormData = {
    code_nature_marche: currentRow?.code_nature_marche ?? '',
    intitule_nature_marche: currentRow?.intitule_nature_marche ?? '',
  }

  return (
    <DynamicForm
      key={currentRow?.id_nature_marche ?? 'new-nature-marche'}
      config={getNatureMarcheFormConfig()}
      schema={natureMarcheSchema}
      defaultValues={defaultValues}
      onSubmit={(data) => mutation.mutate(data)}
      isLoading={mutation.isPending}
      submitText={isEdit ? 'Mettre à jour' : 'Ajouter'}
      loadingText='Enregistrement…'
      onCancel={onBack}
      cancelText='Retour'
    />
  )
}
