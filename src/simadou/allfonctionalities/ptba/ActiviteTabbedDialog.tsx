import { useState, useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import {
  NiveauTabTrigger,
  NiveauTabsList,
  useNiveauTabsTheme,
} from '@/components/ui/NiveauTabs'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import type { Ptba } from '@/simadou/allTypes'
import {
  activiteModalTitle,
  ActiviteTableHeading,
} from './activite-modal-utils'
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
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.value ?? '')
  const { tabsStyle } = useNiveauTabsTheme()
  const initialTab = defaultTab ?? tabs[0]?.value ?? ''

  useEffect(() => {
    if (open) setActiveTab(initialTab)
  }, [open, initialTab, activite?.id_ptba])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSubViewActive(false)
      setActiveTab(initialTab)
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[95vh] flex-col gap-2 overflow-hidden p-4 sm:p-5',
          'transition-[max-width] duration-200',
          subViewActive ? DIALOG_SIZES.form : DIALOG_SIZES.full
        )}
        aria-describedby={undefined}
      >
        <DialogTitle className='sr-only'>
          {title ?? activiteModalTitle(activite, 'Planification activité PTBA')}
        </DialogTitle>

        {activite && tabs.length > 0 && (
          <ActiviteTabbedDialogProvider setSubViewActive={setSubViewActive}>
            {!subViewActive && (
              <ActiviteTableHeading
                activite={activite}
                className='rounded-t-md border-0 bg-transparent px-0 py-1'
              />
            )}

            <Tabs
              key={`${activite.id_ptba}-${tabs.length}`}
              value={activeTab}
              onValueChange={setActiveTab}
              className='flex min-h-0 w-full flex-1 flex-col'
              style={tabsStyle}
            >
              {!subViewActive && (
                <div className='shrink-0 overflow-x-auto'>
                  <NiveauTabsList>
                    {tabs.map((tab) => (
                      <NiveauTabTrigger key={tab.value} value={tab.value}>
                        {tab.label}
                      </NiveauTabTrigger>
                    ))}
                  </NiveauTabsList>
                </div>
              )}

              {tabs.map((tab) => (
                <TabsContent
                  key={tab.value}
                  value={tab.value}
                  className='mt-2 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden'
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
