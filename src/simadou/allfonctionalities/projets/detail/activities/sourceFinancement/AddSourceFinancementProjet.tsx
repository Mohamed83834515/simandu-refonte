import { useMemo } from 'react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { ActiviteProjet } from '@/simadou/allTypes'
import { SourFinancementProjet } from '@/simadou/allTypes/sourceFinancemanetProjet'
import {
  useCreateSourceFinancement,
  useUpdateSourceFinancement,
} from '@/simadou/allHooks/admin/sourceFinancementProjetHooks'
import { getSourceFinancementProjetFormConfig } from '@/simadou/allfieldsConfig/sourceFinancementProjetForm'
import { sourceFinancementProjetSchema } from '@/simadou/schemas/sourceFinancementProjet'
import { useGetProjet } from '@/simadou/allHooks/admin/projetHooks'
import { getRouteApi } from '@tanstack/react-router'

interface AddSourceFinancementProps {
  currentRow?: SourFinancementProjet
  activite: ActiviteProjet
  onClose: () => void
  onSuccess: () => void
}

export default function AddSourceFinancement({
  currentRow,
  activite,
  onClose,
  onSuccess,
}: AddSourceFinancementProps) {
  const isEditing = !!currentRow

  const route = getRouteApi('/_authenticated/projet-programme/projets/$id')
  const { id } = route.useParams()
  const { data: projet } = useGetProjet(id)

  const partenaireOptions = useMemo(
    () =>
      (projet?.signataires_projet ?? []).map((p) => ({
        value: p.code_acteur,
        label: p.description_acteur || p.code_acteur,
      })),
    [projet?.signataires_projet]
  )

  const formConfig = useMemo(() => {
    const config = getSourceFinancementProjetFormConfig()

    return {
      fields: config.fields.map((field) => {
        if (field.name === 'code_partenaire') {
          return { ...field, options: partenaireOptions }
        }
        return field
      }),
    }
  }, [partenaireOptions])

  const defaultValues = useMemo(
    () => ({
      code_activite_projet:
        Number(currentRow?.code_activite_projet) || activite.id_activite_projet,
      intitule_source_financement: currentRow?.intitule_source_financement ?? '',
      Numero_reference_sf: currentRow?.Numero_reference_sf ?? '',
      montant_source_financement: currentRow?.montant_source_financement
        ? Number(currentRow.montant_source_financement)
        : undefined,
      date_signature_convention: currentRow?.date_signature_convention ?? '',
      code_partenaire: currentRow?.code_partenaire ?? '',
      etat_source_financement: currentRow?.etat_source_financement ?? 0,
    }),
    [currentRow, activite.id_activite_projet]
  )

  const createMutation = useCreateSourceFinancement(activite.id_activite_projet)
  const updateMutation = useUpdateSourceFinancement(activite.id_activite_projet)

  const onSubmit = (data: Record<string, unknown>) => {
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
