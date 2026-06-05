
import {
  
  EllipsisVertical,
 
} from 'lucide-react'
import useDialogState from '@/hooks/use-dialog-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { SignOutDialog } from '@/components/others/sign-out-dialog'
import { ProfileDropdown } from '@/components/others/profile-dropdown'


type NavUserProps = {
  user: {
   nom_perso?: string
  prenom_perso?: string
  email?: string
   personnel_profile_picture : string | null
     id_personnel_perso?: string;
      statut?: number;
  }
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar()
  const [open, setOpen] = useDialogState()

  // const {mutate : logout, isPending} = useLogout()

  return (
    <>
     <SidebarMenu>
  <SidebarMenuItem>
    <ProfileDropdown
            user={user}
            side={isMobile ? "bottom" : "right"}
            onLogout={() => setOpen(true)}
            trigger={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={user.personnel_profile_picture ?? ''} alt={'profile'} />
                  <AvatarFallback className="rounded-lg bg-gray-700 text-sm font-medium text-blue-700">
                    {user.nom_perso?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user.nom_perso}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>

                <EllipsisVertical className="ml-auto size-4 text-muted-foreground" />
              </SidebarMenuButton>
            }
          />
  </SidebarMenuItem>
</SidebarMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
