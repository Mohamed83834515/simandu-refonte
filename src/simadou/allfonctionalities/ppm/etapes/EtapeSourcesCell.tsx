import { useRef } from 'react'
import { FileText, Loader2, Plus, X } from 'lucide-react'
import {
    useAddSourceVerificationEtape,
    useDeleteSourceVerificationEtape,
    useGetSourcesByEtape,
} from '@/simadou/allHooks/admin/etapePassationHooks'

type EtapeSourcesCellProps = {
    idEtape: number
}

function fileNameFromUrl(url: string): string {
    try {
        const clean = url.split('?')[0]
        const parts = clean.split('/')
        return decodeURIComponent(parts[parts.length - 1] || url)
    } catch {
        return url
    }
}

export default function EtapeSourcesCell({ idEtape }: EtapeSourcesCellProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const { data: sources = [], isLoading } = useGetSourcesByEtape(idEtape)
    const addMutation = useAddSourceVerificationEtape(idEtape)
    const deleteMutation = useDeleteSourceVerificationEtape(idEtape)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) addMutation.mutate(file)
        e.target.value = ''
    }

    return (
        <div className='flex max-w-56 flex-wrap items-center gap-1'>
            {isLoading && (
                <Loader2 className='h-3.5 w-3.5 animate-spin text-muted-foreground' />
            )}

            {!isLoading &&
                sources.map((source) => (
                    <span
                        key={source.id_source_verif_etape}
                        className='inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2 py-0.5 text-[11px]'
                        title={fileNameFromUrl(source.fichier_join)}
                    >
                        <FileText className='h-3 w-3 shrink-0' />
                        <a
                            href={source.fichier_join}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='max-w-24 truncate hover:underline'
                        >
                            {fileNameFromUrl(source.fichier_join)}
                        </a>
                        <button
                            type='button'
                            onClick={() =>
                                deleteMutation.mutate(source.id_source_verif_etape)
                            }
                            className='ml-0.5 text-muted-foreground hover:text-red-500'
                            aria-label='Supprimer le fichier'
                        >
                            <X className='h-3 w-3' />
                        </button>
                    </span>
                ))}

            <button
                type='button'
                onClick={() => inputRef.current?.click()}
                disabled={addMutation.isPending}
                className='inline-flex h-5 w-5 items-center justify-center rounded-full border border-dashed text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50'
                aria-label='Ajouter un fichier'
            >
                {addMutation.isPending ? (
                    <Loader2 className='h-3 w-3 animate-spin' />
                ) : (
                    <Plus className='h-3 w-3' />
                )}
            </button>
            <input
                ref={inputRef}
                type='file'
                className='hidden'
                onChange={handleFileChange}
            />
        </div>
    )
}