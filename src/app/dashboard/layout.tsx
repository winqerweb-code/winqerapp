"use client"

import { useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useStore } from "@/contexts/store-context"
import { getStores } from "@/app/actions/store"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { setStores, stores } = useStore()

    useEffect(() => {
        const fetchStores = async () => {
            // Only fetch if we don't have stores yet
            if (stores.length === 0) {
                const result = await getStores()
                if (result.success && result.stores) {
                    setStores(result.stores)
                }
            }
        }
        fetchStores()
    }, [setStores, stores.length])

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
