import { useMemo } from 'react'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { useGetActeurs } from '@/simadou/allHooks/admin/acteurHooks'
import { useGetCadresStrategique } from '@/simadou/allHooks/admin/cadreStrategiqueHooks'
import {
  useCreateIndicateurStrategique,
  useUpdateIndicateurStrategique,
} from '@/simadou/allHooks/admin/indicateurStrategiqueHooks'
import { useGetPersonnels } from '@/simadou/allHooks/admin/personnelHooks'
import type { IndicateurStrategique } from '@/simadou/allTypes/indicateurStrategique'
import { getIndicateurStrategiqueFormConfigForDialog } from '@/simadou/allfieldsConfig/indicateurStrategiqueForm'

import {
  indicateurStrategiqueWriteSchema,
  type IndicateurStrategiqueWriteData,
} from '@/simadou/schemas/indicateurStrategiqueSchemas'
import { toast } from 'sonner'
import {
  buildIndicateurStrategiquePayload,
  indicateurStrategiqueToFormValues,
} from './indicateurStrategiqueFormUtils'
import { resolveNiveauCsNumber } from '@/simadou/lib/cadreStrategiqueUtils'
import { getApiErrorMessage } from '@/lib/api-error-message'

export default function IndicateurStrategiqueFormPanel({
  codeProgramme,
  niveauId,
  indicateur,
  onClose,
  onSuccess,
}: {
  codeProgramme: string
  niveauId: number
  indicateur?: IndicateurStrategique | null
  onClose: () => void
  onSuccess: () => void
}) {
  const isEditing = !!indicateur
  const createMutation = useCreateIndicateurStrategique()
  const updateMutation = useUpdateIndicateurStrategique()
  const { data: cadres = [], isLoading: isLoadingCadres } =
    useGetCadresStrategique()
  const { data: acteurs = [], isLoading: isLoadingActeurs } = useGetActeurs()
  const { data: personnels = [], isLoading: isLoadingPersonnels } =
    useGetPersonnels()
  console.log('niveauId', niveauId)
  const cadreOptions = useMemo(
    () =>
      cadres
        .filter((c) => resolveNiveauCsNumber(c.niveau_cs) === niveauId)
        .map((c) => ({
          value: String(c.id_cs),
          label: `${c.code_cs} — ${c.intutile_cs}`,
        })),
    [cadres, niveauId ]
  )

  const acteurOptions = useMemo(
    () =>
      acteurs
        .filter((a) => a.code_acteur)
        .map((a) => ({
          value: a.code_acteur!,
          label: a.nom_acteur,
        })),
    [acteurs]
  )

  const personnelOptions = useMemo(
    () =>
      personnels
        .filter((p) => p.id_personnel_perso != null)
        .map((p) => ({
          value: String(p.id_personnel_perso),
          label: [p.prenom_perso, p.nom_perso].filter(Boolean).join(' ') || '—',
        })),
    [personnels]
  )

  const formConfig = useMemo(
    () =>
      getIndicateurStrategiqueFormConfigForDialog({
        cadreOptions,
        acteurOptions,
        personnelOptions,
        isLoadingCadres,
        isLoadingActeurs,
        isLoadingPersonnels,
      }),
    [
      cadreOptions,
      acteurOptions,
      personnelOptions,
      isLoadingCadres,
      isLoadingActeurs,
      isLoadingPersonnels,
    ]
  )

  const defaultValues = useMemo(
    () =>
      indicateurStrategiqueToFormValues({
        indicateur,
        codeProgramme,
        niveauId,
      }),
    [indicateur, codeProgramme, niveauId]
  )

  const onSubmit = (data: IndicateurStrategiqueWriteData) => {
    const payload = buildIndicateurStrategiquePayload({
      data,
      codeProgramme,
      niveauId,
    })

    const callbacks = {
      onSuccess: () => {
        toast.success(isEditing ? 'Indicateur mis à jour' : 'Indicateur ajouté')
        onSuccess()
      },
      onError: (error: unknown) =>
        toast.error(getApiErrorMessage(error, "Erreur lors de l'enregistrement")),
    }

    if (isEditing && indicateur) {
      updateMutation.mutate(
        { id: indicateur.id_indicateur_str, data: payload },
        callbacks
      )
      return
    }

    createMutation.mutate(payload, callbacks)
  }

  return (
    <DynamicForm
      key={indicateur?.id_indicateur_str ?? `new-${niveauId}`}
      config={formConfig}
      schema={indicateurStrategiqueWriteSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitText={isEditing ? 'Mettre à jour' : 'Ajouter'}
      loadingText='Enregistrement…'
      isLoading={createMutation.isPending || updateMutation.isPending}
      onCancel={onClose}
      cancelText='Annuler'
    />
  )
}
