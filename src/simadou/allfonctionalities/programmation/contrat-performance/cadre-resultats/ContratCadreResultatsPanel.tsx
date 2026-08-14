import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import { buildCadreLogiqueClcpColumns } from '@/simadou/allColonnes/cadre-logique-clcp-columns'
import {
  cadreLogiqueClcpQueryKeys,
  useDeleteCadreLogiqueClcp,
  useGetCadresLogiquesClcp,
  useGetNiveauxConfigClcp,
  niveauConfigClcpQueryKeys,
} from '@/simadou/allHooks/admin/cadreLogiqueClcpHooks'
import { invalidateAndRefetch } from '@/simadou/allHooks/admin/queryInvalidation'
import type { ContratPerformance } from '@/simadou/allTypes/contratPerformance'
import type { CadreLogiqueClcp } from '@/simadou/allTypes/cadreLogiqueClcp'
import type { NiveauConfigClcp } from '@/simadou/allTypes/niveauConfigClcp'
import {
  getNiveauClcpLabel,
  resolveNiveauClcId,
} from '@/simadou/lib/cadreLogiqueClcpUtils'
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import CadreLogiqueClcpFormDialog from './CadreLogiqueClcpFormDialog'
import NiveauConfigClcpManager from './NiveauConfigClcpManager'

type ModalState = 'form' | 'niveaux'

function CadreLogiqueClcpNiveauTable({
  niveau,
  niveaux,
  cadres,
  tableKey,
  onEdit,
  onDeleteRequest,
}: {
  niveau: NiveauConfigClcp
  niveaux: NiveauConfigClcp[]
  cadres: CadreLogiqueClcp[]
  tableKey: string
  onEdit: (row: CadreLogiqueClcp) => void
  onDeleteRequest: (row: CadreLogiqueClcp) => void
}) {
  const { search, navigate } = useEmbeddedTableState()
  const columns = useMemo(
    () =>
      buildCadreLogiqueClcpColumns({
        cadres,
        niveaux,
        currentNiveauId: niveau.id_niveau_ncl,
        onEdit,
        onDeleteRequest,
      }),
    [cadres, niveaux, niveau.id_niveau_ncl, onEdit, onDeleteRequest]
  )

  const rows = useMemo(
    () =>
      cadres.filter(
        (c) => resolveNiveauClcId(c.niveau_clc) === niveau.id_niveau_ncl
      ),
    [cadres, niveau]
  )

  return (
    <GenericTable<CadreLogiqueClcp>
      key={tableKey}
      data={rows}
      columns={columns}
      search={search}
      navigate={navigate}
      searchKey='intitule_clc'
      searchPlaceholder='Filtrer les cadres…'
      urlFilterConfig={[
        {
          columnId: 'intitule_clc',
          searchKey: 'intitule_clc',
          type: 'string',
        },
      ]}
      defaultPageSize={10}
      showViewOptions={false}
      emptyMessage='Aucun cadre pour ce niveau'
    />
  )
}

