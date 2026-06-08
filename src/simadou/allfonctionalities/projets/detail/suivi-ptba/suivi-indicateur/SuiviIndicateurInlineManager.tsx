import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Save, Trash2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getApiErrorMessage } from '@/lib/api-error-message'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { SuiviIndicateurActivite } from '@/simadou/allTypes'
import type { Ptba } from '@/simadou/allTypes'
import { IndicateurTache } from '@/simadou/allTypes/indicateurTache'
import type { SuiviIndicateurActiviteFormData } from '@/simadou/schemas/suiviIndicateurSchemas'
import {
  useCreateSuiviIndicateur,
  useDeleteSuiviIndicateur,
  useGetLocalites,
  useGetSuivisIndicateurByIndicateur,
  useUpdateSuiviIndicateur,
  suiviPtbaQueryKeys,
} from '@/simadou/allHooks/admin/suiviPtbaHooks'
import { ensureIndicateurActivitePtbaCode } from './suiviIndicateurUtils'

type SuiviRow = {
  id?: number
  localite: string
  date_suivi_indicateur: string
  valeur_suivi_indicateur: string
  isNew: boolean
}

function toRow(suivi: SuiviIndicateurActivite): SuiviRow {
  return {
    id: suivi.id_suivi_indicateur,
    localite:
      typeof suivi.localite === 'object' && suivi.localite
        ? suivi.localite.code_loca
        : typeof suivi.localite === 'string'
          ? suivi.localite
          : '',
    date_suivi_indicateur: suivi.date_suivi_indicateur
      ? new Date(suivi.date_suivi_indicateur).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    valeur_suivi_indicateur: String(suivi.valeur_suivi_indicateur ?? ''),
    isNew: false,
  }
}

function createEmptyRow(): SuiviRow {
  return {
    localite: '',
    date_suivi_indicateur: new Date().toISOString().split('T')[0],
    valeur_suivi_indicateur: '',
    isNew: true,
  }
}

function rowHasData(row: SuiviRow): boolean {
  return (
    !!row.localite.trim() ||
    !!row.valeur_suivi_indicateur.trim()
  )
}

type SuiviIndicateurInlineManagerProps = {
  activite: Ptba
  indicateur: IndicateurTache
  onClose: () => void
}

function syncRowsFromSuivis(suivis: SuiviIndicateurActivite[]): SuiviRow[] {
  return suivis.length === 0
    ? [createEmptyRow()]
    : [...suivis.map(toRow), createEmptyRow()]
}

