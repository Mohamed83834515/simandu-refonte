import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useGetAllPlansSite, useDeletePlanSite } from '@/simadou/allHooks/admin/planSiteHooks'
import { PlanSiteNiveauTable } from './PlanSiteNiveauTable'
import AddPlanSite from './AddPlanSite'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import type { PlanSite } from '@/simadou/allTypes/planSite'
import { useGetNiveauxPlanSite } from '@/simadou/allHooks/admin/niveauPlanSiteHooks'
import { NiveauTabsList, NiveauTabTrigger, useNiveauTabsTheme } from '@/components/ui/NiveauTabs'
import NiveauPlanSiteManager from './niveau/NiveauPlanSiteManager'

type ModalState = 'form' | 'niveaux'

export default function ListePlanSite() {
  const { data: niveaux = [], isLoading: isLoadingNiveaux } = useGetNiveauxPlanSite()
  const { data: allPlans = [], dataUpdatedAt } = useGetAllPlansSite()
  const deleteMutation = useDeletePlanSite()

  const sortedNiveaux = useMemo(
    () => [...niveaux].sort((a: any, b: any) => a.nombre_nsc - b.nombre_nsc),
    [niveaux]
  )

  const { tabsStyle } = useNiveauTabsTheme()
  const hasNiveaux = sortedNiveaux.length > 0

  const [activeNiveauId, setActiveNiveauId] = useState<string>('')
  const [showModal, setShowModal] = useState<ModalState | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<PlanSite | null>(null)
  const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
  const [planToDelete, setPlanToDelete] = useState<PlanSite | null>(null)

  // Initialiser le premier niveau
  useEffect(() => {
    if (sortedNiveaux.length > 0 && activeNiveauId === '') {
      setActiveNiveauId(String(sortedNiveaux[0].id_nsc))
    }
  }, [sortedNiveaux, activeNiveauId])

  const currentNiveauId = Number(activeNiveauId || sortedNiveaux[0]?.id_nsc || 0)
  const currentNiveau = useMemo(
    () => sortedNiveaux.find((n: any) => n.id_nsc === currentNiveauId),
    [sortedNiveaux, currentNiveauId]
  )

  // Compter les plans par niveau
  const countByNiveau = useMemo(() => {
    const counts = new Map<number, number>()
    for (const plan of allPlans) {
      const niveauId = typeof plan.niveau_structure === 'object'
        ? (plan.niveau_structure as any)?.id_nsc
        : plan.niveau_structure
      if (niveauId == null) continue
      counts.set(niveauId, (counts.get(niveauId) ?? 0) + 1)
    }
    return counts
  }, [allPlans])

  const handleEdit = useCallback((plan: PlanSite) => {
    setSelectedPlan(plan)
    setShowModal('form')
  }, [])

  const handleDeleteRequest = useCallback(
    (plan: PlanSite) => {
      setPlanToDelete(plan)
      setDeleteOpen('delete')
    },
    [setDeleteOpen]
  )

  const handleConfirmDelete = (plan: PlanSite) => {
    deleteMutation.mutate(plan.id_ds || 0, {
      onSuccess: () => {
        toast.success('Plan site supprimé')
        setPlanToDelete(null)
        setDeleteOpen(null)
      },
      onError: () => toast.error('Erreur lors de la suppression'),
    })
  }

  const handleClose = () => {
    setShowModal(null)
    setSelectedPlan(null)
  }

  const handleSuccess = () => {
    handleClose()
  }

  if (isLoadingNiveaux) {
    return (
      <div className='flex justify-center py-8'>
        <div className='text-muted-foreground'>Chargement des niveaux...</div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-muted-foreground'>
          Configurez d&apos;abord les niveaux, puis ajoutez les plans site par niveau.
        </p>

        <div className='flex flex-col gap-2 sm:flex-row'>
          <Button type='button' variant='outline' onClick={() => setShowModal('niveaux')}>
            <Settings className='h-4 w-4' />
            Niveaux
          </Button>
        </div>
      </div>

      {!hasNiveaux ? (
        <Card className='border-dashed p-6 text-center'>
          <p className='mb-3 text-sm text-muted-foreground'>
            Aucun niveau configuré. Cliquez sur le bouton &quot;Niveaux&quot; pour commencer.
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
            <div className='overflow-x-auto flex-1'>
              <NiveauTabsList>
                {sortedNiveaux.map((n: any) => (
                  <NiveauTabTrigger
                    key={n.id_nsc}
                    value={String(n.id_nsc)}
                    count={countByNiveau.get(n.id_nsc) ?? 0}
                  >
                    {n.libelle_nsc}
                  </NiveauTabTrigger>
                ))}
              </NiveauTabsList>
            </div>

            <Button
              type='button'
              onClick={() => {
                setSelectedPlan(null)
                setShowModal('form')
              }}
              disabled={isLoadingNiveaux}
            >
              <Plus className='h-4 w-4' />
              Ajouter {currentNiveau?.libelle_nsc ?? 'plan'}
            </Button>
          </div>

          {sortedNiveaux.map((n: any) => (
            <TabsContent key={n.id_nsc} value={String(n.id_nsc)}>
              {n.id_nsc === currentNiveauId && (
                <PlanSiteNiveauTable
                  niveauId={n.id_nsc}
                  plans={allPlans}
                  tableKey={`plans-${n.id_nsc}-${dataUpdatedAt}-${allPlans.length}`}
                  onEdit={handleEdit}
                  onDeleteRequest={handleDeleteRequest}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {planToDelete && (
        <GenericDeleteDialog<PlanSite>
          open={deleteOpen === 'delete'}
          onOpenChange={(isOpen) => setDeleteOpen(isOpen ? 'delete' : null)}
          currentRow={planToDelete}
          entityName='le plan site'
          getEntityLabel={(row) => row.intutile_ds}
          onDelete={handleConfirmDelete}
        />
      )}

      {/* Dialogue Niveaux — always mounted so empty-state "Niveaux" works */}
      <Dialog open={showModal === 'niveaux'} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className='sm:max-w-3xl'>
          <NiveauPlanSiteManager onSuccess={handleClose} />
        </DialogContent>
      </Dialog>

      {/* Dialogue Formulaire Plan Site */}
      <Dialog open={showModal === 'form'} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className='sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle>
              {selectedPlan
                ? `Modifier un(e) ${currentNiveau?.libelle_nsc ?? 'structure'}`
                : `Créer un(e) ${currentNiveau?.libelle_nsc ?? 'structure'}`}
            </DialogTitle>
          </DialogHeader>
          <AddPlanSite
            currentRow={selectedPlan}
            niveauId={currentNiveauId}
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}