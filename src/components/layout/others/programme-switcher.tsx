import { useState } from 'react'
import { Check, ChevronDown, FolderKanban, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import type { Programme } from '@/simadou/allTypes/programme'
import { useProgrammeStore } from '@/stores/programme-store'

interface ProgrammeSwitcherProps {
  onHeader?: boolean
}

function programmePeriode(programme: Programme): string {
  const debut = programme.annee_debut_programme?.slice(0, 4)
  const fin = programme.annee_fin_programme?.slice(0, 4)
  if (debut && fin) return `${debut} – ${fin}`
  if (debut) return debut
  return '—'
}

function programmeLabel(programme: Programme): string {
  return programme.sigle_programme?.trim() || programme.code_programme
}

export function ProgrammeSwitcher({ onHeader = false }: ProgrammeSwitcherProps) {
  const activeProgramme = useProgrammeStore((s) => s.activeProgramme)
  const programmes = useProgrammeStore((s) => s.programmes)
  const setActiveProgramme = useProgrammeStore((s) => s.setActiveProgramme)
  const [open, setOpen] = useState(false)

  const isLoading = programmes.length === 0 && !activeProgramme

  const handleSelect = (programme: Programme) => {
    if (programme.id_programme === activeProgramme?.id_programme) {
      setOpen(false)
      return
    }
    setActiveProgramme(programme)
    setOpen(false)
  }

  const triggerLabel = activeProgramme
    ? programmeLabel(activeProgramme)
    : 'Projet'

  const triggerTitle = activeProgramme
    ? `${activeProgramme.nom_programme} (${activeProgramme.code_programme})`
    : 'Sélectionner un programme'

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className={cn(
            'flex max-w-[220px] items-center gap-2 shadow-sm transition-colors',
            onHeader ? 'hover:brightness-110' : 'hover:brightness-[0.98]'
          )}
          disabled={isLoading}
          title={triggerTitle}
          style={
            onHeader
              ? {
                  color: 'var(--header-text)',
                  borderColor:
                    'color-mix(in srgb, var(--chart-color) 55%, transparent)',
                  backgroundColor:
                    'color-mix(in srgb, var(--chart-color) 18%, rgba(255,255,255,0.08))',
                  boxShadow:
                    '0 0 0 1px color-mix(in srgb, var(--chart-color) 30%, transparent)',
                }
              : {
                  borderColor:
                    'color-mix(in srgb, var(--chart-color-2) 45%, transparent)',
                  backgroundColor:
                    'color-mix(in srgb, var(--chart-color-2) 10%, transparent)',
                  boxShadow:
                    '0 0 0 1px color-mix(in srgb, var(--chart-color-2) 20%, transparent)',
                }
          }
        >
          {isLoading ? (
            <Loader2
              className='h-4 w-4 shrink-0 animate-spin'
              style={
                onHeader ? { color: 'var(--header-text)' } : undefined
              }
            />
          ) : (
            <FolderKanban
              className='h-4 w-4 shrink-0'
              style={{
                color: onHeader
                  ? 'var(--chart-color)'
                  : 'var(--chart-color-2)',
              }}
            />
          )}
          <span className='truncate text-xs font-semibold'>{triggerLabel}</span>
          <ChevronDown className='h-3 w-3 shrink-0 opacity-50' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='w-80'>
        <DropdownMenuLabel className='text-xs font-normal text-muted-foreground'>
          Programme actif
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {programmes.length === 0 && (
          <div className='px-3 py-4 text-center text-sm text-muted-foreground'>
            Aucun programme disponible
          </div>
        )}

        {programmes.map((programme) => {
          const isActive =
            activeProgramme?.id_programme === programme.id_programme
          return (
            <DropdownMenuItem
              key={programme.id_programme}
              onClick={() => handleSelect(programme)}
              className={cn(
                'my-0.5 flex cursor-pointer flex-col items-start gap-1 rounded-md p-3',
                isActive && 'bg-primary/10 ring-1 ring-primary/25'
              )}
            >
              <div className='flex w-full items-center justify-between gap-2'>
                <div className='flex min-w-0 items-center gap-2'>
                  {isActive && (
                    <Check className='h-3.5 w-3.5 shrink-0 text-primary' />
                  )}
                  <span className='truncate text-sm font-semibold'>
                    {programme.sigle_programme} | {programme.code_programme}
                  </span>
                </div>
                <Badge variant='outline' className='shrink-0 px-1.5 py-0 text-[10px]'>
                  {programmePeriode(programme)}
                </Badge>
              </div>
              <span
                className={cn(
                  'line-clamp-2 text-xs',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {programme.nom_programme}
              </span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
