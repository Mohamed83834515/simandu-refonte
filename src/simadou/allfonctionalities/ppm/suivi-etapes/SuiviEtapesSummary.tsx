import {
    CalendarDays,
    Clock3,
    TrendingDown,
    TrendingUp,
} from 'lucide-react'

type SuiviEtapesSummaryProps = {
    dureePrevue: number | null
    dureeConsommee: number | null
    ecart: number | null
    derniereEtapeRealisee: boolean
}

function formatDuration(value: number | null): string {
    if (value === null) return '—'

    return `${value} jour${Math.abs(value) > 1 ? 's' : ''}`
}

export default function SuiviEtapesSummary({
    dureePrevue,
    dureeConsommee,
    ecart,
    derniereEtapeRealisee,
}: SuiviEtapesSummaryProps) {
    const isRetard = ecart !== null && ecart > 0
    const isAvance = ecart !== null && ecart < 0
    const isDansLesDelais = ecart === 0
    console.log(derniereEtapeRealisee)
    return (
        <div className='rounded-xl border bg-background p-4 shadow-sm'>
            <div className='mb-4 flex items-center justify-between'>
                <div>
                    <h3 className='text-sm font-semibold'>
                        Synthèse du suivi
                    </h3>
                </div>
            </div>

            <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
                <div className='rounded-lg border bg-muted/20 p-4'>
                    <div className='mb-2 flex items-center gap-2 text-muted-foreground'>
                        <CalendarDays className='h-4 w-4' />

                        <span className='text-xs font-medium uppercase tracking-wide'>
                            Durée prévue
                        </span>
                    </div>

                    <div className='text-xl font-bold'>
                        {formatDuration(dureePrevue)}
                    </div>
                </div>

                <div className='rounded-lg border bg-muted/20 p-4'>
                    <div className='mb-2 flex items-center gap-2 text-muted-foreground'>
                        <Clock3 className='h-4 w-4' />

                        <span className='text-xs font-medium uppercase tracking-wide'>
                            Durée consommée
                        </span>
                    </div>

                    <div className='text-xl font-bold'>
                        {formatDuration(dureeConsommee)}
                    </div>
                </div>

                <div
                    className={`rounded-lg border p-4 ${isRetard
                        ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20'
                        : isAvance
                            ? 'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20'
                            : 'bg-muted/20'
                        }`}
                >
                    <div className='mb-2 flex items-center gap-2'>
                        {isRetard ? (
                            <TrendingUp className='h-4 w-4 text-red-600' />
                        ) : isAvance ? (
                            <TrendingDown className='h-4 w-4 text-green-600' />
                        ) : (
                            <Clock3 className='h-4 w-4 text-muted-foreground' />
                        )}

                        <span className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                            Écart global
                        </span>
                    </div>

                    <div
                        className={`text-xl font-bold ${isRetard
                            ? 'text-red-600'
                            : isAvance || isDansLesDelais
                                ? 'text-green-600'
                                : ''
                            }`}
                    >
                        {ecart === null
                            ? '—'
                            : ecart > 0
                                ? `+${ecart} jour${ecart > 1 ? 's' : ''}`
                                : `${ecart} jour${Math.abs(ecart) > 1 ? 's' : ''}`}
                    </div>

                    {isRetard && (
                        <p className='mt-1 text-xs text-red-600'>
                            Retard global
                        </p>
                    )}

                    {isAvance && (
                        <p className='mt-1 text-xs text-green-600'>
                            Avance globale
                        </p>
                    )}

                    {isDansLesDelais && (
                        <p className='mt-1 text-xs text-green-600'>
                            Dans les délais
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}