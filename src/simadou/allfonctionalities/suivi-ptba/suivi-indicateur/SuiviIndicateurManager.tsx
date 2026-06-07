import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { Ptba } from '@/simadou/allTypes'
import { IndicateurTache } from '@/simadou/allTypes/indicateurTache'
import { useGetIndicateursByActivite } from '@/simadou/allHooks/admin/indicateurTacheHooks'
import {
  useGetAllSuivisIndicateurs,
} from '@/simadou/allHooks/admin/suiviPtbaHooks'
import SuiviIndicateurActiviteTable from './SuiviIndicateurActiviteTable'
import SuiviIndicateurSuiviDialog from './SuiviIndicateurSuiviDialog'

type SuiviIndicateurManagerProps = {
  activite: Ptba
}

export default function SuiviIndicateurManager({
  activite,
}: SuiviIndicateurManagerProps) {
  const [selectedIndicateur, setSelectedIndicateur] =
    useState<IndicateurTache | null>(null)
  const [showSuiviDialog, setShowSuiviDialog] = useState(false)

  const { data: indicateurs = [], isLoading } = useGetIndicateursByActivite(
    activite.id_ptba
  )
  const { data: suivis = [] } = useGetAllSuivisIndicateurs(
    Number.isFinite(activite.id_ptba)
  )

  const handleSuivre = (indicateur: IndicateurTache) => {
    setSelectedIndicateur(indicateur)
    setShowSuiviDialog(true)
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
      <div className='min-h-0 flex-1 overflow-y-auto px-3 py-2 sm:px-4 sm:py-3'>
        <SuiviIndicateurActiviteTable
          indicateurs={indicateurs}
          suivis={suivis}
          onSuivre={handleSuivre}
        />
      </div>

      <SuiviIndicateurSuiviDialog
        activite={activite}
        indicateur={selectedIndicateur}
        open={showSuiviDialog}
        onOpenChange={(open) => {
          setShowSuiviDialog(open)
          if (!open) setSelectedIndicateur(null)
        }}
      />
    </div>
  )
}
