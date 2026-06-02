import { useMemo } from 'react'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getDictionnaireIndicateurFormConfigForDialog } from '@/simadou/allfieldsConfig/dictionnaireIndicateurForm'
import type { DictionnaireIndicateur } from '@/simadou/allTypes'
import { useGetActeurs } from '@/simadou/allHooks/admin/sharedHooks'
import { useGetTypeZones } from '@/simadou/allHooks/admin/typeZoneHooks'
import {
  dictionnaireIndicateurWriteSchema,
  type DictionnaireIndicateurWriteData,
} from '@/simadou/schemas/dictionnaireIndicateurSchemas'
import {
  useCreateDictionnaireIndicateur,
  useUpdateDictionnaireIndicateur,
} from '@/simadou/allHooks/admin/dictionnaireIndicateurHooks'
import { dictionnaireToFormValues } from './dictionnaireIndicateurFormUtils'
import { useGetUniteIndicateurs } from '@/simadou/allHooks/admin/uniteIndicateurHooks'

export default function DictionnaireIndicateurFormPanel({
  dictionnaire,
  onClose,
  onSuccess,
}: {
  dictionnaire?: DictionnaireIndicateur | null
  onClose: () => void
  onSuccess: () => void
}) {
  const isEditing = !!dictionnaire

  const { data: unites = [], isLoading: isLoadingUnites } = useGetUniteIndicateurs()
  const { data: typeZones = [], isLoading: isLoadingTypeZones } = useGetTypeZones()
  const { data: acteurs = [], isLoading: isLoadingActeurs } = useGetActeurs()

  const formConfig = useMemo(
    () =>
      getDictionnaireIndicateurFormConfigForDialog({
        unites,
        typeZones,
        acteurs,
        isLoadingUnites,
        isLoadingTypeZones,
        isLoadingActeurs,
      }),
    [unites, typeZones, acteurs, isLoadingUnites, isLoadingTypeZones, isLoadingActeurs]
  )

  const defaultValues = useMemo(
    () => dictionnaireToFormValues(dictionnaire),
    [dictionnaire]
  )

  const createMutation = useCreateDictionnaireIndicateur()
  const updateMutation = useUpdateDictionnaireIndicateur()
  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = (data: DictionnaireIndicateurWriteData) => {
    if (isEditing && dictionnaire) {
      updateMutation.mutate(
        { id: dictionnaire.id_ref_ind_ref, data },
        { onSuccess }
      )
      return
    }

    createMutation.mutate(data, { onSuccess })
  }

  return (
    <DynamicForm
      key={dictionnaire?.id_ref_ind_ref ?? 'new'}
      embedded
      config={formConfig}
      schema={dictionnaireIndicateurWriteSchema}
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
