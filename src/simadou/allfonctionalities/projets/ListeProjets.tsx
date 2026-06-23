import { useCallback, useMemo, useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { GenericTable } from '@/Global/Generic/Generictable'
import { useActiveProgramme } from '@/hooks/use-active-programme'
import { buildProjetsColumns } from '@/simadou/allColonnes/projets-columns'
import { useDeleteProjet, useGetProjets, useToggleProjetCloture } from '@/simadou/allHooks/admin/projetHooks'
import { useGetTypeProjet } from '@/simadou/allHooks/admin/typeProjetHooks'
import type { Projet } from '@/simadou/allTypes/projet'
import useDialogState from '@/hooks/use-dialog-state'
import { GenericDialogs } from '@/Global/Generic/Genericdialogs'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import AddProjet from './AddProjet'
import { useGeneralParamsQuery } from '@/simadou/allHooks/generalParams/queries'
import { useTypeProjetStore } from '@/stores/type-projet-store'
import { useNiveauTabsTheme } from './detail/NiveauTabs'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const route = getRouteApi('/_authenticated/projet-programme/projets/')

export default function ListeProjets() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const activeProgramme = useActiveProgramme()

  const { tabsStyle } = useNiveauTabsTheme()
  const [open, setOpen] = useDialogState<'add' | 'edit' | 'delete' | 'cloture'>(null)
  const [currentRow, setCurrentRow] = useState<Projet | null>(null)

  const { data: projets = [], isLoading } = useGetProjets()
  const { data: typeProjets = [], isLoading: isLoadingTypes } = useGetTypeProjet()
  const { selectedTypeProjetId, setSelectedTypeProjetId } = useTypeProjetStore()
  const deleteMutation = useDeleteProjet()
  const { mutate: toggleCloture, isPending: isClotureLoading } = useToggleProjetCloture()

  const goToDetail = useCallback(
    (projet: Projet) => {
      navigate({
        to: '/projet-programme/projets/$id',
        params: { id: projet.code_projet || String(projet.id_projet) },
      })
    },
    [navigate]
  )

  const { data: config } = useGeneralParamsQuery()
  const currencyCode = config?.currencyCode

  const sortedTypes = useMemo(() => {
    if (!Array.isArray(typeProjets)) return []
    return [...typeProjets].sort((a, b) =>
      a.nom_type_projet?.localeCompare(b.nom_type_projet) || 0
    )
  }, [typeProjets])

  // ✅ ID actif : store s'il est valide, sinon premier type disponible
  const activeTypeId = useMemo(() => {
    if (!sortedTypes.length) return null
    const existsInList = sortedTypes.some(t => t.id_type_projet === selectedTypeProjetId)
    return existsInList ? selectedTypeProjetId : sortedTypes[0].id_type_projet
  }, [sortedTypes, selectedTypeProjetId])

  // ✅ Sync le store si on a dû fallback sur le premier type
  useEffect(() => {
    if (activeTypeId !== null && activeTypeId !== selectedTypeProjetId) {
      setSelectedTypeProjetId(activeTypeId)
    }
  }, [activeTypeId, selectedTypeProjetId, setSelectedTypeProjetId])

  // ✅ Gestion de la clôture
  const handleClotureConfirm = useCallback((projet: Projet) => {
    setCurrentRow(projet)
    setOpen('cloture')
  }, [setOpen])

  const handleClotureAction = useCallback(() => {
    if (!currentRow) return
    toggleCloture({
      id: currentRow.id_projet,
      isCloture: !currentRow.is_cloture,
    }, {
      onSuccess: () => {
        setOpen(null)
        setCurrentRow(null)
      },
    })
  }, [currentRow, toggleCloture, setOpen])

  const columns = useMemo(
    () => buildProjetsColumns(setOpen, setCurrentRow, goToDetail, handleClotureConfirm, currencyCode),
    [setOpen, setCurrentRow, goToDetail, handleClotureConfirm, currencyCode]
  )

  const filteredProjets = useMemo(() => {
    if (!activeTypeId) return projets
    return projets.filter((projet) => {
      if (!projet.type_projet) return false
      const id = typeof projet.type_projet === 'number'
        ? projet.type_projet
        : (projet.type_projet as any)?.id_type_projet
      return id === activeTypeId
    })
  }, [projets, activeTypeId])

  const countByType = useMemo(() => {
    const map = new Map<number, number>()
    projets.forEach((projet) => {
      if (!projet.type_projet) return
      const id = typeof projet.type_projet === 'number'
        ? projet.type_projet
        : (projet.type_projet as any)?.id_type_projet
      if (id) map.set(id, (map.get(id) || 0) + 1)
    })
    return map
  }, [projets])

  if (!activeProgramme) {
    return (
      <p className='py-8 text-center text-sm text-muted-foreground'>
        Sélectionnez un programme pour afficher les projets.
      </p>
    )
  }

  if (isLoading || isLoadingTypes) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='space-y-2 px-2'>
      {/* Tabs des types de projets */}
      <div className='overflow-x-auto'>
        <Tabs
          orientation='vertical'
          className='gap-1 space-y-1'
          style={tabsStyle}
          value={activeTypeId !== null ? String(activeTypeId) : undefined}
          onValueChange={(val) => setSelectedTypeProjetId(Number(val))}
        >
          <TabsList className='flex flex-wrap gap-1'>
            {sortedTypes.map((type) => (
              <TabsTrigger
                className='relative'
                key={type.id_type_projet}
                value={String(type.id_type_projet)}
              >
                {type.nom_type_projet.length > 20
                  ? type.nom_type_projet.substring(0, 12) + '…'
                  : type.nom_type_projet}
                <span className='ml-2 rounded-full bg-muted px-1.5 py-0.5 text-xs text-black'>
                  ({countByType.get(type.id_type_projet) || 0})
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className='space-y-2'>
        <GenericTable<Projet>
          data={filteredProjets}
          columns={columns}
          search={search}
          navigate={navigate}
          searchKey='intitule_projet'
          searchPlaceholder='Filtrer les projets…'
          urlFilterConfig={[
            { columnId: 'intitule_projet', searchKey: 'intitule_projet', type: 'string' },
            { columnId: 'sigle_projet', searchKey: 'sigle_projet', type: 'string' },
          ]}
          defaultPageSize={10}
          showViewOptions={false}
          emptyMessage={
            activeTypeId
              ? `Aucun projet dans le type ${sortedTypes.find(t => t.id_type_projet === activeTypeId)?.nom_type_projet || ''}`
              : 'Aucun projet trouvé.'
          }
        />
      </div>

      {/* Dialogue de clôture */}
      <AlertDialog 
        open={open === 'cloture'} 
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(null)
            setCurrentRow(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {currentRow?.is_cloture ? 'Déclôturer le projet' : 'Clôturer le projet'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {currentRow?.is_cloture
                ? `Êtes-vous sûr de vouloir déclôturer le projet "${currentRow?.intitule_projet}" ?`
                : `Êtes-vous sûr de vouloir clôturer le projet "${currentRow?.intitule_projet}" ? Cette action peut être annulée.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClotureLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClotureAction}
              disabled={isClotureLoading}
              className={currentRow?.is_cloture ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'}
            >
              {isClotureLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {currentRow?.is_cloture ? 'Déclôturer' : 'Clôturer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogues génériques (edit, delete) */}
      <GenericDialogs<Projet, 'add' | 'edit' | 'delete' | "cloture">
        open={open}
        setOpen={setOpen}
        currentRow={currentRow}
        setCurrentRow={setCurrentRow}
        rowRequiredDialogs={['edit', 'delete']}
        dialogMap={{
          edit: (props) => (
            <AddProjet
              key={`projet-edit-${props.currentRow?.id_projet || 'new'}`}
              open={props.open}
              onOpenChange={props.onOpenChange}
              currentRow={props.currentRow as any}
            />
          ),
          delete: (props) => (
            <GenericDeleteDialog<Projet>
              key={`projet-delete-${currentRow?.id_projet}`}
              {...props}
              currentRow={props.currentRow as Projet}
              entityName='projet'
              getEntityLabel={(row) => row.intitule_projet}
              onDelete={(row) => deleteMutation.mutate(row.id_projet)}
            />
          ),
        }}
      />
    </div>
  )
}