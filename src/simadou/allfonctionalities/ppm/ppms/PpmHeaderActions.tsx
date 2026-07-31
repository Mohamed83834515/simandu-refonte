import { useRef } from 'react'
import { Download, FileUp } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PPM_CANEVAS_URL = '/templates/ppm-canevas.xlsx'
const PPM_CANEVAS_FILENAME = 'PPM-2025-Sans-Montant.xlsx'

export default function PpmHeaderActions() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDownloadCanevas = () => {
    const link = document.createElement('a')
    link.href = PPM_CANEVAS_URL
    link.download = PPM_CANEVAS_FILENAME
    link.rel = 'noopener'
    document.body.appendChild(link)
    link.click()
    link.remove()
    toast.success('Téléchargement du canevas démarré')
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const isExcel =
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls') ||
      file.type.includes('spreadsheet') ||
      file.type.includes('excel')

    if (!isExcel) {
      toast.error('Veuillez sélectionner un fichier Excel (.xlsx)')
      return
    }

    // Backend import endpoint not available yet — keep the file picker ready.
    toast.message(`Fichier sélectionné : ${file.name}`)
  }

  return (
    <div className='flex items-center gap-2'>
      <Button
        type='button'
        variant='outline'
        onClick={handleDownloadCanevas}
        className={cn(
          'h-9 gap-2 border-emerald-200/80 bg-emerald-50/70 text-emerald-800',
          'shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-900',
          'dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300',
          'dark:hover:bg-emerald-950/70'
        )}
      >
        <Download className='h-4 w-4' />
        <span className='text-sm font-medium'>Télécharger le canevas</span>
      </Button>

      <Button
        type='button'
        variant='outline'
        onClick={handleImportClick}
        className={cn(
          'h-9 gap-2 border-sky-200/80 bg-sky-50/70 text-sky-800',
          'shadow-sm transition-all hover:border-sky-300 hover:bg-sky-100 hover:text-sky-900',
          'dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-300',
          'dark:hover:bg-sky-950/70'
        )}
      >
        <FileUp className='h-4 w-4' />
        <span className='text-sm font-medium'>Importer</span>
      </Button>

      <input
        ref={fileInputRef}
        type='file'
        accept='.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'
        className='hidden'
        onChange={handleFileChange}
      />
    </div>
  )
}
