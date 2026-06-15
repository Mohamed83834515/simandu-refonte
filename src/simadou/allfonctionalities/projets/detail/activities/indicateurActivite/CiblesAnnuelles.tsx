import React, { useMemo, useEffect } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { useGetProjet } from '@/simadou/allHooks/admin/projetHooks'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2 } from 'lucide-react'

type CiblesAnnuellesProps = {
    onCiblesChange: (cibles: any[]) => void
    initialCibles?: any[] // Ajout pour recevoir les cibles existantes
}

export default function CiblesAnnuelles({ onCiblesChange, initialCibles }: CiblesAnnuellesProps) {
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

    // Initialiser les cibles avec les valeurs existantes ou par défaut
    useEffect(() => {
        if (annees.length > 0) {
            if (initialCibles && initialCibles.length > 0) {
                // Utiliser les cibles existantes
                const mappedCibles = annees.map(annee => {
                    const existingCible = initialCibles.find(c => c.annee === annee)
                    return {
                        annee,
                        valeur_cible: existingCible ? Number(existingCible.valeur_cible_indcateur_performance || existingCible.valeur_cible) : 0
                    }
                })
                setCibles(mappedCibles)
                onCiblesChange(mappedCibles)
            } else if (cibles.length === 0) {
                // Créer des cibles par défaut
                const defaultCibles = annees.map(annee => ({ annee, valeur_cible: 0 }))
                setCibles(defaultCibles)
                onCiblesChange(defaultCibles)
            }
        }
    }, [annees, initialCibles])

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
            <div className="rounded-md border overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="border-b">
                            {annees.map(annee => (
                                <TableHead
                                    key={annee}
                                    className="text-center font-semibold text-foreground border-r last:border-r-0"
                                >
                                    {annee}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="hover:bg-muted/20 transition-colors">
                            {annees.map((annee, index) => (
                                <TableCell
                                    key={annee}
                                    className="text-center border-r last:border-r-0 p-2"
                                >
                                    <Input
                                        type="text"
                                        placeholder="Valeur"
                                        className="w-28 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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