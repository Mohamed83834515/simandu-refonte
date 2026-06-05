import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useMe } from '@/simadou/allHooks/auth/authHooks'
import {
  AlertCircle,
  BadgeCheck,
  Camera,
  MessageCircleWarning,
  ShieldCheck,
} from 'lucide-react'
import { ProfileAvatar } from '../profile/profileAvatar'
import { Skeleton } from '@/components/ui/skeleton'

type ContentSectionProps = {
  title: string
  desc: string
  children: React.JSX.Element
}

export function ContentSection({ title, desc, children }: ContentSectionProps) {
  const { data: personnel, isLoading } = useMe()
  const isActive = personnel?.statut === 1
  const initials = personnel?.nom_perso?.charAt(0).toUpperCase() ?? 'U'

  if (isLoading) return (
  <div className="flex w-full flex-1 flex-col">
    {/* Profile header skeleton */}
    <div className="flex items-center gap-4 pb-5">
      {/* Avatar */}
      <Skeleton className="size-30 rounded-full flex-shrink-0" />

      {/* Identity */}
      <div className="flex-1 space-y-2.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>
    </div>

    <Separator className="flex-none" />

    {/* Content skeleton */}
    <div className="px-1.5 pt-4 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-4 w-1/4 mt-4" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-2/3" />
    </div>
  </div>
)

  return (
   <>
   {personnel && (
     <div className="flex w-full flex-1 flex-col">

      {/* Profile header */}
      <div className="flex items-center gap-4 pb-5">

       <ProfileAvatar 
       n_personel={personnel?.n_personnel ?? 0}
       currentPicture={personnel?.personnel_profile_picture ?? ''}
       initials={initials}
       />

        {/* Identity */}
        <div className="flex-1 min-w-0 pb-0.5">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-base font-medium text-foreground">
              {personnel?.nom_perso ?? 'Utilisateur'}
            </span>
            <span className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
              isActive
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
            )}>
              {isActive
                ? <><ShieldCheck className="size-3" />Compte actif</>
                : <><AlertCircle className="size-3" />Action requise</>
              }
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span>{personnel?.email ?? 'Email indisponible'}</span>
            {personnel?.id_personnel_perso && (
              <>
                <span className="size-1 rounded-full bg-border" />
                <span>{personnel.id_personnel_perso}</span>
              </>
            )}
            {personnel?.is_admin && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">
                admin
              </span>
            )}
          </div>
        </div>
      </div>

      <Separator className="flex-none" />

      {/* Content */}
      <div className="faded-bottom h-[75vh] w-full overflow-y-auto scroll-smooth pb-12 pe-4">
        <div className="px-1.5 pt-4 w-full">{children}</div>
      </div>

    </div>
   )}
   </>
  )
}