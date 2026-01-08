import { BarChart3, Globe } from "lucide-react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GoogleConnectButton } from "@/components/google-connect-button"
import { supabase } from "@/lib/auth"

interface IntegrationsProps {
    metaCampaignId: string
    setMetaCampaignId: (value: string) => void
    campaigns: any[]
    ga4PropertyId: string
    setGa4PropertyId: (value: string) => void
    gbpLocationId: string
    setGbpLocationId: (value: string) => void
    cvEventName: string
    setCvEventName: (value: string) => void
    onSave: () => void
    loading: boolean
}

export function Integrations({
    metaCampaignId,
    setMetaCampaignId,
    campaigns,
    ga4PropertyId,
    setGa4PropertyId,
    gbpLocationId,
    setGbpLocationId,
    cvEventName,
    setCvEventName,
    onSave,
    loading,
}: IntegrationsProps) {
    const [isGoogleConnected, setIsGoogleConnected] = useState(false)
    const [gbpLocations, setGbpLocations] = useState<any[]>([])
    const [ga4Properties, setGa4Properties] = useState<any[]>([])

    // Google Auth & Data Fetching Logic
    useEffect(() => {
        const initGoogleIntegration = async () => {
            console.log('🔍 [Integrations] Starting Google auth check...')
            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (session?.user) {
                    setIsGoogleConnected(true)

                    const accessToken = session.provider_token
                    if (accessToken) {
                        console.log('📍 [Integrations] Fetching Google data...')
                        const { GoogleApiClient } = await import('@/lib/google-api')
                        const googleClient = new GoogleApiClient(accessToken)

                        try {
                            const locations = await googleClient.getLocations()
                            console.log('✅ [Integrations] Locations:', locations.length)
                            setGbpLocations(locations)
                        } catch (e) {
                            console.warn('⚠️ [Integrations] Failed to fetch locations (API might be disabled):', e)
                            setGbpLocations([])
                            // Do not block execution, user might only want GA4
                        }

                        try {
                            const properties = await googleClient.getGa4Properties()
                            console.log('✅ [Integrations] Properties:', properties.length)
                            setGa4Properties(properties)
                        } catch (e) {
                            console.error('❌ [Integrations] Failed to fetch properties:', e)
                            setGa4Properties([])
                        }
                    } else {
                        console.warn('⚠️ [Integrations] No provider token, using mock data')
                        const { googleApi } = await import('@/lib/google-api')
                        setGbpLocations(await googleApi.getLocations())
                        setGa4Properties(await googleApi.getGa4Properties())
                    }
                } else {
                    setIsGoogleConnected(false)
                    setGbpLocations([])
                    setGa4Properties([])
                }
            } catch (error) {
                console.error('❌ [Integrations] Auth check error:', error)
            }
        }

        initGoogleIntegration()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                setIsGoogleConnected(true)
                initGoogleIntegration()
            } else {
                setIsGoogleConnected(false)
                setGbpLocations([])
                setGa4Properties([])
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" /> プラットフォーム連携
                </CardTitle>
                <CardDescription>各プラットフォームのIDを紐付けます。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Meta Ads */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-600" /> Meta広告キャンペーン
                    </Label>
                    <Select value={metaCampaignId} onValueChange={setMetaCampaignId}>
                        <SelectTrigger className="bg-card">
                            <SelectValue placeholder="未連携" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">未連携</SelectItem>
                            {campaigns.map((c: any) => (
                                <SelectItem key={c.id} value={c.id}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        この店舗の集客に使用しているメインのキャンペーンを選択してください。
                    </p>
                </div>

                {/* Google Integration */}
                <div className="space-y-4 pt-4 border-t">
                    <Label className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-green-600" /> Google連携 (GA4 / GBP)
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                        Googleアカウントを連携すると、GA4プロパティとGBPロケーションを選択できるようになります。
                    </p>

                    <GoogleConnectButton />

                    {/* GBP Location */}
                    <div className="space-y-2 mt-4">
                        <Label>Google Business Profile (GBP)</Label>
                        <Select value={gbpLocationId} onValueChange={setGbpLocationId} disabled={!isGoogleConnected}>
                            <SelectTrigger className="bg-card [&>span]:truncate [&>span]:min-w-0">
                                <SelectValue placeholder={isGoogleConnected ? "ロケーションを選択" : "Google連携が必要です"} />
                            </SelectTrigger>
                            <SelectContent>
                                {gbpLocations.map((loc: any) => (
                                    <SelectItem key={loc.name} value={loc.name}>
                                        <span className="block truncate max-w-[280px]">{loc.title}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {gbpLocationId && <p className="text-[10px] text-muted-foreground">選択中: {gbpLocationId}</p>}
                    </div>

                    {/* GA4 Property */}
                    <div className="space-y-2">
                        <Label>Google Analytics 4 (GA4)</Label>
                        <Select
                            value={ga4PropertyId}
                            onValueChange={setGa4PropertyId}
                            disabled={!isGoogleConnected}
                        >
                            <SelectTrigger className="bg-card [&>span]:truncate [&>span]:min-w-0">
                                <SelectValue placeholder={isGoogleConnected ? "プロパティを選択" : "Google連携が必要です"} />
                            </SelectTrigger>
                            <SelectContent>
                                {ga4Properties.map((prop: any) => (
                                    <SelectItem key={prop.name} value={prop.name}>
                                        <span className="block truncate max-w-[280px]">{prop.displayName}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {ga4PropertyId && <p className="text-[10px] text-muted-foreground">選択中: {ga4PropertyId}</p>}
                    </div>

                    {/* CV Event Name */}
                    <div className="space-y-2 pt-2">
                        <Label>CVイベント名 (GA4)</Label>
                        <Input
                            value={cvEventName}
                            onChange={(e) => setCvEventName(e.target.value)}
                            placeholder="例: generate_lead"
                            className="bg-card"
                        />
                        <p className="text-xs text-muted-foreground">
                            コンバージョンとして計測するGA4のイベント名を入力してください。
                        </p>
                    </div>

                    {/* Save Button */}
                    <div className="pt-4">
                        <Button onClick={onSave} disabled={loading} className="w-full" variant="outline">
                            {loading ? '保存中...' : '連携設定を保存'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
