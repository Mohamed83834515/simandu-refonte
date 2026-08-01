import { afterEach, describe, expect, it, vi } from 'vitest'
import { exportRapportPdf } from './exportRapportPdf'
import type { RapportExportPayload } from './rapportExportTypes'

/**
 * Payload au format produit par les pages rapport : colonne « Activité »
 * en tête (code intégré au libellé, en gras via boldPrefixSeparator),
 * sections indentées par niveau, fusion verticale par activité via
 * mergeKeys sur la colonne 0.
 */
function buildPayload(
  overrides: Partial<RapportExportPayload> = {}
): RapportExportPayload {
  return {
    pageTitle: 'Tâches PTBA',
    columns: [
      { id: 'activite', header: 'Activité', boldPrefixSeparator: ' : ' },
      { id: 'tache', header: 'Intitulé tâche' },
      { id: 'responsable', header: 'Responsable' },
    ],
    rows: [
      ['Composante 1', '', ''],
      ['1A : Promotion des entreprises', '', ''],
      ['1.1.1 : Étude de faisabilité', 'Recrutement du consultant', 'A'],
    ],
    rowMetas: [
      { type: 'section', niveau: 0, label: 'Composante 1' },
      { type: 'section', niveau: 1, label: '1A : Promotion des entreprises' },
      { type: 'data', niveau: 2, mergeKeys: { 0: '1' } },
    ],
    ...overrides,
  }
}

/** Exécute l'export et retourne le blob PDF produit. */
async function exportAndGetBlob(payload: RapportExportPayload) {
  const blobs: Blob[] = []

  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
    blobs.push(blob as Blob)
    return 'blob:mock'
  })
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

  await exportRapportPdf(payload)

  expect(blobs).toHaveLength(1)
  return blobs[0]
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('exportRapportPdf', () => {
  it('sections indentées (code en gras) : le document se génère sans erreur', async () => {
    const blob = await exportAndGetBlob(buildPayload())

    expect(blob.type).toBe('application/pdf')
    expect(blob.size).toBeGreaterThan(0)
  })

  it('Gantt + niveaux profonds (retrait plafonné) : le document se génère sans erreur', async () => {
    const blob = await exportAndGetBlob(
      buildPayload({
        rows: [
          ['Composante 1', '', ''],
          ['C4 : Cadre très profond au libellé particulièrement long', '', ''],
          ['1.1.1 : Étude de faisabilité du programme de développement', 'x', 'y'],
        ],
        rowMetas: [
          { type: 'section', niveau: 0, label: 'Composante 1' },
          {
            type: 'section',
            niveau: 8,
            label: 'C4 : Cadre très profond au libellé particulièrement long',
          },
          { type: 'data', niveau: 9, mergeKeys: { 0: '1' } },
        ],
        gantt: {
          columns: [
            { id: '2025-01', header: 'janv. 25' },
            { id: '2025-02', header: 'févr. 25' },
          ],
          activeByRow: [[], [], [0, 1]],
        },
      })
    )

    expect(blob.type).toBe('application/pdf')
    expect(blob.size).toBeGreaterThan(0)
  })
})
