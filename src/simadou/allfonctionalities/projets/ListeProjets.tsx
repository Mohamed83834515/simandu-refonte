import { useCallback, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { GenericTable } from '@/Global/Generic/Generictable'
import { useActiveProgramme } from '@/hooks/use-active-programme'
import { buildProjetsColumns } from '@/simadou/allColonnes/projets-columns'
import { useDeleteProjet, useGetProjets } from '@/simadou/allHooks/admin/projetHooks'
import type { Projet } from '@/simadou/allTypes/projet'
import useDialogState from '@/hooks/use-dialog-state'
import { GenericDialogs } from '@/Global/Generic/Genericdialogs'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import AddProjet from './AddProjet'
import { useGeneralParamsQuery } from '@/simadou/allHooks/generalParams/queries'

const route = getRouteApi('/_authenticated/programmation/projets/')

export default function ListeProjets() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const activeProgramme = useActiveProgramme()

  const [open, setOpen] = useDialogState<'add' | 'edit' | 'delete'>(null)
  const [currentRow, setCurrentRow] = useState<Projet | null>(null)
  const { data: projets = [], isLoading } = useGetProjets()
  const deleteMutation = useDeleteProjet()

  const goToDetail = useCallback(
    (projet: Projet) => {
      const routeId = projet.code_projet || String(projet.id_projet)
      navigate({
        to: '/programmation/projets/$id',
        params: { id: routeId },
      })
    },
    [navigate]
  )

  const { data: config } = useGeneralParamsQuery()
  const currencyCode = config?.currencyCode

  const columns = useMemo(
    () => buildProjetsColumns(setOpen, setCurrentRow, goToDetail, currencyCode),
    [setOpen, setCurrentRow, goToDetail, currencyCode]
  )

  if (!activeProgramme) {
    return (
      <p className='py-8 text-center text-sm text-muted-foreground'>
        Sélectionnez un programme pour afficher les projets.
      </p>
    )
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <>
      <GenericTable<Projet>
        data={projets}
        columns={columns}
        search={search}
        navigate={navigate}
        searchKey='intitule_projet'
        searchPlaceholder='Filtrer les projets…'
        urlFilterConfig={[
          {
            columnId: 'intitule_projet',
            searchKey: 'intitule_projet',
            type: 'string',
          },
          {
            columnId: 'sigle_projet',
            searchKey: 'sigle_projet',
            type: 'string',
          },
        ]}
        defaultPageSize={10}
        showViewOptions={false}
        emptyMessage='Aucun projet pour ce programme.'
      // onRowClick={goToDetail}
      />

      <GenericDialogs<Projet, 'add' | 'edit' | 'delete'>
        open={open}
        setOpen={setOpen}
        currentRow={currentRow}
        setCurrentRow={setCurrentRow}
        rowRequiredDialogs={['edit', 'delete']}
        dialogMap={{
          edit: (props) => (
            <AddProjet
              key={`projet-edit-${props.currentRow?.id_projet || 'new'}-${Date.now()}`}
              open={props.open}
              onOpenChange={props.onOpenChange}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              currentRow={props.currentRow as any}
            />
          ),
          delete: (props) => (
            <GenericDeleteDialog<Projet>
              key={`ptba-delete-${currentRow?.id_projet}`}
              {...props}
              currentRow={props.currentRow as Projet}
              entityName='ptba'
              getEntityLabel={(row) => row.intitule_projet}
              onDelete={(row) => deleteMutation.mutate(row.id_projet)}
            />
          ),
        }}
      />
    </>

  )
}
