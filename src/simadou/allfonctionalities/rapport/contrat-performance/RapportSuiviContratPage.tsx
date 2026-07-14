import { useMemo, useState } from 'react'
import Select from 'react-select'
import {
  useGetCadresLogiquesClcp,
  useGetNiveauxConfigClcp,
} from '@/simadou/allHooks/admin/cadreLogiqueClcpHooks'
import { useGetContratsPerformance } from '@/simadou/allHooks/admin/contratPerformanceHooks'
import { useGetIndicateursContrat } from '@/simadou/allHooks/admin/indicateurContratHooks'
import { useGetSuivisContrat } from '@/simadou/allHooks/admin/suiviContratHooks'
import { Eye } from 'lucide-react'
import { useActiveProgrammeId } from '@/hooks/use-active-programme'
import RapportPageLayout from '../RapportPageLayout'
import { ContratPerformanceReportTable } from './ContratPerformanceReportTable'

type ContratOption = {
  label: string
  value: string
}

export default function RapportSuiviContratPage() {
  const programmeId = useActiveProgrammeId()
  const { data: contrats = [], isLoading: contratsLoading } =
    useGetContratsPerformance(programmeId)

  const [selectedContratId, setSelectedContratId] = useState<string | null>(
    null
  )

  // Premier contrat sélectionné par défaut.
  const contratId = selectedContratId
    ? Number(selectedContratId)
    : (contrats[0]?.id_contrat ?? 0)

  const { data: niveaux = [], isLoading: niveauxLoading } =
    useGetNiveauxConfigClcp(contratId)
  const { data: cadres = [], isLoading: cadresLoading } =
    useGetCadresLogiquesClcp(contratId)
  const { data: indicateurs = [], isLoading: indicateursLoading } =
    useGetIndicateursContrat(contratId)
  const { data: suivis = [], isLoading: suivisLoading } = useGetSuivisContrat()

  const options: ContratOption[] = useMemo(
    () =>
      contrats
        .filter((c) => c.id_contrat != null)
        .map((c) => ({
          value: String(c.id_contrat),
          label: `${c.code_contrat} : ${c.intitule_contrat}`,
        })),
    [contrats]
  )

  const isLoading =
    contratsLoading ||
    niveauxLoading ||
    cadresLoading ||
    indicateursLoading ||
    suivisLoading

  return (
    <RapportPageLayout
      title='Rapport de suivi des contrats de performance'
      icon={Eye}
    >
      <div className='space-y-4'>
        <div className='flex justify-end'>
          <Select<ContratOption, false>
            placeholder='Rechercher un contrat...'
            options={options}
            value={options.find((opt) => opt.value === String(contratId)) ?? null}
            onChange={(selected) => setSelectedContratId(selected?.value ?? null)}
            className='min-w-[280px] text-sm'
            classNamePrefix='suivi-contrat-performance'
          />
        </div>

        <ContratPerformanceReportTable
          niveaux={niveaux}
          cadres={cadres}
          indicateurs={indicateurs}
          isLoading={isLoading}
          suivis={suivis}
          showValeurRealisee
        />
      </div>
    </RapportPageLayout>
  )
}
