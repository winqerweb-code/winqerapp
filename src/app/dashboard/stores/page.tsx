"use client"

import { useState, useEffect } from "react"
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
import { Plus, MapPin, Phone, ExternalLink } from "lucide-react"
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
    const { stores, setStores, setSelectedStore } = useStore()
    const [open, setOpen] = useState(false)
    const [newStoreName, setNewStoreName] = useState("")
    const [newStoreAddress, setNewStoreAddress] = useState("")
    const [newStorePhone, setNewStorePhone] = useState("")
    const [isAdmin, setIsAdmin] = useState(false)
    const { toast } = useToast()

    // Fetch stores on mount to ensure context is populated
    useEffect(() => {
        const fetchStores = async () => {
            const result = await getStores()
            if (result.success && result.stores) {
                setStores(result.stores)
            }
        }

        const checkAdmin = async () => {
            const res = await checkAdminStatusAction()
            setIsAdmin(res.isAdmin)
        }

        fetchStores()
        checkAdmin()
    }, [setStores])

    const handleAddStore = async () => {
        // ... (existing logic)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">店舗ハブ (Store Hub)</h2>
                    <p className="text-muted-foreground">
                        各店舗のマーケティングデータ（Meta, GA4, GBP）を一元管理します。
                    </p>
                </div>
                {isAdmin && (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                店舗を追加
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            {/* ... dialog content ... */}
                            <DialogHeader>
                                <DialogTitle>新しい店舗を追加</DialogTitle>
                                <DialogDescription>
                                    店舗の基本情報を入力してください。
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="store-name">店舗名</Label>
                                    <Input
                                        id="store-name"
                                        placeholder="例: WINQER 池袋店"
                                        value={newStoreName}
                                        onChange={(e) => setNewStoreName(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="store-address">住所</Label>
                                    <Input
                                        id="store-address"
                                        placeholder="例: 東京都豊島区南池袋1-1-1"
                                        value={newStoreAddress}
                                        onChange={(e) => setNewStoreAddress(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="store-phone">電話番号</Label>
                                    <Input
                                        id="store-phone"
                                        placeholder="例: 03-1111-2222"
                                        value={newStorePhone}
                                        onChange={(e) => setNewStorePhone(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setOpen(false)}>
                                    キャンセル
                                </Button>
                                <Button onClick={handleAddStore}>
                                    追加
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">登録店舗数</CardTitle>
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
                    <CardTitle>店舗一覧</CardTitle>
                    <CardDescription>
                        管理中の店舗と連携ステータス
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>店舗名</TableHead>
                                <TableHead>住所 / 電話番号</TableHead>
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
                                            <span>{store.address}</span>
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> {store.phone}
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
