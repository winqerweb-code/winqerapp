"use client"

import { useStore } from "@/contexts/store-context"

export function Header() {
    const { selectedStore } = useStore()

    return (
        <header className="flex h-16 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold">
                    {selectedStore ? selectedStore.name : "Dashboard"}
                </h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-muted" />
            </div>
        </header>
    )
}
