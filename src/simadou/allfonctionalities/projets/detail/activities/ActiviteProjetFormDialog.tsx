import { useMemo } from 'react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getActiviteProjetFormConfigForDialog } from '@/simadou/allfieldsConfig/activiteProjetForm'
import {
  getActiviteProjetFormSchema,
  type ActiviteProjetFormData,
} from '@/simadou/schemas/activiteProjetSchemas'
import type { ActiviteProjet, NiveauActiviteProjet, Projet } from '@/simadou/allTypes'
import {
  useCreateActiviteProjet,
  useUpdateActiviteProjet,
} from '@/simadou/allHooks/admin/activiteProjetHooks'
import { useGetActivitesProgramme } from '@/simadou/allHooks/admin/activiteProgrammeHooks'
import { useGetAllProjets, useGetProjet } from '@/simadou/allHooks/admin/projetHooks'
import { getRouteApi } from '@tanstack/react-router'

function resolveCodeActiviteProgramme(
  value: ActiviteProjet['code_activite_programme']
): string | null {
  if (value == null || value === '') return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && 'code_ap' in value) {
    return value.code_ap ?? null
  }
  return null
}

export default function ActiviteProjetFormDialog({
  projet,
  niveau,
  niveaux,
  activite,
  parentOptions,
  onClose,
  onSuccess,
}: {
  projet: Projet
  niveau: number
  niveaux: NiveauActiviteProjet[]
  activite?: ActiviteProjet | null
  parentOptions: Array<{ value: number; label: string }>
  onClose: () => void
  onSuccess: () => void
}) {
  const codeProjet = projet.code_projet
  const isEditing = !!activite
  const createMutation = useCreateActiviteProjet(codeProjet)
  const updateMutation = useUpdateActiviteProjet(codeProjet)
  const { data: activitesProgramme = [], isLoading: isLoadingActivitesProgramme } =
    useGetActivitesProgramme()
  const { data: projets = [], isLoading: isLoadingProjets } = useGetAllProjets()

  const niveauConfig = useMemo(
    () =>
      niveaux.find((n) => Number(n.nombre_niveau_activite_projet) === niveau),
    [niveaux, niveau]
  )

  const fixedCodeLength = useMemo(
    () => Number(niveauConfig?.taille_code_niveau_activite_projet) || 2,
    [niveauConfig]
  )


      const route = getRouteApi('/_authenticated/programmation/projets/$id')
  
      const { id } = route.useParams()
      const { data: currentProjet } = useGetProjet(id)

  const parentNiveauLabel = useMemo(() => {
    const parentNiveau = niveaux.find(
      (n) => Number(n.nombre_niveau_activite_projet) === niveau - 1
    )
    return parentNiveau?.libelle_niveau_activite_projet ?? 'Activité parent'
  }, [niveaux, niveau])

  const activiteProgrammeOptions = useMemo(
    () =>
      activitesProgramme.map((ap) => ({
        value: ap.code_ap,
        label: `${ap.code_ap} — ${ap.intutile}`,
      })),
    [activitesProgramme]
  )

  const projetOptions = useMemo(
    () =>
      projets.map((p) => ({
        value: p.code_projet,
        label: `${p.code_projet} — ${p.intitule_projet}`,
      })),
    [projets]
  )

  const config = useMemo(
    () =>
      getActiviteProjetFormConfigForDialog({
        fixedCodeLength,
        parentNiveauLabel,
        showParent: niveau > 1,
        parentOptions,
        activiteProgrammeOptions,
        projetOptions,
        isLoadingActivitesProgramme,
        isLoadingProjets,
      }),
    [
      fixedCodeLength,
      parentNiveauLabel,
      niveau,
      parentOptions,
      activiteProgrammeOptions,
      projetOptions,
      isLoadingActivitesProgramme,
      isLoadingProjets,
    ]
  )

  const schema = useMemo(
    () =>
      getActiviteProjetFormSchema({
        fixedCodeLength,
        niveau,
        parentNiveauLabel,
      }),
    [fixedCodeLength, niveau, parentNiveauLabel]
  )

  const defaultValues = useMemo(
    (): ActiviteProjetFormData => ({
      code_activite_projet: activite?.code_activite_projet ?? '',
      intitule_activite_projet: activite?.intitule_activite_projet ?? '',
      niveau_activite_projet: niveau,
      parent_activite_projet:
        typeof activite?.parent_activite_projet === 'number'
          ? activite.parent_activite_projet
          : typeof activite?.parent_activite_projet === 'object' &&
              activite.parent_activite_projet
            ? activite.parent_activite_projet.id_activite_projet
            : null,
      code_activite_programme: resolveCodeActiviteProgramme(
        activite?.code_activite_programme
      ),
      code_projet: currentProjet?.code_projet,
    }),
    [activite, niveau]
  )

  const onSubmit = (data: ActiviteProjetFormData) => {
    if (!niveauConfig) {
      toast.error(
        `Le niveau ${niveau} n'est pas configuré. Configurez d'abord les niveaux d'activité projet.`
      )
      return
    }

    const payload: ActiviteProjetFormData = {
      ...data,
      niveau_activite_projet: niveau,
      parent_activite_projet: data.parent_activite_projet || null,
      code_activite_programme: data.code_activite_programme || null,
    }

    if (isEditing && activite) {
      updateMutation.mutate(
        { id: activite.id_activite_projet, data: payload },
        {
          onSuccess: () => {
            toast.success('Activité mise à jour')
            onSuccess()
          },
          onError: () => toast.error('Erreur lors de la mise à jour'),
        }
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Activité créée')
          onSuccess()
        },
        onError: () => toast.error("Erreur lors de la création de l'activité"),
      })
    }
  }

  return (
    <DynamicForm
      key={`${niveau}-${activite?.id_activite_projet ?? 'new'}`}
      config={config}
      schema={schema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitText={isEditing ? 'Mettre à jour' : 'Enregistrer'}
      loadingText='Enregistrement…'
      isLoading={createMutation.isPending || updateMutation.isPending}
      onCancel={onClose}
      cancelText='Retour'
    />
  )
}
