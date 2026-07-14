import {
  useGetCadresLogiquesClcp,
  useGetNiveauxConfigClcp,
} from '@/simadou/allHooks/admin/cadreLogiqueClcpHooks'
import { useGetIndicateursContrat } from '@/simadou/allHooks/admin/indicateurContratHooks'
import type { ContratPerformance } from '@/simadou/allTypes/contratPerformance'
import RapportExportButton from '@/simadou/allfonctionalities/rapport/RapportExportButton'
import { RapportExportProvider } from '@/simadou/allfonctionalities/rapport/RapportExportContext'
import { ContratPerformanceReportTable } from '@/simadou/allfonctionalities/rapport/contrat-performance/ContratPerformanceReportTable'

export default function ContratReportPanel({
  contrat,
}: {
  contrat: ContratPerformance
}) {
  const idContrat = contrat.id_contrat ?? 0

  const { data: niveaux = [], isLoading: niveauxLoading } =
    useGetNiveauxConfigClcp(idContrat)
  const { data: cadres = [], isLoading: cadresLoading } =
    useGetCadresLogiquesClcp(idContrat)
  const { data: indicateurs = [], isLoading: indicateursLoading } =
    useGetIndicateursContrat(idContrat)

  return (
    <RapportExportProvider
      pageTitle={`Rapport du contrat de performance ${contrat.code_contrat}`}
    >
      <div className='space-y-4'>
        <div className='flex justify-end'>
          <RapportExportButton />
        </div>

        <ContratPerformanceReportTable
          niveaux={niveaux}
          cadres={cadres}
          indicateurs={indicateurs}
          isLoading={niveauxLoading || cadresLoading || indicateursLoading}
        />
      </div>
    </RapportExportProvider>
  )
}
