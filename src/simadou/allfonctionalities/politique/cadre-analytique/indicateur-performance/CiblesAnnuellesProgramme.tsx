import React, { useEffect, useMemo } from 'react'
import { useActiveProgramme } from '@/hooks/use-active-programme'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { CibleIndicateurPerformanceProgramme } from '@/simadou/allTypes/cibleIndicateurPerformanceProgramme'
import { getProgrammeYearRange } from '@/simadou/lib/cibleCmrGridUtils'
import type { CibleAnnuelleProgrammeFormValue } from '@/simadou/lib/indicateurPerformanceProgrammeUtils'

type CiblesAnnuellesProgrammeProps = {
  onCiblesChange: (cibles: CibleAnnuelleProgrammeFormValue[]) => void
  initialCibles?: CibleIndicateurPerformanceProgramme[]
}

function formatInputValue(value: number | undefined): string {
  if (value == null || value === 0) return ''
  return String(value)
}

export default function CiblesAnnuellesProgramme({
  onCiblesChange,
  initialCibles,
}: CiblesAnnuellesProgrammeProps) {
  const programme = useActiveProgramme()
  const annees = useMemo(() => getProgrammeYearRange(programme), [programme])
  const [cibles, setCibles] = React.useState<CibleAnnuelleProgrammeFormValue[]>([])

  useEffect(() => {
    if (annees.length === 0) return

    const mappedCibles = annees.map((annee) => {
      const existingCible = initialCibles?.find((c) => c.annee === annee)
      return {
        annee,
        valeur_cible: existingCible
          ? Number(existingCible.valeur_cible_indcateur_performance ?? 0)
          : 0,
        budget_an: existingCible ? Number(existingCible.budget_an ?? 0) : 0,
        id_cible_indicateur_performance:
          existingCible?.id_cible_indicateur_performance,
      }
    })

    setCibles(mappedCibles)
    onCiblesChange(mappedCibles)
  }, [annees, initialCibles])

  const handleChange = (
    index: number,
    field: 'valeur_cible' | 'budget_an',
    rawValue: string
  ) => {
    const value = rawValue === '' ? 0 : Number(rawValue)
    const newCibles = [...cibles]
    newCibles[index] = { ...newCibles[index], [field]: value }
    setCibles(newCibles)
    onCiblesChange(newCibles)
  }

  if (!programme || annees.length === 0) {
    return (
      <p className='text-sm text-muted-foreground'>
        Configurez la période du programme pour saisir les cibles annuelles.
      </p>
    )
  }

  return (
    <div className='space-y-4 border-t pt-6'>
      <p className='text-sm font-medium'>Cibles annuelles</p>

      <div className='rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-28'>Année</TableHead>
              <TableHead>Valeur Cible</TableHead>
              <TableHead>Budget (GNF)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cibles.map((cible, index) => (
              <TableRow key={cible.annee}>
                <TableCell className='align-top font-medium tabular-nums'>
                  {cible.annee}
                </TableCell>
                <TableCell className='align-top'>
                  <Input
                    type='number'
                    min={0}
                    placeholder='Valeur cible'
                    value={formatInputValue(cibles[index]?.valeur_cible)}
                    onChange={(e) =>
                      handleChange(index, 'valeur_cible', e.target.value)
                    }
                  />
                </TableCell>
                <TableCell className='align-top'>
                  <Input
                    type='number'
                    min={0}
                    placeholder='Budget'
                    value={formatInputValue(cibles[index]?.budget_an)}
                    onChange={(e) =>
                      handleChange(index, 'budget_an', e.target.value)
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export type { CibleAnnuelleProgrammeFormValue }
