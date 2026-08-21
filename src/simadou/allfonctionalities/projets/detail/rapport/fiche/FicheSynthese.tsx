import type { ReactNode } from 'react'
import { RAPPORT_EXPORT_THEME as theme } from '@/simadou/allfonctionalities/rapport/export/rapportExportTheme'
import { cn } from '@/lib/utils'

/** Accent vert institutionnel (aligné sur l’export PDF/Word). */
export const FICHE_ACCENT = `#${theme.green}`
export const FICHE_ACCENT_DARK = `#${theme.greenDark}`
export const FICHE_ACCENT_LIGHT = `#${theme.greenLight}`
export const FICHE_ACCENT_MUTED = `#${theme.greenMuted}`

export type FicheKpi = {
  label: string
  value: string
  accent?: string
}

export type FicheContextItem = {
  label: string
  value: string
}

export type FicheRepartitionItem = {
  label: string
  value: string
}

type FicheSyntheseProps = {
  orgTitle?: string
  orgSubtitle?: string
  badge?: string
  title: string
  generatedBy?: string
  generatedAt?: Date
  contextItems?: FicheContextItem[]
  kpis?: FicheKpi[]
  narrative?: string
  repartitionTitle?: string
  repartition?: FicheRepartitionItem[]
  tableTitle?: string
  tableDescription?: string
  tableHeaders?: string[]
  tableRows?: string[][]
  tableTotalRow?: string[]
  children?: ReactNode
  footerNote?: string
  footerCode?: string
  className?: string
  actions?: ReactNode
}

