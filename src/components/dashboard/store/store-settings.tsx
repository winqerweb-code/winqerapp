import { MapPin, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Store } from "@/types/store"

interface StoreSettingsProps {
    store: Store
    name: string
    setName: (value: string) => void
    address: string
    setAddress: (value: string) => void
    phone: string
    setPhone: (value: string) => void
    targetAudience: string
    setTargetAudience: (value: string) => void
    initialBudget: string
    setInitialBudget: (value: string) => void
    industry: string
    setIndustry: (value: string) => void
    onSave: () => void
    loading: boolean
}

export function StoreSettings({
    store,
    name,
    setName,
    address,
    setAddress,
    phone,
    setPhone,
    targetAudience,
    setTargetAudience,
    initialBudget,
    setInitialBudget,
    industry,
    setIndustry,
    onSave,
    loading,
}: StoreSettingsProps) {
    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    基本情報
                </CardTitle>
                <p className="text-sm text-muted-foreground">店舗の基本情報を編集します。</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">店舗名</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">住所</Label>
                    <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">電話番号</Label>
                    <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="industry">業種</Label>
                    <Input
                        id="industry"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="例: 美容室、飲食店"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="targetAudience">ターゲット層</Label>
                        <Input
                            id="targetAudience"
                            placeholder="例: 30代女性、会社員"
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="initialBudget">初期予算 (円)</Label>
                        <Input
                            id="initialBudget"
                            type="number"
                            placeholder="例: 50000"
                            value={initialBudget}
                            onChange={(e) => setInitialBudget(e.target.value)}
                        />
                    </div>
                </div>
                <div className="pt-4">
                    <Button onClick={onSave} disabled={loading} className="w-full">
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? '保存中...' : '保存'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
