import { useMemo } from 'react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getIndicateurTacheFormConfigForDialog } from '@/simadou/allfieldsConfig/indicateurTacheForm'
import {
  indicateurTacheSchema,
  type IndicateurTacheFormData,
} from '@/simadou/schemas/indicateurTacheSchemas'
import type { Ptba } from '@/simadou/allTypes'
import { IndicateurTache } from '@/simadou/allTypes/indicateurTache'
import { useGetIndicateursCmr } from '@/simadou/allHooks/admin/indicateurCmrHooks'
import { useCreateIndicateurTacheProjet, useUpdateIndicateurTacheProjet } from '@/simadou/allHooks/admin/indicateurTacheProjetHooks'
import { useGetUnitesIndicateur } from '@/simadou/allHooks/admin/uniteIndicateurHooks'

interface IndicateurTacheFormProps {
  indicateur?: IndicateurTache
  activite: Ptba
  onClose: () => void
  onSuccess: () => void
}

export default function IndicateurTacheProjetForm({
  indicateur,
  activite,
  onClose,
  onSuccess,
}: IndicateurTacheFormProps) {
  const isEditing = !!indicateur
  const { data: indicateursCmr = [], isLoading: isLoadingIndicateurCmrs } =
    useGetIndicateursCmr()
  const { data: unites = [], isLoading: isLoadingUnites } = useGetUnitesIndicateur()

  const formConfig = useMemo(
    () =>
      getIndicateurTacheFormConfigForDialog({
        indicateurCmrOptions: indicateursCmr.map((i) => ({
          value: i.id_ref_ind_cmr,
          label: i.intitule_ref_ind ?? i.code_ref_ind,
        })),
        uniteIndicateurOptions: unites.map((u) => ({
          value: u.id_unite,
          label: u.definition_ui ?? u.unite_ui ?? String(u.id_unite),
        })),
        isLoadingIndicateurCmrs,
        isLoadingUnites,
      }),
    [indicateursCmr, unites, isLoadingIndicateurCmrs, isLoadingUnites]
  )
  const idActivite = activite.id_ptba

  const defaultValues = useMemo(
    (): IndicateurTacheFormData => ({
      intitule_indicateur_tache: indicateur?.intitule_indicateur_tache || '',
      code_indicateur_ptba: indicateur?.code_indicateur_ptba || '',
      unite_ind_tache: indicateur?.unite_ind_tache || 0,
      indicateur_cmr: indicateur?.indicateur_cmr || 0,
      trimestre_1: indicateur?.trimestre_1 || '',
      trimestre_2: indicateur?.trimestre_2 || '',
      trimestre_3: indicateur?.trimestre_3 || '',
      trimestre_4: indicateur?.trimestre_4 || '',
      id_activite: indicateur?.id_activite || Number(idActivite),
    }),
    [indicateur, idActivite]
  )

  const createMutation = useCreateIndicateurTacheProjet(idActivite)
  const updateMutation = useUpdateIndicateurTacheProjet(idActivite)

  const onSubmit = (data: IndicateurTache) => {
    if (isEditing && indicateur?.id_indicateur_tache) {
      updateMutation.mutate(
        { id: indicateur.id_indicateur_tache, data },
        {
          onSuccess: () => {
            toast.success('Indicateur mis à jour avec succès')
            onSuccess()
          },
          onError: () => toast.error('Erreur lors de la mise à jour'),
        }
      )
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success('Indicateur créé avec succès')
          onSuccess()
        },
        onError: () => toast.error('Erreur lors de la création'),
      })
    }
  }

  return (
    <DynamicForm
      key={`${indicateur?.id_indicateur_tache ?? 'new'}`}
      config={formConfig}
      schema={indicateurTacheSchema}
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
