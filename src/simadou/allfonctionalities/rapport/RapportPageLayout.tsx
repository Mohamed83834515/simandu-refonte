import type { LucideIcon } from 'lucide-react'
import RapportExportButton from './RapportExportButton'
import { RapportExportProvider } from './RapportExportContext'

type Props = {
  title: string
  icon: LucideIcon
  children: React.ReactNode
}

export default function RapportPageLayout({ title, icon: Icon, children }: Props) {
  return (
    <RapportExportProvider pageTitle={title}>
      <div>
        <div className='flex items-center justify-between gap-4 rounded-lg px-6 pb-2'>
          <div className='flex items-center gap-2'>
            <Icon className='h-5 w-5 text-muted-foreground' />
            <h3>{title}</h3>
          </div>
          <RapportExportButton />
        </div>
        <div className='px-4'>{children}</div>
      </div>
    </RapportExportProvider>
  )
}
