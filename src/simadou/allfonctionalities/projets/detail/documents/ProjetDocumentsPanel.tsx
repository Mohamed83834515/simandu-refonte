import { useCallback, useState } from 'react'
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileType,
  File,
  Plus,
  Pencil,
  Trash2,
  Image,
  Video,
  Archive,
  Code,
  Presentation,
  Music
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import type { Projet } from '@/simadou/allTypes'
import type { DocumentProjet } from '@/simadou/allTypes/documentProjet'
import {
  useDeleteDocumentProjet,
  useGetDocumentsProjet,
} from '@/simadou/allHooks/admin/documentProjetHooks'
import DocumentProjetFormDialog from './DocumentProjetFormDialog'
import { cn } from '@/lib/utils'

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Extrait le nom de fichier depuis une URL ou un chemin */
function getFilename(path: string): string {
  return path?.split('/').pop() ?? path ?? 'Fichier'
}

/** Icône + couleur selon l'extension */
function getFileStyle(path: string): {
  icon: React.ElementType
  bgClass: string
  colorClass: string
  borderClass: string
  label: string
} {
  const ext = path?.split('.').pop()?.toLowerCase() ?? ''

  // PDF
  if (['pdf'].includes(ext))
    return {
      icon: FileType,
      bgClass: 'bg-red-50 dark:bg-red-950/30',
      colorClass: 'text-red-600 dark:text-red-400',
      borderClass: 'border-red-200 dark:border-red-800/50',
      label: 'PDF'
    }
  // Excel / CSV
  if (['xls', 'xlsx', 'csv'].includes(ext))
    return {
      icon: FileSpreadsheet,
      bgClass: 'bg-green-50 dark:bg-green-950/30',
      colorClass: 'text-green-600 dark:text-green-400',
      borderClass: 'border-green-200 dark:border-green-800/50',
      label: 'Excel'
    }
  // Word
  if (['doc', 'docx'].includes(ext))
    return {
      icon: FileText,
      bgClass: 'bg-blue-50 dark:bg-blue-950/30',
      colorClass: 'text-blue-600 dark:text-blue-400',
      borderClass: 'border-blue-200 dark:border-blue-800/50',
      label: 'Word'
    }
  // PowerPoint
  if (['ppt', 'pptx'].includes(ext))
    return {
      icon: Presentation,
      bgClass: 'bg-orange-50 dark:bg-orange-950/30',
      colorClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-200 dark:border-orange-800/50',
      label: 'PowerPoint'
    }
  // Images
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext))
    return {
      icon: Image,
      bgClass: 'bg-purple-50 dark:bg-purple-950/30',
      colorClass: 'text-purple-600 dark:text-purple-400',
      borderClass: 'border-purple-200 dark:border-purple-800/50',
      label: 'Image'
    }
  // Vidéos
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(ext))
    return {
      icon: Video,
      bgClass: 'bg-pink-50 dark:bg-pink-950/30',
      colorClass: 'text-pink-600 dark:text-pink-400',
      borderClass: 'border-pink-200 dark:border-pink-800/50',
      label: 'Vidéo'
    }
  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext))
    return {
      icon: Archive,
      bgClass: 'bg-amber-50 dark:bg-amber-950/30',
      colorClass: 'text-amber-600 dark:text-amber-400',
      borderClass: 'border-amber-200 dark:border-amber-800/50',
      label: 'Archive'
    }
  // Code
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'py', 'java', 'c', 'cpp'].includes(ext))
    return {
      icon: Code,
      bgClass: 'bg-indigo-50 dark:bg-indigo-950/30',
      colorClass: 'text-indigo-600 dark:text-indigo-400',
      borderClass: 'border-indigo-200 dark:border-indigo-800/50',
      label: 'Code'
    }
  // Audio
  if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext))
    return {
      icon: Music,
      bgClass: 'bg-teal-50 dark:bg-teal-950/30',
      colorClass: 'text-teal-600 dark:text-teal-400',
      borderClass: 'border-teal-200 dark:border-teal-800/50',
      label: 'Audio'
    }

  // Default
  return {
    icon: File,
    bgClass: 'bg-gray-50 dark:bg-gray-900/30',
    colorClass: 'text-gray-500 dark:text-gray-400',
    borderClass: 'border-gray-200 dark:border-gray-700',
    label: 'Fichier'
  }
}

