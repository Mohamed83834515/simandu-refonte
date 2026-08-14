import { SidebarData, NavLink, NavCollapsible } from '@/components/layout/others/types'
import { useMe } from '@/simadou/allHooks/auth/authHooks'
import { sidebarData } from '@/simadou/routescontantes/sidebar-data'

export function useFilteredSidebar(): SidebarData {
  const { data: user } = useMe()
  const niveauPerso = user?.niveau_perso

  // Niveau 3 → accès uniquement à "Projets / Programmes"
  if (niveauPerso === 3) {
    // ✅ Filtrer les groupes pour ne garder que ceux qui ont des items
    const filteredNavGroups = sidebarData.navGroups
      .map((group) => {
        // Filtrer les items pour ne garder que "Projets / Programmes"
        const filteredItems = group.items
          .filter((item) => item.title === 'Projets / Programmes')
          .map((item) => {
            // Si c'est un item avec des sous-items (NavCollapsible)
            if ('items' in item && item.items) {
              // Filtrer les sous-items pour ne garder que "Liste des projets"
              const filteredSubItems = item.items.filter(
                (subItem) => subItem.url === '/projet-programme/projets'
              )
              
              // Retourner l'item avec les sous-items filtrés
              return {
                ...item,
                items: filteredSubItems,
              } as NavCollapsible
            }
            
            // Si c'est un item simple (NavLink)
            return item as NavLink
          })

        // Ne garder le groupe que s'il a des items
        if (filteredItems.length === 0) return null

        return {
          ...group,
          items: filteredItems,
        }
      })
      .filter((group): group is NonNullable<typeof group> => group !== null)

    return {
      ...sidebarData,
      navGroups: filteredNavGroups,
    }
  }

  return sidebarData
}