export default function SuiviIndicateurInlineProjetManager({
  activite,
  indicateur,
  onClose,
}: SuiviIndicateurInlineManagerProps) {
  const queryClient = useQueryClient()
  const codeIndicateur = indicateur.code_indicateur_ptba
  const {
    data: suivis = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetSuivisIndicateurByIndicateur(codeIndicateur, true)
  const { data: localites = [] } = useGetLocalites()
  const createMutation = useCreateSuiviIndicateur(codeIndicateur)
  const updateMutation = useUpdateSuiviIndicateur(codeIndicateur)
  const deleteMutation = useDeleteSuiviIndicateur(codeIndicateur)

  const [rows, setRows] = useState<SuiviRow[]>([createEmptyRow()])
  const [initialized, setInitialized] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (initialized || isLoading || isFetching) return
    setRows(syncRowsFromSuivis(suivis))
    setInitialized(true)
  }, [initialized, isLoading, isFetching, suivis])

  const refreshSuivis = async () => {
    await Promise.all([
      refetch(),
      queryClient.refetchQueries({
        queryKey: suiviPtbaQueryKeys.suivisIndicateurs,
      }),
    ])
  }

  const onAddRow = () => {
    setRows((prev) => [...prev, createEmptyRow()])
  }

  const onRemoveRow = async (index: number) => {
    const row = rows[index]
    if (!row) return

    if (row.id != null) {
      const ok = window.confirm('Supprimer ce suivi ?')
      if (!ok) return
      try {
        await deleteMutation.mutateAsync(row.id)
        setInitialized(false)
        await refreshSuivis()
        toast.success('Suivi supprimé')
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, 'Erreur lors de la suppression')
        )
      }
      return
    }

    setRows((prev) => {
      const next = prev.filter((_, i) => i !== index)
      return next.length > 0 ? next : [createEmptyRow()]
    })
  }

  const onSave = async () => {
    const rowsToSave = rows.filter(rowHasData)
    if (rowsToSave.length === 0) {
      toast.error('Renseignez au moins une ligne de suivi')
      return
    }

    for (const row of rowsToSave) {
      if (!row.localite.trim()) {
        toast.error('La commune est requise sur chaque ligne')
        return
      }
      if (!row.date_suivi_indicateur.trim()) {
        toast.error('La date est requise sur chaque ligne')
        return
      }
      const valeur = Number(row.valeur_suivi_indicateur.replace(',', '.'))
      if (!Number.isFinite(valeur)) {
        toast.error('La valeur doit être un nombre')
        return
      }
    }

    setIsSaving(true)
    try {
      const indicateurActiviteCode = await ensureIndicateurActivitePtbaCode(
        activite,
        indicateur
      )

      for (const row of rowsToSave) {
        const payload: SuiviIndicateurActiviteFormData = {
          localite: row.localite,
          date_suivi_indicateur: row.date_suivi_indicateur,
          valeur_suivi_indicateur: Number(
            row.valeur_suivi_indicateur.replace(',', '.')
          ),
          indicateur_activite: indicateurActiviteCode,
        }

        if (row.isNew) {
          await createMutation.mutateAsync(payload)
        } else if (row.id != null) {
          await updateMutation.mutateAsync({ id: row.id, data: payload })
        }
      }
      toast.success('Suivis enregistrés')
      setInitialized(false)
      await refreshSuivis()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erreur lors de la sauvegarde'))
    } finally {
      setIsSaving(false)
    }
  }

  if ((isLoading || isFetching) && !initialized) {
    return (
      <div className='py-6 text-sm text-muted-foreground'>Chargement…</div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-muted-foreground'>
          Saisissez la commune, la date et la valeur pour chaque suivi.
        </p>
        <div className='flex flex-col gap-2 sm:flex-row'>
          <Button
            type='button'
            variant='outline'
            onClick={onClose}
            disabled={isSaving}
          >
            <ArrowLeft className='h-4 w-4' />
            Retour
          </Button>
          <Button
            type='button'
            variant='outline'
            onClick={onAddRow}
            disabled={isSaving}
          >
            <Plus className='h-4 w-4' />
            Ajouter une ligne
          </Button>
          <Button type='button' onClick={onSave} disabled={isSaving}>
            <Save className='h-4 w-4' />
            {isSaving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      <div className='rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Commune</TableHead>
              <TableHead className='w-40'>Date suivi</TableHead>
              <TableHead className='w-32'>Valeur</TableHead>
              <TableHead className='w-16 text-end'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id ?? `new-${index}`}>
                <TableCell className='align-top'>
                  <Select
                    value={row.localite || undefined}
                    onValueChange={(value) =>
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, localite: value } : r
                        )
                      )
                    }
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Commune' />
                    </SelectTrigger>
                    <SelectContent>
                      {localites.map((loc) => (
                        <SelectItem key={loc.id_loca} value={loc.code_loca}>
                          {loc.intitule_loca || loc.code_loca}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className='align-top'>
                  <Input
                    type='date'
                    value={row.date_suivi_indicateur}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index
                            ? { ...r, date_suivi_indicateur: e.target.value }
                            : r
                        )
                      )
                    }
                  />
                </TableCell>
                <TableCell className='align-top'>
                  <Input
                    type='number'
                    min={0}
                    step='any'
                    placeholder='0'
                    value={row.valeur_suivi_indicateur}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index
                            ? { ...r, valeur_suivi_indicateur: e.target.value }
                            : r
                        )
                      )
                    }
                  />
                </TableCell>
                <TableCell className='text-end align-top'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    disabled={isSaving || rows.length <= 1}
                    onClick={() => onRemoveRow(index)}
                    title='Supprimer la ligne'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
