import { useMemo } from 'react'
import { z } from 'zod'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { useGetActeurs } from '@/simadou/allHooks/admin/acteurHooks'
import {
  useCreateCadreStrategique,
  useUpdateCadreStrategique,
} from '@/simadou/allHooks/admin/cadreStrategiqueHooks'
import type { CadreStrategique } from '@/simadou/allTypes/cadreStrategique'
import type { NiveauCadreStrategique } from '@/simadou/allTypes/niveauCadreStrategique'
import { getCadreStrategiqueFormConfigForDialog } from '@/simadou/allfieldsConfig/cadreStrategiqueForm'
import { buildCadreStrategiqueParentOptions } from '@/simadou/lib/cadreStrategiqueUtils'
import {
  cadreStrategiqueWriteSchema,
  type CadreStrategiqueWriteData,
} from '@/simadou/schemas/cadreStrategiqueSchemas'
import { toast } from 'sonner'
import { cadreStrategiqueToFormValues, getCadreStrategiqueSaveErrorMessage } from './cadreStrategiqueFormUtils'

export default function CadreStrategiqueFormPanel({
  programmeId,
  niveau,
  niveaux,
  cadres,
  cadre,
  onClose,
  onSuccess,
}: {
  programmeId: number
  niveau: NiveauCadreStrategique
  niveaux: NiveauCadreStrategique[]
  cadres: CadreStrategique[]
  cadre?: CadreStrategique | null
  onClose: () => void
  onSuccess: () => void
}) {
  const isEditing = !!cadre
  const createMutation = useCreateCadreStrategique()
  const updateMutation = useUpdateCadreStrategique(programmeId)
  const { data: acteurs = [], isLoading: isLoadingActeurs } = useGetActeurs()

  const codeLength = Number(niveau.code_number_nsc) || 2

  const schema = useMemo(
    () =>
      cadreStrategiqueWriteSchema.extend({
        code_cs: z
          .string()
          .min(1, 'Le code est obligatoire')
          .length(
            codeLength,
            `Le code doit contenir exactement ${codeLength} caractère(s) selon la configuration du niveau ${niveau.nombre_nsc}`
          ),
      }),
    [codeLength, niveau.nombre_nsc]
  )

  const parent = useMemo(
    () =>
      niveaux.find(
        (n) => Number(n.nombre_nsc) === Number(niveau.nombre_nsc) - 1
      ),
    [niveau, niveaux]
  )

  const parentOptions = useMemo(
    () =>
      buildCadreStrategiqueParentOptions({
        cadres,
        parentId: parent?.id_nsc,
        excludeCadreId: cadre?.id_cs,
      }),
    [cadres, parent?.id_nsc, cadre?.id_cs]
  )

  const acteurOptions = useMemo(
    () =>
      acteurs.map((a) => ({
        value: a.id_acteur,
        label: `${a.nom_acteur} (${a.code_acteur})`,
      })),
    [acteurs]
  )

  const showParent = niveau.nombre_nsc > 1

  const formConfig = useMemo(
    () =>
      getCadreStrategiqueFormConfigForDialog({
        parentOptions,
        acteurOptions,
        isLoadingActeurs,
        showParent,
        parentLabel: parent?.libelle_nsc,
        parentDisabled: parentOptions.length === 0,
        codeLength,
      }),
    [
      parentOptions,
      acteurOptions,
      isLoadingActeurs,
      showParent,
      parent?.libelle_nsc,
      codeLength,
    ]
  )

  const defaultValues = useMemo(
    () =>
      cadreStrategiqueToFormValues({
        cadre,
        programmeId,
        niveauCs: niveau.id_nsc,
        acteurs,
      }),
    [cadre, programmeId, niveau.id_nsc, acteurs]
  )

  const onSubmit = (data: CadreStrategiqueWriteData) => {
    const payload: CadreStrategiqueWriteData = {
      ...data,
      niveau_cs: niveau.id_nsc,
      programme_cs: programmeId,
      parent_cs: data.parent_cs || null,
      partenaire_cs: data.partenaire_cs ?? [],
    }

    const callbacks = {
      onSuccess: () => {
        toast.success(
          isEditing
            ? 'Cadre stratégique mis à jour avec succès'
            : 'Cadre stratégique ajouté avec succès'
        )
        onSuccess()
      },
      onError: (error: unknown) =>
        toast.error(getCadreStrategiqueSaveErrorMessage(error)),
    }

    if (isEditing && cadre) {
      updateMutation.mutate({ id: cadre.id_cs, data: payload }, callbacks)
      return
    }

    createMutation.mutate(payload, callbacks)
  }

  return (
    <DynamicForm
      key={cadre?.id_cs ?? `new-${niveau.id_nsc}`}
      config={formConfig}
      schema={schema}
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
