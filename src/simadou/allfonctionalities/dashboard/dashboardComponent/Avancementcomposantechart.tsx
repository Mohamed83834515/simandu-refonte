import React, { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CalendarIcon } from 'lucide-react'
import { formatDashboardPercent } from '@/simadou/lib/dashboardPaoStatsUtils'
import { CadreAnalytiqueComposante, NiveauCadreAnalytiqueComposante } from '@/simadou/allTypes/composanteGraphe'

// ─── Couleurs alignées sur la charte du dashboard ───────────────────────────
const AVANCEMENT_COLOR = '#F59E0B'  // Jaune – Avancement technique
const INDICATEURS_COLOR = '#22C55E' // Vert  – Indicateurs
const DECAISSEMENT_COLOR = '#EF4444' // Rouge – Décaissement

// ─── Types ──────────────────────────────────────────────────────────────────
interface ComposanteChartRow {
  composante: string
  avancementTechnique: number
  indicateurs: number
  decaissement: number
}

interface AvancementComposanteChartProps {
  niveau2Data: NiveauCadreAnalytiqueComposante | NiveauCadreAnalytiqueComposante[]
  niveau3Data: NiveauCadreAnalytiqueComposante | NiveauCadreAnalytiqueComposante[]
  anneesDisponibles: number[]
  selectedAnnee: number
  onAnneeChange: (annee: number) => void
  title?: string
  subtitle?: string
  emptyMessage?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Calcule la moyenne d'un champ numérique sur un tableau */
function moyenne(items: CadreAnalytiqueComposante[], field: keyof CadreAnalytiqueComposante): number {
  if (!items.length) return 0
  const somme = items.reduce((acc, item) => acc + (Number(item[field]) || 0), 0)
  return somme / items.length
}

/** Normalise la réponse API : objet unique ou tableau → toujours un tableau */
function toArray(data: NiveauCadreAnalytiqueComposante | NiveauCadreAnalytiqueComposante[]): NiveauCadreAnalytiqueComposante[] {
  if (!data) return []
  return Array.isArray(data) ? data : [data]
}

/** Transforme les données niveau2 + niveau3 en rows prêts pour le graphe */
function buildChartRows(
  niveau2Data: NiveauCadreAnalytiqueComposante | NiveauCadreAnalytiqueComposante[],
  niveau3Data: NiveauCadreAnalytiqueComposante | NiveauCadreAnalytiqueComposante[],
): ComposanteChartRow[] {
  // Normalise en tableau puis aplatit les cadres_analytiques
  const composantesN2 = toArray(niveau2Data).flatMap((n) => n.cadres_analytiques ?? [])
  const composantesN3 = toArray(niveau3Data).flatMap((n) => n.cadres_analytiques ?? [])

  return composantesN2.map((n2) => {
    // Filtre les niveau3 dont le parent est ce niveau2
    const enfants = composantesN3.filter(
      (n3) => Number(n3.parent_ca?.id_ca) === Number(n2.id_ca)
    )

    const avancementTechnique = enfants.length
      ? moyenne(enfants, 'taux_execution_ptba_moyen')
      : Number(n2.taux_execution_ptba_moyen) || 0

    const indicateurs = enfants.length
      ? moyenne(enfants, 'taux_realisation_indicateurs_taches_moyen')
      : Number(n2.taux_realisation_indicateurs_taches_moyen) || 0

    const decaissement = enfants.length
      ? moyenne(enfants, 'taux_decaissement_ptba_moyen')
      : Number(n2.taux_decaissement_ptba_moyen) || 0

    return {
      composante: n2.code_ca,
      avancementTechnique: parseFloat(avancementTechnique.toFixed(1)),
      indicateurs: parseFloat(indicateurs.toFixed(1)),
      decaissement: parseFloat(decaissement.toFixed(1)),
    }
  })
}

// ─── Tooltip custom ──────────────────────────────────────────────────────────
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className='min-w-[200px] rounded-xl border border-gray-200 bg-white p-3 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-800'>
      <p className='mb-2 font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[220px]'>
        {label}
      </p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className='mb-1 flex items-center gap-2'>
          <div
            className='h-2.5 w-2.5 rounded-full flex-shrink-0'
            style={{ background: entry.fill }}
          />
          <span className='text-gray-600 dark:text-gray-400'>{entry.name} :</span>
          <span className='font-semibold text-gray-900 dark:text-gray-100'>
            {formatDashboardPercent(Number(entry.value))}%
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Composant principal ─────────────────────────────────────────────────────
const AvancementComposanteChart: React.FC<AvancementComposanteChartProps> = ({
  niveau2Data,
  niveau3Data,
  anneesDisponibles,
  selectedAnnee,
  onAnneeChange,
  title = 'PTBA par composante',
  subtitle = 'Avancement technique · Indicateurs · Décaissement',
  emptyMessage,
}) => {
  const chartData = useMemo(
    () => buildChartRows(niveau2Data, niveau3Data),
    [niveau2Data, niveau3Data]
  )

  return (
    <div className='rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
      {/* En-tête */}
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h3 className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
            {title}
          </h3>
          {subtitle && (
            <p className='text-xs text-gray-400 dark:text-gray-500'>{subtitle}</p>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <CalendarIcon className='h-4 w-4 text-gray-400' />
          <select
            value={selectedAnnee}
            onChange={(e) => onAnneeChange(Number(e.target.value))}
            className='rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'
          >
            {anneesDisponibles.map((annee) => (
              <option key={annee} value={annee}>
                {annee}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Graphe ou message vide */}
      {chartData.length === 0 ? (
        <div className='flex h-[320px] items-center justify-center text-sm text-muted-foreground'>
          {emptyMessage ?? `Aucune composante disponible pour ${selectedAnnee}`}
        </div>
      ) : (
        <ResponsiveContainer width='100%' height={320}>
          <BarChart
            data={chartData}
            margin={{ top: 24, right: 24, left: 8, bottom: 48 }}
            barCategoryGap='28%'
            barGap={4}
          >
            <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' vertical={false} />
            <XAxis
              dataKey='composante'
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              angle={-30}
              textAnchor='end'
              interval={0}
              height={70}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
              iconType='circle'
              iconSize={8}
            />
            <Bar
              dataKey='avancementTechnique'
              name='Avancement technique'
              fill={AVANCEMENT_COLOR}
              radius={[4, 4, 0, 0]}
              barSize={24}
              label={{
                position: 'top',
                fontSize: 10,
                fill: AVANCEMENT_COLOR,
                formatter: (v: unknown) => `${formatDashboardPercent(Number(v))}%`,
              }}
            />
            <Bar
              dataKey='indicateurs'
              name='Indicateurs'
              fill={INDICATEURS_COLOR}
              radius={[4, 4, 0, 0]}
              barSize={24}
              label={{
                position: 'top',
                fontSize: 10,
                fill: INDICATEURS_COLOR,
                formatter: (v: unknown) => `${formatDashboardPercent(Number(v))}%`,
              }}
            />
            <Bar
              dataKey='decaissement'
              name='Décaissement'
              fill={DECAISSEMENT_COLOR}
              radius={[4, 4, 0, 0]}
              barSize={24}
              label={{
                position: 'top',
                fontSize: 10,
                fill: DECAISSEMENT_COLOR,
                formatter: (v: unknown) => `${formatDashboardPercent(Number(v))}%`,
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default AvancementComposanteChart