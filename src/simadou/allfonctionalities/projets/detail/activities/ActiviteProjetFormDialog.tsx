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
import { useGetProjets } from '@/simadou/allHooks/admin/projetHooks'

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
  niveauNombre,
  niveaux,
  activite,
  parentOptions,
  onClose,
  onSuccess,
}: {
  projet: Projet
  niveau: number
  niveauNombre: number
  niveaux: NiveauActiviteProjet[]
  activite?: ActiviteProjet | null
  parentOptions: Array<{ value: number; label: string }>
  onClose: () => void
  onSuccess: () => void
}) {
  console.log('niveau', niveau)
  console.log('niveaux', niveaux)
  // ✅ Extraire le code_projet (peut être string ou objet)
 const codeProjet = projet.code_projet

  const isEditing = !!activite
  const createMutation = useCreateActiviteProjet(codeProjet)
  const updateMutation = useUpdateActiviteProjet(codeProjet)
  const { data: activitesProgramme = [], isLoading: isLoadingActivitesProgramme } =
    useGetActivitesProgramme()
  const { data: projets = [], isLoading: isLoadingProjets } = useGetProjets()

  // ✅ Trouver le niveau correspondant
  const niveauConfig = useMemo(
    () =>
      niveaux.find((n) => Number(n.id_niveau_activite_projet) === niveau),
    [niveaux, niveau]
  )

  const fixedCodeLength = useMemo(
    () => Number(niveauConfig?.taille_code_niveau_activite_projet) || 2,
    [niveauConfig]
  )

  const parentNiveauLabel = useMemo(() => {
    const parentNiveau = niveaux.find(
      (n) => Number(n.nombre_niveau_activite_projet) === niveauNombre - 1
    )
    return parentNiveau?.libelle_niveau_activite_projet ?? 'Activité parent'
  }, [niveaux, niveauNombre])

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
        showParent: niveauNombre > 1,
        parentOptions,
        activiteProgrammeOptions,
        projetOptions,
        isLoadingActivitesProgramme,
        isLoadingProjets,
      }),
    [
      fixedCodeLength,
      parentNiveauLabel,
      niveauNombre,
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
        niveauNombre,
        parentNiveauLabel,
      }),
    [fixedCodeLength, niveauNombre, parentNiveauLabel]
  )

  // ✅ Extraire la valeur du code_projet de l'activité si c'est un objet
  const getActiviteCodeProjet = useMemo(() => {
    const code = activite?.code_projet
    if (!code) return ''
    return typeof code === 'string' ? code : code?.code_projet || ''
  }, [activite?.code_projet])

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
      // ✅ Utiliser le code_projet extrait
      code_projet: getActiviteCodeProjet || codeProjet,
    }),
    [activite, niveau, getActiviteCodeProjet, codeProjet]
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
      // ✅ S'assurer que code_projet est une string
      code_projet: typeof data.code_projet === 'string' 
        ? data.code_projet 
        : data.code_projet|| codeProjet,
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