function formatGeneratedAt(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function FicheSynthese({
  orgTitle = 'SIMANDOU',
  orgSubtitle = 'Plateforme de suivi des projets et programmes',
  badge = 'Rapport d’or',
  title,
  generatedBy,
  generatedAt = new Date(),
  contextItems = [],
  kpis = [],
  narrative,
  repartitionTitle,
  repartition = [],
  tableTitle,
  tableDescription,
  tableHeaders,
  tableRows,
  tableTotalRow,
  children,
  footerNote = 'Document généré automatiquement — données issues du projet au moment de la génération.',
  footerCode = 'MINAGRI-RAPPORT-OR',
  className,
  actions,
}: FicheSyntheseProps) {
  return (
    <article
      className={cn(
        'space-y-6 bg-white text-slate-900 dark:bg-background dark:text-foreground',
        className
      )}
    >
      <header className='space-y-3'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='min-w-0'>
            <p className='text-sm font-semibold tracking-tight'>{orgTitle}</p>
            <p className='text-xs text-muted-foreground'>{orgSubtitle}</p>
          </div>
          <div className='flex min-w-0 flex-col items-start gap-2 sm:items-end'>
            {actions}
            <div className='text-left sm:text-right'>
              <p
                className='text-[11px] font-semibold uppercase tracking-[0.14em]'
                style={{ color: FICHE_ACCENT }}
              >
                {badge}
              </p>
              <h2 className='mt-1 text-xl font-bold leading-tight tracking-tight sm:text-2xl'>
                {title}
              </h2>
              <p className='mt-1 text-xs text-muted-foreground'>
                Générée le {formatGeneratedAt(generatedAt)}
                {generatedBy ? ` par ${generatedBy}` : ''}
              </p>
            </div>
          </div>
        </div>
        <div
          className='h-1 w-full rounded-full'
          style={{ background: FICHE_ACCENT }}
        />
      </header>

      {contextItems.length > 0 && (
        <div className='grid gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-border dark:bg-muted/30 sm:grid-cols-3'>
          {contextItems.map((item) => (
            <div
              key={item.label}
              className='min-w-0 sm:border-l sm:border-slate-200 sm:pl-4 sm:first:border-l-0 sm:first:pl-0 dark:sm:border-border'
            >
              <p className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                {item.label}
              </p>
              <p className='mt-0.5 truncate text-sm font-semibold'>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {kpis.length > 0 && (
        <div
          className={cn(
            'grid gap-3',
            kpis.length === 1 && 'sm:grid-cols-1',
            kpis.length === 2 && 'sm:grid-cols-2',
            kpis.length === 3 && 'sm:grid-cols-3',
            kpis.length >= 4 && 'sm:grid-cols-2 lg:grid-cols-4'
          )}
        >
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className='rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-border dark:bg-card'
              style={{
                borderTopWidth: 3,
                borderTopColor: kpi.accent ?? FICHE_ACCENT,
              }}
            >
              <p className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                {kpi.label}
              </p>
              <p className='mt-1 text-xl font-bold tabular-nums tracking-tight'>
                {kpi.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {narrative ? <FicheNarrative>{narrative}</FicheNarrative> : null}

      {repartition.length > 0 && (
        <section className='space-y-2'>
          {repartitionTitle ? (
            <h3 className='text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-foreground'>
              {repartitionTitle}
            </h3>
          ) : null}
          <ul className='divide-y divide-slate-100 dark:divide-border'>
            {repartition.map((item) => (
              <li
                key={item.label}
                className='flex items-baseline justify-between gap-4 py-1.5 text-sm'
              >
                <span>{item.label}</span>
                <span className='shrink-0 font-semibold tabular-nums'>
                  {item.value}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tableHeaders && tableRows ? (
        <FicheTable
          title={tableTitle}
          description={tableDescription}
          headers={tableHeaders}
          rows={tableRows}
          totalRow={tableTotalRow}
        />
      ) : null}

      {children}

      <footer className='flex flex-col gap-1 border-t border-slate-200 pt-3 text-[11px] text-muted-foreground dark:border-border sm:flex-row sm:items-center sm:justify-between'>
        <p>{footerNote}</p>
        <p className='font-medium tracking-wide'>{footerCode}</p>
      </footer>
    </article>
  )
}

export function FicheNarrative({ children }: { children: ReactNode }) {
  return (
    <p
      className='rounded-r-md border-l-4 py-3 pl-4 pr-3 text-sm leading-relaxed text-slate-700 dark:text-foreground'
      style={{
        borderLeftColor: FICHE_ACCENT,
        backgroundColor: `${FICHE_ACCENT_LIGHT}99`,
      }}
    >
      {children}
    </p>
  )
}

export function FicheSection({
  title,
  narrative,
  children,
}: {
  title: string
  narrative?: string
  children: ReactNode
}) {
  return (
    <section className='space-y-3 pt-2'>
      <h3
        className='text-xs font-bold uppercase tracking-wider'
        style={{ color: FICHE_ACCENT_DARK }}
      >
        {title}
      </h3>
      {narrative ? <FicheNarrative>{narrative}</FicheNarrative> : null}
      {children}
    </section>
  )
}

export function FicheTable({
  title,
  description,
  headers,
  rows,
  totalRow,
  empty = 'Aucune donnée.',
}: {
  title?: string
  description?: string
  headers: string[]
  rows: string[][]
  totalRow?: string[]
  empty?: string
}) {
  return (
    <section className='space-y-2'>
      {title ? (
        <h3 className='text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-foreground'>
          {title}
        </h3>
      ) : null}
      {description ? (
        <p className='text-sm leading-relaxed text-muted-foreground'>
          {description}
        </p>
      ) : null}
      {rows.length === 0 ? (
        <p className='text-sm text-muted-foreground'>{empty}</p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[520px] border-collapse text-sm'>
            <thead>
              <tr className='border-b-2 border-slate-300 dark:border-border'>
                {headers.map((h) => (
                  <th
                    key={h}
                    className='px-2 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground'
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className='border-b border-slate-100 dark:border-border/60'
                >
                  {row.map((cell, j) => (
                    <td key={j} className='px-2 py-2 align-top'>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
              {totalRow ? (
                <tr className='border-t-2 border-slate-300 font-semibold dark:border-border'>
                  {totalRow.map((cell, j) => (
                    <td key={j} className='px-2 py-2 align-top'>
                      {cell}
                    </td>
                  ))}
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export type FicheNiveauGroupItem = {
  code: string
  label: string
  extra?: string
}

export type FicheNiveauGroup = {
  key: string
  label: string
  items: FicheNiveauGroupItem[]
}

/**
 * Tableau niveau | éléments avec rowspan à gauche
 * (style demandé pour les parties à niveaux), chrome « fiche ».
 */
export function FicheNiveauTable({
  title,
  groups,
  empty = 'Aucune donnée.',
  showExtra,
  extraHeader = 'Info',
}: {
  title?: string
  groups: FicheNiveauGroup[]
  empty?: string
  showExtra?: boolean
  extraHeader?: string
}) {
  if (groups.length === 0) {
    return (
      <section className='space-y-2'>
        {title ? (
          <h3 className='text-xs font-bold uppercase tracking-wider text-slate-800'>
            {title}
          </h3>
        ) : null}
        <p className='text-sm text-muted-foreground'>{empty}</p>
      </section>
    )
  }

  return (
    <section className='space-y-2'>
      {title ? (
        <h3 className='text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-foreground'>
          {title}
        </h3>
      ) : null}
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[520px] border-collapse text-sm'>
          <thead>
            <tr className='border-b-2 border-slate-300 dark:border-border'>
              <th className='w-[28%] px-2 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
                Niveau
              </th>
              <th className='px-2 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
                Élément
              </th>
              {showExtra ? (
                <th className='w-[18%] px-2 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
                  {extraHeader}
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => {
              const items =
                group.items.length > 0
                  ? group.items
                  : [{ code: '—', label: 'Aucun élément' }]
              return items.map((item, idx) => {
                const isLastInGroup = idx === items.length - 1
                // Ligne plus marquée entre chaque niveau.
                const rowBorder = isLastInGroup
                  ? 'border-b-2 border-slate-300 dark:border-border'
                  : 'border-b border-slate-100 dark:border-border/60'
                return (
                  <tr key={`${group.key}-${idx}`} className={rowBorder}>
                    {idx === 0 ? (
                      <td
                        rowSpan={items.length}
                        className='border-b-2 border-slate-300 px-2 py-3 align-middle font-semibold dark:border-border'
                        style={{
                          backgroundColor: FICHE_ACCENT_MUTED,
                          color: FICHE_ACCENT_DARK,
                        }}
                      >
                        {group.label}
                      </td>
                    ) : null}
                    <td className='px-2 py-2.5 align-top'>
                      <span className='font-bold'>{item.code}</span>
                      {` : ${item.label}`}
                    </td>
                    {showExtra ? (
                      <td className='px-2 py-2.5 align-top text-muted-foreground'>
                        {item.extra || '—'}
                      </td>
                    ) : null}
                  </tr>
                )
              })
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
