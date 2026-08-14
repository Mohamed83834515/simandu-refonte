import { useMemo } from 'react'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import type { Projet } from '@/simadou/allTypes'
import type { Convention, ConventionApiPayload } from '@/simadou/allTypes/convention'
import { getConventionFormConfig } from '@/simadou/allfieldsConfig/conventionForm'
import {
  useCreateConventionProjet,
  useUpdateConventionProjet,
} from '@/simadou/allHooks/admin/conventionHooks'
import { buildBailleurOptionsFromSignataires } from '@/simadou/lib/financementProjetUtils'
import { resolvePartenaireConventionId } from '@/simadou/lib/conventionUtils'
import {
  conventionFormSchema,
  type ConventionFormData,
} from '@/simadou/schemas/conventionSchema'

type ConventionProjetFormDialogProps = {
  projet: Projet
  convention?: Convention | null
  onClose: () => void
  onSuccess: () => void
}

function formatDateForInput(value?: string): string {
  if (!value) return ''
  return value.includes('T') ? value.split('T')[0] : value
}

export default function ConventionProjetFormDialog({
  projet,
  convention,
  onClose,
  onSuccess,
}: ConventionProjetFormDialogProps) {
  const isEditing = !!convention?.id_convention
  const idProjet = projet.id_projet

  const partenaireOptions = useMemo(
    () => buildBailleurOptionsFromSignataires(projet.signataires_projet),
    [projet.signataires_projet]
  )

  const formConfig = useMemo(
    () => getConventionFormConfig(partenaireOptions, isEditing),
    [partenaireOptions, isEditing]
  )

  const defaultValues = useMemo(
    (): ConventionFormData => ({
      code_convention: convention?.code_convention ?? '',
      intutile_conv: convention?.intutile_conv ?? '',
      reference_conv: convention?.reference_conv ?? '',
      montant_conv:
        convention?.montant_conv != null ? Number(convention.montant_conv) : 0,
      date_signature_conv: formatDateForInput(convention?.date_signature_conv),
      etat_conv: isEditing ? 'modifier' : 'ajouter',
      partenaire_conv: resolvePartenaireConventionId(convention?.partenaire_conv),
      document_fichier: convention?.document_fichier ?? null,
    }),
    [convention, isEditing]
  )

  const createMutation = useCreateConventionProjet(idProjet)
  const updateMutation = useUpdateConventionProjet(idProjet)

  const onSubmit = (data: ConventionFormData) => {
    const payload: ConventionApiPayload = {
      code_convention: data.code_convention,
      intutile_conv: data.intutile_conv,
      reference_conv: data.reference_conv,
      montant_conv: Number(data.montant_conv),
      date_signature_conv: data.date_signature_conv,
      etat_conv: isEditing ? 'modifier' : 'ajouter',
      partenaire_conv: data.partenaire_conv ?? null,
      projet: idProjet,
      document_fichier: data.document_fichier ?? null,
    }

    if (isEditing && convention?.id_convention) {
      updateMutation.mutate(
        { id: convention.id_convention, data: payload },
        { onSuccess }
      )
      return
    }

    createMutation.mutate(payload, { onSuccess })
  }

  return (
    <DynamicForm
      key={`convention-projet-${convention?.id_convention ?? 'new'}-${convention?.document_fichier ?? ''}`}
      config={formConfig}
      schema={conventionFormSchema}
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
