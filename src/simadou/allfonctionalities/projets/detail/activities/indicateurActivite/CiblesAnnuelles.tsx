import React, { useMemo, useEffect } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { useGetProjet } from '@/simadou/allHooks/admin/projetHooks'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2 } from 'lucide-react'
import type { CibleIndicateurPerformanceProjet } from '@/simadou/allTypes'
import { getProjetYearRangeFromMonths } from '@/simadou/lib/projetYearRange'

export type CibleAnnuelleFormValue = {
  annee: number
  valeur_cible: number
  budget_an: number
}

type CiblesAnnuellesProps = {
  onCiblesChange: (cibles: CibleAnnuelleFormValue[]) => void
  initialCibles?: CibleIndicateurPerformanceProjet[]
}

function formatInputValue(value: number | undefined): string {
  if (value == null || value === 0) return ''
  return String(value)
}

export default function CiblesAnnuelles({
  onCiblesChange,
  initialCibles,
}: CiblesAnnuellesProps) {
  const route = getRouteApi('/_authenticated/projet-programme/projets/$id')
  const { id } = route.useParams()
  const { data: projet, isLoading: isLoadingProjet } = useGetProjet(id)

  const annees = useMemo(() => getProjetYearRangeFromMonths(projet), [projet])

  const [cibles, setCibles] = React.useState<CibleAnnuelleFormValue[]>([])

  useEffect(() => {
    if (annees.length === 0) return

    const mappedCibles = annees.map((annee) => {
      const existingCible = initialCibles?.find((c) => c.annee === annee)
      return {
        annee,
        valeur_cible: existingCible
          ? Number(
              existingCible.valeur_cible_indcateur_performance ??
                existingCible.valeur_cible ??
                0
            )
          : 0,
        budget_an: existingCible ? Number(existingCible.budget_an ?? 0) : 0,
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

  if (isLoadingProjet) {
    return (
      <div className='flex justify-center py-8'>
        <Loader2 className='h-6 w-6 animate-spin' />
      </div>
    )
  }

  if (!projet || annees.length === 0) return null

  return (
    <div className='space-y-4 border-t pt-6'>
      <p className='text-sm font-medium'>Cibles annuelles</p>

      <div className='rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-28'>Année</TableHead>
              <TableHead>Cible</TableHead>
              <TableHead>Budget</TableHead>
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
