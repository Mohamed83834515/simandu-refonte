// simadou/stores/acteurStore.ts
import { create } from 'zustand'

type TypeProjetStore = {
    selectedTypeProjetId: number | null
    setSelectedTypeProjetId: (id: number | null) => void
}

export const useTypeProjetStore = create<TypeProjetStore>((set) => ({
    selectedTypeProjetId: null,
    setSelectedTypeProjetId: (id) => set({ selectedTypeProjetId: id }),
}))