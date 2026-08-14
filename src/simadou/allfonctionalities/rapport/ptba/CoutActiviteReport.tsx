import { CoutActiviteTable } from './Components/CoutActiviteTable'
import { type RapportPtbaData } from './types'

export function CoutActiviteReport({
  cadresAnalaytiques,
  ptbas,
  couts,
  isLoading,
  currencyCode,
}: RapportPtbaData) {
  return (
    <div className='space-y-4'>
      <CoutActiviteTable
        cadresAnalytiques={cadresAnalaytiques}
        ptbas={ptbas}
        couts={couts}
        isLoading={isLoading}
        currencyCode={currencyCode}
      />
    </div>
  )
}
