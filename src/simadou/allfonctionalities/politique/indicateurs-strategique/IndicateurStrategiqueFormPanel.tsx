import { useMemo } from 'react'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getIndicateurStrategiqueFormConfigForDialog } from '@/simadou/allfieldsConfig/indicateurStrategiqueForm'
import type { IndicateurStrategique } from '@/simadou/allTypes/indicateurStrategique'
import {
  indicateurStrategiqueWriteSchema,
  type IndicateurStrategiqueWriteData,
} from '@/simadou/schemas/indicateurStrategiqueSchemas'
import { useGetActeurs } from '@/simadou/allHooks/admin/acteurHooks'
import {
  useCreateIndicateurStrategique,
  useUpdateIndicateurStrategique,
} from '@/simadou/allHooks/admin/indicateurStrategiqueHooks'
import { useGetCadresStrategique } from '@/simadou/allHooks/admin/cadreStrategiqueHooks'
import { useGetPersonnels } from '@/simadou/allHooks/admin/personnelHooks'
import { resolveNiveauCsNumber } from '@/simadou/lib/cadreStrategiqueUtils'
import {
  buildIndicateurStrategiquePayload,
  indicateurStrategiqueToFormValues,
} from './indicateurStrategiqueFormUtils'

function formatSaveError(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data
    if (data && typeof data === 'object') {
      const messages = Object.values(data as Record<string, unknown>)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .filter((value): value is string => typeof value === 'string')
      if (messages.length > 0) return messages.join(' ')
    }
  }
  return "Erreur lors de l'enregistrement"
}

export default function IndicateurStrategiqueFormPanel({
  programmeId,
  codeProgramme,
  niveauCodeNumber,
  indicateur,
  onClose,
  onSuccess,
}: {
  programmeId: number
  codeProgramme: string
  niveauCodeNumber: number
  indicateur?: IndicateurStrategique | null
  onClose: () => void
  onSuccess: () => void
}) {
  const isEditing = !!indicateur
  const createMutation = useCreateIndicateurStrategique()
  const updateMutation = useUpdateIndicateurStrategique()
  const { data: cadres = [], isLoading: isLoadingCadres } =
    useGetCadresStrategique(programmeId)
  const { data: acteurs = [], isLoading: isLoadingActeurs } = useGetActeurs()
  const { data: personnels = [], isLoading: isLoadingPersonnels } =
    useGetPersonnels()

  const cadreOptions = useMemo(
    () =>
      cadres
        .filter(
          (c) => resolveNiveauCsNumber(c.niveau_cs) === niveauCodeNumber
        )
        .map((c) => ({
          value: String(c.id_cs),
          label: `${c.code_cs} — ${c.intutile_cs}`,
        })),
    [cadres, niveauCodeNumber]
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
        niveauCodeNumber,
      }),
    [indicateur, codeProgramme, niveauCodeNumber]
  )

  const onSubmit = (data: IndicateurStrategiqueWriteData) => {
    const payload = buildIndicateurStrategiquePayload({
      data,
      codeProgramme,
      niveauCodeNumber,
    })

    const callbacks = {
      onSuccess: () => {
        toast.success(
          isEditing ? 'Indicateur mis à jour' : 'Indicateur ajouté'
        )
        onSuccess()
      },
      onError: (error: unknown) => toast.error(formatSaveError(error)),
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
      key={indicateur?.id_indicateur_str ?? `new-${niveauCodeNumber}`}
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
