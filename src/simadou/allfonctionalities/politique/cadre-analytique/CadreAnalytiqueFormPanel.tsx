import { useMemo } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getCadreAnalytiqueFormConfigForDialog } from '@/simadou/allfieldsConfig/cadreAnalytiqueForm'
import type { CadreAnalytique, NiveauCadreAnalytique } from '@/simadou/allTypes/cadreAnalytique'
import {
  cadreAnalytiqueWriteSchema,
  type CadreAnalytiqueWriteData,
} from '@/simadou/schemas/cadreAnalytiqueSchemas'
import { useGetActeurs } from '@/simadou/allHooks/admin/acteurHooks'
import {
  useCreateCadreAnalytique,
  useUpdateCadreAnalytique,
} from '@/simadou/allHooks/admin/cadreAnalytiqueHooks'
import {
  buildCadreAnalytiqueParentOptions,
  getFixedCodeLengthForNiveau,
  getNiveauCadreAnalytiqueLibelle,
} from '@/simadou/lib/cadreAnalytiqueUtils'
import { cadreAnalytiqueToFormValues } from './cadreAnalytiqueFormUtils'

export default function CadreAnalytiqueFormPanel({
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
  niveaux: NiveauCadreAnalytique[]
  cadres: CadreAnalytique[]
  cadre?: CadreAnalytique | null
  onClose: () => void
  onSuccess: () => void
}) {
  const isEditing = !!cadre
  const createMutation = useCreateCadreAnalytique()
  const updateMutation = useUpdateCadreAnalytique(programmeId)
  const { data: acteurs = [], isLoading: isLoadingActeurs } = useGetActeurs()

  const codeLength = getFixedCodeLengthForNiveau(
    niveaux,
    niveauCodeNumber,
    codeProgramme
  )

  const schema = useMemo(
    () =>
      cadreAnalytiqueWriteSchema.extend({
        code_ca: z
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
      buildCadreAnalytiqueParentOptions({
        cadres,
        niveauCodeNumber,
        excludeCadreId: cadre?.id_ca,
      }),
    [cadres, niveauCodeNumber, cadre?.id_ca]
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
    const libelle = getNiveauCadreAnalytiqueLibelle(
      niveaux,
      niveauCodeNumber - 1,
      codeProgramme
    )
    return libelle || 'Parent'
  }, [niveaux, niveauCodeNumber, codeProgramme])

  const formConfig = useMemo(
    () =>
      getCadreAnalytiqueFormConfigForDialog({
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
      cadreAnalytiqueToFormValues({
        cadre,
        programmeId,
        niveauCodeNumber,
        acteurs,
      }),
    [cadre, programmeId, niveauCodeNumber, acteurs]
  )

  const onSubmit = (data: CadreAnalytiqueWriteData) => {
    const payload: CadreAnalytiqueWriteData = {
      ...data,
      niveau_ca: niveauCodeNumber,
      programme_ca: programmeId,
      parent_ca: data.parent_ca || null,
      partenaire_ca: data.partenaire_ca ?? [],
    }

    const callbacks = {
      onSuccess: () => {
        toast.success(
          isEditing
            ? 'Cadre analytique mis à jour avec succès'
            : 'Cadre analytique ajouté avec succès'
        )
        onSuccess()
      },
      onError: () =>
        toast.error('Erreur lors de la sauvegarde du cadre analytique'),
    }

    if (isEditing && cadre) {
      updateMutation.mutate(
        {
          ...cadre,
          ...payload,
          id_ca: cadre.id_ca,
        },
        callbacks
      )
      return
    }

    createMutation.mutate(payload, callbacks)
  }

  return (
    <DynamicForm
      key={cadre?.id_ca ?? `new-${niveauCodeNumber}`}
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
