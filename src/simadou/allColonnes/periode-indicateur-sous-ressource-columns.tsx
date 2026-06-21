import type { ColumnDef } from '@tanstack/react-table'
import { ExternalLink } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/data-table'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type {
  DocumentationCmrEnregistrement,
  FondCarteEnregistrement,
  PeriodeSousRessourceEnregistrement,
  PeriodeSousRessourceType,
} from '@/simadou/allTypes/periodeIndicateurSousRessource'
import {
  resolveDocumentFileName,
  resolveDocumentList,
  resolveDocumentUrl,
} from '@/simadou/lib/documentProjetUtils'

function DocumentLinksCell({ document }: { document: unknown }) {
  const documents = resolveDocumentList(document)

  if (documents.length === 0) {
    return <span className='text-sm text-muted-foreground'>—</span>
  }

  return (
    <div className='flex max-w-[14rem] flex-col gap-1'>
      {documents.map((doc, index) => {
        const href = resolveDocumentUrl(doc)
        const label = resolveDocumentFileName(doc)

        if (!href) {
          return (
            <span key={`${doc}-${index}`} className='truncate text-sm text-muted-foreground'>
              {label}
            </span>
          )
        }

        return (
          <a
            key={`${doc}-${index}`}
            href={href}
            target='_blank'
            rel='noopener noreferrer'
            className='
              inline-flex items-center gap-1.5 truncate text-sm font-medium 
              text-emerald-600 hover:text-emerald-800 
              hover:underline underline-offset-2 
              transition-colors duration-200
            '
          >
            <ExternalLink className='h-3.5 w-3.5 shrink-0 text-emerald-500' />
            {label}
          </a>
        )
      })}
    </div>
  )
}

export function buildPeriodeIndicateurSousRessourceColumns({
  resource,
  onEdit,
  onDeleteRequest,
}: {
  resource: PeriodeSousRessourceType
  onEdit: (row: PeriodeSousRessourceEnregistrement) => void
  onDeleteRequest: (row: PeriodeSousRessourceEnregistrement) => void
}): ColumnDef<PeriodeSousRessourceEnregistrement>[] {
  // ─── Colonnes communes ────────────────────────────────────────────────

  const sourceColumn: ColumnDef<PeriodeSousRessourceEnregistrement> = {
    accessorKey: 'source_donnees',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Source de données' />
    ),
    cell: ({ row }) => (
      <span className='line-clamp-1 max-w-[12rem] text-sm'>
        {row.original.source_donnees || '—'}
      </span>
    ),
  }

  const dateColumn: ColumnDef<PeriodeSousRessourceEnregistrement> = {
    accessorKey: 'date_validation',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date validation' />
    ),
    cell: ({ row }) => row.original.date_validation || '—',
  }

  const observationColumn: ColumnDef<PeriodeSousRessourceEnregistrement> = {
    accessorKey: 'observation',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Observations' />
    ),
    cell: ({ row }) => (
      <span className='line-clamp-1 max-w-[12rem] text-sm'>
        {row.original.observation || '—'}
      </span>
    ),
  }

  // ─── Colonnes fichiers ────────────────────────────────────────────────

  const documentColumn: ColumnDef<PeriodeSousRessourceEnregistrement> = {
    accessorKey: 'document',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fichiers à télécharger' />
    ),
    cell: ({ row }) => (
      <DocumentLinksCell
        document={(row.original as DocumentationCmrEnregistrement).document}
      />
    ),
  }

  const fondCarteFileColumn: ColumnDef<PeriodeSousRessourceEnregistrement> = {
    accessorKey: 'shape_file',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fichiers à télécharger' />
    ),
    cell: ({ row }) => (
      <DocumentLinksCell
        document={(row.original as FondCarteEnregistrement).shape_file}
      />
    ),
  }

  // ─── Colonne Titre (uniquement pour documentations) ──────────────────

  const titreColumn: ColumnDef<PeriodeSousRessourceEnregistrement> = {
    accessorKey: 'titre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Titre' />
    ),
    cell: ({ row }) =>
      (row.original as DocumentationCmrEnregistrement).titre || '—',
  }

  // ─── Construction des colonnes selon le type ─────────────────────────

  let columns: ColumnDef<PeriodeSousRessourceEnregistrement>[] = []

  if (resource === 'documentations') {
    columns = [
      titreColumn,                           // 1. Titre
      sourceColumn,                          // 2. Source de données
      dateColumn,                            // 3. Date validation
      documentColumn,                        // 4. Fichiers à télécharger
      observationColumn,                     // 5. Observations
    ]
  } else if (resource === 'fonds-carte') {
    columns = [
      sourceColumn,                          // 1. Source de données
      dateColumn,                            // 2. Date validation
      fondCarteFileColumn,                   // 3. Fichiers à télécharger
      observationColumn,                     // 4. Observations
    ]
  } else {
    columns = [
      sourceColumn,                          // 1. Source de données
      dateColumn,                            // 2. Date validation
      observationColumn,                     // 3. Observations
    ]
  }

  // ─── Ajout des actions à la fin ──────────────────────────────────────

  return [
    ...columns,
    buildEditDeleteActionsColumn<PeriodeSousRessourceEnregistrement>({
      onEdit,
      onDeleteRequest,
    }),
  ]
}