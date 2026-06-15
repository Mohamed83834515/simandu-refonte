import { useMemo } from 'react'
import { GenericTable } from '@/Global/Generic/Generictable'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { PlanSite } from '@/simadou/allTypes/planSite'
import { buildPlanSiteColumns } from '@/simadou/allColonnes/plan-site-columns'
import { useGetNiveauxPlanSite } from '@/simadou/allHooks/admin/niveauPlanSiteHooks'

type PlanSiteNiveauTableProps = {
  niveauId: number
  plans: PlanSite[]
  tableKey: string
  onEdit: (row: PlanSite) => void
  onDeleteRequest: (row: PlanSite) => void
}

function getNiveauIdFromPlan(plan: PlanSite): number | null {
  if (!plan.niveau_ds) return null
  if (typeof plan.niveau_ds === 'object') return (plan.niveau_ds as any).id_nsc || null
  return plan.niveau_ds
}

export function PlanSiteNiveauTable({
  niveauId,
  plans,
  tableKey,
  onEdit,
  onDeleteRequest,
}: PlanSiteNiveauTableProps) {
  const { search, navigate } = useEmbeddedTableState()
  const { data: niveaux = [] } = useGetNiveauxPlanSite()

  const currentNiveau = niveaux.find((n: any) => n.id_nsc === niveauId)

  const columns = useMemo(
    () => buildPlanSiteColumns(niveaux, currentNiveau?.nombre_nsc || 0, onEdit, onDeleteRequest),
    [niveaux, currentNiveau?.nombre_nsc, onEdit, onDeleteRequest]
  )

  const rows = useMemo(
    () => plans.filter((plan) => getNiveauIdFromPlan(plan) === niveauId),
    [plans, niveauId]
  )

  return (
    <GenericTable<PlanSite>
      key={tableKey}
      data={rows}
      columns={columns as any}
      search={search}
      navigate={navigate}
      searchKey='intutile_ds'
      searchPlaceholder='Filtrer les plans...'
      defaultPageSize={10}
      showViewOptions={false}
      showSearch={false}
      emptyMessage='Aucun plan site pour ce niveau'
    />
  )
}