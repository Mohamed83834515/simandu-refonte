// simadou/allfonctionalities/parametrage/localite/AddLocalite.tsx
import { useMemo } from 'react'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { localiteSchema } from '@/simadou/schemas/localiteSchema'
import { useSaveLocalite, useGetLocalitesByParent } from '@/simadou/allHooks/admin/localiteHooks'
import { useGetNiveauxLocalite } from '@/simadou/allHooks/admin/niveauLocaliteHooks'
import { getLocaliteFormConfig } from '@/simadou/allfieldsConfig/localiteForm'
import { Localite } from '@/simadou/allTypes'

type Props = {
  currentRow?: any | null
  niveauId: number
  onClose: () => void
  onSuccess: () => void
}

export default function AddLocalite({ currentRow, niveauId, onClose, onSuccess }: Props) {
  const isEdit = !!currentRow
  const { data: niveaux = [] } = useGetNiveauxLocalite()

  // Trouver le niveau actuel et le niveau parent
  const currentNiveau = niveaux.find((n: any) => n.id_nlc === niveauId)
  const parentNiveau = niveaux.find((n: any) => n.nombre_nlc === (currentNiveau?.nombre_nlc || 0) - 1)

  // Récupérer les localités parentes pour le select
  const { data: parentLocalites = [] } = useGetLocalitesByParent(parentNiveau?.nombre_nlc || null)
  // Configuration du formulaire avec options dynamiques
  const formConfig = useMemo(() => {
    const config = getLocaliteFormConfig()

    // Ajouter le champ parent si un niveau parent existe
    if (parentNiveau) {
      const parentOptions = parentLocalites.map((loc: any) => ({
        label: loc.intitule_loca,
        value: loc.id_loca,
      }))

      config.fields.push({
        name: 'parent_loca',
        label: parentNiveau.libelle_nlc,
        type: 'select',
        placeholder: `Sélectionner ${parentNiveau.nombre_nlc}`,
        required: true,
        options: parentOptions,
        colSpan: 'full',
      })
    }
    config.fields.push({
      name: 'shape_file',
      label: 'Shape file',
      type: 'file',
      accept: 'application/pdf,image/*,.doc,.docx',
      maxSize: 10,
      helperText: "Formats acceptés: PDF, DOC, DOCX (max 10MB)",
      required: false,
      gridCols: 1,
    })
    return config
  }, [parentNiveau, parentLocalites])

  // Valeurs par défaut
  const defaultValues = useMemo(() => ({
    code_loca: currentRow?.code_loca || '',
    code_national_loca: currentRow?.code_national_loca || '',
    intitule_loca: currentRow?.intitule_loca || '',
    parent_loca: typeof currentRow?.parent_loca === 'object' && currentRow?.parent_loca !== null
      ? (currentRow.parent_loca as any).id_loca
      : currentRow?.parent_loca || null,
    niveau_loca: niveauId,
    shape_file: currentRow?.shape_file || '',
  }), [currentRow, niveauId])

  const mutation = useSaveLocalite(isEdit, currentRow, () => {
    onSuccess()
    onClose()
  })

  const handleSubmit = (data: Localite) => {
    mutation.mutate(data)
  }

  return (
    <DynamicForm
      key={currentRow?.id_loca ?? 'new'}
      config={formConfig}
      schema={localiteSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isLoading={mutation.isPending}
      submitText={isEdit ? 'Mettre à jour' : 'Ajouter'}
      loadingText='Enregistrement...'
      onCancel={onClose}
      cancelText='Annuler'
    />
  )
}
