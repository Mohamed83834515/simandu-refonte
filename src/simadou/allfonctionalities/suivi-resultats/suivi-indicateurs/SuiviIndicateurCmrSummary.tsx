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
    <Card className='border-primary/15 bg-primary/5 py-0 dark:bg-primary/10'>
      <CardContent className='px-4 py-3'>
        <dl className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
          <div className='space-y-0.5'>
            <dt className='text-[11px] font-medium text-muted-foreground'>
              Indicateur
            </dt>
            <dd className='text-xs leading-snug'>{indicateurLabel}</dd>
          </div>
          <div className='space-y-0.5'>
            <dt className='text-[11px] font-medium text-muted-foreground'>Type</dt>
            <dd className='text-xs'>
              {resolveReferentielField(indicateur, 'typologie')}
            </dd>
          </div>
          <div className='space-y-0.5'>
            <dt className='text-[11px] font-medium text-muted-foreground'>
              Périodicité
            </dt>
            <dd className='text-xs'>
              {displayValue(
                (indicateur as Record<string, unknown>).periodicite_cmr ??
                  (indicateur as Record<string, unknown>).periodicite
              )}
            </dd>
          </div>
          <div className='space-y-0.5'>
            <dt className='text-[11px] font-medium text-muted-foreground'>
              Structure responsable
            </dt>
            <dd className='text-xs'>
              {displayValue(indicateur.responsable_collecte_cmr)}
            </dd>
          </div>
          <div className='space-y-0.5'>
            <dt className='text-[11px] font-medium text-muted-foreground'>
              Échelle
            </dt>
            <dd className='text-xs'>
              {resolveReferentielField(indicateur, 'echelle')}
            </dd>
          </div>
          <div className='space-y-0.5'>
            <dt className='text-[11px] font-medium text-muted-foreground'>
              Fonction d&apos;agrégation
            </dt>
            <dd className='text-xs'>
              {displayValue(indicateur.fonction_agregat_cmr)}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
