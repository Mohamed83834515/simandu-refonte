import { TachesTable } from './Components/TachesTable'
import { type RapportPtbaData } from './types'

export function TachesPtbaReport({
  ptbas,
  taches,
  isLoading,
  cadresAnalaytiques,
}: RapportPtbaData) {
  return (
    <div className='space-y-4'>
      <TachesTable
        cadresAnalytiques={cadresAnalaytiques}
        ptbas={ptbas}
        taches={taches}
        isLoading={isLoading}
      />
    </div>
  )
}
