// simadou/allfonctionalities/parametrage/localite/ListeLocalite.tsx
import { useMemo, useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { SearchIcon } from 'lucide-react'
import { GenericTable } from '@/Global/Generic/Generictable'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import { useGetAllLocalites } from '@/simadou/allHooks/admin/localiteHooks'
import { buildLocaliteColumns } from '@/simadou/allColonnes/localite-columns'
import { useGetNiveauxLocalite } from '@/simadou/allHooks/admin/niveauLocaliteHooks'
import { useLocaliteContext } from '@/simadou/allContext/niveauLocalite'

export default function ListeLocalite() {
  const { activeNiveauId, setActiveNiveauId } = useLocaliteContext()
  const { data: niveaux = [] } = useGetNiveauxLocalite()
  const { data: allLocalites = [] } = useGetAllLocalites() // ✅ Un seul appel
  const [searchTerm, setSearchTerm] = useState('')
  const { search, navigate } = useEmbeddedTableState()

  // Initialiser le premier niveau
  useEffect(() => {
    if (niveaux.length > 0 && !activeNiveauId) {
      setActiveNiveauId(niveaux[0]?.id_nlc as number || 0)
    }
  }, [niveaux, activeNiveauId, setActiveNiveauId])

  const currentNiveauId = activeNiveauId || 0
  const currentNiveauObj = niveaux.find((n: any) => n.id_nlc === currentNiveauId)

  // ✅ Filtrer localités par niveau
  const localitesDuNiveau = useMemo(() => {
    return allLocalites.filter((loc: any) => {
      const locNiveauId = typeof loc.niveau_loca === 'object' 
        ? loc.niveau_loca?.id_nlc 
        : loc.niveau_loca
      return locNiveauId === currentNiveauId
    })
  }, [allLocalites, currentNiveauId])

  // Filtrer par recherche
  const filteredLocalites = localitesDuNiveau.filter(
    (loc: any) =>
      loc.intitule_loca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.code_national_loca?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Colonnes dynamiques
  const columns = useMemo(
    () => buildLocaliteColumns(niveaux, currentNiveauObj?.nombre_nlc || 0),
    [niveaux, currentNiveauObj?.nombre_nlc]
  )

  const handleTabChange = (value: string) => {
    setActiveNiveauId(parseInt(value))
    setSearchTerm('')
  }

  if (niveaux.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun niveau de localité configuré. Cliquez sur "Configuration Niveaux" pour en créer.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs value={currentNiveauId?.toString()} onValueChange={handleTabChange}>
          <TabsList>
            {niveaux.map((niveau: any) => (
              <TabsTrigger key={niveau.id_nlc} value={niveau.id_nlc.toString()}>
                {niveau.libelle_nlc}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Rechercher ${currentNiveauObj?.libelle_nlc?.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
      </div>

      <Tabs value={currentNiveauId?.toString()} onValueChange={handleTabChange}>
        {niveaux.map((niveau: any) => (
          <TabsContent key={niveau.id_nlc} value={niveau.id_nlc.toString()}>
            <GenericTable
              data={filteredLocalites}
              columns={columns}
              search={search}
              navigate={navigate}
              showSearch={false}
              showPagination={true}
              showViewOptions={false}
              defaultPageSize={10}
              emptyMessage={`Aucune ${niveau.libelle_nlc?.toLowerCase()} trouvée`}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}