import { useCallback, useEffect, useMemo, useState } from 'react'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import { buildIndicateurStrategiqueColumns } from '@/simadou/allColonnes/indicateur-strategique-columns'
import { useGetNiveauxCadreStrategique } from '@/simadou/allHooks/admin/cadreStrategiqueHooks'
import { useGetCiblesIndicateurStrategique } from '@/simadou/allHooks/admin/cibleIndicateurStrategiqueHooks'
import {
  useDeleteIndicateurStrategique,
  useGetIndicateursStrategique,
} from '@/simadou/allHooks/admin/indicateurStrategiqueHooks'
import { useGetPersonnels } from '@/simadou/allHooks/admin/personnelHooks'
import type { IndicateurStrategique } from '@/simadou/allTypes/indicateurStrategique'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import {
  useActiveProgramme,
  useActiveProgrammeId,
} from '@/hooks/use-active-programme'
import useDialogState from '@/hooks/use-dialog-state'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import {
  NiveauTabTrigger,
  NiveauTabsList,
  useNiveauTabsTheme,
} from '@/components/ui/NiveauTabs'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { DataTableToolbarOutlineButton } from '@/components/data-table/toolbar-outline-button'
import CiblesIndicateurStrategiqueDialog from './CiblesIndicateurStrategiqueDialog'
import IndicateurStrategiqueFormPanel from './IndicateurStrategiqueFormPanel'
import { resolveIndicateurStrategiqueCode } from './indicateurStrategiqueFormUtils'

function IndicateurStrategiqueNiveauTable({
  niveauId,
  indicateurs,
  searchTerm,
  tableKey,
  getResponsableLabel,
  getValeurCible,
  onOpenCibles,
  onEdit,
  onDeleteRequest,
}: {
  niveauId: number
  indicateurs: IndicateurStrategique[]
  searchTerm: string
  tableKey: string
  getResponsableLabel: (row: IndicateurStrategique) => string
  getValeurCible: (row: IndicateurStrategique) => number
  onOpenCibles: (row: IndicateurStrategique) => void
  onEdit: (row: IndicateurStrategique) => void
  onDeleteRequest: (row: IndicateurStrategique) => void
}) {
  const { search, navigate } = useEmbeddedTableState()

  const columns = useMemo(
    () =>
      buildIndicateurStrategiqueColumns({
        getResponsableLabel,
        getValeurCible,
        onOpenCibles,
        onEdit,
        onDeleteRequest,
      }),
    [getResponsableLabel, getValeurCible, onOpenCibles, onEdit, onDeleteRequest]
  )

  const rows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    return indicateurs.filter((ind) => {
      if (Number(ind.niveau_istr) !== niveauId) return false
      if (!normalizedSearch) return true
      return (
        ind.intitule_indicateur_istr.toLowerCase().includes(normalizedSearch) ||
        ind.code_indicateur_istr.toLowerCase().includes(normalizedSearch)
      )
    })
  }, [indicateurs, niveauId, searchTerm])

  return (
    <GenericTable<IndicateurStrategique>
      key={tableKey}
      data={rows}
      columns={columns}
      search={search}
      navigate={navigate}
      showSearch={false}
      defaultPageSize={10}
      showViewOptions={false}
      emptyMessage='Aucun indicateur stratégique'
    />
  )
}

