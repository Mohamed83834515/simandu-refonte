// simadou/allfonctionalities/parametrage/acteur/ListeActeur.tsx
import { useMemo, useState } from 'react'
import { GenericTable } from '@/Global/Generic/Generictable'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import { Acteur } from '@/simadou/allTypes'
import useDialogState from '@/hooks/use-dialog-state'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import { useDeleteActeur, useGetActeurs } from '@/simadou/allHooks/admin/acteurHooks'
import { useGetCategoriesActeur } from '@/simadou/allHooks/admin/categorieActeurHooks'
import { buildActeurColumns } from '@/simadou/allColonnes/acteur-columns'
import { GenericDialogs } from '@/Global/Generic/Genericdialogs'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import { useNiveauTabsTheme } from '@/components/ui/NiveauTabs'
import AddActeur from './AddActeur'
import { useActeurStore } from '@/stores/acteur-store'

export function ListeActeur() {
  const { search, navigate } = useEmbeddedTableState()
  const [open, setOpen] = useDialogState<'add' | 'edit' | 'delete'>(null)
  const [currentRow, setCurrentRow] = useState<Acteur | null>(null)
  // Remplacer le useState local
  const { selectedCategorieId, setSelectedCategorieId } = useActeurStore()

  const { data: acteurs = [], isLoading: isLoadingActeurs } = useGetActeurs()
  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategoriesActeur()
  const { tabsStyle } = useNiveauTabsTheme()

  // Compter le nombre d'acteurs par catégorie
  const countByCategorie = useMemo(() => {
    const counts = new Map<number, number>()
    categories.forEach((cat) => {
      const count = acteurs.filter(
        (acteur) => acteur.categorie_acteur?.id_categorie === cat.id_categorie
      ).length
      counts.set(cat.id_categorie, count)
    })
    return counts
  }, [acteurs, categories])

  // Trier les catégories par nombre d'acteurs (du plus grand au plus petit)
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const countA = countByCategorie.get(a.id_categorie) || 0
      const countB = countByCategorie.get(b.id_categorie) || 0
      return countB - countA
    })
  }, [categories, countByCategorie])

  // Sélectionner la première catégorie par défaut (celle avec le plus d'acteurs)
  const defaultCategorieId = useMemo(() => {
    if (sortedCategories.length > 0 && selectedCategorieId === null) {
      setSelectedCategorieId(sortedCategories[0].id_categorie)
    }
    return selectedCategorieId ?? sortedCategories[0]?.id_categorie ?? null
  }, [sortedCategories, selectedCategorieId])

  // Filtrer les acteurs par catégorie
  const filteredActeurs = useMemo(() => {
    const activeId = selectedCategorieId ?? defaultCategorieId
    if (!activeId) return []
    return acteurs.filter(
      (acteur) => acteur.categorie_acteur?.id_categorie === activeId
    )
  }, [acteurs, selectedCategorieId, defaultCategorieId])

  const columns = useMemo(
    () => buildActeurColumns(setOpen, setCurrentRow),
    [setOpen, setCurrentRow]
  )

  const deleteMutation = useDeleteActeur()

  if (isLoadingActeurs || isLoadingCategories) {
    return (
      <div className='flex items-center justify-center py-6'>
        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  const currentActiveId = selectedCategorieId ?? defaultCategorieId

  return (
    <div className='space-y-2 px-2'>
      {/* En-tête */}
      <div className='overflow-x-auto'>
        <Tabs
          orientation='vertical'
          className='gap-1 space-y-1'
          style={tabsStyle}
          value={String(currentActiveId)}
          onValueChange={(val) => setSelectedCategorieId(Number(val))}
        >
          <TabsList className='inline-flex w-full min-w-max gap-1 bg-transparent p-0'>
            {sortedCategories && sortedCategories.length > 0 ? (
              sortedCategories.map((categorie) => {
                // Sécuriser chaque élément
                if (!categorie || !categorie.id_categorie) return null

                const nom = categorie.nom_categorie || 'Sans nom'
                const displayNom = nom.length > 15 ? nom.substring(0, 12) + '…' : nom
                const count = countByCategorie?.get(categorie.id_categorie) || 0

                return (
                  <TabsTrigger
                    key={categorie.id_categorie}
                    value={String(categorie.id_categorie)}
                  >
                    {displayNom}
                    <span className='ml-2 rounded-full bg-muted px-1.5 py-0.5 text-xs text-black'>
                      ({count})
                    </span>
                  </TabsTrigger>
                )
              })
            ) : (
              <span>Aucune catégorie d'acteur trouvée</span>
            )}
          </TabsList>
        </Tabs>
      </div>

      {/* Tableau des acteurs */}
      <div className='space-y-2'>
        <GenericTable
          data={filteredActeurs}
          columns={columns}
          search={search}
          navigate={navigate}
          searchKey='nom_acteur'
          searchPlaceholder='Filtrer les acteurs...'
          urlFilterConfig={[
            {
              columnId: 'nom_acteur',
              searchKey: 'nom_acteur',
              type: 'string',
            },
            {
              columnId: 'code_acteur',
              searchKey: 'code_acteur',
              type: 'string',
            },
          ]}
          defaultPageSize={10}
          showViewOptions={true}
          emptyMessage={
            currentActiveId
              ? `Aucun acteur dans la catégorie ${sortedCategories.find((c) => c.id_categorie === currentActiveId)?.nom_categorie || ''
              }`
              : 'Aucun acteur trouvé.'
          }
        />
      </div>

      {/* Dialogues */}
      <GenericDialogs<Acteur, 'add' | 'edit' | 'delete'>
        open={open}
        setOpen={setOpen}
        currentRow={currentRow}
        setCurrentRow={setCurrentRow}
        rowRequiredDialogs={['edit', 'delete']}
        dialogMap={{
          add: (props) => (
            <AddActeur
              key='acteur-add'
              open={props.open}
              onOpenChange={props.onOpenChange}
              currentRow={null}
            />
          ),
          edit: (props) => (
            <AddActeur
              key={`acteur-edit-${currentRow?.id_acteur}`}
              open={props.open}
              onOpenChange={props.onOpenChange}
              currentRow={props.currentRow as Acteur}
            />
          ),
          delete: (props) => (
            <GenericDeleteDialog<Acteur>
              key={`acteur-delete-${currentRow?.id_acteur}`}
              {...props}
              currentRow={props.currentRow as Acteur}
              entityName="l'acteur"
              getEntityLabel={(row) => `${row.code_acteur} - ${row.nom_acteur}`}
              onDelete={(row) => deleteMutation.mutate(row.id_acteur)}
            />
          ),
        }}
      />
    </div>
  )
}
