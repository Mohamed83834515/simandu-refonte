import { ClipboardList } from 'lucide-react'
import RapportPageLayout from '../RapportPageLayout'
import ListeRapportPtba from './ListeRapportPtba'

export default function RapportPtbaPage() {
  return (
    <RapportPageLayout title='Rapport des états PAO' icon={ClipboardList}>
      <ListeRapportPtba />
    </RapportPageLayout>
  )
}
