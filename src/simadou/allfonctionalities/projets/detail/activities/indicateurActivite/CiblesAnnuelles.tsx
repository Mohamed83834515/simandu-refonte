import React, { useMemo, useEffect } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { useGetProjet } from '@/simadou/allHooks/admin/projetHooks'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2 } from 'lucide-react'

type CiblesAnnuellesProps = {
    onCiblesChange: (cibles: any[]) => void
}

export default function CiblesAnnuelles({ onCiblesChange }: CiblesAnnuellesProps) {
    const route = getRouteApi('/_authenticated/programmation/projets/$id')
    const { id } = route.useParams()
    const { data: projet, isLoading: isLoadingProjet } = useGetProjet(id)

    const annees = useMemo(() => {
        if (!projet) return []
        const anneeDebut = new Date(projet.date_demarrage_projet).getFullYear()
        const dureeAnnees = projet.duree_projet || 1
        return Array.from({ length: dureeAnnees }, (_, i) => anneeDebut + i)
    }, [projet])

    const [cibles, setCibles] = React.useState<any[]>([])

    useEffect(() => {
        if (annees.length > 0 && cibles.length === 0) {
            const initialCibles = annees.map(annee => ({ annee, valeur_cible: 0 }))
            setCibles(initialCibles)
            onCiblesChange(initialCibles)
        }
    }, [annees])

    const handleChange = (index: number, value: number) => {
        const newCibles = [...cibles]
        newCibles[index] = { ...newCibles[index], valeur_cible: value }
        setCibles(newCibles)
        onCiblesChange(newCibles)
    }

    if (isLoadingProjet) {
        return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
    }

    if (!projet || annees.length === 0) return null

    return (
        <div className="space-y-4 mt-6">
            <Label>Cibles annuelles (optionnelles)</Label>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {annees.map(annee => <TableHead key={annee} className="text-center">{annee}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            {annees.map((annee, index) => (
                                <TableCell key={annee} className="text-center">
                                    <Input
                                        type="number"
                                        placeholder="Valeur"
                                        className="w-32 text-center"
                                        value={cibles[index]?.valeur_cible || 0}
                                        onChange={(e) => handleChange(index, Number(e.target.value))}
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}