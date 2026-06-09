import { useMemo } from 'react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { ActiviteProjet } from '@/simadou/allTypes'
import { SourFinancementProjet } from '@/simadou/allTypes/sourceFinancemanetProjet'
import { useCreateSourceFinancement, useUpdateSourceFinancement } from '@/simadou/allHooks/admin/sourceFinancementProjetHooks'
import { getSourceFinancementProjetFormConfig } from '@/simadou/allfieldsConfig/sourceFinancementProjetForm'
import { sourceFinancementProjetSchema } from '@/simadou/schemas/sourceFinancementProjet'

interface AddSourceFinancementProps {
  currentRow?: SourFinancementProjet;
  activite: ActiviteProjet;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddSourceFinancement({
  currentRow,
  activite,
  onClose,
  onSuccess,
}: AddSourceFinancementProps) {
  const isEditing = !!currentRow
  const formConfig = useMemo(() => getSourceFinancementProjetFormConfig(), [])

  const defaultValues = useMemo(
    () => ({
      code_source_financement: currentRow?.code_source_financement || "",
      intitule_source_financement: currentRow?.intitule_source_financement || "",
      Numero_reference_sf: currentRow?.Numero_reference_sf || "",
      montant_source_financement: currentRow?.montant_source_financement || "",
      date_signature_convention: currentRow?.date_signature_convention || "",
      code_partenaire: currentRow?.code_partenaire || "",
      etat_source_financement: currentRow?.etat_source_financement || "actif",
    }),
    [currentRow]
  )

  const createMutation = useCreateSourceFinancement(activite.code_activite_projet as any)
  const updateMutation = useUpdateSourceFinancement(activite.code_activite_projet as any)

  const onSubmit = (data: any) => {
    if (isEditing && currentRow?.id_source_financement) {
      updateMutation.mutate(
        { id: currentRow.id_source_financement, data },
        {
          onSuccess: () => {
            toast.success('Source modifiée avec succès')
            onSuccess()
          },
          onError: () => toast.error('Erreur lors de la mise à jour'),
        }
      )
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success('Source créée avec succès')
          onSuccess()
        },
        onError: () => toast.error("Erreur lors de l'enregistrement"),
      })
    }
  }

  return (
    <DynamicForm
      key={`source-${currentRow?.id_source_financement ?? 'new'}`}
      config={formConfig}
      schema={sourceFinancementProjetSchema}
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