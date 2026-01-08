"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useStore } from "@/contexts/store-context"
import { getStores } from "@/app/actions/store"
import { checkAdminStatusAction } from "@/app/actions/provider-actions"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { setStores, stores } = useStore()
    const [isAdmin, setIsAdmin] = useState(false)

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

        const checkAdmin = async () => {
            const res = await checkAdminStatusAction()
            setIsAdmin(res.isAdmin)
        }

        fetchStores()
        checkAdmin()
    }, [setStores, stores.length])

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar isAdmin={isAdmin} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header isAdmin={isAdmin} />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
