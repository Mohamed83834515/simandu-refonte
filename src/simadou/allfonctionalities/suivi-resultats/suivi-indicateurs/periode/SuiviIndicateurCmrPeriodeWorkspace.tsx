import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PeriodeIndicateur } from '@/simadou/allTypes/periodeIndicateur'
import SuiviIndicateurCmrSousRessourcePanel from '../sous-ressource/SuiviIndicateurCmrSousRessourcePanel'
import {
  resolvePeriodeIndicateurLabel,
  resolvePeriodeIndicateurSelectValue,
} from './periodeIndicateurFormUtils'
import SuiviIndicateurCmrSourceResultatPanel from './SuiviIndicateurCmrSourceResultatPanel'

const CONTENT_TABS = [
  { value: 'source', label: 'Source et résultat' },
  { value: 'synthese', label: 'Tableau de synthèse' },
  { value: 'carte', label: 'Fonds de carte' },
  { value: 'documentation', label: 'Documentation' },
] as const

type ContentTab = (typeof CONTENT_TABS)[number]['value']

export type SuiviIndicateurCmrPeriodeWorkspaceHandle = {
  selectPeriode: (idPeriode: number) => void
}

type SuiviIndicateurCmrPeriodeWorkspaceProps = {
  refIndicateur: number
  indicateurCode: string
  periodes: PeriodeIndicateur[]
  isLoadingPeriodes: boolean
  isPeriodesError: boolean
}

const SuiviIndicateurCmrPeriodeWorkspace = forwardRef<
  SuiviIndicateurCmrPeriodeWorkspaceHandle,
  SuiviIndicateurCmrPeriodeWorkspaceProps
>(function SuiviIndicateurCmrPeriodeWorkspace(
  {
    refIndicateur,
    indicateurCode,
    periodes,
    isLoadingPeriodes,
    isPeriodesError,
  },
  ref
) {
  const [selectedPeriodeKey, setSelectedPeriodeKey] = useState('')
  const [activeTab, setActiveTab] = useState<ContentTab>('source')

  const periodeOptions = useMemo(
    () =>
      periodes.map((periode) => ({
        key: resolvePeriodeIndicateurSelectValue(periode),
        label: resolvePeriodeIndicateurLabel(periode),
        periode,
      })),
    [periodes]
  )

  useEffect(() => {
    if (periodeOptions.length === 0) {
      setSelectedPeriodeKey('')
      return
    }

    const stillExists = periodeOptions.some(
      (option) => option.key === selectedPeriodeKey
    )

    if (!selectedPeriodeKey || !stillExists) {
      setSelectedPeriodeKey(periodeOptions[0].key)
      setActiveTab('source')
    }
  }, [periodeOptions, selectedPeriodeKey])

  const selectedPeriode = useMemo(
    () =>
      periodeOptions.find((option) => option.key === selectedPeriodeKey)
        ?.periode ?? null,
    [periodeOptions, selectedPeriodeKey]
  )

  useImperativeHandle(ref, () => ({
    selectPeriode: (idPeriode: number) => {
      setSelectedPeriodeKey(String(idPeriode))
      setActiveTab('source')
    },
  }))

  if (isLoadingPeriodes) {
    return (
      <Card>
        <CardContent className='flex justify-center py-16'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </CardContent>
      </Card>
    )
  }

  if (isPeriodesError) {
    return (
      <Card className='border-dashed'>
        <CardContent className='py-10 text-center text-sm text-muted-foreground'>
          Impossible de charger les périodes de suivi pour cet indicateur.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className='space-y-6 pt-6'>
        <div className='max-w-md space-y-2'>
          <Label htmlFor='periode-suivi-select'>Sélectionner une période</Label>
          <Select
            value={selectedPeriodeKey || undefined}
            onValueChange={(value) => {
              setSelectedPeriodeKey(value)
              setActiveTab('source')
            }}
            disabled={periodeOptions.length === 0}
          >
            <SelectTrigger id='periode-suivi-select' className='w-full'>
              <SelectValue
                placeholder={
                  periodeOptions.length === 0
                    ? 'Aucune période enregistrée'
                    : 'Choisir une période…'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {periodeOptions.map((option) => (
                <SelectItem key={option.key} value={option.key}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPeriode ? (
          <Tabs
            key={`${refIndicateur}-${selectedPeriode.id_periode}`}
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as ContentTab)}
            className='gap-4'
          >
            <TabsList className='h-auto w-full flex-wrap justify-start gap-1'>
              {CONTENT_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className='px-3'>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value='source' className='mt-0 rounded-lg border p-4'>
              <SuiviIndicateurCmrSourceResultatPanel
                refIndicateur={refIndicateur}
                periode={selectedPeriode}
                onDeleted={() => setSelectedPeriodeKey('')}
              />
            </TabsContent>

            <TabsContent value='synthese' className='mt-0 rounded-lg border p-4'>
              <SuiviIndicateurCmrSousRessourcePanel
                resource='tableaux-synthese'
                parentPeriodeId={selectedPeriode.id_periode}
              />
            </TabsContent>

            <TabsContent value='carte' className='mt-0 rounded-lg border p-4'>
              <SuiviIndicateurCmrSousRessourcePanel
                resource='fonds-carte'
                parentPeriodeId={selectedPeriode.id_periode}
              />
            </TabsContent>

            <TabsContent
              value='documentation'
              className='mt-0 rounded-lg border p-4'
            >
              <SuiviIndicateurCmrSousRessourcePanel
                resource='documentations'
                parentPeriodeId={selectedPeriode.id_periode}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <p className='rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground'>
            Aucune période enregistrée pour l&apos;indicateur{' '}
            <span className='font-mono font-medium text-foreground'>
              {indicateurCode}
            </span>
            . Utilisez le bouton{' '}
            <span className='font-medium text-foreground'>
              Suivi de l&apos;Indicateur ({indicateurCode})
            </span>{' '}
            pour en créer une.
          </p>
        )}
      </CardContent>
    </Card>
  )
})

export default SuiviIndicateurCmrPeriodeWorkspace
