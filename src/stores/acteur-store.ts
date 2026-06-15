// simadou/stores/acteurStore.ts
import { create } from 'zustand'

type ActeurStore = {
    selectedCategorieId: number | null
    setSelectedCategorieId: (id: number | null) => void
}

export const useActeurStore = create<ActeurStore>((set) => ({
    selectedCategorieId: null,
    setSelectedCategorieId: (id) => set({ selectedCategorieId: id }),
}))