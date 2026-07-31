import { useCallback, useEffect, useMemo, useState } from 'react'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import { buildCadreAnalytiqueColumns } from '@/simadou/allColonnes/cadre-analytique-columns'
import { useGetActeurs } from '@/simadou/allHooks/admin/acteurHooks'
import {
  useDeleteCadreAnalytique,
  useGetCadresAnalytique,
  useGetNiveauxCadreAnalytique,
} from '@/simadou/allHooks/admin/cadreAnalytiqueHooks'
import { useGetAllIndicateursPerformanceProgramme } from '@/simadou/allHooks/admin/indicateurPerformanceProgrammeHooks'
import type {
  CadreAnalytique,
  NiveauCadreAnalytique,
} from '@/simadou/allTypes/cadreAnalytique'
import {
  getNiveauCadreAnalytiqueLibelle,
  resolveNiveauCaNumber,
} from '@/simadou/lib/cadreAnalytiqueUtils'
import { buildIndicateurCountByCadreAnalytiqueId } from '@/simadou/lib/indicateurPerformanceProgrammeUtils'
import { Plus, Search, Settings } from 'lucide-react'
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
import CadreAnalytiqueFormPanel from './CadreAnalytiqueFormPanel'
import NiveauCadreAnalytiqueDialog from './NiveauCadreAnalytiqueDialog'
import CadreAnalytiqueIndicateursDialog from './indicateur-performance/CadreAnalytiqueIndicateursDialog'

