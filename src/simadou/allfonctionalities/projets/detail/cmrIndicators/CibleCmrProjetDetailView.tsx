import { Badge } from '@/components/ui/badge'
import type { CibleCmrProjet } from '@/simadou/allTypes'
import {
  DetailField,
  DetailFieldGrid,
  DetailMetric,
  DetailSection,
  DetailViewFooter,
  DetailViewHeader,
} from '@/Global/Detail/DetailFields'
import { useGetIndicateursCadreResultat } from '@/simadou/allHooks/admin/indicateurCadreResultatHooks'
import {
  formatAnneeCible,
  formatValeurCible,
  lookupIndicateurCadreResultatByCrpId,
  resolveCodeIndicateurCrpForForm,
} from '@/simadou/schemas/cibleCmrProjetSchema'
import { resolveRelationCode } from '@/simadou/lib/resolveApiRelation'

function displayCode(value: unknown, codeKey: string): string {
  return resolveRelationCode(value, codeKey) ?? ''
}

export default function CibleCmrProjetDetailView({
  cible,
  onClose,
}: {
  cible: CibleCmrProjet
  onClose: () => void
}) {
  const { data: indicateurs = [] } = useGetIndicateursCadreResultat()
  const indicateurId = resolveCodeIndicateurCrpForForm(cible)
  const indicateur =
    lookupIndicateurCadreResultatByCrpId(indicateurId, indicateurs) ??
    (cible.indicateur_crp as (typeof indicateurs)[number] | null | undefined)
  const codeIndicateur =
    indicateur?.code_indicateur_cr_iop ??
    displayCode(cible.code_indicateur_crp, 'code_indicateur_cr_iop')
  const codeUgl = displayCode(cible.code_ug, 'code_ugl')
  const codeProjet = displayCode(cible.code_projet, 'code_projet')

  const indicateurIntitule =
    indicateur?.intitule_indicateur_cr_iop ??
    resolveRelationCode(
      cible.indicateur_crp ?? cible.code_indicateur_crp,
      'intitule_indicateur_cr_iop'
    )

  const uglNom = resolveRelationCode(cible.ugl ?? cible.code_ug, 'nom_ugl')
  const annee = formatAnneeCible(cible.annee)
  const valeur = formatValeurCible(Number(cible.valeur_cible_indcateur_crp ?? 0))

  return (
    <div className='space-y-5'>
      <DetailViewHeader
        title={`Cible ${annee}`}
        badge={
          codeProjet ? (
            <Badge variant='outline' className='font-mono text-[11px]'>
              {codeProjet}
            </Badge>
          ) : undefined
        }
        description={indicateurIntitule ?? undefined}
      />

      <div className='grid gap-3 sm:grid-cols-2'>
        <DetailMetric label='Année de la cible' value={annee} />
        <DetailMetric label='Valeur cible' value={valeur} />
      </div>

      <DetailSection title='Rattachements'>
        <DetailFieldGrid>
          <DetailField
            label='Code indicateur CRP'
            value={codeIndicateur}
            mono
          />
          <DetailField label='Indicateur de résultat' value={indicateurIntitule} />
          <DetailField label='Code UGL' value={codeUgl} mono />
          <DetailField label='UGL' value={uglNom} />
        </DetailFieldGrid>
      </DetailSection>

      <DetailSection title='Informations système'>
        <DetailFieldGrid className='sm:grid-cols-2'>
          <DetailField
            label='ID'
            value={cible.id_cible_indicateur_crp}
            mono
          />
          <DetailField label='Code projet' value={codeProjet} mono />
        </DetailFieldGrid>
      </DetailSection>

      <DetailViewFooter onClose={onClose} />
    </div>
  )
}
