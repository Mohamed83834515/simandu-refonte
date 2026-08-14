import { useMemo } from 'react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import type { Ptba, TacheActivitePtba } from '@/simadou/allTypes'
import {
  createTacheActivitePtbaSchema,
  type TacheActivitePtbaFormData,
} from '@/simadou/schemas/tacheActivitePtbaSchemas'
import {
  useCreateTacheActivite,
  useUpdateTacheActivite,
} from '@/simadou/allHooks/admin/tacheActiviteHooks'
import { getTacheActivitePtbaFormConfigForDialog } from '@/simadou/allfieldsConfig/tacheActivitePtbaForm'
import { useMe } from '@/simadou/allHooks/auth/authHooks'
import { useGetPersonnels } from '@/simadou/allHooks/admin/personnelHooks'
import {
  buildTacheActivitePtbaPayload,
  getMaxAssignableProportion,
  parseTacheProportion,
  resolvePersonnelFormValue,
} from '@/simadou/lib/tacheActivitePtbaUtils'

interface TacheActivitePtbaFormProps {
  tache?: TacheActivitePtba
  activite: Ptba
  existingTaches: TacheActivitePtba[]
  onClose: () => void
  onSuccess: () => void
}

export default function TacheActiviteForm({
  tache,
  activite,
  existingTaches,
  onClose,
  onSuccess,
}: TacheActivitePtbaFormProps) {
  const isEditing = !!tache
  const { data: user } = useMe()
  const { data: personnels = [], isLoading: isLoadingPersonnels } =
    useGetPersonnels()

  const maxProportion = useMemo(
    () =>
      getMaxAssignableProportion(
        existingTaches,
        tache?.id_groupe_tache ?? null
      ),
    [existingTaches, tache?.id_groupe_tache]
  )

  const schema = useMemo(
    () => createTacheActivitePtbaSchema(maxProportion),
    [maxProportion]
  )

  const formConfig = useMemo(
    () =>
      getTacheActivitePtbaFormConfigForDialog({
        personnelOptions: personnels.map((p) => ({
          value: p.n_personnel!,
          label: `${p.prenom_perso ?? ''} ${p.nom_perso ?? ''}`.trim(),
        })),
        isLoadingPersonnels,
        maxProportion,
      }),
    [personnels, isLoadingPersonnels, maxProportion]
  )
  const idActivite = activite.id_ptba
  const defaultValues = useMemo(
    (): TacheActivitePtbaFormData => ({
      intutile_tache_gt: tache?.intutile_tache_gt || '',
      proportion_gt: Math.min(
        parseTacheProportion(tache?.proportion_gt),
        maxProportion
      ),
      code_tache_gt: tache?.code_tache_gt || '',
      date_debut_gt: tache?.date_debut_gt || '',
      date_fin_gt: tache?.date_fin_gt || '',
      n_lot_gt: tache?.n_lot_gt || 1,
      observation_gt: tache?.observation_gt || '',
      id_personnel_gt:
        resolvePersonnelFormValue(tache?.id_personnel_gt) ?? user?.n_personnel,
      responsable_gt: resolvePersonnelFormValue(tache?.responsable_gt),
      id_activite: Number(idActivite),
    }),
    [tache, idActivite, user?.n_personnel, maxProportion]
  )

  const createMutation = useCreateTacheActivite(idActivite)
  const updateMutation = useUpdateTacheActivite(idActivite)

  const onSubmit = (data: TacheActivitePtbaFormData) => {
    if (data.proportion_gt > maxProportion) {
      toast.error(
        `La proportion ne peut pas dépasser ${maxProportion}% (total ≤ 100%)`
      )
      return
    }

    const payload = buildTacheActivitePtbaPayload(data, Number(idActivite))

    if (isEditing && tache?.id_groupe_tache) {
      updateMutation.mutate(
        { id: tache.id_groupe_tache, data: payload },
        {
          onSuccess: () => {
            toast.success('Tache mise à jour avec succès')
            onSuccess()
          },
          onError: () => toast.error('Erreur lors de la mise à jour'),
        }
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Tache Planifiée avec succès')
          onSuccess()
        },
        onError: () => toast.error("Erreur lors de l'enregistrement"),
      })
    }
  }

  return (
    <DynamicForm
      key={`${tache?.id_groupe_tache ?? 'new'}-${maxProportion}`}
      config={formConfig}
      schema={schema}
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
