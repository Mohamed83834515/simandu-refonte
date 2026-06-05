
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { sidebarData } from '../../../simadou/routescontantes/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { useLayout } from '@/stores/others/layout-store'
import { CHART_COLORS, useColor } from '@/stores/others/color-store'
import { useMe } from '@/simadou/allHooks/auth/authHooks'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { color } = useColor()                     
  const { stroke } = CHART_COLORS[color]  
  const {data : user} = useMe()  
    console.log("user",user)

  return (
    <Sidebar
      collapsible={collapsible}
      variant={variant}
      style={{
        '--sidebar-primary': stroke,             
        '--sidebar-accent': `${stroke}1A`,         
        '--sidebar-accent-foreground': stroke,  
        '--sidebar-ring': stroke,                
      } as React.CSSProperties}
    >
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <NavUser user={{nom_perso : user.nom_perso ?? "Simadou", email : user.email ?? "hello@gmail.com", id_personnel_perso: user.id_personnel_perso ?? "4", statut : user.statut ?? 1, personnel_profile_picture : user.personnel_profile_picture, prenom_perso : user.prenom_perso}} />
        )}
        
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}