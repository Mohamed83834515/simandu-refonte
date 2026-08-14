import { DetailSection } from '@/Global/Detail/DetailFields'
import type { ContratPerformance } from '@/simadou/allTypes/contratPerformance'

export default function ContratFollowupPanel({ contrat }: { contrat: ContratPerformance }) {
  return (
    <DetailSection title='Suivi indicateur'>
      <div className='rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground'>
        Le suivi des indicateurs du contrat sera affiché ici. {contrat.code_contrat}
      </div>
    </DetailSection>
  )
}
