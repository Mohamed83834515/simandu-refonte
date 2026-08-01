import { TableCell } from '@/components/ui/table'
import {
  SECTION_LABEL_SEPARATOR,
  splitCellBoldPrefix,
} from './export/rapportExportUtils'
import { NIVEAU_INDENT_PX, niveauIndentStyle } from './rapportTableUtils'

/**
 * Libellé « CODE : Intitulé » avec le code en gras ; rendu tel quel quand
 * le libellé ne contient pas le séparateur.
 */
export function BoldPrefixLabel({ label }: { label: string }) {
  const split = splitCellBoldPrefix(label, SECTION_LABEL_SEPARATOR)

  if (!split) return <>{label}</>

  return (
    <>
      <span className='font-bold'>{split.prefix}</span>
      {SECTION_LABEL_SEPARATOR}
      {split.rest}
    </>
  )
}

/**
 * Repères verticaux des niveaux d'indentation dans la colonne Activité
 * (mêmes bordures que les colonnes d'indentation du fichier Excel).
 * À poser dans une cellule en position relative.
 */
export function IndentGuides({ niveau }: { niveau: number }) {
  if (niveau <= 0) return null

  return (
    <>
      {Array.from({ length: niveau }).map((_, index) => (
        <span
          key={index}
          aria-hidden='true'
          className='pointer-events-none absolute inset-y-0 border-r border-border/20'
          style={{ left: (index + 1) * NIVEAU_INDENT_PX }}
        />
      ))}
    </>
  )
}

/**
 * Cellule Activité d'une ligne d'activité : libellé « CODE : Intitulé »
 * (code en gras), indenté sous son cadre avec les repères de niveaux.
 */
export function ActiviteLabelCell({
  label,
  niveau,
  className,
  rowSpan,
}: {
  label: string
  niveau: number
  className: string
  rowSpan?: number
}) {
  return (
    <TableCell
      className={`${className} relative`}
      rowSpan={rowSpan}
      style={niveauIndentStyle(niveau)}
    >
      <IndentGuides niveau={niveau} />
      <BoldPrefixLabel label={label} />
    </TableCell>
  )
}

type CadreSectionCellsProps = {
  label: string
  niveau: number
  columnCount: number
  cellClassName: (cellIdx?: number) => string
}

/**
 * Cellules d'une ligne de cadre analytique : le libellé reste dans la
 * colonne « Activité » (première colonne), indenté selon le niveau (code en
 * gras, repères de niveaux), et ne déborde jamais sur les colonnes
 * suivantes.
 */
export function CadreSectionCells({
  label,
  niveau,
  columnCount,
  cellClassName,
}: CadreSectionCellsProps) {
  const split = splitCellBoldPrefix(label, SECTION_LABEL_SEPARATOR)

  return (
    <>
      <TableCell
        className={`${cellClassName()} relative`}
        style={niveauIndentStyle(niveau)}
      >
        <IndentGuides niveau={niveau} />
        {split ? (
          <BoldPrefixLabel label={label} />
        ) : (
          <span className='font-bold'>{label}</span>
        )}
      </TableCell>
      {Array.from({ length: Math.max(columnCount - 1, 0) }).map((_, index) => (
        <TableCell key={index} className={cellClassName()} />
      ))}
    </>
  )
}
