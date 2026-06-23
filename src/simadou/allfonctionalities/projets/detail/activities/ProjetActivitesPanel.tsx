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
import type { ActiviteProjet, NiveauActiviteProjet, Projet } from '@/simadou/allTypes'
import { buildActiviteProjetColumns } from '@/simadou/allColonnes/activite-projet-columns'
import {
  useDeleteActiviteProjet,
  useGetActivitesProjet,
  useGetNiveauxActiviteProjet,
} from '@/simadou/allHooks/admin/activiteProjetHooks'
import { useGetAllIndicateursPerformanceProjet } from '@/simadou/allHooks/admin/indicateurPerformanceProjetHooks'
import { buildIndicateurCountByActiviteCode } from '@/simadou/lib/indicateurPerformanceUtils'
import ActiviteProjetFormDialog from './ActiviteProjetFormDialog'
import NiveauActiviteProjetManager from './NiveauActiviteProjetManager'
import SourceFinancementManager from './sourceFinancement/SourceFinancementProjetDialog'
import IndicateurPerformanceActiviteManager from './indicateurActivite/ProjetActivityIndicatorsPanel'

type ModalState = 'form' | 'niveaux'

function ActiviteProjetNiveauTable({
  niveauId,
  activites,
  allActivites,
  niveaux,
  tableKey,
  onEdit,
  onDeleteRequest,
  isLastLevel,
  indicateurCountByActiviteCode,
}: {
  niveauId: number
  activites: ActiviteProjet[]
  allActivites: ActiviteProjet[]
  niveaux: NiveauActiviteProjet[]
  tableKey: string
  onEdit: (row: ActiviteProjet) => void
  onDeleteRequest: (row: ActiviteProjet) => void
  isLastLevel: boolean
  indicateurCountByActiviteCode: Map<string, number>
}) {
  const { search, navigate } = useEmbeddedTableState()
  const [planifierSource, setPlanifierSource] = useState<ActiviteProjet | null>(null)
  const [showPlanificationModal, setShowPlanificationModal] = useState(false)
  const [showPlanificationIndicateurModal, setShowPlanificationIndicateurModal] = useState(false)

  // ✅ Récupérer le niveau correspondant pour avoir le nombre
  const currentNiveau = useMemo(() => {
    return niveaux.find(n => n.id_niveau_activite_projet === niveauId)
  }, [niveaux, niveauId])

  const niveauNum = currentNiveau?.nombre_niveau_activite_projet || 1
  const showParent = (currentNiveau?.nombre_niveau_activite_projet || 1) > 1

  const onOpenPlanification = useCallback((activite: ActiviteProjet) => {
    setPlanifierSource(activite)
    setShowPlanificationModal(true)
  }, [])

  const onOpenPlanificationIndicateur = useCallback((activite: ActiviteProjet) => {
    setPlanifierSource(activite)
    setShowPlanificationIndicateurModal(true)
  }, [])

  const getParentAtLevel = useCallback(
    (row: ActiviteProjet, targetNiveau: number): string => {
      let current = row
      let currentNiveau = niveauNum

      while (currentNiveau > targetNiveau && current.parent_activite_projet) {
        const parentId = typeof current.parent_activite_projet === 'number'
          ? current.parent_activite_projet
          : current.parent_activite_projet?.id_activite_projet

        if (!parentId) break

        const parent = allActivites.find((p) => p.id_activite_projet === parentId)
        if (!parent) break

        current = parent
        currentNiveau = Number(parent.niveau_activite_projet)
      }

      if (currentNiveau === targetNiveau) {
        return `${current.code_activite_projet} — ${current.intitule_activite_projet}`
      }
      return '—'
    },
    [allActivites, niveauNum]
  )

  const getIndicateurCount = useCallback(
    (activite: ActiviteProjet) =>
      indicateurCountByActiviteCode.get(activite.code_activite_projet) ?? 0,
    [indicateurCountByActiviteCode]
  )

  const columns = useMemo(
    () =>
      buildActiviteProjetColumns({
        showParent,
        getParentAtLevel,
        niveaux,
        niveauActuel: niveauNum,
        onEdit,
        onDeleteRequest,
        onOpenPlanification,
        onOpenPlanificationIndicateur,
        getIndicateurCount,
        isLastLevel,
      }),
    [
      showParent,
      getParentAtLevel,
      niveaux,
      niveauNum,
      onEdit,
      onDeleteRequest,
      onOpenPlanification,
      onOpenPlanificationIndicateur,
      getIndicateurCount,
      isLastLevel,
    ]
  )

  // ✅ Filtrer les activités par ID du niveau (correspondance directe)
  const rows = useMemo(
    () => activites.filter((a) => Number(a.niveau_activite_projet) === niveauId),
    [activites, niveauId]
  )

  return (
    <>
      <GenericTable<ActiviteProjet>
        key={tableKey}
        data={rows}
        columns={columns}
        search={search}
        navigate={navigate}
        searchKey='intitule_activite_projet'
        searchPlaceholder='Filtrer les activités…'
        urlFilterConfig={[
          { columnId: 'intitule_activite_projet', searchKey: 'intitule_activite_projet', type: 'string' },
        ]}
        defaultPageSize={10}
        showViewOptions={false}
        emptyMessage='Aucune activité pour ce niveau'
      />

      {showPlanificationModal && planifierSource && (
        <SourceFinancementManager
          activite={planifierSource}
          open={showPlanificationModal}
          onOpenChange={(open) => {
            setShowPlanificationModal(open)
            if (!open) setPlanifierSource(null)
          }}
        />
      )}

      {showPlanificationIndicateurModal && planifierSource && (
        <IndicateurPerformanceActiviteManager
          activite={planifierSource}
          open={showPlanificationIndicateurModal}
          onOpenChange={(open) => {
            setShowPlanificationIndicateurModal(open)
            if (!open) setPlanifierSource(null)
          }}
        />
      )}
    </>
  )
}

