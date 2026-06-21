import { useMemo } from 'react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import type { Projet } from '@/simadou/allTypes'
import type { DossierProjet } from '@/simadou/allTypes/dossierProjet'
import { getDossierProjetFormConfig } from '@/simadou/allfieldsConfig/dossierProjetForm'
import {
  useCreateDossierProjet,
  useUpdateDossierProjet,
} from '@/simadou/allHooks/admin/dossierProjetHooks'
import {
  dossierProjetSchema,
  type DossierProjetFormData,
} from '@/simadou/schemas/dossierProjetSchemas'

type DossierFormDialogProps = {
  projet: Projet
  dossier?: DossierProjet | null
  onClose: () => void
  onSuccess: () => void
}

export default function DossierFormDialog({
  projet,
  dossier,
  onClose,
  onSuccess,
}: DossierFormDialogProps) {
  const isEditing = !!dossier?.id_dossier
  const idProjet = projet.id_projet

  const formConfig = useMemo(() => getDossierProjetFormConfig(), [])
  const defaultValues = useMemo(
    (): DossierProjetFormData => ({
      nom_dossier: dossier?.nom_dossier || '',
      description_dossier: dossier?.description_dossier || '',
    }),
    [dossier]
  )

  const createMutation = useCreateDossierProjet(idProjet)
  const updateMutation = useUpdateDossierProjet(idProjet)

  const onSubmit = (data: DossierProjetFormData) => {
    const payload = {
      nom_dossier: data.nom_dossier.trim(),
      description_dossier: data.description_dossier?.trim() || undefined,
      projet: idProjet,
    }

    if (!payload.nom_dossier) {
      toast.error('Le nom du dossier est obligatoire')
      return
    }

    if (isEditing && dossier?.id_dossier) {
      updateMutation.mutate(
        { id: dossier.id_dossier, data: payload },
        { onSuccess: () => onSuccess() }
      )
      return
    }

    createMutation.mutate(payload, {
      onSuccess: () => onSuccess(),
    })
  }

  return (
    <DynamicForm
      key={`dossier-projet-${dossier?.id_dossier ?? 'new'}`}
      config={formConfig}
      schema={dossierProjetSchema}
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