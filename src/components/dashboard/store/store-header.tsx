import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface StoreHeaderProps {
    name: string
    storeId: string
    isAdmin: boolean
}

export function StoreHeader({ name, storeId, isAdmin }: StoreHeaderProps) {
    return (
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard/stores">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{name}</h2>
                <p className="text-muted-foreground">店舗詳細と連携設定</p>
            </div>
            {isAdmin && (
                <div className="ml-auto">
                    <Button variant="outline" asChild>
                        <Link href={`/dashboard/stores/${storeId}/dashboard`}>
                            📊 レポート
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
