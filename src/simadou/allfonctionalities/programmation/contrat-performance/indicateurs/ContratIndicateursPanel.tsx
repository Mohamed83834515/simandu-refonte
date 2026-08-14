import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import { buildIndicateurContratColumns } from '@/simadou/allColonnes/indicateur-contrat-columns'
import {
  useGetCadresLogiquesClcp,
  useGetNiveauxConfigClcp,
} from '@/simadou/allHooks/admin/cadreLogiqueClcpHooks'
import {
  useDeleteIndicateurContrat,
  useGetIndicateursContrat,
} from '@/simadou/allHooks/admin/indicateurContratHooks'
import type { ContratPerformance } from '@/simadou/allTypes/contratPerformance'
import type { IndicateurContrat } from '@/simadou/allTypes/indicateurContrat'
import type { NiveauConfigClcp } from '@/simadou/allTypes/niveauConfigClcp'
import { getNiveauClcpLabel } from '@/simadou/lib/cadreLogiqueClcpUtils'
import {
  filterCadresByNiveauClcp,
  filterIndicateursByNiveauClcp,
} from '@/simadou/lib/indicateurContratUtils'
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
import IndicateurContratFormDialog from './IndicateurContratFormDialog'
import SuiviIndicateurContratManager from './SuiviIndicateurContratManager'

function IndicateurContratNiveauTable({
  indicateurs,
  cadres,
  tableKey,
  onEdit,
  onDeleteRequest,
  onSuivi,
}: {
  indicateurs: IndicateurContrat[]
  cadres: ReturnType<typeof useGetCadresLogiquesClcp>['data']
  tableKey: string
  onEdit: (row: IndicateurContrat) => void
  onDeleteRequest: (row: IndicateurContrat) => void
  onSuivi: (row: IndicateurContrat) => void
}) {
  const { search, navigate } = useEmbeddedTableState()
  const columns = useMemo(
    () =>
      buildIndicateurContratColumns({
        cadres: cadres ?? [],
        onEdit,
        onDeleteRequest,
        onSuivi,
        hideClcpColumn: true,
      }),
    [cadres, onEdit, onDeleteRequest, onSuivi]
  )

  return (
    <GenericTable<IndicateurContrat>
      key={tableKey}
      data={indicateurs}
      columns={columns}
      search={search}
      navigate={navigate}
      searchKey='intitule_indicateur'
      searchPlaceholder='Filtrer les indicateurs…'
      urlFilterConfig={[
        {
          columnId: 'intitule_indicateur',
          searchKey: 'intitule_indicateur',
          type: 'string',
        },
      ]}
      defaultPageSize={10}
      showViewOptions={false}
      emptyMessage='Aucun indicateur pour ce niveau'
    />
  )
}

