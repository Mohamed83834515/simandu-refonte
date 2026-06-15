import { useRef } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useUploadStructureLogo } from '@/simadou/allHooks/generalParams/mutations'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
const MAX_MB   = 2

interface Props {
  currentLogo:    string | null
  structureSigle?: string | null
}

export function StructureLogoUploader({ currentLogo, structureSigle }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutate: upload, isPending } = useUploadStructureLogo()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED.includes(file.type)) {
      toast.error('Format accepté : JPG, PNG, WEBP ou SVG')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Taille maximale : ${MAX_MB} Mo`)
      return
    }

    upload(file)
    e.target.value = ''
  }

  return (
    <div className="flex items-center gap-4">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={handleChange}
      />

      <div className="relative">
        <Avatar className="size-16 rounded-full border border-border">
          <AvatarImage
            src={currentLogo ?? ''}
            alt="Logo de la structure"
            // className="object-contain p-1"
          />
          <AvatarFallback className="rounded-xl bg-muted text-xs font-medium text-muted-foreground">
  {structureSigle?.slice(0, 3).toUpperCase() ?? 'CEP'}
   </AvatarFallback>
        </Avatar>

        <button
          type="button"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
          className="
            absolute -bottom-1 -right-1
            flex size-6 items-center justify-center
            rounded-full border border-border bg-background shadow-sm
            transition hover:bg-muted disabled:opacity-50
          "
        >
          {isPending
            ? <Loader2 className="size-3 animate-spin text-muted-foreground" />
            : <Camera className="size-3 text-muted-foreground" />
          }
        </button>
      </div>

      <div>
        <p className="text-sm font-medium">Logo de la structure</p>
        <p className="text-xs text-muted-foreground">
          JPG, PNG, WEBP ou SVG · max {MAX_MB} Mo
        </p>
      </div>
    </div>
  )
}