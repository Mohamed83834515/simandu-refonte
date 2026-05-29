import { useMemo } from 'react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getIndicateurCadreResultatFormConfigForDialog } from '@/simadou/allfieldsConfig/indicateurCadreResultatForm'
import {
  indicateurCadreResultatCreateSchema,
  type IndicateurCadreResultatCreateData,
} from '@/simadou/schemas/indicateursSchemas'
import type { IndicateurCadreResultat } from '@/simadou/allTypes'
import { useGetActeurs } from '@/simadou/allHooks/admin/acteurHooks'
import { useGetCadresResultat } from '@/simadou/allHooks/admin/cadreResultatHooks'
import { useGetProjets } from '@/simadou/allHooks/admin/projetHooks'
import {
  useCreateIndicateurCadreResultat,
  useUpdateIndicateurCadreResultat,
} from '@/simadou/allHooks/admin/indicateurCadreResultatHooks'
import {
  resolveRelationCode,
  resolveRelationId,
} from '@/simadou/lib/resolveApiRelation'

export default function IndicateurCadreResultatFormDialog({
  codeProjet,
  indicateur,
  onClose,
  onSuccess,
}: {
  codeProjet: string
  indicateur?: IndicateurCadreResultat | null
  onClose: () => void
  onSuccess: () => void
}) {
  const isEditing = !!indicateur
  const createMutation = useCreateIndicateurCadreResultat(codeProjet)
  const updateMutation = useUpdateIndicateurCadreResultat()
  const { data: cadres = [], isLoading: isLoadingCadres } = useGetCadresResultat()
  const { data: acteurs = [], isLoading: isLoadingActeurs } = useGetActeurs()
  const { data: projets = [], isLoading: isLoadingProjets } = useGetProjets()

  const cadreOptions = useMemo(
    () =>
      cadres.map((c) => ({
        value: c.code_cr,
        label: `${c.code_cr} - ${c.intutile_cr}`,
      })),
    [cadres]
  )

  const acteurOptions = useMemo(
    () =>
      acteurs.map((a) => ({
        value: String(a.id_acteur),
        label: `${a.code_acteur} - ${a.nom_acteur}`,
      })),
    [acteurs]
  )

  const projetOptions = useMemo(
    () =>
      projets.map((p) => ({
        value: p.code_projet,
        label: `${p.code_projet} - ${p.intitule_projet}`,
      })),
    [projets]
  )

  const config = useMemo(
    () =>
      getIndicateurCadreResultatFormConfigForDialog({
        cadreOptions,
        acteurOptions,
        projetOptions,
        isLoadingCadres,
        isLoadingActeurs,
        isLoadingProjets,
        showProjet: true,
      }),
    [
      cadreOptions,
      acteurOptions,
      projetOptions,
      isLoadingCadres,
      isLoadingActeurs,
      isLoadingProjets,
    ]
  )

  const defaultValues = useMemo(
    (): Partial<IndicateurCadreResultatCreateData> => ({
      niveau_iop: indicateur?.niveau_iop,
      code_indicateur_cr_iop: indicateur?.code_indicateur_cr_iop ?? '',
      code_cr_iop: resolveRelationCode(indicateur?.code_cr_iop, 'code_cr') ?? '',
      intitule_indicateur_cr_iop: indicateur?.intitule_indicateur_cr_iop ?? '',
      periodicite_iop: indicateur?.periodicite_iop ?? '',
      source_iop: indicateur?.source_iop ?? '',
      responsable_iop: indicateur?.responsable_iop ?? '',
      description_iop: indicateur?.description_iop ?? '',
      structure_iop:
        resolveRelationId(indicateur?.structure_iop, 'id_acteur')?.toString() ||
        undefined,
      projet_iop:
        resolveRelationCode(indicateur?.projet_iop, 'code_projet') ??
        (indicateur ? undefined : codeProjet),
    }),
    [codeProjet, indicateur]
  )

  const onSubmit = (data: IndicateurCadreResultatCreateData) => {
    const payload: IndicateurCadreResultatCreateData = {
      ...data,
      projet_iop: data.projet_iop || (isEditing ? undefined : codeProjet),
      structure_iop: data.structure_iop || undefined,
    }

    const callbacks = {
      onSuccess: () => {
        toast.success(isEditing ? 'Indicateur mis à jour' : 'Indicateur créé')
        onSuccess()
      },
      onError: () =>
        toast.error(
          isEditing
            ? 'Erreur lors de la mise à jour'
            : 'Erreur lors de la création'
        ),
    }

    if (isEditing && indicateur) {
      updateMutation.mutate(
        { id: indicateur.id_indicateur_cr_iop, data: payload },
        callbacks
      )
      return
    }

    createMutation.mutate(payload, callbacks)
  }

  return (
    <DynamicForm
      key={indicateur?.id_indicateur_cr_iop ?? 'new'}
      config={config}
      schema={indicateurCadreResultatCreateSchema}
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
