import { useMemo } from 'react'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { planSiteSchema } from '@/simadou/schemas/planSiteSchema'
import { useSavePlanSite, useGetAllPlansSite } from '@/simadou/allHooks/admin/planSiteHooks'
import { getPlanSiteFormConfig } from '@/simadou/allfieldsConfig/planSiteForm'
import { useGetNiveauxPlanSite } from '@/simadou/allHooks/admin/niveauPlanSiteHooks'
import { PlanSite } from '@/simadou/allTypes'

type Props = {
  currentRow?: any | null
  niveauId: number
  onClose: () => void
  onSuccess: () => void
}

export default function AddPlanSite({ currentRow, niveauId, onClose, onSuccess }: Props) {
  const isEdit = !!currentRow
  const { data: niveaux = [] } = useGetNiveauxPlanSite()
  const { data: allPlans = [] } = useGetAllPlansSite()

  const currentNiveau = niveaux.find((n: any) => n.id_nsc === niveauId)
  const parentNiveau = niveaux.find((n: any) => n.nombre_nsc === (currentNiveau?.nombre_nsc || 0) - 1)

  // Filtrer les plans parents
  const parentPlans = useMemo(() => {
    if (!parentNiveau) return []
    return allPlans.filter((plan: any) => {
      const planNiveauId = typeof plan.niveau_structure === 'object' 
        ? (plan.niveau_structure as any)?.id_nsc
        : plan.niveau_structure
      return planNiveauId === parentNiveau.id_nsc
    })
  }, [allPlans, parentNiveau])

  const formConfig = useMemo(() => {
    const config = getPlanSiteFormConfig()

    if (parentNiveau && parentPlans.length > 0) {
      const parentOptions = parentPlans.map((plan: any) => ({
        label: plan.intutile_ds,
        value: plan.id_ds,
      }))

      config.fields.push({
        name: 'parent_ds',
        label: parentNiveau.libelle_nsc,
        type: 'select',
        placeholder: `Sélectionner ${parentNiveau.libelle_nsc}`,
        required: false,
        options: parentOptions,
        colSpan: 'full',
      })
    }

    return config
  }, [parentNiveau, parentPlans])

  const defaultValues = useMemo(() => ({
    code_ds: currentRow?.code_ds || '',
    code_relai_ds: currentRow?.code_relai_ds || '',
    intutile_ds: currentRow?.intutile_ds || '',
    parent_ds: typeof currentRow?.parent_ds === 'object' && currentRow?.parent_ds !== null
      ? (currentRow.parent_ds as any).id_ds
      : currentRow?.parent_ds || null,
    niveau_ds: niveauId,
    niveau_structure: niveauId,
  }), [currentRow, niveauId])

  const mutation = useSavePlanSite(isEdit, currentRow, () => {
    onSuccess()
    onClose()
  })

  const handleSubmit = (data: PlanSite) => {
    mutation.mutate(data)
  }

  return (
    <DynamicForm
      key={currentRow?.id_ds ?? 'new'}
      config={formConfig}
      schema={planSiteSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isLoading={mutation.isPending}
      submitText={isEdit ? 'Mettre à jour' : 'Ajouter'}
      loadingText='Enregistrement...'
      onCancel={onClose}
      cancelText='Annuler'
    />
  )
}