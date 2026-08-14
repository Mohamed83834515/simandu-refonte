import { useMemo } from 'react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { getIndicateurContratFormConfig } from '@/simadou/allfieldsConfig/indicateurContratForm'
import {
  useCreateIndicateurContrat,
  useUpdateIndicateurContrat,
} from '@/simadou/allHooks/admin/indicateurContratHooks'
import { useGetUnitesIndicateur } from '@/simadou/allHooks/admin/uniteIndicateurHooks'
import { useMe } from '@/simadou/allHooks/auth/authHooks'
import type { CadreLogiqueClcp } from '@/simadou/allTypes/cadreLogiqueClcp'
import type { IndicateurContrat } from '@/simadou/allTypes/indicateurContrat'
import type { NiveauConfigClcp } from '@/simadou/allTypes/niveauConfigClcp'
import { filterCadresByNiveauClcp } from '@/simadou/lib/indicateurContratUtils'
import {
  indicateurContratCreateSchema,
  indicateurContratUpdateSchema,
  type IndicateurContratFormData,
} from '@/simadou/schemas/indicateurContratSchemas'
import {
  buildIndicateurContratPayload,
  indicateurContratToFormValues,
} from './indicateurContratFormUtils'

type Props = {
  idContrat: number
  niveau: NiveauConfigClcp
  cadres: CadreLogiqueClcp[]
  indicateur?: IndicateurContrat | null
  onClose: () => void
  onSuccess: () => void
}

export default function IndicateurContratFormDialog({
  idContrat,
  niveau,
  cadres,
  indicateur,
  onClose,
  onSuccess,
}: Props) {
  const isEditing = !!indicateur
  const { data: me } = useMe()
  const idPersonnel = me?.n_personnel

  const createMutation = useCreateIndicateurContrat(idContrat)
  const updateMutation = useUpdateIndicateurContrat(idContrat)
  const { data: unites = [], isLoading: isLoadingUnites } =
    useGetUnitesIndicateur()

  const cadresForNiveau = useMemo(
    () => filterCadresByNiveauClcp(cadres, niveau.id_niveau_ncl),
    [cadres, niveau.id_niveau_ncl]
  )

  const clcpOptions = useMemo(
    () =>
      cadresForNiveau.map((c) => ({
        value: c.id_clc,
        label: `${c.code_clc} — ${c.intitule_clc}`,
      })),
    [cadresForNiveau]
  )

  const uniteOptions = useMemo(
    () =>
      unites.map((u) => ({
        value: u.id_unite,
        label: `${u.unite_ui} — ${u.definition_ui}`,
      })),
    [unites]
  )

  const config = useMemo(
    () =>
      getIndicateurContratFormConfig({
        clcpOptions,
        uniteOptions,
        isLoadingUnites,
      }),
    [clcpOptions, uniteOptions, isLoadingUnites]
  )

  const defaultValues = useMemo(
    () =>
      indicateurContratToFormValues({
        indicateur,
        cadresForNiveau,
        idPersonnel,
      }),
    [indicateur, cadresForNiveau, idPersonnel]
  )

  const schema = isEditing
    ? indicateurContratUpdateSchema
    : indicateurContratCreateSchema

  const onSubmit = (data: IndicateurContratFormData) => {
    if (idPersonnel == null) {
      toast.error('Impossible d’identifier le personnel connecté.')
      return
    }

    const payload = buildIndicateurContratPayload({
      data,
      idPersonnel,
      existingMoyenVerification: indicateur?.moyen_verification,
    })

    const callbacks = {
      onSuccess: () => {
        toast.success(isEditing ? 'Indicateur mis à jour' : 'Indicateur créé')
        onSuccess()
      },
      onError: (error: unknown) =>
        toast.error(
          getApiErrorMessage(
            error,
            isEditing
              ? 'Erreur lors de la mise à jour'
              : 'Erreur lors de la création'
          )
        ),
    }

    if (isEditing && indicateur) {
      updateMutation.mutate(
        { id: indicateur.id_indicateur_contrat, data: payload },
        callbacks
      )
      return
    }

    createMutation.mutate(payload, callbacks)
  }

  if (cadresForNiveau.length === 0) {
    return (
      <p className='text-sm text-muted-foreground'>
        Aucun cadre logique pour ce niveau. Ajoutez d&apos;abord un cadre dans
        l&apos;onglet Cadre de résultat.
      </p>
    )
  }

  return (
    <DynamicForm
      key={`indicateur-contrat-${indicateur?.id_indicateur_contrat ?? 'new'}-${indicateur?.moyen_verification ?? ''}-${niveau.id_niveau_ncl}`}
      config={config}
      schema={schema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitText={isEditing ? 'Modifier' : 'Créer'}
      loadingText='Enregistrement…'
      isLoading={createMutation.isPending || updateMutation.isPending}
      onCancel={onClose}
      cancelText='Annuler'
      embedded
    />
  )
}
