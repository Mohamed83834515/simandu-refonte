 
import { createFileRoute } from '@tanstack/react-router'
import ListeLocalite from '@/simadou/allfonctionalities/parametrage/localite/ListeLocalite'

export const Route = createFileRoute('/_authenticated/parametrage/localites/')({
  component: ListeLocalite,
})
