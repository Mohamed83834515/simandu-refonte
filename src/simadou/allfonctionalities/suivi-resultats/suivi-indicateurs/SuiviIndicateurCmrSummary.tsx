import type { IndicateurCmr } from '@/simadou/allTypes'
import { Card, CardContent } from '@/components/ui/card'
import { resolveRelationCode } from '@/simadou/lib/resolveApiRelation'

function displayValue(value: unknown, fallback = '—'): string {
  if (value == null || value === '') return fallback
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    const label =
      record.libelle ??
      record.nom ??
      record.intitule ??
      record.libelle_nsc ??
      record.nom_acteur
    if (typeof label === 'string' && label.trim()) return label.trim()
    const code = resolveRelationCode(value, 'code_ref_ind')
    if (code) return code
  }
  return fallback
}

function resolveReferentielField(
  indicateur: IndicateurCmr,
  field: string
): string {
  const referentiel = indicateur.referentiel_cmr
  if (referentiel == null) return '—'
  if (typeof referentiel === 'object') {
    return displayValue((referentiel as Record<string, unknown>)[field])
  }
  return '—'
}

export default function SuiviIndicateurCmrSummary({
  indicateur,
}: {
  indicateur: IndicateurCmr
}) {
  const indicateurLabel = `${indicateur.code_ref_ind} — ${indicateur.intitule_ref_ind}`

  return (
    <Card className='h-full border-primary/15 bg-primary/5 py-0 dark:bg-primary/10'>
      <CardContent className='min-h-[9.5rem] px-3 py-3'>
        <dl className='grid gap-x-3 gap-y-1.5 sm:grid-cols-2'>
          <div className='space-y-0.5 sm:col-span-2'>
            <dt className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
              Indicateur
            </dt>
            <dd className='line-clamp-2 text-xs leading-snug'>{indicateurLabel}</dd>
          </div>
          <div className='space-y-0.5'>
            <dt className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
              Type
            </dt>
            <dd className='truncate text-xs'>
              {resolveReferentielField(indicateur, 'typologie')}
            </dd>
          </div>
          <div className='space-y-0.5'>
            <dt className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
              Périodicité
            </dt>
            <dd className='truncate text-xs'>
              {displayValue(
                (indicateur as Record<string, unknown>).periodicite_cmr ??
                  (indicateur as Record<string, unknown>).periodicite
              )}
            </dd>
          </div>
          <div className='space-y-0.5'>
            <dt className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
              Structure responsable
            </dt>
            <dd className='truncate text-xs'>
              {displayValue(indicateur.responsable_collecte_cmr)}
            </dd>
          </div>
          <div className='space-y-0.5'>
            <dt className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
              Échelle
            </dt>
            <dd className='truncate text-xs'>
              {resolveReferentielField(indicateur, 'echelle')}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
