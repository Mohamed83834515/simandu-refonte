import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import type { Ptba } from '@/simadou/allTypes'
import { activiteModalTitle } from './activite-modal-utils'
import { ActiviteTabbedDialogProvider } from './ActiviteTabbedDialogContext'

export type ActiviteTabConfig = {
  value: string
  label: string
  content: ReactNode
}

type ActiviteTabbedDialogProps = {
  activite: Ptba | null
  open: boolean
  onOpenChange: (open: boolean) => void
  tabs: ActiviteTabConfig[]
  defaultTab?: string
  title?: string
}

export default function ActiviteTabbedDialog({
  activite,
  open,
  onOpenChange,
  tabs,
  defaultTab,
  title,
}: ActiviteTabbedDialogProps) {
  const [subViewActive, setSubViewActive] = useState(false)
  const initialTab = defaultTab ?? tabs[0]?.value ?? ''

  const handleOpenChange = (next: boolean) => {
    if (!next) setSubViewActive(false)
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[95vh] flex-col overflow-hidden transition-[max-width] duration-200',
          subViewActive ? DIALOG_SIZES.lg : DIALOG_SIZES.full
        )}
        aria-describedby={undefined}
      >
        <DialogHeader className='shrink-0'>
          <DialogTitle>
            {title ?? activiteModalTitle(activite, 'Activité')}
          </DialogTitle>
        </DialogHeader>

        {activite && tabs.length > 0 && (
          <ActiviteTabbedDialogProvider setSubViewActive={setSubViewActive}>
            <Tabs
              key={activite.id_ptba}
              defaultValue={initialTab}
              className='flex min-h-0 w-full flex-1 flex-col'
            >
              {!subViewActive && (
                <TabsList className='flex h-auto w-full flex-wrap gap-1'>
                  {tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              )}

              {tabs.map((tab) => (
                <TabsContent
                  key={tab.value}
                  value={tab.value}
                  className='mt-3 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden'
                >
                  {tab.content}
                </TabsContent>
              ))}
            </Tabs>
          </ActiviteTabbedDialogProvider>
        )}
      </DialogContent>
    </Dialog>
  )
}
