import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { NiveauTabTrigger, NiveauTabsList, useNiveauTabsTheme } from '@/components/ui/NiveauTabs'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { CadreResultat, Projet } from '@/simadou/allTypes'
import { buildCadreResultatColumns } from '@/simadou/allColonnes/cadre-resultat-columns'
import {
  useDeleteCadreResultat,
  useGetCadresResultat,
  useGetNiveauxCadreResultat,
} from '@/simadou/allHooks/admin/cadreResultatHooks'
import CadreResultatFormDialog from './CadreResultatFormDialog'
import NiveauCadreResultatManager from './NiveauCadreResultatManager'
import IndicateurCadreResultatCadreDialog from '../resultsFrameworkIndicators/IndicateurCadreResultatCadreDialog'
import { resolveNiveauCrId, sortNiveauxCadreResultat } from '@/simadou/lib/cadreResultatUtils'

type ModalState = 'form' | 'niveaux'

function CadreResultatNiveauTable({
  niveauId,
  cadres,
  tableKey,
  onEdit,
  onDeleteRequest,
  onOpenIndicateurs,
}: {
  niveauId: number
  cadres: CadreResultat[]
  tableKey: string
  onEdit: (row: CadreResultat) => void
  onDeleteRequest: (row: CadreResultat) => void
  onOpenIndicateurs: (row: CadreResultat) => void
}) {
  const { search, navigate } = useEmbeddedTableState()

  const columns = useMemo(
    () =>
      buildCadreResultatColumns({
        cadres,
        onEdit,
        onDeleteRequest,
        onOpenIndicateurs,
        hideProjetColumn: true,
      }),
    [cadres, onEdit, onDeleteRequest, onOpenIndicateurs]
  )

  const rows = useMemo(
    () => cadres.filter((c) => resolveNiveauCrId(c.niveau_cr) === niveauId),
    [cadres, niveauId]
  )

  return (
    <GenericTable<CadreResultat>
      key={tableKey}
      data={rows}
      columns={columns}
      search={search}
      navigate={navigate}
      searchKey='intutile_cr'
      searchPlaceholder='Filtrer les cadres…'
      urlFilterConfig={[
        {
          columnId: 'intutile_cr',
          searchKey: 'intutile_cr',
          type: 'string',
        },
      ]}
      defaultPageSize={10}
      showViewOptions={false}
      emptyMessage='Aucun cadre pour ce niveau'
    />
  )
}

