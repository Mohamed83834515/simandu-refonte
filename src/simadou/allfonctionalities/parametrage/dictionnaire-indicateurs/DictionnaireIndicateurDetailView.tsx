import { Badge } from '@/components/ui/badge'
import {
  DetailField,
  DetailFieldGrid,
  DetailHighlight,
  DetailSection,
  DetailViewError,
  DetailViewFooter,
  DetailViewHeader,
  DetailViewLoading,
} from '@/Global/Detail/DetailFields'
import { useGetDictionnaireIndicateur } from '@/simadou/allHooks/admin/dictionnaireIndicateurHooks'

function formatUnite(unite: {
  unite_ui?: string
  definition_ui?: string
} | null | undefined): string {
  if (!unite) return ''
  const code = unite.unite_ui?.trim()
  const definition = unite.definition_ui?.trim()
  if (code && definition) return `${code} — ${definition}`
  return code ?? definition ?? ''
}

function formatSeuils(min?: number, max?: number): string {
  if (min != null && max != null) return `${min} — ${max}`
  if (min != null) return `Min. ${min}`
  if (max != null) return `Max. ${max}`
  return ''
}

export default function DictionnaireIndicateurDetailView({
  indicateurId,
  onClose,
}: {
  indicateurId: number
  onClose: () => void
}) {
  const { data: indicateur, isLoading, isError } =
    useGetDictionnaireIndicateur(indicateurId)

  if (isLoading) return <DetailViewLoading />

  if (isError || !indicateur) {
    return <DetailViewError message='Indicateur non trouvé' />
  }

  const seuils = formatSeuils(indicateur.seuil_minimum, indicateur.seuil_maximum)

  return (
    <div className='space-y-5'>
      <DetailViewHeader
        title={indicateur.intitule_ref_ind}
        badge={
          <Badge variant='secondary' className='font-mono text-[11px]'>
            {indicateur.code_ref_ind}
          </Badge>
        }
      />

      {indicateur.typologie ? (
        <DetailHighlight label='Typologie'>{indicateur.typologie}</DetailHighlight>
      ) : null}

      <DetailSection title='Informations générales'>
        <DetailFieldGrid>
          <DetailField
            label='Unité de mesure'
            value={formatUnite(indicateur.unite_cmr)}
            className='sm:col-span-2'
          />
          <DetailField
            label='Échelle'
            value={indicateur.echelle?.nom_type_zone}
          />
          <DetailField
            label="Fonction d'agrégation"
            value={indicateur.fonction_agregat_cmr || 'Non définie'}
          />
        </DetailFieldGrid>
      </DetailSection>

      <DetailSection title='Collecte & seuils'>
        <DetailFieldGrid>
          <DetailField
            label='Responsable de collecte'
            value={indicateur.responsable_collecte_cmr?.nom_acteur}
            className='sm:col-span-2'
          />
          <DetailField label='Seuils' value={seuils || 'Non définis'} />
        </DetailFieldGrid>
      </DetailSection>

      <DetailSection title='Informations système'>
        <DetailFieldGrid className='sm:grid-cols-3'>
          <DetailField label='ID' value={indicateur.id_ref_ind_ref} mono />
          {indicateur.created_at ? (
            <DetailField
              label='Créé le'
              value={new Date(indicateur.created_at).toLocaleDateString('fr-FR')}
            />
          ) : null}
          {indicateur.updated_at ? (
            <DetailField
              label='Modifié le'
              value={new Date(indicateur.updated_at).toLocaleDateString('fr-FR')}
            />
          ) : null}
        </DetailFieldGrid>
      </DetailSection>

      <DetailViewFooter onClose={onClose} />
    </div>
  )
}
