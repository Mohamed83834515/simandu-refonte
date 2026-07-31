import { useRef, useState } from 'react'
import { Download, FileUp, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { downloadBlob } from '@/simadou/allfonctionalities/rapport/export/rapportExportUtils'
import { ppmService } from '@/simadou/allSercices/ppmService'

export default function PpmHeaderActions() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadCanevas = async () => {
    if (isDownloading) return
    setIsDownloading(true)
    try {
      const { blob, filename } = await ppmService.downloadTemplate()
      downloadBlob(blob, filename)
      toast.success('Canevas téléchargé')
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Erreur lors du téléchargement du canevas')
      )
    } finally {
      setIsDownloading(false)
    }
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
        disabled={isDownloading}
        className={cn(
          'h-9 gap-2 border-emerald-200/80 bg-emerald-50/70 text-emerald-800',
          'shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-900',
          'dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300',
          'dark:hover:bg-emerald-950/70'
        )}
      >
        {isDownloading ? (
          <Loader2 className='h-4 w-4 animate-spin' />
        ) : (
          <Download className='h-4 w-4' />
        )}
        <span className='text-sm font-medium'>
          {isDownloading ? 'Téléchargement…' : 'Télécharger le canevas'}
        </span>
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
