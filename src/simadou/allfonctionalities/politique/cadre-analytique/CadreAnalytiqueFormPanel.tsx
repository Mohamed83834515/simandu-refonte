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
  filterNiveauxByProgramme,
  getFixedCodeLengthForNiveau,
  getNiveauCadreAnalytiqueLibelle,
  sortNiveauxCadreAnalytique,
} from '@/simadou/lib/cadreAnalytiqueUtils'
import { cadreAnalytiqueToFormValues } from './cadreAnalytiqueFormUtils'

export default function CadreAnalytiqueFormPanel({
  programmeId,
  codeProgramme,
  niveauCodeNumber,
  niveaux,
  niveauId,
  cadres,
  cadre,
  onClose,
  onSuccess,
}: {
  programmeId: number
  codeProgramme?: string
  niveauCodeNumber: number
  niveauId: number
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

  const showParent = niveauCodeNumber > 1

  const showBudget = useMemo(() => {
    const scoped = sortNiveauxCadreAnalytique(
      filterNiveauxByProgramme(niveaux, codeProgramme, programmeId)
    )
    if (scoped.length === 0) return false
    const lastNiveauOrder = Number(scoped[scoped.length - 1].nombre_nca)
    return niveauCodeNumber === lastNiveauOrder
  }, [niveaux, codeProgramme, programmeId, niveauCodeNumber])

  const schema = useMemo(() => {
    const withCode = cadreAnalytiqueWriteSchema.extend({
      code_ca: z
        .string()
        .min(1, 'Le code est obligatoire')
        .length(
          codeLength,
          `Le code doit contenir exactement ${codeLength} caractère(s) selon la configuration du niveau ${niveauCodeNumber}`
        ),
    })

    return showBudget ? withCode : withCode.omit({ cout_axe: true })
  }, [codeLength, niveauCodeNumber, showBudget])
  const parentNIveauId = useMemo(() => {
    if (!showParent) return null
    const parentNiveau = niveaux.find(
      (n) => Number(n.nombre_nca) === niveauCodeNumber - 1
    )
    return parentNiveau?.id_nca ?? null
  }, [niveaux, niveauCodeNumber, showParent])
  const parentOptions = useMemo(
    () =>
      buildCadreAnalytiqueParentOptions({
        cadres,
        parentNIveauId,
        excludeCadreId: cadre?.id_ca,
      }),
    [cadres, parentNIveauId, cadre?.id_ca]
  )

  const acteurOptions = useMemo(
    () =>
      acteurs.map((a) => ({
        value: a.id_acteur,
        label: `${a.nom_acteur} (${a.code_acteur})`,
      })),
    [acteurs]
  )

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
        showBudget,
        parentLabel,
        parentDisabled: parentOptions.length === 0,
        codeLength,
      }),
    [
      parentOptions,
      acteurOptions,
      isLoadingActeurs,
      showParent,
      showBudget,
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
        showBudget,
      }),
    [cadre, programmeId, niveauCodeNumber, acteurs, showBudget]
  )

  const onSubmit = (data: CadreAnalytiqueWriteData) => {
    const payload: CadreAnalytiqueWriteData = {
      ...data,
      niveau_ca: niveauId,
      programme_ca: programmeId,
      parent_ca: data.parent_ca || null,
      partenaire_ca: data.partenaire_ca ?? [],
      ...(showBudget
        ? {}
        : { cout_axe: cadre?.cout_axe ?? 0 }),
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
      key={cadre?.id_ca ?? `new-${niveauId}`}
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
