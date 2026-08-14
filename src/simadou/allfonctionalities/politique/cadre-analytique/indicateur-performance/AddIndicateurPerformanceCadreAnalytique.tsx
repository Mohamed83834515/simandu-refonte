import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { getIndicateurPerformanceProjetFormConfigForDialog } from '@/simadou/allfieldsConfig/indicateurPerformanceProjetForm'
import {
  indicateurPerformanceProgrammeFormSchema,
  type IndicateurPerformanceProgrammeFormData,
} from '@/simadou/schemas/indicateurPerformanceProgrammeSchemas'
import type {
  CadreAnalytique,
  IndicateurPerformanceProgramme,
} from '@/simadou/allTypes'
import {
  normalizeIndicateurPerformanceProgrammeCibles,
} from '@/simadou/lib/indicateurPerformanceProgrammeUtils'
import { syncCiblesIndicateurPerformanceProgramme } from '@/simadou/lib/syncCiblesIndicateurPerformanceProgramme'
import { useGetUnitesIndicateur } from '@/simadou/allHooks/admin/uniteIndicateurHooks'
import {
  useCreateIndicateurPerformanceProgramme,
  useUpdateIndicateurPerformanceProgramme,
} from '@/simadou/allHooks/admin/indicateurPerformanceProgrammeHooks'
import CiblesAnnuellesProgramme, {
  type CibleAnnuelleProgrammeFormValue,
} from './CiblesAnnuellesProgramme'

type AddIndicateurPerformanceCadreAnalytiqueProps = {
  currentRow?: IndicateurPerformanceProgramme | null
  cadre: CadreAnalytique
  programmeId: number
  onClose: () => void
  onSuccess: () => void | Promise<void>
}

function resolveUniteId(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v) && v > 0) return v
  if (v && typeof v === 'object' && 'id_unite' in v) {
    const id = Number((v as { id_unite: number }).id_unite)
    return Number.isFinite(id) && id > 0 ? id : null
  }
  return null
}

export default function AddIndicateurPerformanceCadreAnalytique({
  currentRow,
  cadre,
  programmeId,
  onClose,
  onSuccess,
}: AddIndicateurPerformanceCadreAnalytiqueProps) {
  const isEditing = !!currentRow
  const [cibles, setCibles] = useState<CibleAnnuelleProgrammeFormValue[]>([])
  const [isSavingCibles, setIsSavingCibles] = useState(false)

  const { data: unites = [], isLoading: isLoadingUnites } = useGetUnitesIndicateur()
  const createMutation = useCreateIndicateurPerformanceProgramme(programmeId)
  const updateMutation = useUpdateIndicateurPerformanceProgramme(programmeId)

  const uniteOptions = useMemo(
    () =>
      unites.map((u) => ({
        value: u.id_unite,
        label: `${u.unite_ui} - ${u.definition_ui}`,
      })),
    [unites]
  )

  const defaultValues: IndicateurPerformanceProgrammeFormData = useMemo(
    () => ({
      code_indicateur_performance: currentRow?.code_indicateur_performance ?? '',
      intitule_indicateur_tache: currentRow?.intitule_indicateur_tache ?? '',
      type_ind: currentRow?.type_ind === 0 ? 0 : 1,
      cadre_analytique: cadre.id_ca,
      unite_indicateur_performance:
        resolveUniteId(currentRow?.unite_indicateur_performance) ?? 1,
      programme: programmeId,
    }),
    [currentRow, cadre.id_ca, programmeId]
  )

  const existingCibles = useMemo(
    () => normalizeIndicateurPerformanceProgrammeCibles(currentRow?.cibles),
    [currentRow]
  )

  const onSubmit = async (data: IndicateurPerformanceProgrammeFormData) => {
    const payload = {
      type_ind: data.type_ind,
      code_indicateur_performance: data.code_indicateur_performance,
      intitule_indicateur_tache: data.intitule_indicateur_tache,
      cadre_analytique: cadre.id_ca,
      unite_indicateur_performance: data.unite_indicateur_performance,
      programme: programmeId,
    }

    try {
      let indicateurId = currentRow?.id_indicateur_performance

      if (isEditing && currentRow) {
        await updateMutation.mutateAsync({
          id: currentRow.id_indicateur_performance,
          data: payload,
        })
        indicateurId = currentRow.id_indicateur_performance
      } else {
        const created = await createMutation.mutateAsync(payload)
        indicateurId = created.id_indicateur_performance
      }

      if (indicateurId != null) {
        setIsSavingCibles(true)
        await syncCiblesIndicateurPerformanceProgramme({
          indicateurId,
          programmeId,
          cibles,
          existingCibles,
        })
      }

      toast.success(isEditing ? 'Indicateur mis à jour' : 'Indicateur créé')
      await onSuccess()
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Erreur lors de l'enregistrement de l'indicateur")
      )
    } finally {
      setIsSavingCibles(false)
    }
  }

  const config = useMemo(
    () =>
      getIndicateurPerformanceProjetFormConfigForDialog({
        isEditing,
        uniteOptions,
        isLoadingUnites,
      }),
    [isEditing, uniteOptions, isLoadingUnites]
  )

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    isSavingCibles

  return (
    <DynamicForm
      key={currentRow?.id_indicateur_performance ?? `new-${cadre.id_ca}`}
      embedded
      config={config}
      schema={indicateurPerformanceProgrammeFormSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitText={isEditing ? 'Mettre à jour' : 'Enregistrer'}
      loadingText='Enregistrement…'
      isLoading={isLoading}
      onCancel={onClose}
      cancelText='Retour'
      renderAfter={
        <CiblesAnnuellesProgramme
          onCiblesChange={setCibles}
          initialCibles={existingCibles}
        />
      }
    />
  )
}
