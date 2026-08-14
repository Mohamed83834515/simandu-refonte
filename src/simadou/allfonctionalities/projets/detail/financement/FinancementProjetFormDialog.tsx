import { useMemo } from 'react'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import type { Projet } from '@/simadou/allTypes'
import type { FinancementProjet } from '@/simadou/allTypes/financementProjet'
import { getFinancementProjetFormConfig } from '@/simadou/allfieldsConfig/financementProjetForm'
import {
  useCreateFinancementProjet,
  useUpdateFinancementProjet,
} from '@/simadou/allHooks/admin/financementProjetHooks'
import { useMe } from '@/simadou/allHooks/auth/authHooks'
import { buildBailleurOptionsFromSignataires } from '@/simadou/lib/financementProjetUtils'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'
import {
  financementProjetSchema,
  type FinancementProjetFormData,
} from '@/simadou/schemas/financementProjetSchemas'

type FinancementProjetFormDialogProps = {
  projet: Projet
  financement?: FinancementProjet | null
  onClose: () => void
  onSuccess: () => void
}

export default function FinancementProjetFormDialog({
  projet,
  financement,
  onClose,
  onSuccess,
}: FinancementProjetFormDialogProps) {
  const isEditing = !!financement?.id_part
  const idProjet = projet.id_projet
  const { data: user } = useMe()

  const bailleurOptions = useMemo(
    () => buildBailleurOptionsFromSignataires(projet.signataires_projet),
    [projet.signataires_projet]
  )

  const formConfig = useMemo(
    () => getFinancementProjetFormConfig(bailleurOptions),
    [bailleurOptions]
  )

  const defaultValues = useMemo(
    (): FinancementProjetFormData => ({
      code_type: financement?.code_type ?? '',
      intitule: financement?.intitule ?? '',
      montant: financement?.montant != null ? Number(financement.montant) : 0,
      date_accord: financement?.date_accord ?? '',
      observation: financement?.observation ?? '',
      type_financement: financement?.type_financement ?? 'pret',
      bailleur: resolveRelationId(financement?.bailleur, 'id_acteur') ?? 0,
    }),
    [financement]
  )

  const createMutation = useCreateFinancementProjet(idProjet)
  const updateMutation = useUpdateFinancementProjet(idProjet)

  const onSubmit = (data: FinancementProjetFormData) => {
    const personnelId = user?.n_personnel ?? 0

    const payload = {
      code_type: data.code_type.trim(),
      intitule: data.intitule.trim(),
      montant: Number(data.montant),
      date_accord: data.date_accord,
      observation: data.observation?.trim() || undefined,
      type_financement: data.type_financement,
      bailleur: Number(data.bailleur),
      etat: isEditing ? 'modifier' : 'Ajouter',
      projet: idProjet,
      id_personnel: personnelId,
      modifier_par: personnelId,
    }

    if (isEditing && financement?.id_part) {
      updateMutation.mutate(
        { id: financement.id_part, data: payload },
        { onSuccess }
      )
      return
    }

    createMutation.mutate(payload, { onSuccess })
  }

  return (
    <DynamicForm
      key={`financement-projet-${financement?.id_part ?? 'new'}`}
      config={formConfig}
      schema={financementProjetSchema}
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