export default function ContratIndicateursPanel({
  contrat,
}: {
  contrat: ContratPerformance
}) {
  const idContrat = contrat.id_contrat!
  const { data: niveaux = [], isLoading: isLoadingNiveaux } =
    useGetNiveauxConfigClcp(idContrat)
  const { data: cadres = [], dataUpdatedAt: cadresUpdatedAt } =
    useGetCadresLogiquesClcp(idContrat)

  const cadreIds = useMemo(() => cadres.map((c) => c.id_clc), [cadres])
  const { data: indicateurs = [], dataUpdatedAt: indicateursUpdatedAt } =
    useGetIndicateursContrat(idContrat, cadreIds)

  const deleteMutation = useDeleteIndicateurContrat(idContrat)
  const hasNiveaux = niveaux.length > 0
  const { tabsStyle } = useNiveauTabsTheme()

  const [activeNiveau, setActiveNiveau] = useState<
    NiveauConfigClcp | undefined
  >()
  const [showForm, setShowForm] = useState(false)
  const [selectedIndicateur, setSelectedIndicateur] =
    useState<IndicateurContrat | null>(null)
  const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
  const [indicateurToDelete, setIndicateurToDelete] =
    useState<IndicateurContrat | null>(null)
  const [suiviIndicateur, setSuiviIndicateur] =
    useState<IndicateurContrat | null>(null)

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
    for (const n of niveaux) {
      const filtered = filterIndicateursByNiveauClcp(
        indicateurs,
        cadres,
        n.id_niveau_ncl
      )
      counts.set(n.id_niveau_ncl, filtered.length)
    }
    return counts
  }, [niveaux, indicateurs, cadres])

  const indicateursForActiveNiveau = useMemo(
    () =>
      filterIndicateursByNiveauClcp(indicateurs, cadres, currentNiveauId),
    [indicateurs, cadres, currentNiveauId]
  )

  const cadresForActiveNiveau = useMemo(
    () => filterCadresByNiveauClcp(cadres, currentNiveauId),
    [cadres, currentNiveauId]
  )

  const handleEdit = useCallback((indicateur: IndicateurContrat) => {
    setSelectedIndicateur(indicateur)
    setShowForm(true)
  }, [])

  const handleDeleteRequest = useCallback(
    (indicateur: IndicateurContrat) => {
      setIndicateurToDelete(indicateur)
      setDeleteOpen('delete')
    },
    [setDeleteOpen]
  )

  const handleSuivi = useCallback((indicateur: IndicateurContrat) => {
    setSuiviIndicateur(indicateur)
  }, [])

  const handleConfirmDelete = (indicateur: IndicateurContrat) => {
    deleteMutation.mutate(indicateur.id_indicateur_contrat, {
      onSuccess: () => {
        toast.success('Indicateur supprimé')
        setIndicateurToDelete(null)
        setDeleteOpen(null)
      },
      onError: () => toast.error('Erreur lors de la suppression'),
    })
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setSelectedIndicateur(null)
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
      <p className='text-sm text-muted-foreground'>
        Planifiez les indicateurs de résultats par niveau du cadre logique.
        Les cadres disponibles dans le formulaire dépendent du niveau
        sélectionné.
      </p>

      {!isLoadingNiveaux && !hasNiveaux ? (
        <Card className='border-dashed p-6 text-center'>
          <p className='text-sm text-muted-foreground'>
            Configurez d&apos;abord les niveaux et cadres logiques dans
            l&apos;onglet Cadre de résultat.
          </p>
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
                setSelectedIndicateur(null)
                setShowForm(true)
              }}
              disabled={
                isLoadingNiveaux || cadresForActiveNiveau.length === 0
              }
            >
              <Plus className='h-4 w-4' />
              Nouvel indicateur
            </Button>
          </div>

          {niveaux.map((n) => (
            <TabsContent key={n.id_niveau_ncl} value={String(n.id_niveau_ncl)}>
              {n.id_niveau_ncl === currentNiveauId && (
                <IndicateurContratNiveauTable
                  indicateurs={indicateursForActiveNiveau}
                  cadres={cadres}
                  tableKey={`indicateurs-clcp-${n.id_niveau_ncl}-${cadresUpdatedAt}-${indicateursUpdatedAt}-${indicateursForActiveNiveau.length}`}
                  onEdit={handleEdit}
                  onDeleteRequest={handleDeleteRequest}
                  onSuivi={handleSuivi}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {indicateurToDelete && (
        <GenericDeleteDialog<IndicateurContrat>
          open={deleteOpen === 'delete'}
          onOpenChange={(isOpen) => setDeleteOpen(isOpen ? 'delete' : null)}
          currentRow={indicateurToDelete}
          entityName="l'indicateur"
          getEntityLabel={(row) => row.intitule_indicateur}
          onDelete={handleConfirmDelete}
        />
      )}

      {activeNiveau && (
        <Dialog open={showForm} onOpenChange={(o) => !o && handleCloseForm()}>
          <DialogContent className='sm:max-w-3xl' aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>
                {selectedIndicateur
                  ? "Modifier l'indicateur"
                  : 'Créer un indicateur de résultat'}
              </DialogTitle>
            </DialogHeader>
            <IndicateurContratFormDialog
              idContrat={idContrat}
              niveau={activeNiveau}
              cadres={cadres}
              indicateur={selectedIndicateur}
              onClose={handleCloseForm}
              onSuccess={handleCloseForm}
            />
          </DialogContent>
        </Dialog>
      )}

      <Dialog
        open={suiviIndicateur != null}
        onOpenChange={(o) => !o && setSuiviIndicateur(null)}
      >
        <DialogContent className='sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Suivi de l&apos;indicateur</DialogTitle>
            <DialogDescription>
              Saisissez la valeur réalisée, le trimestre et une observation.
            </DialogDescription>
          </DialogHeader>
          {suiviIndicateur && (
            <SuiviIndicateurContratManager indicateur={suiviIndicateur} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
