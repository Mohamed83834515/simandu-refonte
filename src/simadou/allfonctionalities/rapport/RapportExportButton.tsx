import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Download, FileSpreadsheet, FileText, FileType } from 'lucide-react'
import { useRapportExport } from './RapportExportContext'
import type { ExportFormat } from './export/rapportExportTypes'

type ExportOption = {
  format: ExportFormat
  label: string
  extension: string
  icon: typeof FileText
  badgeClassName: string
  iconClassName: string
}

const exportOptions: ExportOption[] = [
  {
    format: 'word',
    label: 'Word',
    extension: '.docx',
    icon: FileText,
    badgeClassName: 'bg-blue-50 dark:bg-blue-950/50',
    iconClassName: 'text-blue-600 dark:text-blue-400',
  },
  {
    format: 'excel',
    label: 'Excel',
    extension: '.xlsx',
    icon: FileSpreadsheet,
    badgeClassName: 'bg-green-50 dark:bg-green-950/50',
    iconClassName: 'text-green-600 dark:text-green-400',
  },
  {
    format: 'pdf',
    label: 'PDF',
    extension: '.pdf',
    icon: FileType,
    badgeClassName: 'bg-red-50 dark:bg-red-950/50',
    iconClassName: 'text-red-600 dark:text-red-400',
  },
]

function ExportFormatIcon({
  icon: Icon,
  badgeClassName,
  iconClassName,
}: Pick<ExportOption, 'icon' | 'badgeClassName' | 'iconClassName'>) {
  return (
    <span
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-md border border-border/50',
        badgeClassName
      )}
    >
      <Icon className={cn('size-4', iconClassName)} />
    </span>
  )
}

export default function RapportExportButton() {
  const { isRegistered, isLoading, resolvePayload } = useRapportExport()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: ExportFormat) => {
    if (isExporting) return

    const payload = resolvePayload()
    if (!payload) return

    setIsExporting(true)
    try {
      const { exportRapport } = await import('./export/exportRapport')
      await exportRapport(format, payload)
    } finally {
      setIsExporting(false)
    }
  }

  const disabled = !isRegistered || isLoading || isExporting

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' className='cursor-pointer' disabled={disabled}>
          <Download className='mr-2 h-4 w-4' />
          {isExporting ? 'Export…' : 'Exporter'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-44 p-1'>
        {exportOptions.map(
          ({ format, label, extension, icon, badgeClassName, iconClassName }) => (
            <DropdownMenuItem
              key={format}
              className='cursor-pointer gap-2.5 px-2 py-2'
              disabled={disabled}
              onClick={() => void handleExport(format)}
            >
              <ExportFormatIcon
                icon={icon}
                badgeClassName={badgeClassName}
                iconClassName={iconClassName}
              />
              <span className='flex min-w-0 flex-1 items-baseline justify-between gap-3'>
                <span className='text-sm font-medium'>{label}</span>
                <span className='text-xs text-muted-foreground'>{extension}</span>
              </span>
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