export default function ProjetActivitesPanel({ projet }: { projet: Projet }) {
  const codeProjet = projet.code_projet
  const { data: niveaux = [], isLoading: isLoadingNiveaux } =
    useGetNiveauxActiviteProjet(codeProjet)
  const { data: activites = [], dataUpdatedAt } = useGetActivitesProjet(codeProjet)
  const { data: allIndicateurs = [], dataUpdatedAt: indicateursUpdatedAt } =
    useGetAllIndicateursPerformanceProjet()
  const deleteMutation = useDeleteActiviteProjet()

  // ✅ Trier les niveaux par nombre_niveau_activite_projet (ordre logique 1, 2, 3...)
  const sortedNiveaux = useMemo(
    () =>
      [...niveaux]
        .map((n) => ({
          ...n,
          id_niveau_activite_projet: Number(n.id_niveau_activite_projet),
          nombre_niveau_activite_projet: Number(n.nombre_niveau_activite_projet),
        }))
        .filter((n) => Number.isFinite(n.id_niveau_activite_projet))
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
  const [selectedActivite, setSelectedActivite] = useState<ActiviteProjet | null>(null)
  const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
  const [activiteToDelete, setActiviteToDelete] = useState<ActiviteProjet | null>(null)

  useEffect(() => {
    if (sortedNiveaux.length > 0 && tabActive === '') {
      const first = sortedNiveaux[0]
      setTabActive(String(first.id_niveau_activite_projet))
      setAddBoutonLabel(first.libelle_niveau_activite_projet)
    }
  }, [sortedNiveaux, tabActive])

  // ✅ ID du niveau actif (utilisé pour les onglets)
  const currentNiveauId = Number(tabActive || sortedNiveaux[0]?.id_niveau_activite_projet || 0)

  // ✅ Récupérer l'objet niveau complet pour avoir le nombre
  const currentNiveauObj = useMemo(() => {
    return sortedNiveaux.find(n => n.id_niveau_activite_projet === currentNiveauId)
  }, [sortedNiveaux, currentNiveauId])

  // ✅ Le nombre du niveau actif (utilisé pour l'affichage et la logique métier)
  const currentNiveauNumber = currentNiveauObj?.nombre_niveau_activite_projet || 1

  // ✅ Compter les activités par ID de niveau
  // ⚠️ activite.niveau_activite_projet stocke directement l'ID du niveau
  // Donc correspondance directe : activite.niveau_activite_projet = niveau.id_niveau_activite_projet
  const countByNiveauId = useMemo(() => {
    const counts = new Map<number, number>()

    for (const a of activites) {
      // Récupérer l'ID du niveau de l'activité (correspondance directe)
      const niveauId = Number(a.niveau_activite_projet)
      if (!Number.isFinite(niveauId)) continue

      // Vérifier que cet ID existe dans sortedNiveaux
      const niveau = sortedNiveaux.find(n => n.id_niveau_activite_projet === niveauId)
      if (niveau) {
        counts.set(niveauId, (counts.get(niveauId) ?? 0) + 1)
      }
    }
    return counts
  }, [activites, sortedNiveaux])

  const indicateurCountByActiviteCode = useMemo(
    () => buildIndicateurCountByActiviteCode(allIndicateurs, activites),
    [allIndicateurs, activites]
  )

  // ✅ Options parent basées sur le niveau précédent
  const parentOptions = useMemo(() => {
    // Si on est au niveau 1, pas de parent
    if (currentNiveauNumber <= 1) return []

    // 🔑 Trouver l'ID du niveau précédent (currentNiveauNumber - 1)
    const previousNiveau = sortedNiveaux.find(
      (n) => n.nombre_niveau_activite_projet === currentNiveauNumber - 1
    )

    if (!previousNiveau) return []

    // ✅ Filtrer les activités du niveau précédent par son ID
    const parents = activites.filter(
      (a) => Number(a.niveau_activite_projet) === previousNiveau.id_niveau_activite_projet
    )

    return parents.map((p) => ({
      value: p.id_activite_projet,
      label: `${p.code_activite_projet} — ${p.intitule_activite_projet}`,
    }))
  }, [activites, currentNiveauNumber, sortedNiveaux])


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

  // ✅ Déterminer si le niveau actuel est le dernier (basé sur le nombre)
  const isLastLevel = useMemo(() => {
    const maxNiveau = Math.max(...sortedNiveaux.map(n => n.nombre_niveau_activite_projet), 0)
    return currentNiveauNumber === maxNiveau
  }, [currentNiveauNumber, sortedNiveaux])

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
          // ✅ Value basée sur l'ID du niveau
          value={String(currentNiveauId)}
          onValueChange={(val) => {
            const n = sortedNiveaux.find(
              (x) => String(x.id_niveau_activite_projet) === val
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
                  // ✅ Value basée sur l'ID du niveau
                  value={String(niveau.id_niveau_activite_projet)}
                  // ✅ Compteur basé sur l'ID du niveau (correspondance directe)
                  count={countByNiveauId.get(niveau.id_niveau_activite_projet) ?? 0}
                >
                  {niveau.libelle_niveau_activite_projet}
                </NiveauTabTrigger>
              ))}
            </NiveauTabsList>
          </div>

          {sortedNiveaux.map((niveau) => (
            <TabsContent
              key={niveau.id_niveau_activite_projet}
              // ✅ Value basée sur l'ID du niveau
              value={String(niveau.id_niveau_activite_projet)}
              className='focus-visible:outline-none'
            >
              {niveau.id_niveau_activite_projet === currentNiveauId && (
                <ActiviteProjetNiveauTable
                  // ✅ Passer l'ID du niveau (correspondance directe)
                  niveauId={niveau.id_niveau_activite_projet}
                  activites={activites}
                  allActivites={activites}
                  niveaux={sortedNiveaux}
                  tableKey={`activites-${niveau.id_niveau_activite_projet}-${dataUpdatedAt}-${activites.length}-${indicateursUpdatedAt}`}
                  onEdit={handleEdit}
                  onDeleteRequest={handleDeleteRequest}
                  isLastLevel={isLastLevel}
                  indicateurCountByActiviteCode={indicateurCountByActiviteCode}
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
            // ✅ Passer l'ID du niveau (correspondance directe)
            niveau={currentNiveauId}
            niveauNombre={currentNiveauNumber}
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