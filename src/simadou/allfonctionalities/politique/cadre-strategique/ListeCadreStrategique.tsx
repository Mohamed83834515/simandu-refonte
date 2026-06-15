import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Search, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import {
  useActiveProgramme,
  useActiveProgrammeId,
} from '@/hooks/use-active-programme'
import type { CadreStrategique } from '@/simadou/allTypes/cadreStrategique'
import type { NiveauCadreStrategique } from '@/simadou/allTypes/niveauCadreStrategique'
import { buildCadreStrategiqueColumns } from '@/simadou/allColonnes/cadre-strategique-columns'
import {
  useDeleteCadreStrategique,
  useGetCadresStrategique,
  useGetNiveauxCadreStrategique,
} from '@/simadou/allHooks/admin/cadreStrategiqueHooks'
import { useGetActeurs } from '@/simadou/allHooks/admin/acteurHooks'
import {
  NiveauTabTrigger,
  NiveauTabsList,
  useNiveauTabsTheme,
} from '@/components/ui/NiveauTabs'
import {
  filterNiveauxByProgramme,
  getNiveauCadreStrategiqueLibelle,
  resolveNiveauCsNumber,
  sortNiveauxCadreStrategique,
} from '@/simadou/lib/cadreStrategiqueUtils'
import CadreStrategiqueFormPanel from './CadreStrategiqueFormPanel'
import NiveauCadreStrategiqueDialog from './NiveauCadreStrategiqueDialog'

function CadreStrategiqueNiveauTable({
  niveauCodeNumber,
  niveaux,
  cadres,
  acteurs,
  searchTerm,
  tableKey,
  onEdit,
  onDeleteRequest,
}: {
  niveauCodeNumber: number
  niveaux: NiveauCadreStrategique[]
  cadres: CadreStrategique[]
  acteurs: { id_acteur: number; nom_acteur: string; code_acteur: string }[]
  searchTerm: string
  tableKey: string
  onEdit: (row: CadreStrategique) => void
  onDeleteRequest: (row: CadreStrategique) => void
}) {
  const { search, navigate } = useEmbeddedTableState()

  const columns = useMemo(
    () =>
      buildCadreStrategiqueColumns({
        cadres,
        niveaux,
        currentNiveauCodeNumber: niveauCodeNumber,
        acteurs,
        onEdit,
        onDeleteRequest,
      }),
    [cadres, niveaux, niveauCodeNumber, acteurs, onEdit, onDeleteRequest]
  )

  const rows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return cadres.filter((cadre) => {
      if (resolveNiveauCsNumber(cadre.niveau_cs) !== niveauCodeNumber) {
        return false
      }

      if (!normalizedSearch) return true

      return (
        cadre.intutile_cs.toLowerCase().includes(normalizedSearch) ||
        cadre.code_cs.toLowerCase().includes(normalizedSearch)
      )
    })
  }, [cadres, niveauCodeNumber, searchTerm])

  return (
    <GenericTable<CadreStrategique>
      key={tableKey}
      data={rows}
      columns={columns}
      search={search}
      navigate={navigate}
      showSearch={false}
      defaultPageSize={10}
      showViewOptions={false}
      emptyMessage='Aucune donnée trouvée'
    />
  )
}

