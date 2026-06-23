import { useMemo } from 'react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import {
  indicateurTacheSchema,
  type IndicateurTacheFormData,
} from '@/simadou/schemas/indicateurTacheSchemas'
import type {  PtbaProjet } from '@/simadou/allTypes'
import { IndicateurTache } from '@/simadou/allTypes/indicateurTache'
import {
  useCreateIndicateurTacheProjet,
  useUpdateIndicateurTacheProjet,
} from '@/simadou/allHooks/admin/indicateurTacheProjetHooks'
import { useGetUnitesIndicateur } from '@/simadou/allHooks/admin/uniteIndicateurHooks'
import {
  buildIndicateurPerforamnceSelectOptions,
  buildIndicateurTachePayload,
  buildUniteIndicateurSelectOptions,
  resolveIndicateurCmrFormValue,
  resolveUniteIndicateurFormValue,
} from '@/simadou/lib/indicateurTacheUtils'
import { useGetIndicateurPerformanceByActiviteProjet } from '@/simadou/allHooks/admin/indicateurPerformanceProjetHooks'
import { getIndicateurTacheProjetFormConfigForDialog } from '@/simadou/allfieldsConfig/indicateurTacheFormProjet'

interface IndicateurTacheFormProps {
  indicateur?: IndicateurTache
  activite: PtbaProjet
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
  // Fonction utilitaire pour extraire le code_projet
  const getCodeProjet = (codeProjet: string | { code_projet: string } | any): string => {
    if (!codeProjet) return ''
    if (typeof codeProjet === 'string') return codeProjet
    if (typeof codeProjet === 'object' && codeProjet?.code_projet) {
      return codeProjet.code_projet
    }
    return ''
  }

  // Utilisation
  const codeProjet = getCodeProjet(activite.code_projet)
  const { data: indicateurPerformanceProjet } = useGetIndicateurPerformanceByActiviteProjet(
    codeProjet
  )
  const { data: unites = [], isLoading: isLoadingUnites } = useGetUnitesIndicateur()

  const formConfig = useMemo(
    () =>
      getIndicateurTacheProjetFormConfigForDialog({
        indicateurPerformanceOptions: buildIndicateurPerforamnceSelectOptions(indicateurPerformanceProjet || []),
        uniteIndicateurOptions: buildUniteIndicateurSelectOptions(unites),
        isLoadingUnites,
      }),
    [indicateurPerformanceProjet, unites, isLoadingUnites]
  )
  const idActivite = activite.id_ptba
  console.log("activite", activite)
  const defaultValues = useMemo(
    (): IndicateurTacheFormData => ({
      intitule_indicateur_tache: indicateur?.intitule_indicateur_tache || '',
      code_indicateur_ptba: indicateur?.code_indicateur_ptba || '',
      unite_ind_tache:
        resolveUniteIndicateurFormValue(indicateur?.unite_ind_tache) ??
        (undefined as unknown as number),
      indicateur_cmr:
        resolveIndicateurCmrFormValue(indicateur?.indicateur_cmr) ??
        (undefined as unknown as number),
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

  const onSubmit = (data: IndicateurTacheFormData) => {
    const payload = buildIndicateurTachePayload(data, Number(idActivite))

    if (isEditing && indicateur?.id_indicateur_tache) {
      updateMutation.mutate(
        { id: indicateur.id_indicateur_tache, data: payload },
        {
          onSuccess: () => {
            toast.success('Indicateur mis à jour avec succès')
            onSuccess()
          },
          onError: () => toast.error('Erreur lors de la mise à jour'),
        }
      )
    } else {
      createMutation.mutate(payload, {
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