export default function ProjetCadreResultatsPanel({ projet }: { projet: Projet }) {
  const codeProjet = projet.code_projet
  const { data: niveaux = [], isLoading: isLoadingNiveaux } = useGetNiveauxCadreResultat()
  const { data: cadres = [], dataUpdatedAt } = useGetCadresResultat(projet.code_projet)
  const deleteMutation = useDeleteCadreResultat()

  const sortedNiveaux = useMemo(() => sortNiveauxCadreResultat(niveaux), [niveaux])

  const hasNiveaux = sortedNiveaux.length > 0
  const { tabsStyle } = useNiveauTabsTheme()

  const [activeNiveauId, setActiveNiveauId] = useState<string>('')
  const [showModal, setShowModal] = useState<ModalState | null>(null)
  const [selectedCadre, setSelectedCadre] = useState<CadreResultat | null>(null)
  const [indicateursOpen, setIndicateursOpen] = useState(false)
  const [cadreForIndicateurs, setCadreForIndicateurs] = useState<CadreResultat | null>(
    null
  )
  const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
  const [cadreToDelete, setCadreToDelete] = useState<CadreResultat | null>(null)

  useEffect(() => {
    if (sortedNiveaux.length > 0 && activeNiveauId === '') {
      setActiveNiveauId(String(sortedNiveaux[0].id_ncr))
    }
  }, [sortedNiveaux, activeNiveauId])

  const currentNiveauId = Number(activeNiveauId || sortedNiveaux[0]?.id_ncr || 0)

  const countByNiveau = useMemo(() => {
    const counts = new Map<number, number>()
    for (const c of cadres) {
      const n = resolveNiveauCrId(c.niveau_cr)
      if (n == null) continue
      counts.set(n, (counts.get(n) ?? 0) + 1)
    }
    return counts
  }, [cadres])

  const handleEdit = useCallback((cadre: CadreResultat) => {
    setSelectedCadre(cadre)
    setShowModal('form')
  }, [])

  const handleDeleteRequest = useCallback(
    (cadre: CadreResultat) => {
      setCadreToDelete(cadre)
      setDeleteOpen('delete')
    },
    [setDeleteOpen]
  )

  const handleOpenIndicateurs = useCallback((cadre: CadreResultat) => {
    setCadreForIndicateurs(cadre)
    setIndicateursOpen(true)
  }, [])

  const handleCloseIndicateurs = useCallback((open: boolean) => {
    setIndicateursOpen(open)
    if (!open) setCadreForIndicateurs(null)
  }, [])

  const handleConfirmDelete = (cadre: CadreResultat) => {
    deleteMutation.mutate(cadre.id_cr, {
      onSuccess: () => {
        toast.success('Cadre supprimé')
        setCadreToDelete(null)
        setDeleteOpen(null)
      },
      onError: () => toast.error('Erreur lors de la suppression'),
    })
  }

  const handleClose = () => {
    setShowModal(null)
    setSelectedCadre(null)
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-muted-foreground'>
          Configurez d&apos;abord les niveaux, puis ajoutez les cadres par niveau.
        </p>

        <div className='flex flex-col gap-2 sm:flex-row'>
        <Button type='button' variant='outline' onClick={() => setShowModal('niveaux')}>
          <Settings className='h-4 w-4' />
          Niveaux
        </Button>
        </div>
      </div>

      {!isLoadingNiveaux && !hasNiveaux ? (
        <Card className='border-dashed p-6 text-center'>
          <p className='mb-3 text-sm text-muted-foreground'>
            Configurez les niveaux du cadre de résultats avant d&apos;ajouter des cadres.
          </p>
          <Button type='button' onClick={() => setShowModal('niveaux')}>
            <Settings className='h-4 w-4' />
            Configurer les niveaux
          </Button>
        </Card>
      ) : (
        <Tabs
          orientation='vertical'
          className='space-y-4'
          style={tabsStyle}
          key={sortedNiveaux.length}
          value={String(currentNiveauId)}
          onValueChange={setActiveNiveauId}
        >
          <div className='flex items-center justify-between gap-4'>
            <div className='flex-1 overflow-x-auto'>
              <NiveauTabsList>
                {sortedNiveaux.map((n) => (
                  <NiveauTabTrigger
                    key={n.id_ncr}
                    value={String(n.id_ncr)}
                    count={countByNiveau.get(n.id_ncr) ?? 0}
                  >
                    {n.libelle_ncr}
                  </NiveauTabTrigger>
                ))}
              </NiveauTabsList>
            </div>

            <Button
              type='button'
              className='shrink-0'
              onClick={() => {
                setSelectedCadre(null)
                setShowModal('form')
              }}
              disabled={isLoadingNiveaux}
            >
              <Plus className='h-4 w-4' />
              Nouveau cadre
            </Button>
          </div>
          {sortedNiveaux.map((n) => (
            <TabsContent key={n.id_ncr} value={String(n.id_ncr)}>
              {n.id_ncr === currentNiveauId && (
                <CadreResultatNiveauTable
                  niveauId={n.id_ncr}
                  cadres={cadres}
                  tableKey={`cadres-${n.id_ncr}-${dataUpdatedAt}-${cadres.length}`}
                  onEdit={handleEdit}
                  onDeleteRequest={handleDeleteRequest}
                  onOpenIndicateurs={handleOpenIndicateurs}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {cadreToDelete && (
        <GenericDeleteDialog<CadreResultat>
          open={deleteOpen === 'delete'}
          onOpenChange={(isOpen) => setDeleteOpen(isOpen ? 'delete' : null)}
          currentRow={cadreToDelete}
          entityName='le cadre'
          getEntityLabel={(row) => row.intutile_cr}
          onDelete={handleConfirmDelete}
        />
      )}

      <IndicateurCadreResultatCadreDialog
        open={indicateursOpen}
        onOpenChange={handleCloseIndicateurs}
        cadre={cadreForIndicateurs}
        codeProjet={codeProjet}
      />

      <Dialog open={showModal === 'niveaux'} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className='sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Configuration des niveaux du cadre de résultat</DialogTitle>
            <DialogDescription>
              Définissez les niveaux (Effet, Produit, Impact).
            </DialogDescription>
          </DialogHeader>
          <NiveauCadreResultatManager />
        </DialogContent>
      </Dialog>

      <Dialog open={showModal === 'form'} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className='sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle>
              {selectedCadre
                ? 'Modifier le cadre de résultat'
                : 'Créer un cadre de résultat'}
            </DialogTitle>
          </DialogHeader>
          <CadreResultatFormDialog
            codeProjet={codeProjet}
            niveauId={currentNiveauId}
            niveaux={sortedNiveaux}
            cadres={cadres}
            cadre={selectedCadre}
            onClose={handleClose}
            onSuccess={handleClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
