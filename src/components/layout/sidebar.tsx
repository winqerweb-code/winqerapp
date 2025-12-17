"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, BarChart3, Settings, FileText, LogOut, Store } from "lucide-react"

const sidebarItems = [
    {
        title: "ダッシュボード",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "店舗ハブ",
        href: "/dashboard/stores",
        icon: Store,
    },
    {
        title: "戦略",
        href: "/dashboard/strategy",
        icon: BarChart3,
    },
    {
        title: "設定",
        href: "/dashboard/settings",
        icon: Settings,
    },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full w-64 flex-col border-r bg-card text-card-foreground">
            <div className="flex h-16 items-center border-b px-6">
                <span className="text-xl font-bold tracking-tight text-primary">WINQER</span>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="grid gap-1 px-2">
                    {sidebarItems.map((item, index) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="border-t p-4">
                <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                    <LogOut className="h-4 w-4" />
                    Log out
                </button>
            </div>
        </div>
    )
}
