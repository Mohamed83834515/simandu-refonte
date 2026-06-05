import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { profilePictureSchema } from '@/simadou/schemas/personnelSchema'
import { useUpdateProfilePicture } from '@/simadou/allHooks/personnel/personnelHooks'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, ImageUp, Loader2, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface Props {
  n_personel: number
  currentPicture: string | null
  initials: string
}

export function ProfileAvatar({ n_personel, currentPicture, initials }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const { mutate: updatePicture, isPending } = useUpdateProfilePicture(n_personel)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate before upload
    const result = profilePictureSchema.safeParse({ file })
    if (!result.success) {
      toast.error(result.error.message)
      return
    }

    // Optimistic local preview
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)

    // Upload
    updatePicture(file, {
      onError: () => {
        setPreview(null)   // revert preview on failure
        toast.error("Échec de la mise à jour de la photo")
      },
      onSuccess: () => {
        toast.success("Photo mise à jour")
      },
    })
  }

  return (
    <div className="relative flex-shrink-0">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <Avatar className="size-30 border-[3px] border-background">
        <AvatarImage src={preview ?? currentPicture ?? ''} />
        <AvatarFallback className="bg-[#995F2F] text-5xl font-bold text-background">
          {isPending
            ? <Loader2 className="size-8 animate-spin text-background" />
            : initials
          }
        </AvatarFallback>
      </Avatar>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            disabled={isPending}
            className="absolute bottom-0 right-0 flex size-6 items-center justify-center
                       rounded-full border border-border bg-background shadow-sm
                       transition hover:bg-muted disabled:opacity-50"
          >
            {isPending
              ? <Loader2 className="size-3 animate-spin text-muted-foreground" />
              : <Camera className="size-3 text-muted-foreground" />
            }
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            <ImageUp className="size-4" />
            Importer une image
          </DropdownMenuItem>
          {currentPicture && (
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => {/* TODO: delete handler */}}
            >
              <Trash2 className="size-4" />
              Supprimer la photo
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}