export default function ListeIndicateursStrategique() {
  const activeProgramme = useActiveProgramme()
  const programmeId = useActiveProgrammeId()
  const codeProgramme = activeProgramme?.code_programme

  const { data: niveaux = [], isLoading: isLoadingNiveaux } =
    useGetNiveauxCadreStrategique()
  const { data: indicateurs = [], dataUpdatedAt } =
    useGetIndicateursStrategique()
  const { data: cibles = [] } = useGetCiblesIndicateurStrategique()
  const { data: personnels = [] } = useGetPersonnels()
  const deleteMutation = useDeleteIndicateurStrategique()

  const hasNiveaux = niveaux.length > 0
  const { tabsStyle } = useNiveauTabsTheme()

  const [activeNiveauCode, setActiveNiveauCode] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedIndicateur, setSelectedIndicateur] =
    useState<IndicateurStrategique | null>(null)
  const [ciblesOpen, setCiblesOpen] = useState(false)
  const [ciblesIndicateur, setCiblesIndicateur] =
    useState<IndicateurStrategique | null>(null)
  const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
  const [rowToDelete, setRowToDelete] = useState<IndicateurStrategique | null>(
    null
  )

  const [currentProgramme, setCurrentProgramme] = useState(codeProgramme)
  
  useEffect(() => {
    // Si le programme a changé, réinitialiser tout
    if (codeProgramme !== currentProgramme) {
      setCurrentProgramme(codeProgramme)
      setActiveNiveauCode('')
    }
  }, [codeProgramme, currentProgramme])

  // Effet pour sélectionner le premier niveau
  useEffect(() => {
    if (niveaux.length > 0 && activeNiveauCode === '') {
      const premierNiveau = niveaux[0]
      if (premierNiveau && premierNiveau.id_nsc != null) {
        const code = String(premierNiveau.id_nsc)
        setActiveNiveauCode(code)
      }
    }
  }, [niveaux, activeNiveauCode])

  const currentNiveauId = Number(
    activeNiveauCode || niveaux[0]?.id_nsc || 0
  )
  console.log("currentNiveauId", currentNiveauId)
  const currentNiveau = useMemo(
    () => niveaux.find((x) => Number(x.id_nsc) === currentNiveauId) ?? niveaux[0],
    [niveaux, currentNiveauId]
  )

  const currentNiveauLibelle = currentNiveau?.libelle_nsc ?? 'indicateur'

  const getValeurCible = useCallback(
    (ind: IndicateurStrategique) => {
      let somme = 0
      for (const cible of cibles) {
        if (
          resolveIndicateurStrategiqueCode(cible.code_indicateur_istr) ===
          ind.code_indicateur_istr
        ) {
          somme += Number(cible.valeur_cible_indcateur_istr) || 0
        }
      }
      return somme
    },
    [cibles]
  )

  const getResponsableLabel = useCallback(
    (ind: IndicateurStrategique) => {
      const v = ind.responsable_istr as unknown
      if (v == null || v === '') return '—'
      if (typeof v === 'string' && Number.isNaN(Number(v))) return v
      const id = Number(v)
      if (!Number.isFinite(id)) return '—'
      const p = personnels.find((x) => Number(x.id_personnel_perso) === id)
      if (p) {
        return [p.prenom_perso, p.nom_perso].filter(Boolean).join(' ') || '—'
      }
      return String(v)
    },
    [personnels]
  )
  const handleTabChange = useCallback((value: string) => {
    setActiveNiveauCode(value)
    setSearchTerm('')
  }, [niveaux])

  // const handleTabChange = useCallback((value: string) => {
  //   setActiveNiveauCode(value)
  //   setSearchTerm('')
  // }, [])

  const handleEdit = useCallback((row: IndicateurStrategique) => {
    setSelectedIndicateur(row)
    setShowForm(true)
  }, [])

  const handleDeleteRequest = useCallback(
    (row: IndicateurStrategique) => {
      setRowToDelete(row)
      setDeleteOpen('delete')
    },
    [setDeleteOpen]
  )

  const handleOpenCibles = useCallback((row: IndicateurStrategique) => {
    setCiblesIndicateur(row)
    setCiblesOpen(true)
  }, [])

  const handleCloseForm = () => {
    setShowForm(false)
    setSelectedIndicateur(null)
  }

  const handleAddForm = () => {
    if (!hasNiveaux) {
      toast.info('Configurez d’abord les niveaux du cadre stratégique.')
      return
    }
    setSelectedIndicateur(null)
    setShowForm(true)
  }

  if (!programmeId || !codeProgramme) {
    return (
      <Card className='border-dashed p-6 text-center'>
        <p className='text-sm text-muted-foreground'>
          Sélectionnez un programme dans l&apos;en-tête pour gérer les
          indicateurs stratégiques.
        </p>
      </Card>
    )
  }

  if (isLoadingNiveaux) {
    return (
      <div className='py-12 text-center text-sm text-muted-foreground'>
        Chargement…
      </div>
    )
  }

  if (!hasNiveaux) {
    return (
      <Card className='border-dashed p-6 text-center'>
        <p className='mb-4 text-sm text-muted-foreground'>
          Configurez les niveaux du cadre stratégique (menu Gestion des niveaux)
          avant d&apos;ajouter des indicateurs.
        </p>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      <Tabs
        orientation='vertical'
        className='space-y-4'
        style={tabsStyle}
        key={niveaux.length}
        value={String(currentNiveauId)}
        onValueChange={handleTabChange}
      >
        <div className='flex items-center justify-between gap-4'>
          <div className='flex-1 overflow-x-auto'>
            <NiveauTabsList>
              {niveaux.map((n) => (
                <NiveauTabTrigger
                  key={n.id_nsc}
                  value={String(n.id_nsc)}
                  count={
                    indicateurs.filter(
                      (i) => Number(i.niveau_istr) === Number(n.id_nsc)
                    ).length
                  }
                >
                  {n.libelle_nsc}
                </NiveauTabTrigger>
              ))}
            </NiveauTabsList>
          </div>

          <div className='flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center'>
            <div className='relative'>
              <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder='Rechercher…'
                className='w-full pl-9 sm:w-64'
              />
            </div>
            <DataTableToolbarOutlineButton onClick={handleAddForm}>
              Ajout des {currentNiveauLibelle}s
            </DataTableToolbarOutlineButton>
          </div>
        </div>

        {niveaux.map((n) => (
          <TabsContent key={n.id_nsc} value={String(n.id_nsc)}>
            {Number(n.id_nsc) === currentNiveauId && (
              <IndicateurStrategiqueNiveauTable
                niveauId={Number(n.id_nsc)}
                indicateurs={indicateurs}
                searchTerm={searchTerm}
                tableKey={`indic-istr-${n.id_nsc}-${dataUpdatedAt}-${searchTerm}`}
                getResponsableLabel={getResponsableLabel}
                getValeurCible={getValeurCible}
                onOpenCibles={handleOpenCibles}
                onEdit={handleEdit}
                onDeleteRequest={handleDeleteRequest}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>

      {rowToDelete && (
        <GenericDeleteDialog<IndicateurStrategique>
          open={deleteOpen === 'delete'}
          onOpenChange={(isOpen) => setDeleteOpen(isOpen ? 'delete' : null)}
          currentRow={rowToDelete}
          entityName="l'indicateur stratégique"
          getEntityLabel={(row) => row.intitule_indicateur_istr}
          onDelete={(row) =>
            deleteMutation.mutate(row.id_indicateur_str, {
              onSuccess: () => {
                toast.success('Indicateur supprimé')
                setRowToDelete(null)
                setDeleteOpen(null)
              },
              onError: () => toast.error('Erreur lors de la suppression'),
            })
          }
        />
      )}

      {ciblesIndicateur && (
        <CiblesIndicateurStrategiqueDialog
          open={ciblesOpen}
          onOpenChange={setCiblesOpen}
          indicateurCode={ciblesIndicateur.code_indicateur_istr}
          indicateurLabel={ciblesIndicateur.intitule_indicateur_istr}
        />
      )}

      <Dialog open={showForm} onOpenChange={(o) => !o && handleCloseForm()}>
        <DialogContent
          className='gap-0 overflow-hidden p-0 sm:max-w-3xl'
          aria-describedby={undefined}
        >
          <DialogHeader className='border-b px-6 py-4'>
            <DialogTitle>
              {selectedIndicateur
                ? "Modifier l'indicateur stratégique"
                : 'Nouvel indicateur stratégique'}
            </DialogTitle>
            <DialogDescription className='px-6 pb-0'>
              Niveau : {currentNiveauLibelle}
            </DialogDescription>
          </DialogHeader>
          <div className='px-6 py-4'>
            {programmeId > 0 && codeProgramme && (
              <IndicateurStrategiqueFormPanel
                key={
                  selectedIndicateur?.id_indicateur_str ??
                  `new-${currentNiveauId}`
                }
                niveauId={currentNiveauId || 1}
                codeProgramme={codeProgramme}
                indicateur={selectedIndicateur}
                onClose={handleCloseForm}
                onSuccess={handleCloseForm}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}