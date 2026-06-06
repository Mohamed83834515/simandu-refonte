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
import {
  Tabs,
  TabsContent,
} from '@/components/ui/tabs'
import { NiveauTabTrigger, NiveauTabsList, useNiveauTabsTheme } from '@/components/ui/NiveauTabs'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { ActiviteProjet, Projet } from '@/simadou/allTypes'
import { buildActiviteProjetColumns } from '@/simadou/allColonnes/activite-projet-columns'
import {
  useDeleteActiviteProjet,
  useGetActivitesProjet,
  useGetNiveauxActiviteProjet,
} from '@/simadou/allHooks/admin/activiteProjetHooks'
import ActiviteProjetFormDialog from './ActiviteProjetFormDialog'
import NiveauActiviteProjetManager from './NiveauActiviteProjetManager'

type ModalState = 'form' | 'niveaux'

function ActiviteProjetNiveauTable({
  niveauNum,
  showParent,
  activites,
  allActivites,
  tableKey,
  onEdit,
  onDeleteRequest,
}: {
  niveauNum: number
  showParent: boolean
  activites: ActiviteProjet[]
  allActivites: ActiviteProjet[]
  tableKey: string
  onEdit: (row: ActiviteProjet) => void
  onDeleteRequest: (row: ActiviteProjet) => void
}) {
  const { search, navigate } = useEmbeddedTableState()

  const getParentLabel = useCallback(
    (row: ActiviteProjet) => {
      const parentId =
        typeof row.parent_activite_projet === 'number'
          ? row.parent_activite_projet
          : typeof row.parent_activite_projet === 'object' &&
              row.parent_activite_projet
            ? row.parent_activite_projet.id_activite_projet
            : null
      if (parentId == null) return '—'
      const parent = allActivites.find((p) => p.id_activite_projet === parentId)
      return parent
        ? `${parent.code_activite_projet} — ${parent.intitule_activite_projet}`
        : '—'
    },
    [allActivites]
  )

  const columns = useMemo(
    () =>
      buildActiviteProjetColumns({
        showParent,
        getParentLabel,
        onEdit,
        onDeleteRequest,
      }),
    [showParent, getParentLabel, onEdit, onDeleteRequest]
  )

  const rows = useMemo(
    () =>
      activites.filter(
        (a) => Number(a.niveau_activite_projet) === niveauNum
      ),
    [activites, niveauNum]
  )

  return (
    <GenericTable<ActiviteProjet>
      key={tableKey}
      data={rows}
      columns={columns}
      search={search}
      navigate={navigate}
      searchKey='intitule_activite_projet'
      searchPlaceholder='Filtrer les activités…'
      urlFilterConfig={[
        {
          columnId: 'intitule_activite_projet',
          searchKey: 'intitule_activite_projet',
          type: 'string',
        },
      ]}
      defaultPageSize={10}
      showViewOptions={false}
      emptyMessage='Aucune activité pour ce niveau'
    />
  )
}

