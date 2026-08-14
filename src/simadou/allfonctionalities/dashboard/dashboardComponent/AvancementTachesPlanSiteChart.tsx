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
import type { AvancementTachesPlanSiteChartRow } from '@/simadou/allTypes/dashboardType'
import { formatDashboardPercent } from '@/simadou/lib/dashboardPaoStatsUtils'

interface AvancementTachesPlanSiteChartProps {
  data: AvancementTachesPlanSiteChartRow[]
  anneesDisponibles: number[]
  selectedAnnee: number
  onAnneeChange: (annee: number) => void
  title: string
  subtitle?: string
  emptyMessage?: string
}

/** Couleurs alignées sur les autres graphiques dashboard (AvancementDirectionChart, etc.) */
const NB_TACHES_COLOR = '#22C55E'
const TAUX_VALIDATION_COLOR = '#EF4444'

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null

  return (
    <div className='min-w-[180px] rounded-xl border border-gray-200 bg-white p-3 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-800'>
      <p className='mb-2 max-w-[220px] truncate font-semibold text-gray-800 dark:text-gray-200'>
        {label}
      </p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className='mb-1 flex items-center gap-2'>
          <div
            className='h-2.5 w-2.5 rounded-full'
            style={{ background: entry.fill || entry.color }}
          />
          <span className='text-gray-600 dark:text-gray-400'>{entry.name}:</span>
          <span className='font-semibold text-gray-900 dark:text-gray-100'>
            {entry.dataKey === 'pourcentageValide'
              ? `${formatDashboardPercent(Number(entry.value))}%`
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

const AvancementTachesPlanSiteChart: React.FC<
  AvancementTachesPlanSiteChartProps
> = ({
  data,
  anneesDisponibles,
  selectedAnnee,
  onAnneeChange,
  title,
  subtitle,
  emptyMessage,
}) => {
  const chartData = useMemo(() => {
    return [...data].sort((a, b) => b.nbTaches - a.nbTaches)
  }, [data])

  const maxNbTaches = useMemo(
    () => Math.max(...chartData.map((row) => row.nbTaches), 0),
    [chartData]
  )

  return (
    <div className='rounded-2xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
            {title}
          </h3>
          {subtitle ? (
            <p className='text-xs text-gray-400 dark:text-gray-500'>{subtitle}</p>
          ) : null}
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

      {chartData.length === 0 ? (
        <div className='flex h-[320px] items-center justify-center text-sm text-muted-foreground'>
          {emptyMessage ?? `Aucune tâche pour l'année ${selectedAnnee}`}
        </div>
      ) : (
        <ResponsiveContainer width='100%' height={320}>
          <BarChart
            data={chartData}
            margin={{ top: 24, right: 24, left: 8, bottom: 40 }}
            barCategoryGap='24%'
            barGap={4}
          >
            <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' vertical={false} />
            <XAxis
              dataKey='service'
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              angle={-30}
              textAnchor='end'
              interval={0}
              height={70}
            />
            <YAxis
              yAxisId='count'
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              domain={[0, Math.max(maxNbTaches, 1)]}
            />
            <YAxis
              yAxisId='percent'
              orientation='right'
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
              iconType='circle'
              iconSize={8}
            />
            <Bar
              yAxisId='count'
              dataKey='nbTaches'
              name='Nombre total de tâches'
              fill={NB_TACHES_COLOR}
              radius={[4, 4, 0, 0]}
              barSize={28}
            />
            <Bar
              yAxisId='percent'
              dataKey='pourcentageValide'
              name='Taux de réalisation'
              fill={TAUX_VALIDATION_COLOR}
              radius={[4, 4, 0, 0]}
              barSize={28}
              label={{
                position: 'top',
                fontSize: 10,
                fill: TAUX_VALIDATION_COLOR,
                formatter: (value: unknown) =>
                  `${formatDashboardPercent(Number(value))}%`,
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default AvancementTachesPlanSiteChart