export default function ListeCadreStrategique() {
  const activeProgramme = useActiveProgramme()
  const programmeId = useActiveProgrammeId()
  const codeProgramme = activeProgramme?.code_programme

  const { data: niveaux = [], isLoading: isLoadingNiveaux } =
    useGetNiveauxCadreStrategique()
  const { data: cadres = [], dataUpdatedAt } = useGetCadresStrategique(programmeId)
  const { data: acteurs = [] } = useGetActeurs()
  const deleteMutation = useDeleteCadreStrategique(programmeId)

  const sortedNiveaux = useMemo(
    () =>
      sortNiveauxCadreStrategique(
        filterNiveauxByProgramme(niveaux, codeProgramme, programmeId)
      ),
    [niveaux, codeProgramme, programmeId]
  )

  const hasNiveaux = sortedNiveaux.length > 0
  const { tabsStyle } = useNiveauTabsTheme()

  const [activeNiveauCode, setActiveNiveauCode] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showNiveauxDialog, setShowNiveauxDialog] = useState(false)
  const [selectedCadre, setSelectedCadre] = useState<CadreStrategique | null>(null)
  const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
  const [cadreToDelete, setCadreToDelete] = useState<CadreStrategique | null>(null)

  useEffect(() => {
    if (sortedNiveaux.length > 0 && activeNiveauCode === '') {
      setActiveNiveauCode(String(sortedNiveaux[0].code_number_nsc))
    }
  }, [sortedNiveaux, activeNiveauCode])

  const currentNiveauCode = Number(
    activeNiveauCode || sortedNiveaux[0]?.code_number_nsc || 0
  )

  const currentNiveauLibelle = useMemo(() => {
    const libelle = getNiveauCadreStrategiqueLibelle(
      niveaux,
      currentNiveauCode,
      codeProgramme
    )
    return libelle || 'cadre'
  }, [niveaux, currentNiveauCode, codeProgramme])

  const countByNiveau = useMemo(() => {
    const counts = new Map<number, number>()
    for (const c of cadres) {
      const n = resolveNiveauCsNumber(c.niveau_cs)
      if (n == null) continue
      counts.set(n, (counts.get(n) ?? 0) + 1)
    }
    return counts
  }, [cadres])

  const handleTabChange = useCallback((value: string) => {
    setActiveNiveauCode(value)
    setSearchTerm('')
  }, [])

  const handleEdit = useCallback((cadre: CadreStrategique) => {
    setSelectedCadre(cadre)
    setShowForm(true)
  }, [])

  const handleDeleteRequest = useCallback(
    (cadre: CadreStrategique) => {
      setCadreToDelete(cadre)
      setDeleteOpen('delete')
    },
    [setDeleteOpen]
  )

  const handleCloseForm = () => {
    setShowForm(false)
    setSelectedCadre(null)
  }

  const handleAddForm = () => {
    if (!hasNiveaux) {
      toast.info('Configurez d’abord les niveaux du cadre stratégique.')
      setShowNiveauxDialog(true)
      return
    }
    setSelectedCadre(null)
    setShowForm(true)
  }

  if (!programmeId || !codeProgramme) {
    return (
      <Card className='border-dashed p-6 text-center'>
        <p className='text-sm text-muted-foreground'>
          Sélectionnez un programme dans l&apos;en-tête pour gérer le cadre stratégique.
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
      <>
        <Card className='border-dashed p-6 text-center'>
          <Settings className='mx-auto mb-4 h-10 w-10 text-muted-foreground' />
          <h3 className='mb-2 text-lg font-semibold'>Configuration requise</h3>
          <p className='mb-4 text-sm text-muted-foreground'>
            Veuillez d&apos;abord configurer les niveaux du cadre stratégique avant
            de pouvoir ajouter des cadres.
          </p>
          <Button type='button' onClick={() => setShowNiveauxDialog(true)}>
            <Settings className='h-4 w-4' />
            Configurer les niveaux
          </Button>
        </Card>

        <NiveauCadreStrategiqueDialog
          open={showNiveauxDialog}
          onOpenChange={setShowNiveauxDialog}
        />
      </>
    )
  }

  return (
    <div className='space-y-4'>
      <Tabs
        orientation='vertical'
        className='space-y-4'
        style={tabsStyle}
        key={sortedNiveaux.length}
        value={String(currentNiveauCode)}
        onValueChange={handleTabChange}
      >
        <div className='flex items-center justify-between gap-4'>
          <div className='flex-1 overflow-x-auto'>
            <NiveauTabsList>
              {sortedNiveaux.map((n) => (
                <NiveauTabTrigger
                  key={n.id_nsc}
                  value={String(n.code_number_nsc)}
                  count={countByNiveau.get(Number(n.code_number_nsc)) ?? 0}
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
            <Button type='button' onClick={handleAddForm}>
              <Plus className='h-4 w-4' />
               Ajout des {currentNiveauLibelle}s
            </Button>
          </div>
        </div>

        {sortedNiveaux.map((n) => (
          <TabsContent
            key={n.id_nsc}
            value={String(n.code_number_nsc)}
          >
            {Number(n.code_number_nsc) === currentNiveauCode && (
              <CadreStrategiqueNiveauTable
                niveauCodeNumber={Number(n.code_number_nsc)}
                niveaux={sortedNiveaux}
                cadres={cadres}
                acteurs={acteurs}
                searchTerm={searchTerm}
                tableKey={`cadres-cs-${n.id_nsc}-${dataUpdatedAt}-${cadres.length}-${searchTerm}`}
                onEdit={handleEdit}
                onDeleteRequest={handleDeleteRequest}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>

      {cadreToDelete && (
        <GenericDeleteDialog<CadreStrategique>
          open={deleteOpen === 'delete'}
          onOpenChange={(isOpen) => setDeleteOpen(isOpen ? 'delete' : null)}
          currentRow={cadreToDelete}
          entityName='le cadre stratégique'
          getEntityLabel={(row) => row.intutile_cs}
          onDelete={(row) =>
            deleteMutation.mutate(row.id_cs, {
              onSuccess: () => {
                toast.success('Cadre stratégique supprimé avec succès')
                setCadreToDelete(null)
                setDeleteOpen(null)
              },
              onError: () =>
                toast.error('Erreur lors de la suppression du cadre stratégique'),
            })
          }
        />
      )}

      <Dialog open={showForm} onOpenChange={(o) => !o && handleCloseForm()}>
        <DialogContent className='gap-0 overflow-hidden p-0 sm:max-w-3xl' aria-describedby={undefined}>
          <DialogHeader className='border-b px-6 py-4'>
            <DialogTitle>
              {selectedCadre
                ? `Mise à jour d’un ${currentNiveauLibelle}`
                : `Ajout d’un ${currentNiveauLibelle}`}
            </DialogTitle>
          </DialogHeader>
          <div className='px-6 py-4'>
            <CadreStrategiqueFormPanel
              programmeId={programmeId}
              codeProgramme={codeProgramme}
              niveauCodeNumber={currentNiveauCode}
              niveaux={niveaux}
              cadres={cadres}
              cadre={selectedCadre}
              onClose={handleCloseForm}
              onSuccess={handleCloseForm}
            />
          </div>
        </DialogContent>
      </Dialog>

      <NiveauCadreStrategiqueDialog
        open={showNiveauxDialog}
        onOpenChange={setShowNiveauxDialog}
      />
    </div>
  )
}
