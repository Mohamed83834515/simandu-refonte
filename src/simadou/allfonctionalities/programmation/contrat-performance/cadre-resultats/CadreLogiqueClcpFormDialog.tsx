import { useMemo } from 'react'
import z from 'zod'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { useMe } from '@/simadou/allHooks/auth/authHooks'
import {
  useCreateCadreLogiqueClcp,
  useUpdateCadreLogiqueClcp,
} from '@/simadou/allHooks/admin/cadreLogiqueClcpHooks'
import type { CadreLogiqueClcp } from '@/simadou/allTypes/cadreLogiqueClcp'
import type { NiveauConfigClcp } from '@/simadou/allTypes/niveauConfigClcp'
import { getCadreLogiqueClcpFormConfig } from '@/simadou/allfieldsConfig/cadreLogiqueClcpForm'
import {
  buildCadreParentClcpOptions,
  getFixedCodeLengthForNiveauClcp,
  getNiveauClcpLabel,
  resolveNiveauClcId,
  resolveParentClcId,
} from '@/simadou/lib/cadreLogiqueClcpUtils'
import {
  cadreLogiqueClcpCreateSchema,
  type CadreLogiqueClcpCreateData,
} from '@/simadou/schemas/cadreLogiqueClcpSchemas'

type Props = {
  idContrat: number
  niveau: NiveauConfigClcp
  niveaux: NiveauConfigClcp[]
  cadres: CadreLogiqueClcp[]
  cadre?: CadreLogiqueClcp | null
  onClose: () => void
  onSuccess: () => void
}

export default function CadreLogiqueClcpFormDialog({
  idContrat,
  niveau,
  niveaux,
  cadres,
  cadre,
  onClose,
  onSuccess,
}: Props) {
  const isEditing = !!cadre
  const { data: me } = useMe()
  const createMutation = useCreateCadreLogiqueClcp(idContrat)
  const updateMutation = useUpdateCadreLogiqueClcp(idContrat)

  const codeLength = getFixedCodeLengthForNiveauClcp(
    niveaux,
    niveau.id_niveau_ncl
  )

  const schema = useMemo(
    () =>
      cadreLogiqueClcpCreateSchema.extend({
        code_clc: z
          .string()
          .min(1, 'Le code est obligatoire')
          .length(
            codeLength,
            `Le code doit contenir exactement ${codeLength} caractère(s) selon la configuration du niveau ${niveau.nombre_ncl}`
          ),
      }),
    [codeLength, niveau.nombre_ncl]
  )

  const initialNiveauId =
    resolveNiveauClcId(cadre?.niveau_clc) ??
    (cadre ? null : niveau.id_niveau_ncl)

  const parent = niveaux.find(
    (n) => Number(n.nombre_ncl) === Number(niveau.nombre_ncl) - 1
  )

  const parentOptions = useMemo(
    () =>
      buildCadreParentClcpOptions({
        cadres,
        parentNiveauId: parent?.id_niveau_ncl,
        excludeCadreId: cadre?.id_clc,
      }),
    [cadres, parent?.id_niveau_ncl, cadre?.id_clc]
  )

  const showParent = niveau.nombre_ncl > 1

  const config = useMemo(
    () =>
      getCadreLogiqueClcpFormConfig({
        parentOptions,
        parentLabel: parent ? getNiveauClcpLabel(parent) : 'Parent',
        showParent,
        codeLength,
      }),
    [parentOptions, parent, showParent, codeLength]
  )

  const defaultValues = useMemo(
    (): CadreLogiqueClcpCreateData => ({
      code_clc: cadre?.code_clc ?? '',
      intitule_clc: cadre?.intitule_clc ?? '',
      etat: cadre?.etat ?? true,
      niveau_clc: initialNiveauId,
      parent_clc: resolveParentClcId(cadre?.parent_clc),
      contrat: idContrat,
      id_personnel: me?.n_personnel,
    }),
    [cadre, initialNiveauId, idContrat, me?.n_personnel]
  )

  const onSubmit = (data: CadreLogiqueClcpCreateData) => {
    const idPersonnel = me?.n_personnel
    if (idPersonnel == null) {
      toast.error('Impossible d’identifier le personnel connecté.')
      return
    }

    const payload = {
      code_clc: data.code_clc,
      intitule_clc: data.intitule_clc,
      etat: data.etat ?? true,
      niveau_clc: data.niveau_clc ?? niveau.id_niveau_ncl,
      parent_clc: data.parent_clc ?? null,
      contrat: idContrat,
      id_personnel: idPersonnel,
    }

    const callbacks = {
      onSuccess: () => {
        toast.success(isEditing ? 'Cadre mis à jour' : 'Cadre créé')
        onSuccess()
      },
      onError: () =>
        toast.error(
          isEditing
            ? 'Erreur lors de la mise à jour'
            : 'Erreur lors de la création'
        ),
    }

    if (isEditing && cadre) {
      updateMutation.mutate({ id: cadre.id_clc, data: payload }, callbacks)
      return
    }

    createMutation.mutate(payload, callbacks)
  }

  return (
    <DynamicForm
      key={cadre?.id_clc ?? `new-${niveau.id_niveau_ncl}`}
      config={config}
      schema={schema}
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
