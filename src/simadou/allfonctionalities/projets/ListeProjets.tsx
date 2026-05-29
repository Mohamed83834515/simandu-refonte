import { useCallback, useMemo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { GenericTable } from '@/Global/Generic/Generictable'
import { useActiveProgramme } from '@/hooks/use-active-programme'
import { buildProjetsColumns } from '@/simadou/allColonnes/projets-columns'
import { useGetProjets } from '@/simadou/allHooks/admin/projetHooks'
import type { Projet } from '@/simadou/allTypes/projet'

const route = getRouteApi('/_authenticated/programmation/projets/')

export default function ListeProjets() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const activeProgramme = useActiveProgramme()

  const { data: projets = [], isLoading } = useGetProjets()

  const goToDetail = useCallback(
    (projet: Projet) => {
      navigate({
        to: '/programmation/projets/$id',
        params: { id: String(projet.id_projet) },
      })
    },
    [navigate]
  )

  const columns = useMemo(
    () => buildProjetsColumns(goToDetail),
    [goToDetail]
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
      onRowClick={goToDetail}
    />
  )
}
