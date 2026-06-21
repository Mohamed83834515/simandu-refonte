import { File, FileText, Image, FileArchive, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Document = {
  id_document: string
  nom_document: string
  type_document?: string
  url?: string
  description_document?: string
}

type DocumentCardProps = {
  document: Document
  onEdit?: (doc: Document) => void
  onDelete?: (doc: Document) => void
}

export function DocumentCard({ document, onEdit, onDelete }: DocumentCardProps) {
  const getIcon = () => {
    const type = document.type_document?.toLowerCase() || ''
    if (type.includes('pdf')) return <FileText className='h-6 w-6 text-red-500' />
    if (type.includes('image') || type.includes('jpg') || type.includes('png') || type.includes('jpeg')) {
      return <Image className='h-6 w-6 text-blue-500' />
    }
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) {
      return <FileArchive className='h-6 w-6 text-amber-500' />
    }
    if (type.includes('word') || type.includes('doc')) {
      return <FileText className='h-6 w-6 text-blue-600' />
    }
    if (type.includes('excel') || type.includes('xls')) {
      return <FileText className='h-6 w-6 text-green-600' />
    }
    return <File className='h-6 w-6 text-muted-foreground' />
  }

  return (
    <div
      className={cn(
        'group flex flex-col gap-2 rounded-lg border border-border/50 bg-card p-3 transition-all duration-200',
        'hover:-translate-y-1 hover:shadow-md'
      )}
    >
      <div className='flex items-start gap-3'>
        <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted/50'>
          {getIcon()}
        </div>
        <div className='flex-1 min-w-0'>
          <p className='truncate text-sm font-medium'>
            {document.nom_document || 'Sans nom'}
          </p>
          {document.description_document && (
            <p className='truncate text-xs text-muted-foreground'>
              {document.description_document}
            </p>
          )}
          {document.type_document && (
            <span className='text-[10px] text-muted-foreground'>
              {document.type_document}
            </span>
          )}
        </div>
        <div className='flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100'>
          {onEdit && (
            <button
              type='button'
              onClick={() => onEdit(document)}
              className='flex h-7 w-7 items-center justify-center rounded-md border border-border/50 bg-background text-muted-foreground transition-all hover:bg-muted hover:text-foreground'
            >
              <Pencil className='h-3 w-3' />
            </button>
          )}
          {onDelete && (
            <button
              type='button'
              onClick={() => onDelete(document)}
              className='flex h-7 w-7 items-center justify-center rounded-md border border-border/50 bg-background text-muted-foreground transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30'
            >
              <Trash2 className='h-3 w-3' />
            </button>
          )}
        </div>
      </div>

      {document.url && (
        <a
          href={document.url}
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 hover:underline'
        >
          <ExternalLink className='h-3 w-3' />
          Télécharger
        </a>
      )}
    </div>
  )
}