// ── Card individuelle ──────────────────────────────────────────────────────────

function DocumentCard({
  doc,
  onEdit,
  onDelete,
}: {
  doc: DocumentProjet
  onEdit: (doc: DocumentProjet) => void
  onDelete: (doc: DocumentProjet) => void
}) {
  const filename = getFilename(doc.document)
  const { icon: Icon, bgClass, colorClass, borderClass, label } = getFileStyle(doc.document)

  return (
    <div className={cn(
      'group relative flex flex-col gap-3 rounded-xl border bg-card p-4 transition-all duration-300',
      'hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1',
      borderClass
    )}>

      {/* Badge extension */}
      <div className="absolute -top-2 -right-2">
        <span className={cn(
          'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
          bgClass, colorClass, 'shadow-sm'
        )}>
          {label}
        </span>
      </div>

      {/* ── Header : icône ── */}
      <div className="flex items-start justify-between gap-2">
        <div className={cn('flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl', bgClass, 'transition-transform group-hover:scale-110')}>
          <Icon className={cn('h-6 w-6', colorClass)} aria-hidden />
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
          <button
            type='button'
            onClick={() => onEdit(doc)}
            title='Modifier'
            className='flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-background text-muted-foreground transition-all hover:bg-muted hover:text-foreground hover:shadow-sm'
          >
            <Pencil className='h-3.5 w-3.5' />
          </button>
          <button
            type='button'
            onClick={() => onDelete(doc)}
            title='Supprimer'
            className='flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-background text-muted-foreground transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30'
          >
            <Trash2 className='h-3.5 w-3.5' />
          </button>
        </div>
      </div>

      {/* ── Description ── */}
      <div className='flex flex-1 flex-col gap-1'>
        <p className='line-clamp-2 text-sm font-semibold leading-snug text-foreground'>
          {doc.description_document?.trim() || 'Sans description'}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <File className="h-3 w-3 text-muted-foreground" />
          <p className='truncate text-xs text-muted-foreground' title={filename}>
            {filename}
          </p>
        </div>
      </div>

      {/* ── Bouton téléchargement ── */}
      <a
        href={doc.document}
        target='_blank'
        rel='noopener noreferrer'
        download={filename}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all',
          bgClass, colorClass, 'hover:opacity-80'
        )}
      >
        <Download className='h-3.5 w-3.5' />
        Télécharger
      </a>
    </div>
  )
}

// ── Panel principal ────────────────────────────────────────────────────────────

type ProjetDocumentsPanelProps = {
  projet: Projet
}

