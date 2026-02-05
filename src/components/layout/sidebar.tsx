"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, BarChart3, Settings, FileText, LogOut, Store } from "lucide-react"
import { signOut } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { Button } from "@/components/ui/button"

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
        title: "設定",
        href: "/dashboard/settings",
        icon: Settings,
    },
]

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

// ... (sidebarItems remains same)

function SidebarContent({ isAdmin, onLinkClick }: { isAdmin?: boolean, onLinkClick?: () => void }) {
    const pathname = usePathname()
    const router = useRouter()
    const { toast } = useToast()

    const handleLogout = async () => {
        try {
            await signOut()
            router.push("/login")
            router.refresh()
        } catch (error) {
            console.error("Logout error:", error)
            toast({
                title: "ログアウトに失敗しました",
                description: "もう一度お試しください。",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="flex h-full flex-col text-card-foreground">
            <div className="flex h-16 items-center border-b px-6">
                <div className="relative h-10 w-10">
                    <Image
                        src="/images/logo.png"
                        alt="WINQER"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="grid gap-1 px-2">
                    {sidebarItems
                        .filter(item => {
                            // If user is admin, show everything
                            if (isAdmin) return true
                            // If user is NOT admin, only show Stores ("店舗ハブ")
                            return item.href === "/dashboard/stores"
                        })
                        .map((item, index) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    onClick={onLinkClick}
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
                    {isAdmin && (
                        <Link
                            href="/admin"
                            onClick={onLinkClick}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                pathname === "/admin" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                            )}
                        >
                            <Settings className="h-4 w-4" />
                            管理画面
                        </Link>
                    )}
                </nav>
            </div>
            <div className="border-t p-4">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                    <LogOut className="h-4 w-4" />
                    ログアウト
                </button>
            </div>
        </div>
    )
}

export function Sidebar({ isAdmin }: { isAdmin?: boolean }) {
    return (
        <div className="hidden border-r bg-background/60 backdrop-blur-xl md:flex md:w-64 md:flex-col">
            <SidebarContent isAdmin={isAdmin} />
        </div>
    )
}

export function MobileSidebar({ isAdmin }: { isAdmin?: boolean }) {
    const [open, setOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-background w-72">
                <SidebarContent isAdmin={isAdmin} onLinkClick={() => setOpen(false)} />
            </SheetContent>
        </Sheet>
    )
}
