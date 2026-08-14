import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DetailViewFooter, DetailViewHeader } from '@/Global/Detail/DetailFields'
import type { ContratPerformance } from '@/simadou/allTypes/contratPerformance'
import { contratDetailTabs, type ContratDetailTab } from './contratDetailTabs'
import ContratDetailPanel from './ContratDetailPanel'

interface DetailContratPerformanceProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contrat: ContratPerformance | null
}

export default function DetailContratPerformance({ open, onOpenChange, contrat }: DetailContratPerformanceProps) {
  const [activeTab, setActiveTab] = useState<ContratDetailTab>(contratDetailTabs[0])

  if (!contrat) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-5xl overflow-hidden p-0'>
        <div className='max-h-[85vh] overflow-y-auto p-6'>
          <DialogHeader className='space-y-2'>
            <DialogTitle>Fiche détaillée du contrat de performance</DialogTitle>
            <DialogDescription>
              Consultez les informations du contrat à travers les onglets dédiés.
            </DialogDescription>
          </DialogHeader>

          <div className='mt-6 space-y-5'>
            <DetailViewHeader
              title={contrat.code_contrat}
              badge={
                <span className='inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary'>
                  {contrat.intitule_contrat}
                </span>
              }
              description='Navigation par onglets similaire au détail des projets.'
            />

            <div className='flex flex-col gap-4 lg:flex-row'>
              <aside className='w-full shrink-0 lg:w-64'>
                <div className='rounded-xl border bg-card p-2'>
                  {contratDetailTabs.map((tab) => {
                    const isActive = activeTab.key === tab.key
                    const TabIcon = tab.icon
                    return (
                      <Button
                        key={tab.key}
                        type='button'
                        variant={isActive ? 'default' : 'ghost'}
                        className='mb-1 h-auto w-full justify-start gap-2 px-3 py-2 text-sm'
                        onClick={() => setActiveTab(tab)}
                      >
                        <TabIcon className='h-4 w-4 shrink-0' />
                        <span className='truncate'>{tab.name}</span>
                      </Button>
                    )
                  })}
                </div>
              </aside>

              <div className='min-w-0 flex-1'>
                <Tabs value={activeTab.key} onValueChange={(value) => setActiveTab(contratDetailTabs.find((tab) => tab.key === value) ?? contratDetailTabs[0])} className='space-y-4'>
                  <TabsList className='grid grid-cols-2 gap-2 md:grid-cols-4'>
                    {contratDetailTabs.map((tab) => (
                      <TabsTrigger key={tab.key} value={tab.key}>{tab.name}</TabsTrigger>
                    ))}
                  </TabsList>

                  {contratDetailTabs.map((tab) => (
                    <TabsContent key={tab.key} value={tab.key} className='space-y-4'>
                      <ContratDetailPanel tab={tab} contrat={contrat} />
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </div>
          </div>

          <DetailViewFooter onClose={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
