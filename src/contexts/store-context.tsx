"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { Store } from "@/types/store"

interface StoreContextType {
    selectedStore: Store | null
    setSelectedStore: (store: Store | null) => void
    stores: Store[]
    setStores: (stores: Store[]) => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
    const [selectedStore, setSelectedStore] = useState<Store | null>(null)
    const [stores, setStores] = useState<Store[]>([])

    return (
        <StoreContext.Provider value={{ selectedStore, setSelectedStore, stores, setStores }}>
            {children}
        </StoreContext.Provider>
    )
}

export function useStore() {
    const context = useContext(StoreContext)
    if (context === undefined) {
        throw new Error("useStore must be used within a StoreProvider")
    }
    return context
}
