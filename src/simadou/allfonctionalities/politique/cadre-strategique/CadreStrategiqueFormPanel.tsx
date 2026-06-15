import { useMemo } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getCadreStrategiqueFormConfigForDialog } from '@/simadou/allfieldsConfig/cadreStrategiqueForm'
import type { CadreStrategique } from '@/simadou/allTypes/cadreStrategique'
import type { NiveauCadreStrategique } from '@/simadou/allTypes/niveauCadreStrategique'
import {
  cadreStrategiqueWriteSchema,
  type CadreStrategiqueWriteData,
} from '@/simadou/schemas/cadreStrategiqueSchemas'
import { useGetActeurs } from '@/simadou/allHooks/admin/acteurHooks'
import {
  useCreateCadreStrategique,
  useUpdateCadreStrategique,
} from '@/simadou/allHooks/admin/cadreStrategiqueHooks'
import {
  buildCadreStrategiqueParentOptions,
  getFixedCodeLengthForNiveauCs,
  getNiveauCadreStrategiqueLibelle,
} from '@/simadou/lib/cadreStrategiqueUtils'
import { cadreStrategiqueToFormValues } from './cadreStrategiqueFormUtils'

export default function CadreStrategiqueFormPanel({
  programmeId,
  codeProgramme,
  niveauCodeNumber,
  niveaux,
  cadres,
  cadre,
  onClose,
  onSuccess,
}: {
  programmeId: number
  codeProgramme?: string
  niveauCodeNumber: number
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

  const codeLength = getFixedCodeLengthForNiveauCs(
    niveaux,
    niveauCodeNumber,
    codeProgramme
  )

  const schema = useMemo(
    () =>
      cadreStrategiqueWriteSchema.extend({
        code_cs: z
          .string()
          .min(1, 'Le code est obligatoire')
          .length(
            codeLength,
            `Le code doit contenir exactement ${codeLength} caractère(s) selon la configuration du niveau ${niveauCodeNumber}`
          ),
      }),
    [codeLength, niveauCodeNumber]
  )

  const parentOptions = useMemo(
    () =>
      buildCadreStrategiqueParentOptions({
        cadres,
        niveauCodeNumber,
        excludeCadreId: cadre?.id_cs,
      }),
    [cadres, niveauCodeNumber, cadre?.id_cs]
  )

  const acteurOptions = useMemo(
    () =>
      acteurs.map((a) => ({
        value: a.id_acteur,
        label: `${a.nom_acteur} (${a.code_acteur})`,
      })),
    [acteurs]
  )

  const showParent = niveauCodeNumber > 1

  const parentLabel = useMemo(() => {
    const libelle = getNiveauCadreStrategiqueLibelle(
      niveaux,
      niveauCodeNumber - 1,
      codeProgramme
    )
    return libelle || 'Parent'
  }, [niveaux, niveauCodeNumber, codeProgramme])

  const formConfig = useMemo(
    () =>
      getCadreStrategiqueFormConfigForDialog({
        parentOptions,
        acteurOptions,
        isLoadingActeurs,
        showParent,
        parentLabel,
        parentDisabled: parentOptions.length === 0,
        codeLength,
      }),
    [
      parentOptions,
      acteurOptions,
      isLoadingActeurs,
      showParent,
      parentLabel,
      codeLength,
    ]
  )

  const defaultValues = useMemo(
    () =>
      cadreStrategiqueToFormValues({
        cadre,
        programmeId,
        niveauCodeNumber,
        acteurs,
      }),
    [cadre, programmeId, niveauCodeNumber, acteurs]
  )

  const onSubmit = (data: CadreStrategiqueWriteData) => {
    const payload: CadreStrategiqueWriteData = {
      ...data,
      niveau_cs: niveauCodeNumber,
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
      onError: () =>
        toast.error('Erreur lors de la sauvegarde du cadre stratégique'),
    }

    if (isEditing && cadre) {
      updateMutation.mutate({ id: cadre.id_cs, data: payload }, callbacks)
      return
    }

    createMutation.mutate(payload, callbacks)
  }

  return (
    <DynamicForm
      key={cadre?.id_cs ?? `new-${niveauCodeNumber}`}
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
