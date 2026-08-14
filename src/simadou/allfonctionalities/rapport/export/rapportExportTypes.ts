export type ExportFormat = 'word' | 'excel' | 'pdf'

export type RapportExportColumn = {
  id: string
  header: string
  width?: number
  /**
   * Découpe la valeur autour de la première occurrence du séparateur :
   * la partie avant (le code) est rendue en gras, le reste en normal.
   * Ex. « O1 : Intitulé » avec ' : ' → « O1 » en gras.
   */
  boldPrefixSeparator?: string
}

/**
 * Diagramme de Gantt exporté : une colonne par mois ajoutée à droite du
 * tableau, cellule colorée quand la tâche est active ce mois-là.
 */
export type RapportExportGantt = {
  /** Colonnes mensuelles (une par mois couvert par les tâches). */
  columns: RapportExportColumn[]
  /**
   * Indices (dans `columns`) des mois actifs, une entrée par ligne de
   * `rows` (tableau vide pour les sections et les lignes non datées).
   */
  activeByRow: number[][]
}

/**
 * En-tête fusionné au-dessus d'un groupe de colonnes contiguës
 * (ex. « Valeur Cible » au-dessus de T1–T4). Les colonnes hors groupe
 * sont fusionnées verticalement sur les deux lignes d'en-tête.
 */
export type RapportExportHeaderGroup = {
  header: string
  /** Ids des colonnes couvertes — elles doivent être contiguës. */
  columnIds: string[]
  /**
   * Fusionne aussi verticalement l'en-tête du groupe sur les deux lignes
   * d'en-tête : les noms des sous-colonnes ne sont pas affichés (comme si
   * le rowSpan du groupe valait 2).
   */
  mergeSubHeaders?: boolean
}

/**
 * Bloc de texte affiché avant le tableau (pages en portrait dans les
 * exports Word/PDF, feuille dédiée dans Excel).
 */
export type RapportExportPreambleBlock = {
  type: 'title' | 'heading' | 'paragraph' | 'list'
  text: string
}

/** Tableau d’une fiche de synthèse (export PDF/Word dédié). */
export type RapportExportFicheTable = {
  title: string
  description?: string
  headers: string[]
  rows: string[][]
  totalRow?: string[]
  /**
   * Fusionne verticalement la 1re colonne quand des valeurs consécutives
   * sont identiques (style « niveau | éléments »).
   */
  mergeFirstColumn?: boolean
  /** Séparateur pour mettre le code en gras (ex. « : » → « O1 » gras). */
  boldPrefixSeparator?: string
}

export type RapportExportFicheSection = {
  title: string
  narrative?: string
  repartitionTitle?: string
  repartition?: { label: string; value: string }[]
  tables?: RapportExportFicheTable[]
}

/**
 * Document « fiche de synthèse » : rendu portrait dédié (PDF/Word),
 * distinct du tableau paysage générique.
 */
export type RapportExportFiche = {
  orgTitle?: string
  orgSubtitle?: string
  /** Ex. « RAPPORT D'OR » ou « FICHE DE SYNTHÈSE ». */
  badge?: string
  title: string
  generatedBy?: string
  generatedAtLabel?: string
  contextItems?: { label: string; value: string }[]
  kpis?: { label: string; value: string; accent?: string }[]
  narrative?: string
  repartitionTitle?: string
  repartition?: { label: string; value: string }[]
  tables?: RapportExportFicheTable[]
  /** Chapitres additionnels (titre + description + tableaux). */
  sections?: RapportExportFicheSection[]
  footerCode?: string
  footerNote?: string
}

export type RapportExportTableData = {
  columns: RapportExportColumn[]
  rows: string[][]
  rowMetas?: RapportExportRowMeta[]
  visibleColumnIds?: string[]
  /** Colonnes mensuelles colorées du diagramme de Gantt. */
  gantt?: RapportExportGantt
  /** En-têtes fusionnés au-dessus de groupes de colonnes. */
  headerGroups?: RapportExportHeaderGroup[]
  /** Texte affiché avant le tableau dans les exports. */
  preamble?: RapportExportPreambleBlock[]
  /** Si présent, PDF/Word utilisent le rendu fiche de synthèse. */
  fiche?: RapportExportFiche
}

export type RapportExportRegistration = {
  buildExportTable: () => RapportExportTableData
  isLoading?: boolean
}

/** Payload résolu au moment du clic sur Exporter. */
export type RapportExportPayload = {
  pageTitle: string
  columns: RapportExportColumn[]
  rows: string[][]
  rowMetas: RapportExportRowMeta[]
  visibleColumnIds?: string[]
  isLoading?: boolean
  gantt?: RapportExportGantt
  headerGroups?: RapportExportHeaderGroup[]
  preamble?: RapportExportPreambleBlock[]
  fiche?: RapportExportFiche
}

export type RapportExportDocumentMeta = {
  title: string
  subtitle: string
  filenameSlug: string
}

export type RapportExportRowMeta = {
  type: 'section' | 'data'
  /**
   * Profondeur d'indentation dans la colonne « Activité » : niveau du
   * cadre pour les sections, niveau du cadre parent + 1 pour les lignes
   * de données (les activités s'indentent sous leur cadre).
   */
  niveau?: number
  label?: string
  /** Fusion legacy : colonnes 0 et 1 fusionnées ensemble par groupe. */
  groupKey?: string
  /**
   * Fusion verticale indépendante par colonne : index de colonne → clé de
   * groupe. Les lignes consécutives partageant la même clé pour une colonne
   * sont fusionnées (chaque colonne a son propre découpage).
   */
  mergeKeys?: Record<number, string>
}
