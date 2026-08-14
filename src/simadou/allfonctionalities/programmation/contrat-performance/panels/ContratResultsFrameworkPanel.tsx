import type { ContratPerformance } from '@/simadou/allTypes/contratPerformance'
import ContratCadreResultatsPanel from '../cadre-resultats/ContratCadreResultatsPanel'
export default function ContratResultsFrameworkPanel({
  contrat,
}: {
  contrat: ContratPerformance
}) {
  return <ContratCadreResultatsPanel contrat={contrat} />
}
