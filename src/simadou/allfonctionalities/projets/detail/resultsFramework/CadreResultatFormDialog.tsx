import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getCadreResultatFormConfigForDialog } from '@/simadou/allfieldsConfig/cadreResultatForm'
import {
  cadreResultatCreateSchema,
  type CadreResultatCreateData,
} from '@/simadou/schemas/cadreResultatSchemas'
import type { CadreResultat, NiveauCadreResultat } from '@/simadou/allTypes'
import { useGetActeurs } from '@/simadou/allHooks/admin/acteurHooks'
import {
  useCreateCadreResultat,
  useUpdateCadreResultat,
} from '@/simadou/allHooks/admin/cadreResultatHooks'
import {
  buildCadreParentOptions,
  resolveNiveauCrId,
  resolveParentCrCode,
  resolvePartenaireCode,
  resolveProjetCr,
  sortNiveauxCadreResultat,
} from '@/simadou/lib/cadreResultatUtils'
import { parseOptionalNumber } from '@/simadou/lib/resolveApiRelation'

export default function CadreResultatFormDialog({
  codeProjet,
  niveauId,
  niveaux,
  cadres,
  cadre,
  onClose,
  onSuccess,
}: {
  codeProjet: string
  niveauId: number
  niveaux: NiveauCadreResultat[]
  cadres: CadreResultat[]
  cadre?: CadreResultat | null
  onClose: () => void
  onSuccess: () => void
}) {
  const isEditing = !!cadre
  const createMutation = useCreateCadreResultat(codeProjet)
  const updateMutation = useUpdateCadreResultat()
  const { data: acteurs = [], isLoading: isLoadingActeurs } = useGetActeurs()

  const initialNiveauId =
    resolveNiveauCrId(cadre?.niveau_cr) ?? (cadre ? null : niveauId)
  const [selectedNiveauId, setSelectedNiveauId] = useState<number | null>(
    initialNiveauId
  )

  const sortedNiveaux = useMemo(() => sortNiveauxCadreResultat(niveaux), [niveaux])

  const niveauOptions = useMemo(
    () =>
      sortedNiveaux.map((n) => ({
        value: n.id_ncr,
        label: `${n.nombre_ncr} - ${n.libelle_ncr}`,
      })),
    [sortedNiveaux]
  )

  const acteurOptions = useMemo(
    () =>
      acteurs.map((a) => ({
        value: a.code_acteur,
        label: `${a.code_acteur} - ${a.nom_acteur}`,
      })),
    [acteurs]
  )

  const parentOptions = useMemo(
    () =>
      buildCadreParentOptions({
        cadres,
        niveaux: sortedNiveaux,
        selectedNiveauId,
        excludeCadreId: cadre?.id_cr,
      }),
    [cadres, sortedNiveaux, selectedNiveauId, cadre?.id_cr]
  )

  const showParent = selectedNiveauId != null && parentOptions.length > 0

  const config = useMemo(
    () =>
      getCadreResultatFormConfigForDialog({
        niveauOptions,
        parentOptions,
        acteurOptions,
        isLoadingActeurs,
        showParent,
        showProjet: true,
      }),
    [niveauOptions, parentOptions, acteurOptions, isLoadingActeurs, showParent]
  )

  const defaultValues = useMemo(
    (): CadreResultatCreateData => ({
      code_cr: cadre?.code_cr ?? '',
      intutile_cr: cadre?.intutile_cr ?? '',
      abgrege_cr: cadre?.abgrege_cr ?? '',
      cout_axe: cadre?.cout_axe ?? 0,
      etat: cadre?.etat ?? 'Actif',
      niveau_cr: initialNiveauId,
      partenaire_cr: resolvePartenaireCode(cadre?.partenaire_cr),
      parent_cr: resolveParentCrCode(cadre?.parent_cr),
      projet_cr: resolveProjetCr(cadre?.projet_cr) ?? (cadre ? null : codeProjet),
    }),
    [cadre, initialNiveauId, codeProjet]
  )

  const onSubmit = (data: CadreResultatCreateData) => {
    const payload: CadreResultatCreateData = {
      ...data,
      niveau_cr: data.niveau_cr ?? selectedNiveauId ?? niveauId ?? null,
      parent_cr: data.parent_cr || null,
      partenaire_cr: data.partenaire_cr || null,
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
          isEditing ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création'
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
      key={cadre?.id_cr ?? `new-${niveauId}`}
      config={config}
      schema={cadreResultatCreateSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitText={isEditing ? 'Modifier' : 'Créer'}
      loadingText='Enregistrement…'
      isLoading={createMutation.isPending || updateMutation.isPending}
      onCancel={onClose}
      cancelText='Annuler'
      onFieldChange={(fieldName, value) => {
        if (fieldName !== 'niveau_cr') return
        setSelectedNiveauId(parseOptionalNumber(value))
      }}
    />
  )
}
