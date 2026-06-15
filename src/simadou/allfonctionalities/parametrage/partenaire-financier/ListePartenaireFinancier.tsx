// simadou/allfonctionalities/parametrage/acteur/ListeActeur.tsx
import { useMemo } from 'react'
import { GenericTable } from '@/Global/Generic/Generictable'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import {  useGetActeurs } from '@/simadou/allHooks/admin/acteurHooks'
import { buildPartenaireFinancierColumns } from '@/simadou/allColonnes/partenaire-financier'

export function ListePartenaireFinancier() {
  const { search, navigate } = useEmbeddedTableState()

  const columns = useMemo(
    () => buildPartenaireFinancierColumns(),
    []
  )

  const { data: acteurs = [] } = useGetActeurs()
  // nous filtrer les acteurs qui on le code 04 qui correspond au partenaire financier
  const partenairesFinanciers = useMemo(() => {
    return acteurs.filter(acteur => typeof acteur.categorie_acteur  === 'object' && acteur.categorie_acteur?.code_cat === '04')
  }, [acteurs])

  return (
    <>
      <div className='space-y-4'>
        <GenericTable
          data={partenairesFinanciers}
          columns={columns}
          search={search}
          navigate={navigate}
          searchKey='nom_acteur'
          searchPlaceholder='Filtrer les partenaires Financiers...'
          urlFilterConfig={[
            {
              columnId: 'nom_acteur',
              searchKey: 'nom_acteur',
              type: 'string',
            },
          ]}
          defaultPageSize={10}
          showViewOptions={true}
          emptyMessage='Aucun partenaire financier trouvé.'
        />
      </div>
    </>
  )
}