export default function ContratCadreResultatsPanel({
  contrat,
}: {
  contrat: ContratPerformance
}) {
  const queryClient = useQueryClient()
  const idContrat = contrat.id_contrat!
  const { data: niveaux = [], isLoading: isLoadingNiveaux } =
    useGetNiveauxConfigClcp(idContrat)
  const { data: cadres = [], dataUpdatedAt } =
    useGetCadresLogiquesClcp(idContrat)
  const deleteMutation = useDeleteCadreLogiqueClcp(idContrat)

  const hasNiveaux = niveaux.length > 0
  const { tabsStyle } = useNiveauTabsTheme()

  const [activeNiveau, setActiveNiveau] = useState<
    NiveauConfigClcp | undefined
  >()
  const [showModal, setShowModal] = useState<ModalState | null>(null)
  const [selectedCadre, setSelectedCadre] = useState<CadreLogiqueClcp | null>(
    null
  )
  const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
  const [cadreToDelete, setCadreToDelete] = useState<CadreLogiqueClcp | null>(
    null
  )

  useEffect(() => {
    if (niveaux.length > 0 && activeNiveau === undefined) {
      setActiveNiveau(niveaux[0])
    }
  }, [niveaux, activeNiveau])

  const currentNiveauId = Number(
    activeNiveau?.id_niveau_ncl || niveaux[0]?.id_niveau_ncl || 0
  )

  const countByNiveau = useMemo(() => {
    const counts = new Map<number, number>()
    for (const c of cadres) {
      const n = resolveNiveauClcId(c.niveau_clc)
      if (n == null) continue
      counts.set(n, (counts.get(n) ?? 0) + 1)
    }
    return counts
  }, [cadres])

  const handleEdit = useCallback((cadre: CadreLogiqueClcp) => {
    setSelectedCadre(cadre)
    setShowModal('form')
  }, [])

  const handleDeleteRequest = useCallback(
    (cadre: CadreLogiqueClcp) => {
      setCadreToDelete(cadre)
      setDeleteOpen('delete')
    },
    [setDeleteOpen]
  )

  const handleConfirmDelete = (cadre: CadreLogiqueClcp) => {
    deleteMutation.mutate(cadre.id_clc, {
      onSuccess: () => {
        toast.success('Cadre supprimé')
        setCadreToDelete(null)
        setDeleteOpen(null)
      },
      onError: () => toast.error('Erreur lors de la suppression'),
    })
  }

  const handleClose = () => {
    invalidateAndRefetch(queryClient, [
      cadreLogiqueClcpQueryKeys.byContrat(idContrat),
    ])
    invalidateAndRefetch(queryClient, [
      niveauConfigClcpQueryKeys.byContrat(idContrat),
    ])
    setShowModal(null)
    setSelectedCadre(null)
  }

  if (!idContrat) {
    return (
      <p className='text-sm text-muted-foreground'>
        Identifiant du contrat manquant.
      </p>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-muted-foreground'>
          Configurez d&apos;abord les niveaux, puis ajoutez les cadres logiques
          par niveau.
        </p>
        <Button type='button' variant='outline' onClick={() => setShowModal('niveaux')}>
          <Settings className='h-4 w-4' />
          Niveaux
        </Button>
      </div>

      {!isLoadingNiveaux && !hasNiveaux ? (
        <Card className='border-dashed p-6 text-center'>
          <p className='mb-3 text-sm text-muted-foreground'>
            Configurez les niveaux du cadre de résultats avant d&apos;ajouter
            des cadres logiques.
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
          key={niveaux.length}
          value={String(currentNiveauId)}
          onValueChange={(value) => {
            const niv = niveaux.find((n) => String(n.id_niveau_ncl) === value)
            setActiveNiveau(niv)
          }}
        >
          <div className='flex items-center justify-between gap-4'>
            <div className='flex-1 overflow-x-auto'>
              <NiveauTabsList>
                {niveaux.map((n) => (
                  <NiveauTabTrigger
                    key={n.id_niveau_ncl}
                    value={String(n.id_niveau_ncl)}
                    count={countByNiveau.get(n.id_niveau_ncl) ?? 0}
                  >
                    {getNiveauClcpLabel(n)}
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
              Nouveau{' '}
              {activeNiveau ? getNiveauClcpLabel(activeNiveau) : 'cadre'}
            </Button>
          </div>

          {niveaux.map((n) => (
            <TabsContent key={n.id_niveau_ncl} value={String(n.id_niveau_ncl)}>
              {n.id_niveau_ncl === currentNiveauId && (
                <CadreLogiqueClcpNiveauTable
                  niveau={n}
                  niveaux={niveaux}
                  cadres={cadres}
                  tableKey={`cadres-clcp-${n.id_niveau_ncl}-${dataUpdatedAt}-${cadres.length}`}
                  onEdit={handleEdit}
                  onDeleteRequest={handleDeleteRequest}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {cadreToDelete && (
        <GenericDeleteDialog<CadreLogiqueClcp>
          open={deleteOpen === 'delete'}
          onOpenChange={(isOpen) => setDeleteOpen(isOpen ? 'delete' : null)}
          currentRow={cadreToDelete}
          entityName='le cadre logique'
          getEntityLabel={(row) => row.intitule_clc}
          onDelete={handleConfirmDelete}
        />
      )}

      <Dialog
        open={showModal === 'niveaux'}
        onOpenChange={(o) => !o && handleClose()}
      >
        <DialogContent className='sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle>
              Configuration des niveaux du cadre de résultat
            </DialogTitle>
            <DialogDescription>
              Définissez les niveaux du cadre logique du contrat de performance.
            </DialogDescription>
          </DialogHeader>
          <NiveauConfigClcpManager idContrat={idContrat} />
        </DialogContent>
      </Dialog>

      {activeNiveau && (
        <Dialog
          open={showModal === 'form'}
          onOpenChange={(o) => !o && handleClose()}
        >
          <DialogContent className='sm:max-w-3xl' aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>
                {selectedCadre
                  ? 'Modifier le cadre logique'
                  : 'Créer un cadre logique'}
              </DialogTitle>
            </DialogHeader>
            <CadreLogiqueClcpFormDialog
              idContrat={idContrat}
              niveau={activeNiveau}
              niveaux={niveaux}
              cadres={cadres}
              cadre={selectedCadre}
              onClose={handleClose}
              onSuccess={handleClose}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