export default function ProjetDocumentsPanel({ projet }: ProjetDocumentsPanelProps) {
  const idProjet = projet.id_projet
  const { data: documents = [], isLoading } = useGetDocumentsProjet(idProjet)
  const deleteMutation = useDeleteDocumentProjet(idProjet)

  const [formOpen, setFormOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<DocumentProjet | null>(null)
  const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
  const [documentToDelete, setDocumentToDelete] = useState<DocumentProjet | null>(null)

  const handleAdd = () => {
    setSelectedDocument(null)
    setFormOpen(true)
  }

  const handleEdit = useCallback((doc: DocumentProjet) => {
    setSelectedDocument(doc)
    setFormOpen(true)
  }, [])

  const handleDelete = useCallback((doc: DocumentProjet) => {
    setDocumentToDelete(doc)
    setDeleteOpen('delete')
  }, [setDeleteOpen])

  const handleCloseForm = () => {
    setFormOpen(false)
    setSelectedDocument(null)
  }

  const handleConfirmDelete = (doc: DocumentProjet) => {
    deleteMutation.mutate(doc.id_document, {
      onSuccess: () => {
        setDocumentToDelete(null)
        setDeleteOpen(null)
      },
    })
  }

  return (
    <div className='space-y-6'>

      {/* ── En-tête avec gradient ── */}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-muted-foreground'>
          Gérez tous les documents rattachés au projet
        </p>

        <div className='flex flex-col gap-2 sm:flex-row'>
          <Button onClick={handleAdd} className='shadow-sm'>
            <Plus className='h-4 w-4' />
            Ajouter un document
          </Button>
        </div>
      </div>
      {/* ── Statistiques rapides ── */}
      {!isLoading && documents.length > 0 && (
        <div className='flex flex-wrap gap-3'>
          <div className='flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'>
            <FileText className='h-3 w-3' />
            <span>{documents.length} document(s)</span>
          </div>
          <div className='flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs text-green-700 dark:bg-green-950/30 dark:text-green-400'>
            <FileSpreadsheet className='h-3 w-3' />
            <span>{documents.filter(d => getFileStyle(d.document).label === 'Excel').length} Excel</span>
          </div>
          <div className='flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-400'>
            <FileType className='h-3 w-3' />
            <span>{documents.filter(d => getFileStyle(d.document).label === 'PDF').length} PDF</span>
          </div>
        </div>
      )}

      {/* ── Grille de cards ── */}
      {isLoading ? (
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='h-48 animate-pulse rounded-xl border border-border/40 bg-muted/40' />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/60 bg-muted/20 py-16 text-center'>
          <div className='rounded-full bg-primary/10 p-4'>
            <File className='h-8 w-8 text-primary/60' />
          </div>
          <div>
            <p className='text-sm font-medium text-foreground'>Aucun document</p>
            <p className='text-xs text-muted-foreground'>Commencez par ajouter un document à ce projet</p>
          </div>
          <Button variant='outline' size='sm' onClick={handleAdd} className='mt-2'>
            <Plus className='h-3.5 w-3.5' /> Ajouter un document
          </Button>
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id_document}
              doc={doc}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
          {/* Card "Ajouter" */}
          <button
            type='button'
            onClick={handleAdd}
            className='group flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/50 bg-transparent transition-all hover:border-primary/40 hover:bg-primary/5'
          >
            <div className='rounded-full bg-muted/50 p-3 transition-all group-hover:bg-primary/10 group-hover:scale-110'>
              <Plus className='h-6 w-6 text-muted-foreground transition-all group-hover:text-primary' />
            </div>
            <span className='text-xs font-medium text-muted-foreground transition-all group-hover:text-primary'>Ajouter</span>
          </button>
        </div>
      )}

      {/* ── Dialog formulaire ── */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent className={DIALOG_SIZES.md}>
          <DialogHeader>
            <DialogTitle>
              {selectedDocument ? 'Modifier le document' : 'Ajouter un document'}
            </DialogTitle>
            <DialogDescription>
              {selectedDocument
                ? 'Modifiez la description ou remplacez le fichier.'
                : 'Téléversez un document et ajoutez une description.'}
            </DialogDescription>
          </DialogHeader>
          <DocumentProjetFormDialog
            projet={projet}
            document={selectedDocument}
            onClose={handleCloseForm}
            onSuccess={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      {/* ── Dialog suppression ── */}
      {documentToDelete && (
        <GenericDeleteDialog<DocumentProjet>
          open={deleteOpen === 'delete'}
          onOpenChange={(isOpen) => setDeleteOpen(isOpen ? 'delete' : null)}
          currentRow={documentToDelete}
          entityName='le document'
          getEntityLabel={(row) =>
            row.description_document?.trim() ||
            getFilename(row.document) ||
            'Document'
          }
          onDelete={handleConfirmDelete}
        />
      )}
    </div>
  )
}