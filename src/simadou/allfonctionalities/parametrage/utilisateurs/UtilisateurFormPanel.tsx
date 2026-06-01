import { useMemo } from 'react'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getPersonnelFormConfigForDialog } from '@/simadou/allfieldsConfig/personnelForm'
import type { Personnel } from '@/simadou/allTypes'
import { useGetFonctions } from '@/simadou/allHooks/admin/fonctionHooks'
import {
  useCreatePersonnel,
  useUpdatePersonnel,
} from '@/simadou/allHooks/admin/personnelHooks'
import { useGetPlanSites } from '@/simadou/allHooks/admin/planSiteHooks'
import { useGetActeurs, useGetLocalites } from '@/simadou/allHooks/admin/sharedHooks'
import { useGetTitresPersonnel } from '@/simadou/allHooks/admin/titrePersonnelHooks'
import {
  personnelWriteSchema,
  type PersonnelWriteData,
} from '@/simadou/schemas/personnelWriteSchema'
import { personnelToFormValues } from './personnelFormUtils'

export default function UtilisateurFormPanel({
  personnel,
  onClose,
  onSuccess,
}: {
  personnel?: Personnel | null
  onClose: () => void
  onSuccess: () => void
}) {
  const isEditing = !!personnel?.n_personnel

  const { data: titres = [], isLoading: isLoadingTitres } = useGetTitresPersonnel()
  const { data: fonctions = [], isLoading: isLoadingFonctions } = useGetFonctions()
  const { data: planSites = [], isLoading: isLoadingPlanSites } = useGetPlanSites()
  const { data: regions = [], isLoading: isLoadingRegions } = useGetLocalites()
  const { data: structures = [], isLoading: isLoadingStructures } = useGetActeurs()

  const formConfig = useMemo(
    () =>
      getPersonnelFormConfigForDialog({
        titres,
        fonctions,
        planSites,
        regions,
        structures,
        isLoadingTitres,
        isLoadingFonctions,
        isLoadingPlanSites,
        isLoadingRegions,
        isLoadingStructures,
      }),
    [
      titres,
      fonctions,
      planSites,
      regions,
      structures,
      isLoadingTitres,
      isLoadingFonctions,
      isLoadingPlanSites,
      isLoadingRegions,
      isLoadingStructures,
    ]
  )

  const defaultValues = useMemo(
    () => personnelToFormValues(personnel),
    [personnel]
  )

  const createMutation = useCreatePersonnel()
  const updateMutation = useUpdatePersonnel()
  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = (data: PersonnelWriteData) => {
    const payload = {
      ...data,
      rapport_mensuel_perso: personnel?.rapport_mensuel_perso ?? false,
      rapport_trimestriel_perso: personnel?.rapport_trimestriel_perso ?? false,
      rapport_semestriel_perso: personnel?.rapport_semestriel_perso ?? false,
      rapport_annuel_perso: personnel?.rapport_annuel_perso ?? false,
    }

    if (isEditing && personnel?.n_personnel) {
      updateMutation.mutate(
        { id: personnel.n_personnel, data: payload },
        { onSuccess }
      )
      return
    }

    createMutation.mutate(payload, { onSuccess })
  }

  return (
    <DynamicForm
      key={personnel?.n_personnel ?? 'new'}
      embedded
      config={formConfig}
      schema={personnelWriteSchema}
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
