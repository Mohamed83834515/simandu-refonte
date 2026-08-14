import { forwardRef, useImperativeHandle, useRef, useState, type ReactNode } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { formPrimaryButtonClassName } from '@/Global/Forms/form-footer-styles'
import {
  NiveauTabTrigger,
  NiveauTabsList,
  useNiveauTabsTheme,
} from '@/components/ui/NiveauTabs'
import type { PeriodeIndicateur } from '@/simadou/allTypes/periodeIndicateur'
import SuiviIndicateurCmrSousRessourcePanel from '../sous-ressource/SuiviIndicateurCmrSousRessourcePanel'
import SuiviIndicateurCmrSourceResultatPanel, {
  type SuiviIndicateurCmrSourceResultatPanelHandle,
} from './SuiviIndicateurCmrSourceResultatPanel'

const CONTENT_TABS = [
  { value: 'source', label: 'Source et résultat' },
  { value: 'synthese', label: 'Tableau de synthèse' },
  { value: 'carte', label: 'Fonds de carte' },
  { value: 'documentation', label: 'Documentation' },
] as const

type ContentTab = (typeof CONTENT_TABS)[number]['value']

/**
 * Same width as the summary column above (1.9fr of the 1.9fr + 1fr page grid).
 * Keeps fields/tables at their original size while the bordered box spans full width.
 */
function TabPanelBodySource({ children }: { children: ReactNode }) {
  return <div className='w-full lg:w-[calc((100%-0.75rem)*19/29)]'>{children}</div>
}
function TabPanelBody({ children }: { children: ReactNode }) {
  return <div className='w-full'>{children}</div>
}

export type SuiviIndicateurCmrPeriodeWorkspaceHandle = {
  selectPeriode: (idPeriode: number) => void
  setActiveTab: (tab: ContentTab) => void
}

type SuiviIndicateurCmrPeriodeWorkspaceProps = {
  refIndicateur: number
  indicateurCode: string
  selectedPeriode: PeriodeIndicateur | null
  onPeriodeDeleted: () => void
}

type PeriodeWorkspaceTabsProps = {
  refIndicateur: number
  selectedPeriode: PeriodeIndicateur
  onPeriodeDeleted: () => void
}

type PeriodeWorkspaceTabsHandle = {
  setActiveTab: (tab: ContentTab) => void
}

const PeriodeWorkspaceTabs = forwardRef<
  PeriodeWorkspaceTabsHandle,
  PeriodeWorkspaceTabsProps
>(function PeriodeWorkspaceTabs(
  { refIndicateur, selectedPeriode, onPeriodeDeleted },
  ref
) {
  const [activeTab, setActiveTab] = useState<ContentTab>('source')
  const [sourceActions, setSourceActions] = useState({
    isPending: false,
    isDeletePending: false,
    isUpdatePending: false,
  })
  const { tabsStyle } = useNiveauTabsTheme()
  const sourcePanelRef = useRef<SuiviIndicateurCmrSourceResultatPanelHandle>(null)

  useImperativeHandle(ref, () => ({ setActiveTab }))

  const showSourceActions = activeTab === 'source'

  return (
    <div className='w-full min-h-[340px] rounded-lg border bg-card px-4 py-4'>
      <Tabs
        orientation='vertical'
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ContentTab)}
        className='gap-2'
        style={tabsStyle}
      >
        <div className='flex items-center gap-2'>
          <div className='min-w-0 flex-1 overflow-x-auto'>
            <NiveauTabsList>
              {CONTENT_TABS.map((tab) => (
                <NiveauTabTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </NiveauTabTrigger>
              ))}
            </NiveauTabsList>
          </div>

          {showSourceActions ? (
            <div className='flex shrink-0 items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='h-8 gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive'
                onClick={() => sourcePanelRef.current?.delete()}
                disabled={sourceActions.isPending}
              >
                {sourceActions.isDeletePending ? (
                  <Loader2 className='h-3.5 w-3.5 animate-spin' />
                ) : (
                  <Trash2 className='h-3.5 w-3.5' />
                )}
                Supprimer
              </Button>
              <Button
                type='button'
                size='sm'
                className={`h-8 ${formPrimaryButtonClassName}`}
                onClick={() => sourcePanelRef.current?.submit()}
                disabled={sourceActions.isPending}
              >
                {sourceActions.isUpdatePending && (
                  <Loader2 className='h-3.5 w-3.5 animate-spin' />
                )}
                Modifier
              </Button>
            </div>
          ) : null}
        </div>

        <TabsContent value='source' className='mt-3 focus-visible:outline-none'>
          <TabPanelBodySource>
            <SuiviIndicateurCmrSourceResultatPanel
              ref={sourcePanelRef}
              refIndicateur={refIndicateur}
              periode={selectedPeriode}
              onDeleted={onPeriodeDeleted}
              onActionsStateChange={setSourceActions}
            />
          </TabPanelBodySource>
        </TabsContent>

        <TabsContent value='synthese' className='mt-1 focus-visible:outline-none'>
          <TabPanelBody>
            <SuiviIndicateurCmrSousRessourcePanel
              resource='tableaux-synthese'
              parentPeriodeId={selectedPeriode.id_periode}
            />
          </TabPanelBody>
        </TabsContent>

        <TabsContent value='carte' className='mt-1 focus-visible:outline-none'>
          <TabPanelBody>
            <SuiviIndicateurCmrSousRessourcePanel
              resource='fonds-carte'
              parentPeriodeId={selectedPeriode.id_periode}
            />
          </TabPanelBody>
        </TabsContent>

        <TabsContent value='documentation' className='mt-1 focus-visible:outline-none'>
          <TabPanelBody>
            <SuiviIndicateurCmrSousRessourcePanel
              resource='documentations'
              parentPeriodeId={selectedPeriode.id_periode}
            />
          </TabPanelBody>
        </TabsContent>
      </Tabs>
    </div>
  )
})

const SuiviIndicateurCmrPeriodeWorkspace = forwardRef<
  SuiviIndicateurCmrPeriodeWorkspaceHandle,
  SuiviIndicateurCmrPeriodeWorkspaceProps
>(function SuiviIndicateurCmrPeriodeWorkspace(
  { refIndicateur, indicateurCode, selectedPeriode, onPeriodeDeleted },
  ref
) {
  const tabsRef = useRef<PeriodeWorkspaceTabsHandle>(null)

  useImperativeHandle(ref, () => ({
    selectPeriode: () => {
      tabsRef.current?.setActiveTab('source')
    },
    setActiveTab: (tab) => {
      tabsRef.current?.setActiveTab(tab)
    },
  }))

  if (!selectedPeriode) {
    return (
      <div className='w-full rounded-lg border border-dashed px-3 py-4 text-left text-sm text-muted-foreground'>
        Aucune période enregistrée pour l&apos;indicateur{' '}
        <span className='font-mono font-medium text-foreground'>
          {indicateurCode}
        </span>
        . Utilisez le bouton{' '}
        <span className='font-medium text-foreground'>
          Suivi de l&apos;Indicateur ({indicateurCode})
        </span>{' '}
        pour en créer une.
      </div>
    )
  }

  return (
    <PeriodeWorkspaceTabs
      ref={tabsRef}
      key={selectedPeriode.id_periode}
      refIndicateur={refIndicateur}
      selectedPeriode={selectedPeriode}
      onPeriodeDeleted={onPeriodeDeleted}
    />
  )
})

export default SuiviIndicateurCmrPeriodeWorkspace