export default function ProjetActivitesPanel({ projet }: { projet: Projet }) {
  const codeProjet = projet.code_projet
  const { data: niveaux = [], isLoading: isLoadingNiveaux } =
    useGetNiveauxActiviteProjet(codeProjet)
  const { data: activites = [], dataUpdatedAt } = useGetActivitesProjet(codeProjet)
  const deleteMutation = useDeleteActiviteProjet()

  const sortedNiveaux = useMemo(
    () =>
      [...niveaux]
        .map((n) => ({
          ...n,
          nombre_niveau_activite_projet: Number(n.nombre_niveau_activite_projet),
        }))
        .filter((n) => Number.isFinite(n.nombre_niveau_activite_projet))
        .sort(
          (a, b) =>
            a.nombre_niveau_activite_projet - b.nombre_niveau_activite_projet
        ),
    [niveaux]
  )

  const hasNiveaux = sortedNiveaux.length > 0
  const { tabsStyle } = useNiveauTabsTheme()

  const [tabActive, setTabActive] = useState<string>('')
  const [addBoutonLabel, setAddBoutonLabel] = useState<string>('une activité')
  const [showModal, setShowModal] = useState<ModalState | null>(null)
  const [selectedActivite, setSelectedActivite] = useState<ActiviteProjet | null>(
    null
  )
  const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
  const [activiteToDelete, setActiviteToDelete] = useState<ActiviteProjet | null>(
    null
  )

  useEffect(() => {
    if (sortedNiveaux.length > 0 && tabActive === '') {
      const first = sortedNiveaux[0]
      setTabActive(String(first.nombre_niveau_activite_projet))
      setAddBoutonLabel(first.libelle_niveau_activite_projet)
    }
  }, [sortedNiveaux, tabActive])

  const currentNiveau = Number(
    tabActive || sortedNiveaux[0]?.nombre_niveau_activite_projet || 1
  )

  const countByNiveau = useMemo(() => {
    const counts = new Map<number, number>()
    for (const a of activites) {
      const n = Number(a.niveau_activite_projet)
      if (!Number.isFinite(n)) continue
      counts.set(n, (counts.get(n) ?? 0) + 1)
    }
    return counts
  }, [activites])

  const parentOptions = useMemo(() => {
    if (currentNiveau <= 1) return []
    const parents = activites.filter(
      (a) => Number(a.niveau_activite_projet) === currentNiveau - 1
    )
    return parents.map((p) => ({
      value: p.id_activite_projet,
      label: `${p.code_activite_projet} — ${p.intitule_activite_projet}`,
    }))
  }, [activites, currentNiveau])

  const handleAdd = () => {
    if (!hasNiveaux) {
      toast.info('Configurez d’abord les niveaux d’activité.')
      setShowModal('niveaux')
      return
    }
    setSelectedActivite(null)
    setShowModal('form')
  }

  const handleEdit = useCallback((activite: ActiviteProjet) => {
    setSelectedActivite(activite)
    setShowModal('form')
  }, [])

  const handleDeleteRequest = useCallback((activite: ActiviteProjet) => {
    setActiviteToDelete(activite)
    setDeleteOpen('delete')
  }, [setDeleteOpen])

  const handleConfirmDelete = (activite: ActiviteProjet) => {
    deleteMutation.mutate(activite.id_activite_projet, {
      onSuccess: () => {
        toast.success('Activité supprimée')
        setActiviteToDelete(null)
        setDeleteOpen(null)
      },
      onError: () => toast.error("Erreur lors de la suppression de l'activité"),
    })
  }

  const handleClose = () => {
    setShowModal(null)
    setSelectedActivite(null)
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-muted-foreground'>
          Configurez d’abord les niveaux, puis ajoutez les activités par niveau.
        </p>

        <div className='flex flex-col gap-2 sm:flex-row'>
          <Button type='button' variant='outline' onClick={() => setShowModal('niveaux')}>
            <Settings className='h-4 w-4' />
            Niveaux
          </Button>
          <Button type='button' onClick={handleAdd} disabled={isLoadingNiveaux}>
            <Plus className='h-4 w-4' />
            Ajouter {addBoutonLabel}
          </Button>
        </div>
      </div>

      {!isLoadingNiveaux && !hasNiveaux ? (
        <Card className='border-dashed p-6'>
          <div className='flex flex-col items-center gap-3 text-center'>
            <Settings className='h-10 w-10 text-muted-foreground' />
            <div className='space-y-1'>
              <h3 className='text-base font-semibold'>Configuration requise</h3>
              <p className='text-sm text-muted-foreground'>
                Veuillez d&apos;abord configurer les niveaux d&apos;activité projet
                avant de pouvoir ajouter des activités.
              </p>
            </div>
            <Button type='button' onClick={() => setShowModal('niveaux')}>
              <Settings className='h-4 w-4' />
              Configurer les niveaux
            </Button>
          </div>
        </Card>
      ) : (
        <Tabs
          orientation='vertical'
          className='space-y-4'
          style={tabsStyle}
          key={sortedNiveaux.length}
          value={String(currentNiveau)}
          onValueChange={(val) => {
            const n = sortedNiveaux.find(
              (x) => String(x.nombre_niveau_activite_projet) === val
            )
            setTabActive(val)
            setAddBoutonLabel(n?.libelle_niveau_activite_projet ?? 'une activité')
          }}
        >
          <div className='overflow-x-auto'>
            <NiveauTabsList>
              {sortedNiveaux.map((niveau) => (
                <NiveauTabTrigger
                  key={niveau.id_niveau_activite_projet}
                  value={String(niveau.nombre_niveau_activite_projet)}
                  count={countByNiveau.get(niveau.nombre_niveau_activite_projet) ?? 0}
                >
                  {niveau.libelle_niveau_activite_projet}
                </NiveauTabTrigger>
              ))}
            </NiveauTabsList>
          </div>

          {sortedNiveaux.map((niveau) => (
            <TabsContent
              key={niveau.id_niveau_activite_projet}
              value={String(niveau.nombre_niveau_activite_projet)}
              className='focus-visible:outline-none'
            >
              {String(niveau.nombre_niveau_activite_projet) === String(currentNiveau) && (
                <ActiviteProjetNiveauTable
                  niveauNum={niveau.nombre_niveau_activite_projet}
                  showParent={niveau.nombre_niveau_activite_projet > 1}
                  activites={activites}
                  allActivites={activites}
                  tableKey={`activites-${niveau.nombre_niveau_activite_projet}-${dataUpdatedAt}-${activites.length}`}
                  onEdit={handleEdit}
                  onDeleteRequest={handleDeleteRequest}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {activiteToDelete && (
        <GenericDeleteDialog<ActiviteProjet>
          open={deleteOpen === 'delete'}
          onOpenChange={(isOpen) => setDeleteOpen(isOpen ? 'delete' : null)}
          currentRow={activiteToDelete}
          entityName="l'activité"
          getEntityLabel={(row) => row.code_activite_projet}
          onDelete={handleConfirmDelete}
        />
      )}

      <Dialog open={showModal === 'niveaux'} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className='sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Configuration des niveaux d&apos;activité projet</DialogTitle>
            <DialogDescription>
              Définissez le nombre de niveaux et la taille des codes.
            </DialogDescription>
          </DialogHeader>
          <NiveauActiviteProjetManager codeProjet={codeProjet} />
        </DialogContent>
      </Dialog>

      <Dialog open={showModal === 'form'} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className='sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle>
              {selectedActivite
                ? 'Modifier une activité projet'
                : `Ajouter ${addBoutonLabel}`}
            </DialogTitle>
            <DialogDescription>
              Renseignez le code et l&apos;intitulé. Le niveau est déterminé par
              l&apos;onglet actif.
            </DialogDescription>
          </DialogHeader>
          <ActiviteProjetFormDialog
            projet={projet}
            niveau={currentNiveau}
            niveaux={sortedNiveaux}
            activite={selectedActivite}
            parentOptions={parentOptions}
            onClose={handleClose}
            onSuccess={handleClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
