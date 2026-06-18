import { useCallback, useRef } from 'react'

export type ExportTableContext<T> = {
  filteredData: T[]
  visibleColumnIds: string[]
}

function isSameExportContext<T>(
  prev: ExportTableContext<T>,
  next: ExportTableContext<T>
): boolean {
  if (prev.filteredData.length !== next.filteredData.length) return false
  if (prev.visibleColumnIds.length !== next.visibleColumnIds.length) return false

  for (let index = 0; index < prev.filteredData.length; index += 1) {
    if (prev.filteredData[index] !== next.filteredData[index]) return false
  }

  for (let index = 0; index < prev.visibleColumnIds.length; index += 1) {
    if (prev.visibleColumnIds[index] !== next.visibleColumnIds[index]) return false
  }

  return true
}

/** Conserve le snapshot filtré du tableau sans provoquer de re-render. */
export function useExportTableContextRef<T>() {
  const contextRef = useRef<ExportTableContext<T>>({
    filteredData: [],
    visibleColumnIds: [],
  })

  const onExportContext = useCallback((next: ExportTableContext<T>) => {
    if (isSameExportContext(contextRef.current, next)) return
    contextRef.current = next
  }, [])

  return { exportContextRef: contextRef, onExportContext }
}
