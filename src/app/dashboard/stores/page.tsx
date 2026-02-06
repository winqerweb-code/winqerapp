"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MOCK_STORES } from "@/lib/mock-data"
import { useStore } from "@/contexts/store-context"
import { getStores } from "@/app/actions/store"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, MapPin, Phone, ExternalLink, Loader2 } from "lucide-react"
import Link from "next/link"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { checkAdminStatusAction } from "@/app/actions/provider-actions"

export default function StoresPage() {
    const router = useRouter()
    const { stores, setStores, setSelectedStore } = useStore()
    const [isAdmin, setIsAdmin] = useState(false)
    const [initializing, setInitializing] = useState(true)
    const { toast } = useToast()

    // Fetch stores on mount to ensure context is populated
    useEffect(() => {
        const init = async () => {
            try {
                const [storesResult, adminResult] = await Promise.all([
                    getStores(),
                    checkAdminStatusAction()
                ])

                const isProvider = adminResult.isAdmin
                setIsAdmin(isProvider)

                if (storesResult.success && storesResult.stores) {
                    setStores(storesResult.stores)

                    // Auto-Redirect Rule:
                    // If user is NOT a Provider Admin (regular user)
                    // AND they have exactly one store assigned
                    // THEN redirect immediately to that store's dashboard.
                    if (!isProvider && storesResult.stores.length === 1) {
                        router.push(`/dashboard/stores/${storesResult.stores[0].id}`)
                        return
                    }
                }
            } catch (error) {
                console.error("Initialization failed:", error)
            } finally {
                setInitializing(false)
            }
        }

        init()
    }, [setStores, router])

    if (initializing) {
        return (
            <div className="flex h-[200px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (stores.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                <Button size="lg" asChild>
                    <Link href="/dashboard/stores/new">
                        <Plus className="mr-2 h-4 w-4" />
                        事業を登録する
                    </Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">事業ハブ (Business Hub)</h2>
                    <p className="text-muted-foreground">
                        各事業のマーケティングデータ（Meta, GA4, GBP）を一元管理します。
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/stores/new">
                        <Plus className="mr-2 h-4 w-4" />
                        事業を追加
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">登録事業数</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stores.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">連携済み (Meta)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stores.filter(s => s.meta_campaign_id || s.meta_campaign_ids.length > 0).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">連携済み (Google)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stores.filter(s => s.ga4_property_id || s.gbp_location_id).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>事業一覧</CardTitle>
                    <CardDescription>
                        管理中の事業と連携ステータス
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>事業名</TableHead>
                                <TableHead>業種 / 電話番号</TableHead>
                                <TableHead>Meta連携</TableHead>
                                <TableHead>Google連携</TableHead>
                                <TableHead className="text-right">アクション</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stores.map((store) => (
                                <TableRow key={store.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            {store.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span>{store.industry || '-'}</span>
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> {store.phone || '-'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {store.meta_campaign_id || store.meta_campaign_ids.length > 0 ? (
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                連携済み
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">未連携</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {store.ga4_property_id ? (
                                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                                    GA4
                                                </Badge>
                                            ) : null}
                                            {store.gbp_location_id ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    GBP
                                                </Badge>
                                            ) : null}
                                            {!store.ga4_property_id && !store.gbp_location_id && (
                                                <Badge variant="secondary">未連携</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/dashboard/stores/${store.id}`}>
                                                詳細 <ExternalLink className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
