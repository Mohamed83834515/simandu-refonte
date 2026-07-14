import '@tanstack/react-table'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    className?: string // apply to both th and td
    tdClassName?: string
    thClassName?: string
    /**
     * Sur une colonne mère : fusionne son en-tête verticalement sur toutes
     * les lignes d'en-tête (les noms des sous-colonnes ne sont pas affichés).
     */
    mergeSubHeaders?: boolean
  }
}
