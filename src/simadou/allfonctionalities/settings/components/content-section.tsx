import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { useMe } from '@/simadou/allHooks/auth/authHooks'
import {
  BadgeCheck,
  Camera,
  MessageCircleWarning,
} from 'lucide-react'

type ContentSectionProps = {
  title: string
  desc: string
  children: React.JSX.Element
}

export function ContentSection({
  children,
}: ContentSectionProps) {
  const { data :personnel } = useMe()

  const isActive = personnel?.statut === 1

  const initials = personnel?.nom
    ? personnel.nom_perso?.charAt(0).toUpperCase()
    : 'U'

  return (
    <div className='flex flex-1 flex-col w-full'>
      <div className='flex flex-col md:flex-row items-start gap-3 md:items-center justify-between w-full text-gray-500'>
        <div className='flex flex-col md:flex-row items-start md:items-center gap-3'>
          <div className='min-w-0'>
            <div className='truncate text-sm font-medium text-foreground'>{title}</div>
            <div className='truncate text-xs text-muted-foreground'>{desc}</div>
          </div>
          <div className='relative'>
            <Avatar className='w-28 h-28 border-4 border-background shadow-xl'>
              <AvatarImage src={''} />

              <AvatarFallback className='text-4xl font-bold bg-primary text-primary-foreground'>
                {initials}
              </AvatarFallback>
            </Avatar>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className='absolute -bottom-1 -right-1 flex items-center justify-center rounded-full border bg-background p-2 shadow-md transition hover:scale-105'>
                  <Camera className='w-4 h-4 text-foreground' />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align='end'>
                <DropdownMenuItem>
                  Changer la photo
                </DropdownMenuItem>

                {/* {personnel?.photo && (
                  <DropdownMenuItem className='text-red-600'>
                    Supprimer la photo
                  </DropdownMenuItem>
                )} */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className='flex flex-col space-y-4'>
            <Badge
              className={`px-3 py-1 text-xs rounded-full font-medium
                ${
                  isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }
              `}
              variant='secondary'
            >
              {isActive ? (
                <>
                  <BadgeCheck
                    className='h-4 w-4'
                    data-icon='inline-start'
                  />
                  Compte actif
                </>
              ) : (
                <>
                  <MessageCircleWarning
                    className='h-4 w-4'
                    data-icon='inline-start'
                  />
                  Action requise
                </>
              )}
            </Badge>

            <span className='px-3 py-1 text-xs rounded-full bg-muted'>
              {personnel?.id_personnel_perso
                ? `${personnel.email} (${personnel.id_personnel_perso})`
                : 'Email indisponible'}
            </span>
          </div>
        </div>
      </div>

      <Separator className='my-4 flex-none' />

      <div className='faded-bottom h-[75] overflow-y-auto w-full scroll-smooth pe-4 pb-12'>
        <div className='px-1.5 w-full'>{children}</div>
      </div>
    </div>
  )
}