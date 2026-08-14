import { useMemo } from 'react'
import z from 'zod'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import {
  useCreateCadreResultat,
  useUpdateCadreResultat,
} from '@/simadou/allHooks/admin/cadreResultatHooks'
import type { CadreResultat, NiveauCadreResultat } from '@/simadou/allTypes'
import { getCadreResultatFormConfigForDialog } from '@/simadou/allfieldsConfig/cadreResultatForm'
import {
  buildCadreParentOptions,
  resolveNiveauCrId,
  resolveParentCrCode,
  resolveProjetCr,
} from '@/simadou/lib/cadreResultatUtils'
import {
  cadreResultatCreateSchema,
  type CadreResultatCreateData,
} from '@/simadou/schemas/cadreResultatSchemas'
import { toast } from 'sonner'

export default function CadreResultatFormDialog({
  codeProjet,
  niveau,
  niveaux,
  cadres,
  cadre,
  onClose,
  onSuccess,
}: {
  codeProjet: string
  niveau: NiveauCadreResultat
  niveaux: NiveauCadreResultat[]
  cadres: CadreResultat[]
  cadre?: CadreResultat | null
  onClose: () => void
  onSuccess: () => void
}) {
  const isEditing = !!cadre
  const createMutation = useCreateCadreResultat(codeProjet)
  const updateMutation = useUpdateCadreResultat()

  const codeLength = Number(niveau?.code_number_ncr) || 2

  const schema = useMemo(
    () =>
      cadreResultatCreateSchema.extend({
        code_cr: z
          .string()
          .min(1, 'Le code est obligatoire')
          .length(
            codeLength,
            `Le code doit contenir exactement ${codeLength} caractère(s) selon la configuration du niveau ${niveau.nombre_ncr}`
          ),
      }),
    [codeLength, niveau.nombre_ncr]
  )

  const initialNiveauId =
    resolveNiveauCrId(cadre?.niveau_cr) ?? (cadre ? null : niveau?.id_ncr)

  const parent = niveaux.find(
    (n) => Number(n.nombre_ncr) == Number(niveau?.nombre_ncr) - 1
  )

  const parentOptions = useMemo(
    () =>
      buildCadreParentOptions({
        cadres,
        parentId: parent?.id_ncr,
        excludeCadreId: cadre?.id_cr,
      }),
    [cadres, parent?.id_ncr, cadre?.id_cr]
  )
  const showParent = niveau?.nombre_ncr > 1

  const config = useMemo(
    () =>
      getCadreResultatFormConfigForDialog({
        parentOptions,
        parentLabel: parent?.libelle_ncr || 'Parent',
        showParent,
        showProjet: true,
        codeLength,
      }),
    [parentOptions, parent?.libelle_ncr, showParent, codeLength]
  )

  const defaultValues = useMemo(
    (): CadreResultatCreateData => ({
      code_cr: cadre?.code_cr ?? '',
      intutile_cr: cadre?.intutile_cr ?? '',
      abgrege_cr: cadre?.abgrege_cr ?? '',
      etat: cadre?.etat ?? 'Actif',
      niveau_cr: initialNiveauId,
      parent_cr: resolveParentCrCode(cadre?.parent_cr),
      projet_cr:
        resolveProjetCr(cadre?.projet_cr) ?? (cadre ? null : codeProjet),
    }),
    [cadre, initialNiveauId, codeProjet]
  )

  const onSubmit = (data: CadreResultatCreateData) => {
    const payload: CadreResultatCreateData = {
      ...data,
      niveau_cr: data.niveau_cr ?? niveau.id_ncr ?? null,
      parent_cr: data.parent_cr || null,
      projet_cr: data.projet_cr || (isEditing ? null : codeProjet) || null,
      etat: data.etat || 'Actif',
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
      updateMutation.mutate({ id: cadre.id_cr, data: payload }, callbacks)
      return
    }

    createMutation.mutate(payload, callbacks)
  }

  return (
    <DynamicForm
      key={cadre?.id_cr ?? `new-${niveau}`}
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