function CadreAnalytiqueNiveauTable({
  niveauCodeNumber,
  niveaux,
  cadres,
  acteurs,
  searchTerm,
  tableKey,
  isLastLevel,
  onOpenIndicateurs,
  getIndicateurCount,
  onEdit,
  onDeleteRequest,
}: {
  niveauCodeNumber: number
  niveaux: NiveauCadreAnalytique[]
  cadres: CadreAnalytique[]
  acteurs: { id_acteur: number; nom_acteur: string; code_acteur: string }[]
  searchTerm: string
  tableKey: string
  isLastLevel: boolean
  onOpenIndicateurs: (row: CadreAnalytique) => void
  getIndicateurCount: (row: CadreAnalytique) => number
  onEdit: (row: CadreAnalytique) => void
  onDeleteRequest: (row: CadreAnalytique) => void
}) {
  const { search, navigate } = useEmbeddedTableState()

  const columns = useMemo(
    () =>
      buildCadreAnalytiqueColumns({
        cadres,
        niveaux,
        currentNiveauCodeNumber: niveauCodeNumber,
        acteurs,
        isLastLevel,
        onOpenIndicateurs,
        getIndicateurCount,
        onEdit,
        onDeleteRequest,
      }),
    [
      cadres,
      niveaux,
      niveauCodeNumber,
      acteurs,
      isLastLevel,
      onOpenIndicateurs,
      getIndicateurCount,
      onEdit,
      onDeleteRequest,
    ]
  )

  const rows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return cadres.filter((cadre) => {
      if (resolveNiveauCaNumber(cadre.niveau_ca) !== niveauCodeNumber) {
        return false
      }

      if (!normalizedSearch) return true

      return (
        cadre.intutile_ca.toLowerCase().includes(normalizedSearch) ||
        cadre.code_ca.toLowerCase().includes(normalizedSearch)
      )
    })
  }, [cadres, niveauCodeNumber, searchTerm])

  return (
    <GenericTable<CadreAnalytique>
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

export default function ListeCadreAnalytique() {
  const activeProgramme = useActiveProgramme()
  const programmeId = useActiveProgrammeId()
  const codeProgramme = activeProgramme?.code_programme

  const { data: niveaux = [], isLoading: isLoadingNiveaux } =
    useGetNiveauxCadreAnalytique()
  const { data: cadres = [], dataUpdatedAt } = useGetCadresAnalytique()
  const { data: acteurs = [] } = useGetActeurs()
  const deleteMutation = useDeleteCadreAnalytique()

  const hasNiveaux = niveaux.length > 0
  const { data: allIndicateurs = [] } =
    useGetAllIndicateursPerformanceProgramme(hasNiveaux)
  const { tabsStyle } = useNiveauTabsTheme()

  const [activeNiveauCode, setActiveNiveauCode] = useState<string>('')
  const [activeNiveauId, setActiveNiveauId] = useState<number>(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showNiveauxDialog, setShowNiveauxDialog] = useState(false)
  const [selectedCadre, setSelectedCadre] = useState<CadreAnalytique | null>(
    null
  )
  const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
  const [cadreToDelete, setCadreToDelete] = useState<CadreAnalytique | null>(
    null
  )
  const [cadreForIndicateurs, setCadreForIndicateurs] =
    useState<CadreAnalytique | null>(null)
  const [showIndicateursDialog, setShowIndicateursDialog] = useState(false)

  // Ajouter un state pour suivre le programme actif
  const [currentProgramme, setCurrentProgramme] = useState(codeProgramme)

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveNiveauCode(value)

      // Convertir en nombre et vérifier que c'est valide
      const index = Number(value) - 1

      // Vérifier que l'index est valide
      if (index >= 0 && index < niveaux.length) {
        const niveau = niveaux[index]
        if (niveau && niveau.id_nca != null) {
          setActiveNiveauId(niveau.id_nca)
        } else {
          setActiveNiveauId(0)
        }
      } else {
        console.warn(
          'Index de niveau invalide:',
          index,
          'Total niveaux:',
          niveaux.length
        )
        setActiveNiveauId(0)
      }

      setSearchTerm('')
    },
    [niveaux]
  )

  useEffect(() => {
    // Si le programme a changé, réinitialiser tout
    if (codeProgramme !== currentProgramme) {
      setCurrentProgramme(codeProgramme)
      setActiveNiveauCode('')
      setActiveNiveauId(0)
      // Les autres effets se déclencheront pour sélectionner le premier niveau
    }
  }, [codeProgramme, currentProgramme])

  // Effet pour sélectionner le premier niveau
  useEffect(() => {
    if (niveaux.length > 0 && activeNiveauCode === '') {
      const premierNiveau = niveaux[0]
      if (premierNiveau && premierNiveau.nombre_nca != null) {
        const code = String(premierNiveau.nombre_nca)
        setActiveNiveauCode(code)
        setActiveNiveauId(premierNiveau.id_nca)
        handleTabChange(code)
      }
    }
  }, [codeProgramme, niveaux, activeNiveauCode])
  const currentNiveauCode = Number(
    activeNiveauCode || niveaux[0]?.nombre_nca || 0
  )

  const currentNiveauLibelle = useMemo(() => {
    const libelle = getNiveauCadreAnalytiqueLibelle(
      niveaux,
      currentNiveauCode,
      codeProgramme
    )
    return libelle || 'cadre'
  }, [niveaux, currentNiveauCode, codeProgramme])

  const countByNiveau = useMemo(() => {
    const counts = new Map<number, number>()
    for (const c of cadres) {
      const n = resolveNiveauCaNumber(c.niveau_ca)
      if (n == null) continue
      counts.set(n, (counts.get(n) ?? 0) + 1)
    }
    return counts
  }, [cadres])

  const maxNiveauCodeNumber = useMemo(
    () =>
      niveaux.length > 0 ? Number(niveaux[niveaux.length - 1].nombre_nca) : 0,
    [niveaux]
  )

  const indicateurCountByCadreId = useMemo(
    () => buildIndicateurCountByCadreAnalytiqueId(allIndicateurs, cadres),
    [allIndicateurs, cadres]
  )

  const getIndicateurCount = useCallback(
    (cadre: CadreAnalytique) => indicateurCountByCadreId.get(cadre.id_ca) ?? 0,
    [indicateurCountByCadreId]
  )

  const handleOpenIndicateurs = useCallback((cadre: CadreAnalytique) => {
    setCadreForIndicateurs(cadre)
    setShowIndicateursDialog(true)
  }, [])

  const handleEdit = useCallback((cadre: CadreAnalytique) => {
    setSelectedCadre(cadre)
    setShowForm(true)
  }, [])

  const handleDeleteRequest = useCallback(
    (cadre: CadreAnalytique) => {
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
      toast.info('Configurez d’abord les niveaux du cadre analytique.')
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
          Sélectionnez un programme dans l&apos;en-tête pour gérer le cadre
          analytique.
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
            Veuillez d&apos;abord configurer les niveaux du cadre analytique
            avant de pouvoir ajouter des cadres.
          </p>
          <Button type='button' onClick={() => setShowNiveauxDialog(true)}>
            <Settings className='h-4 w-4' />
            Configurer les niveaux
          </Button>
        </Card>

        <NiveauCadreAnalytiqueDialog
          open={showNiveauxDialog}
          onOpenChange={setShowNiveauxDialog}
        />
      </>
    )
  }

  return (
    <div className='space-y-2 px-2'>
      <Tabs
        orientation='vertical'
        className='gap-1 space-y-1'
        style={tabsStyle}
        key={niveaux.length}
        value={String(currentNiveauCode)}
        onValueChange={handleTabChange}
      >
        <div className='flex items-center justify-between gap-2'>
          <div className='flex-1 overflow-x-auto'>
            <NiveauTabsList>
              {niveaux.map((n) => (
                <NiveauTabTrigger
                  key={n.nombre_nca}
                  value={String(n.nombre_nca)}
                  count={countByNiveau.get(Number(n.id_nca)) ?? 0}
                >
                  {n.libelle_nca}
                </NiveauTabTrigger>
              ))}
            </NiveauTabsList>
          </div>

          <div className='flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center'>
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

        {niveaux.map((n) => (
          <TabsContent key={n.id_nca} value={String(n.nombre_nca)}>
            {Number(n.nombre_nca) === currentNiveauCode && (
              <CadreAnalytiqueNiveauTable
                niveauCodeNumber={Number(n.id_nca)}
                niveaux={niveaux}
                cadres={cadres}
                acteurs={acteurs}
                searchTerm={searchTerm}
                tableKey={`cadres-ca-${n.id_nca}-${dataUpdatedAt}-${cadres.length}-${searchTerm}-${allIndicateurs.length}`}
                isLastLevel={Number(n.nombre_nca) === maxNiveauCodeNumber}
                onOpenIndicateurs={handleOpenIndicateurs}
                getIndicateurCount={getIndicateurCount}
                onEdit={handleEdit}
                onDeleteRequest={handleDeleteRequest}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>

      {cadreToDelete && (
        <GenericDeleteDialog<CadreAnalytique>
          open={deleteOpen === 'delete'}
          onOpenChange={(isOpen) => setDeleteOpen(isOpen ? 'delete' : null)}
          currentRow={cadreToDelete}
          entityName='le cadre analytique'
          getEntityLabel={(row) => row.intutile_ca}
          onDelete={(row) =>
            deleteMutation.mutate(row.id_ca, {
              onSuccess: () => {
                toast.success('Cadre analytique supprimé avec succès')
                setCadreToDelete(null)
                setDeleteOpen(null)
              },
              onError: () =>
                toast.error(
                  'Erreur lors de la suppression du cadre analytique'
                ),
            })
          }
        />
      )}

      <Dialog open={showForm} onOpenChange={(o) => !o && handleCloseForm()}>
        <DialogContent
          className='gap-0 overflow-hidden p-0 sm:max-w-3xl'
          aria-describedby={undefined}
        >
          <DialogHeader className='border-b px-4 py-3'>
            <DialogTitle>
              {selectedCadre
                ? `Mise à jour d’un ${currentNiveauLibelle}`
                : `Ajout d’un ${currentNiveauLibelle}`}
            </DialogTitle>
          </DialogHeader>
          <div className='px-4 py-3'>
            <CadreAnalytiqueFormPanel
              programmeId={programmeId}
              codeProgramme={codeProgramme}
              niveauCodeNumber={currentNiveauCode}
              niveauId={activeNiveauId || 1}
              niveaux={niveaux}
              cadres={cadres}
              cadre={selectedCadre}
              onClose={handleCloseForm}
              onSuccess={handleCloseForm}
            />
          </div>
        </DialogContent>
      </Dialog>

      <NiveauCadreAnalytiqueDialog
        open={showNiveauxDialog}
        onOpenChange={setShowNiveauxDialog}
      />

      {cadreForIndicateurs && programmeId ? (
        <CadreAnalytiqueIndicateursDialog
          cadre={cadreForIndicateurs}
          programmeId={programmeId}
          open={showIndicateursDialog}
          onOpenChange={(open) => {
            setShowIndicateursDialog(open)
            if (!open) setCadreForIndicateurs(null)
          }}
        />
      ) : null}
    </div>
  )
}
