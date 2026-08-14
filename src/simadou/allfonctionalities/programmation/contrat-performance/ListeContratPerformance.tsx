import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { GenericTable } from '@/Global/Generic/Generictable'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import { useActiveProgrammeCode, useActiveProgrammeId } from '@/hooks/use-active-programme'
import { useGetContratsPerformance } from '@/simadou/allHooks/admin/contratPerformanceHooks'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import { GenericDialogs } from '@/Global/Generic/Genericdialogs'
import { useDeleteContratPerformance } from '@/simadou/allHooks/admin/contratPerformanceHooks'
import { usePtbaVersionSelection } from '@/simadou/allHooks/admin/versionHooks'
import { PtbaVersionSelect } from '@/simadou/allfonctionalities/ptba/PtbaVersionSelect'
import AddContratPerformance from './AddContratPerformance'
import type { ContratPerformance } from '@/simadou/allTypes/contratPerformance'
import { buildContratPerformanceColumns } from '@/simadou/allColonnes/contrat-performance-columns'

export default function ListeContratPerformance() {
  const { search, navigate } = useEmbeddedTableState()
  const routerNavigate = useNavigate()
  const programmeId = useActiveProgrammeId()
  const programmeCode = useActiveProgrammeCode()
  const [open, setOpen] = useDialogState<'add' | 'edit' | 'delete'>(null)
  const [currentRow, setCurrentRow] = useState<ContratPerformance | null>(null)

  const { selectedVersionId, handleChangeVersion, versionOptions } = usePtbaVersionSelection(programmeCode)
  const { data: contrats = [] } = useGetContratsPerformance(programmeId)
  const deleteMutation = useDeleteContratPerformance(programmeId)

  const filteredContrats = useMemo(() => {
    if (!selectedVersionId) return contrats
    const selectedVersionNumber = Number(selectedVersionId)
    return contrats.filter((contrat) => typeof contrat.version_ptba === 'object' && contrat.version_ptba?.id_version_ptba === selectedVersionNumber)
  }, [contrats, selectedVersionId])

  const handleDetail = (contrat: ContratPerformance) => {
    if (!contrat.id_contrat) return

    routerNavigate({
      to: '/programmation/contrat-performance/$id',
      params: { id: String(contrat.id_contrat) },
    })
  }

  const columns = useMemo(
    () => buildContratPerformanceColumns(setOpen, setCurrentRow, handleDetail),
    [setOpen, setCurrentRow, routerNavigate]
  )

  return (
    <>
      <GenericTable<ContratPerformance>
        data={filteredContrats}
        columns={columns}
        search={search}
        navigate={navigate}
        searchKey='intitule_contrat'
        searchPlaceholder='Filtrer les contrats…'
        urlFilterConfig={[
          { columnId: 'intitule_contrat', searchKey: 'intitule_contrat', type: 'string' },
          { columnId: 'code_contrat', searchKey: 'code_contrat', type: 'string' },
        ]}
        defaultPageSize={10}
        showViewOptions={false}
        toolbarEndSlot={
          <PtbaVersionSelect
            options={versionOptions}
            value={selectedVersionId}
            onChange={handleChangeVersion}
          />
        }
        emptyMessage='Aucun contrat de performance trouvé.'
      />

      <GenericDialogs<ContratPerformance, 'add' | 'edit' | 'delete'>
        open={open}
        setOpen={setOpen}
        currentRow={currentRow}
        setCurrentRow={setCurrentRow}
        rowRequiredDialogs={['edit', 'delete']}
        dialogMap={{
          edit: (props) => (
            <AddContratPerformance
              key={`contrat-edit-${currentRow?.id_contrat ?? 'new'}`}
              open={props.open}
              onOpenChange={props.onOpenChange}
              currentRow={props.currentRow as ContratPerformance}
            />
          ),
          delete: (props) => (
            <GenericDeleteDialog<ContratPerformance>
              key={`contrat-delete-${currentRow?.id_contrat ?? 'new'}`}
              {...props}
              currentRow={props.currentRow as ContratPerformance}
              entityName='contrat de performance'
              getEntityLabel={(row) => row.intitule_contrat}
              onDelete={(row) => deleteMutation.mutate(row.id_contrat!)}
            />
          ),
        }}
      />
    </>
  )
}
