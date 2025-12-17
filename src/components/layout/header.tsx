"use client"

import { useStore } from "@/contexts/store-context"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Store } from "lucide-react"

export function Header() {
    const { selectedStore, setSelectedStore, stores } = useStore()

    return (
        <header className="flex h-16 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center gap-4">
                <Select
                    value={selectedStore?.id || ""}
                    onValueChange={(value) => {
                        const store = stores.find((s) => s.id === value)
                        setSelectedStore(store || null)
                    }}
                >
                    <SelectTrigger className="w-[200px] font-semibold text-lg border-none shadow-none focus:ring-0 px-0 hover:bg-accent/50 rounded-md transition-colors">
                        <div className="flex items-center gap-2">
                            <Store className="h-5 w-5 text-muted-foreground" />
                            <SelectValue placeholder="店舗を選択" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {stores.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                                店舗がありません
                            </div>
                        ) : (
                            stores.map((store) => (
                                <SelectItem key={store.id} value={store.id}>
                                    {store.name}
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-muted" />
            </div>
        </header>
    )
}
