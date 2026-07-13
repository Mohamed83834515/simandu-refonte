import { useEffect, useState } from 'react'
import { Plus, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useMe } from '@/simadou/allHooks/auth/authHooks'
import {
  useCreateSuiviIndicateurContrat,
  useDeleteSuiviIndicateurContrat,
  useGetSuivisIndicateurContrat,
  useUpdateSuiviIndicateurContrat,
} from '@/simadou/allHooks/admin/suiviIndicateurContratHooks'
import type { IndicateurContrat } from '@/simadou/allTypes/indicateurContrat'
import {
  TRIMESTRE_OPTIONS,
  type SuiviIndicateurContrat,
  type TrimestreSuiviIndicateurContrat,
} from '@/simadou/allTypes/suiviIndicateurContrat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

type SuiviRow = {
  id?: number
  valeur_realisee: string
  trimestre: TrimestreSuiviIndicateurContrat | ''
  observation: string
  isNew: boolean
}

function toRow(suivi: SuiviIndicateurContrat): SuiviRow {
  const trimestre = TRIMESTRE_OPTIONS.some((o) => o.value === suivi.trimestre)
    ? (suivi.trimestre as TrimestreSuiviIndicateurContrat)
    : ''

  return {
    id: suivi.id_suivi_contrat,
    valeur_realisee:
      suivi.valeur_realisee == null || Number.isNaN(Number(suivi.valeur_realisee))
        ? ''
        : String(suivi.valeur_realisee),
    trimestre,
    observation: String(suivi.observation ?? ''),
    isNew: false,
  }
}

function createEmptyRow(): SuiviRow {
  return {
    valeur_realisee: '',
    trimestre: '',
    observation: '',
    isNew: true,
  }
}

function rowHasData(row: SuiviRow): boolean {
  return (
    !!row.valeur_realisee.trim() ||
    !!row.trimestre ||
    !!row.observation.trim()
  )
}

type Props = {
  indicateur: IndicateurContrat
}

export default function SuiviIndicateurContratManager({ indicateur }: Props) {
  const idIndicateur = indicateur.id_indicateur_contrat
  const { data: me } = useMe()
  const { data: suivis = [], isLoading } =
    useGetSuivisIndicateurContrat(idIndicateur)
  const createMutation = useCreateSuiviIndicateurContrat(idIndicateur)
  const updateMutation = useUpdateSuiviIndicateurContrat(idIndicateur)
  const deleteMutation = useDeleteSuiviIndicateurContrat(idIndicateur)

  const [rows, setRows] = useState<SuiviRow[]>([createEmptyRow()])
  const [initialized, setInitialized] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (initialized || isLoading) return
    setRows(
      suivis.length === 0
        ? [createEmptyRow()]
        : [...suivis.map(toRow), createEmptyRow()]
    )
    setInitialized(true)
  }, [initialized, isLoading, suivis])

  const onAddRow = () => {
    setRows((prev) => [...prev, createEmptyRow()])
  }

  const updateRow = (index: number, patch: Partial<SuiviRow>) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
    )
  }

  const onSave = async () => {
    const idPersonnel = me?.n_personnel
    if (idPersonnel == null) {
      toast.error('Impossible d’identifier le personnel connecté.')
      return
    }

    const rowsToSave = rows.filter(rowHasData)
    if (rowsToSave.length === 0) {
      toast.error('Ajoutez au moins une ligne de suivi')
      return
    }

    for (const row of rowsToSave) {
      const valeur = Number(row.valeur_realisee)
      if (!row.valeur_realisee.trim() || Number.isNaN(valeur)) {
        toast.error('La valeur réalisée doit être un nombre')
        return
      }
      if (!row.trimestre) {
        toast.error('Le trimestre est requis')
        return
      }
    }

    setIsSaving(true)
    try {
      for (const row of rowsToSave) {
        const payload = {
          trimestre: row.trimestre,
          valeur_realisee: Number(row.valeur_realisee),
          observation: row.observation.trim(),
          etat: true,
          indicateur_contrat: idIndicateur,
          id_personnel: idPersonnel,
          modifier_par: idPersonnel,
        }

        if (row.isNew) {
          await createMutation.mutateAsync(payload)
        } else if (row.id != null) {
          await updateMutation.mutateAsync({ id: row.id, data: payload })
        }
      }

      toast.success('Suivis enregistrés')
      setInitialized(false)
    } catch {
      toast.error('Erreur lors de la sauvegarde des suivis')
    } finally {
      setIsSaving(false)
    }
  }

  const onRemoveRow = async (index: number) => {
    const row = rows[index]
    if (!row) return

    if (row.id != null) {
      if (!window.confirm('Supprimer ce suivi ?')) return
      try {
        await deleteMutation.mutateAsync(row.id)
        toast.success('Suivi supprimé')
        setInitialized(false)
      } catch {
        toast.error('Erreur lors de la suppression')
      }
      return
    }

    setRows((prev) => {
      const next = prev.filter((_, i) => i !== index)
      return next.length === 0 ? [createEmptyRow()] : next
    })
  }

  if (isLoading && !initialized) {
    return <div className='py-6 text-sm text-muted-foreground'>Chargement…</div>
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h3 className='text-base font-semibold'>Suivi de l&apos;indicateur</h3>
          <p className='text-sm text-muted-foreground'>
            {indicateur.intitule_indicateur}
          </p>
        </div>
        <div className='flex flex-col gap-2 sm:flex-row'>
          <Button type='button' variant='outline' onClick={onAddRow}>
            <Plus className='h-4 w-4' />
            Ajouter
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
              <TableHead>Valeur réalisée</TableHead>
              <TableHead className='w-44'>Trimestre</TableHead>
              <TableHead>Observation</TableHead>
              <TableHead className='w-20 text-end'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id ?? `new-${index}`}>
                <TableCell>
                  <Input
                    type='number'
                    value={row.valeur_realisee}
                    placeholder='Ex: 12'
                    onChange={(e) =>
                      updateRow(index, { valeur_realisee: e.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={row.trimestre || undefined}
                    onValueChange={(value) =>
                      updateRow(index, {
                        trimestre: value as TrimestreSuiviIndicateurContrat,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Choisir…' />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIMESTRE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    value={row.observation}
                    placeholder='Observation'
                    onChange={(e) =>
                      updateRow(index, { observation: e.target.value })
                    }
                  />
                </TableCell>
                <TableCell className='text-end'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => onRemoveRow(index)}
                    title='Supprimer'
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
