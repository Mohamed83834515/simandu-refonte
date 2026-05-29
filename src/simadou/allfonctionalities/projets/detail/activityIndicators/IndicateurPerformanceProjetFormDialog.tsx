import { useMemo } from 'react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getIndicateurPerformanceProjetFormConfigForDialog } from '@/simadou/allfieldsConfig/indicateurPerformanceProjetForm'
import {
  createIndicateurPerformanceProjetSchema,
  type CreateIndicateurPerformanceProjetFormData,
  type UpdateIndicateurPerformanceProjetFormData,
} from '@/simadou/schemas/indicateurPerformanceProjetSchemas'
import type { IndicateurPerformanceProjet } from '@/simadou/allTypes'
import { useGetAllActivitesProjet } from '@/simadou/allHooks/admin/activiteProjetHooks'
import {
  useCreateIndicateurPerformanceProjet,
  useUpdateIndicateurPerformanceProjet,
} from '@/simadou/allHooks/admin/indicateurPerformanceProjetHooks'
import { useGetAllProjets } from '@/simadou/allHooks/admin/projetHooks'
import { useGetUnitesIndicateur } from '@/simadou/allHooks/admin/uniteIndicateurHooks'

function resolveCodeProjet(v: unknown): string | null {
  if (v == null || v === '') return null
  if (typeof v === 'string') return v
  if (v && typeof v === 'object' && 'code_projet' in v) {
    const code = (v as { code_projet?: string }).code_projet
    return typeof code === 'string' ? code : null
  }
  return null
}

function resolveActiviteCode(v: unknown): string | null {
  if (v == null || v === '') return null
  if (typeof v === 'string') return v
  if (v && typeof v === 'object' && 'code_activite_projet' in v) {
    const code = (v as { code_activite_projet?: string }).code_activite_projet
    return typeof code === 'string' ? code : null
  }
  return null
}

function resolveUniteId(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v) && v > 0) return v
  if (v && typeof v === 'object' && 'id_unite' in v) {
    const id = Number((v as { id_unite: number }).id_unite)
    return Number.isFinite(id) && id > 0 ? id : null
  }
  return null
}

export default function IndicateurPerformanceProjetFormDialog({
  indicateur,
  onClose,
  onSuccess,
}: {
  indicateur?: IndicateurPerformanceProjet | null
  onClose: () => void
  onSuccess: () => void
}) {
  const isEditing = !!indicateur
  const createMutation = useCreateIndicateurPerformanceProjet(undefined)
  const updateMutation = useUpdateIndicateurPerformanceProjet(
    resolveCodeProjet(indicateur?.code_projet) ?? undefined
  )

  const { data: activites = [], isLoading: isLoadingActivites } =
    useGetAllActivitesProjet()
  const { data: unites = [], isLoading: isLoadingUnites } = useGetUnitesIndicateur()
  const { data: projets = [], isLoading: isLoadingProjets } = useGetAllProjets()

  const activiteOptions = useMemo(
    () =>
      activites.map((a) => ({
        value: a.code_activite_projet,
        label: `${a.code_activite_projet} — ${a.intitule_activite_projet}`,
      })),
    [activites]
  )

  const uniteOptions = useMemo(
    () =>
      unites.map((u) => ({
        value: u.id_unite,
        label: u.unite_ui,
      })),
    [unites]
  )

  const projetOptions = useMemo(
    () =>
      projets.map((p) => ({
        value: p.code_projet,
        label: `${p.code_projet} — ${p.intitule_projet}`,
      })),
    [projets]
  )

  const config = useMemo(
    () =>
      getIndicateurPerformanceProjetFormConfigForDialog({
        isEditing,
        activiteOptions,
        uniteOptions,
        projetOptions,
        isLoadingActivites,
        isLoadingUnites,
        isLoadingProjets,
      }),
    [
      isEditing,
      activiteOptions,
      uniteOptions,
      projetOptions,
      isLoadingActivites,
      isLoadingUnites,
      isLoadingProjets,
    ]
  )

  const defaultValues = useMemo(
    (): CreateIndicateurPerformanceProjetFormData => ({
      code_indicateur_performance: indicateur?.code_indicateur_performance ?? '',
      intitule_indicateur_tache: indicateur?.intitule_indicateur_tache ?? '',
      code_activite_projet: resolveActiviteCode(indicateur?.code_activite_projet),
      unite_indicateur_performance: resolveUniteId(
        indicateur?.unite_indicateur_performance
      ),
      code_projet: indicateur ? resolveCodeProjet(indicateur.code_projet) : null,
    }),
    [indicateur]
  )

  const onSubmit = (data: CreateIndicateurPerformanceProjetFormData) => {
    const payload = {
      ...data,
      code_projet: data.code_projet || null,
      code_activite_projet: data.code_activite_projet || null,
      unite_indicateur_performance: data.unite_indicateur_performance || null,
    }

    if (isEditing && indicateur) {
      updateMutation.mutate(
        {
          id: indicateur.id_indicateur_performance,
          data: payload as UpdateIndicateurPerformanceProjetFormData,
        },
        {
          onSuccess: () => {
            toast.success('Indicateur mis à jour')
            onSuccess()
          },
          onError: () => toast.error('Erreur lors de la mise à jour'),
        }
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Indicateur créé')
          onSuccess()
        },
        onError: () => toast.error("Erreur lors de la création de l'indicateur"),
      })
    }
  }

  return (
    <DynamicForm
      key={indicateur?.id_indicateur_performance ?? 'new'}
      config={config}
      schema={createIndicateurPerformanceProjetSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitText={isEditing ? 'Modifier' : 'Créer'}
      loadingText='Enregistrement…'
      isLoading={createMutation.isPending || updateMutation.isPending}
      onCancel={onClose}
      cancelText='Annuler'
    />
  )
}
