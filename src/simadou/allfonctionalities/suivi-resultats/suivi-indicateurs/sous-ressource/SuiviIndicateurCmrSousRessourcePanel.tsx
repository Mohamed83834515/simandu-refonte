import { useCallback, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import { DataTableToolbarOutlineButton } from '@/components/data-table/toolbar-outline-button'
import useDialogState from '@/hooks/use-dialog-state'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import { getApiErrorMessage } from '@/lib/api-error-message'
import {
  useDeletePeriodeSousRessource,
  useGetPeriodeSousRessources,
} from '@/simadou/allHooks/admin/periodeIndicateurSousRessourceHooks'
import { buildPeriodeIndicateurSousRessourceColumns } from '@/simadou/allColonnes/periode-indicateur-sous-ressource-columns'
import type {
  PeriodeSousRessourceEnregistrement,
  PeriodeSousRessourceType,
} from '@/simadou/allTypes/periodeIndicateurSousRessource'
import { PERIODE_SOUS_RESSOURCE_LABELS } from '@/simadou/allTypes/periodeIndicateurSousRessource'
import {
  resolvePeriodeEnregistrementId,
  resolvePeriodeEnregistrementLabel,
} from '@/simadou/lib/periodeSousRessourceUtils'
import SuiviIndicateurCmrSousRessourceFormDialog from './SuiviIndicateurCmrSousRessourceFormDialog'

type SuiviIndicateurCmrSousRessourcePanelProps = {
  resource: PeriodeSousRessourceType
  parentPeriodeId: number
}

export default function SuiviIndicateurCmrSousRessourcePanel({
  resource,
  parentPeriodeId,
}: SuiviIndicateurCmrSousRessourcePanelProps) {
  const { search, navigate } = useEmbeddedTableState()
  const [open, setOpen] = useDialogState<'add' | 'edit' | 'delete'>(null)
  const [currentRow, setCurrentRow] =
    useState<PeriodeSousRessourceEnregistrement | null>(null)

  const { data = [], isLoading, isError } = useGetPeriodeSousRessources(
    parentPeriodeId,
    resource
  )
  const deleteMutation = useDeletePeriodeSousRessource(parentPeriodeId, resource)

  const resourceLabel = PERIODE_SOUS_RESSOURCE_LABELS[resource]
  const searchKey = resource === 'documentations' ? 'titre' : 'source_donnees'

  const handleAdd = useCallback(() => {
    setCurrentRow(null)
    setOpen('add')
  }, [setOpen])

  const handleEdit = useCallback(
    (row: PeriodeSousRessourceEnregistrement) => {
      setCurrentRow(row)
      setOpen('edit')
    },
    [setOpen]
  )

  const handleDeleteRequest = useCallback(
    (row: PeriodeSousRessourceEnregistrement) => {
      setCurrentRow(row)
      setOpen('delete')
    },
    [setOpen]
  )

  const columns = useMemo(
    () =>
      buildPeriodeIndicateurSousRessourceColumns({
        resource,
        onEdit: handleEdit,
        onDeleteRequest: handleDeleteRequest,
      }),
    [resource, handleEdit, handleDeleteRequest]
  )

  const handleConfirmDelete = (row: PeriodeSousRessourceEnregistrement) => {
    const itemId = resolvePeriodeEnregistrementId(row, resource)
    if (itemId == null) {
      toast.error('Enregistrement introuvable.')
      return
    }

    deleteMutation.mutate(itemId, {
      onSuccess: () => {
        toast.success(`${resourceLabel} supprimé(e)`)
        setOpen(null)
        setCurrentRow(null)
      },
      onError: (error) => {
        toast.error(
          getApiErrorMessage(
            error,
            `Erreur lors de la suppression du ${resourceLabel}`
          )
        )
      },
    })
  }

  if (isLoading) {
    return (
      <div className='flex justify-center py-12'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (isError) {
    return (
      <p className='py-8 text-center text-sm text-muted-foreground'>
        Impossible de charger les {resourceLabel}s pour cette période.
      </p>
    )
  }

  return (
    <>
      <GenericTable<PeriodeSousRessourceEnregistrement>
        data={data}
        columns={columns}
        search={search}
        navigate={navigate}
        searchKey={searchKey}
        searchPlaceholder={`Filtrer les ${resourceLabel}s…`}
        urlFilterConfig={[
          {
            columnId: searchKey,
            searchKey,
            type: 'string',
          },
        ]}
        toolbarEndSlot={
          <DataTableToolbarOutlineButton className='ms-auto' onClick={handleAdd}>
            Ajouter
          </DataTableToolbarOutlineButton>
        }
        defaultPageSize={10}
        showViewOptions={false}
        emptyMessage={`Aucun(e) ${resourceLabel} pour cette période.`}
      />

      <SuiviIndicateurCmrSousRessourceFormDialog
        open={open === 'add' || open === 'edit'}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(null)
            setCurrentRow(null)
          }
        }}
        resource={resource}
        parentPeriodeId={parentPeriodeId}
        currentRow={open === 'edit' ? currentRow : null}
      />

      {currentRow && (
        <GenericDeleteDialog<PeriodeSousRessourceEnregistrement>
          open={open === 'delete'}
          onOpenChange={(isOpen) => {
            setOpen(isOpen ? 'delete' : null)
            if (!isOpen) setCurrentRow(null)
          }}
          currentRow={currentRow}
          entityName={resourceLabel}
          getEntityLabel={(row) => resolvePeriodeEnregistrementLabel(row, resource)}
          onDelete={handleConfirmDelete}
        />
      )}
    </>
  )
}
