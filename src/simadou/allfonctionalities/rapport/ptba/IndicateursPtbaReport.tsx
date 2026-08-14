import { IndicateursTable } from './Components/IndicateursTable'
import { type RapportPtbaData } from './types'

export function IndicateursPtbaReport({
  cadresAnalaytiques,
  ptbas,
  indicateurs,
  isLoading,
}: RapportPtbaData) {
  return (
    <div className='space-y-4'>
      <IndicateursTable
        cadresAnalytiques={cadresAnalaytiques}
        ptbas={ptbas}
        indicateurs={indicateurs}
        isLoading={isLoading}
      />
    </div>
  )
}
