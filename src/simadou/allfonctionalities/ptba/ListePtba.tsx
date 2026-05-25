import { useEffect, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { GenericDialogs } from '@/Global/Generic/Genericdialogs'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import { Ptba, VersionPtba } from '@/simadou/allTypes'
import { buildPtbasColumns } from '@/simadou/allColonnes/ptbas-columns'
import { useDeletePtba, useGetPtbas } from '@/simadou/allHooks/admin/ptbaHooks'
import { useGetVersions } from '@/simadou/allHooks/admin/versionHooks'
import SelectInput from 'react-select'
import AddPtba from './AddPtba'
import ActiviteTabbedDialog from './ActiviteTabbedDialog'
import TacheActiviteManager from './tache-activite/TacheActiviteManager'
import IndicateurTacheManager from './indicateur-tache/IndicateurTacheManager'
import { useActiveProgrammeCode } from '@/hooks/use-active-programme'
const route = getRouteApi('/_authenticated/programmation/ptba/')

function ListePtbas() {

  // État local pour la version sélectionnée
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [planifierActivite, setPlanifierActivite] = useState<Ptba | null>(null)
  const [showPlanificationModal, setShowPlanificationModal] = useState<boolean>(false)

  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data: ptbas = [] } = useGetPtbas()
  const { data: versions = [] } = useGetVersions()
  const deleteMutation = useDeletePtba()


  // Récupérer l'année courante
  const currentYear = new Date().getFullYear()
  const defaultVersion = versions.find((v: any) => v.annee_ptba === currentYear)

  // Initialiser la version sélectionnée avec l'année courante au chargement
  useEffect(() => {
    if (defaultVersion && !selectedVersionId) {
      setSelectedVersionId(defaultVersion.id_version_ptba.toString())
      localStorage.setItem('selectedVersionId', defaultVersion.id_version_ptba.toString())
    }
  }, [defaultVersion])

  // Gérer le changement de version pour filtrer les ptbas
  const handleChangeVersion = (versionId: string | null) => {
    setSelectedVersionId(versionId)
    if (versionId) {
      localStorage.setItem('selectedVersionId', versionId)
    } else {
      localStorage.removeItem('selectedVersionId')
    }
  }
  // Filtrer les ptbas côté client
  const filteredPtbas = useMemo(() => {
    if (!selectedVersionId) return ptbas
    return ptbas.filter(
      (ptba: Ptba) => ptba.version_ptba?.toString() === selectedVersionId
    )
  }, [ptbas, selectedVersionId])

  const onOpenPlanification = (activite: Ptba) => {
    setPlanifierActivite(activite)
    setShowPlanificationModal(true)
  }

  const codeProgramme = useActiveProgrammeCode()

  // Options pour le filtre
  const versionOptions = versions
    .filter((version: VersionPtba) => typeof version.programme === "object" && version.programme?.code_programme === codeProgramme)
    .map((version: any) => ({
      label: `${version.version_ptba || `Version ${version.id_version_ptba}`} - ${version.annee_ptba}`,
      value: version.id_version_ptba.toString()
    }))

  const [open, setOpen] = useDialogState<'add' | 'edit' | 'delete'>(
    null
  )
  const [currentRow, setCurrentRow] = useState<Ptba | null>(null)

  const columns = useMemo(
    () => buildPtbasColumns(setOpen, setCurrentRow,
      onOpenPlanification
    ),
    [setOpen, setCurrentRow]
  )

  return (
    <>
      <GenericTable<Ptba>
        data={filteredPtbas}
        columns={columns}
        search={search}
        navigate={navigate}
        searchKey='intitule_activite_ptba'
        searchPlaceholder='Filter activities...'
        toolbarEndSlot={
          <SelectInput<{ label: string; value: string }>
            placeholder="Rechercher une version..."
            options={versionOptions}
            value={
              versionOptions.find((opt) => opt.value === selectedVersionId) || null
            }
            onChange={(selected: any) =>
              handleChangeVersion(selected?.value || null)
            }
            isClearable
          />
        }
        urlFilterConfig={[
          { columnId: 'intitule_activite_ptba', searchKey: 'intitule_activite_ptba', type: 'string' }
        ]}

        showViewOptions={false}

        initialState={{
          columnVisibility: {
            version_ptba: false,
          },
        }}
      />

      <ActiviteTabbedDialog
        activite={planifierActivite}
        open={showPlanificationModal}
        onOpenChange={(open) => {
          setShowPlanificationModal(open)
          if (!open) setPlanifierActivite(null)
        }}
        defaultTab='taches'
        tabs={
          planifierActivite
            ? [
              {
                value: 'taches',
                label: 'Planification des tâches',
                content: (
                  <TacheActiviteManager activite={planifierActivite} />
                ),
              },
              {
                value: 'indicateurs',
                label: 'Planification des indicateurs',
                content: (
                  <IndicateurTacheManager activite={planifierActivite} />
                ),

              }
            ]
            : []
        }
      />
      <GenericDialogs<Ptba, 'add' | 'edit' | 'delete'>
        open={open}
        setOpen={setOpen}
        currentRow={currentRow}
        setCurrentRow={setCurrentRow}
        rowRequiredDialogs={['edit', 'delete']}
        dialogMap={{
          edit: (props) => (
            <AddPtba
              key={`user-edit-${currentRow?.id}`}
              open={props.open}
              onOpenChange={props.onOpenChange}
              currentRow={props.currentRow as any}
            />
          ),
          delete: (props) => (
            <GenericDeleteDialog<Ptba>
              key={`ptba-delete-${currentRow?.id}`}
              {...props}
              currentRow={props.currentRow as Ptba}
              entityName='ptba'
              getEntityLabel={(row) => row.intitule_activite_ptba}
              onDelete={(row) =>
                deleteMutation.mutate(row.id_ptba)
              }
            />
          ),
        }}
      />
    </>
  )
}

export default ListePtbas
