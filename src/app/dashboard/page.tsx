"use client"

import Link from "next/link"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, Users, CreditCard, Activity, Store as StoreIcon } from "lucide-react"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getStores } from "@/app/actions/store"
import { getStoreMetrics } from "@/app/actions/store-metrics"
import { Store } from "@/types/store"
import { addDays } from "date-fns"
import { DateRange } from "react-day-picker"

import { AIAnalysis } from "@/components/dashboard/store/ai-analysis"
import { analyzeStore } from "@/app/actions/analyze-store"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/auth"
import { useStore } from "@/contexts/store-context"

export default function DashboardPage() {
    const { toast } = useToast()
    const { selectedStore, setSelectedStore, stores, setStores } = useStore()
    const [metrics, setMetrics] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
    })

    // AI Analysis State
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisResult, setAnalysisResult] = useState<string | null>(null)
    const [analysisMetrics, setAnalysisMetrics] = useState<any>(null)

    // Analysis Inputs
    const [industry, setIndustry] = useState("")
    const [region, setRegion] = useState("")
    const [adFormat, setAdFormat] = useState("")
    const [adObjective, setAdObjective] = useState("")
    const [targetAudience, setTargetAudience] = useState("")
    const [cvLabel, setCvLabel] = useState("")
    const [ga4CvEvent, setGa4CvEvent] = useState("")
    const [remarks, setRemarks] = useState("")

    // Fetch Stores on Mount
    useEffect(() => {
        const fetchStores = async () => {
            const result = await getStores()
            console.log('🏪 [Dashboard] fetchStores result:', result)
            if (result.success && result.stores) {
                setStores(result.stores)
                if (result.stores.length > 0 && !selectedStore) {
                    const firstStore = result.stores[0]
                    setSelectedStore(firstStore)
                    setIndustry(firstStore.industry || "")
                    setRegion(firstStore.address || "")
                    setTargetAudience(firstStore.target_audience || "")
                    setCvLabel(firstStore.cv_event_name || "")
                    setGa4CvEvent(firstStore.cv_event_name || "") // Default to same as label if not distinct
                }
            }
        }
        fetchStores()
    }, [])

    // Fetch Metrics when Store or Date Range Changes
    useEffect(() => {
        const fetchMetrics = async () => {
            if (!selectedStore) return
            setMetrics(null) // Reset metrics to show loading state
            setLoading(true)
            try {
                const store = selectedStore

                // Get tokens
                const { data: { session } } = await supabase.auth.getSession()
                const googleToken = session?.provider_token
                const metaToken = localStorage.getItem('meta_access_token')

                console.log('📊 [Dashboard] Fetching metrics for:', store.name, {
                    ga4: store.ga4_property_id,
                    cv: store.cv_event_name,
                    meta: store.meta_campaign_id,
                    hasGoogleToken: !!googleToken
                })

                const result = await getStoreMetrics(
                    store.meta_campaign_id || 'none',
                    store.ga4_property_id || '',
                    googleToken || undefined,
                    store.meta_access_token || metaToken || undefined, // Use DB token first, then localStorage fallback
                    store.cv_event_name || '',
                    store.meta_ad_account_id, // Pass the saved Ad Account ID
                    store.google_refresh_token, // Pass Refresh Token for GA4
                    dateRange && dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined
                )

                console.log('📊 [Dashboard] Metrics result:', result)

                if (result.success) {
                    setMetrics(result.metrics)
                } else {
                    toast({
                        title: "データ取得エラー",
                        description: `データの取得に失敗しました: ${result.error}`,
                        variant: "destructive"
                    })
                }
            } catch (error: any) {
                console.error("Failed to fetch metrics", error)
                toast({
                    title: "エラー",
                    description: "予期せぬエラーが発生しました",
                    variant: "destructive"
                })
            } finally {
                setLoading(false)
            }
        }

        fetchMetrics()
    }, [selectedStore, dateRange])

    // Update Analysis Inputs when Store Changes
    useEffect(() => {
        if (selectedStore) {
            const store = selectedStore
            console.log('📝 [Dashboard] Setting Inputs:', { industry: store.industry, region: store.address })
            setIndustry(store.industry || "")
            setRegion(store.address || "")
            setTargetAudience(store.target_audience || "")
            setCvLabel(store.cv_event_name || "")
            setGa4CvEvent(store.cv_event_name || "")
        }
    }, [selectedStore])

    const handleAnalyze = async () => {
        if (!selectedStore) return

        const openaiApiKey = localStorage.getItem('openai_api_key')
        if (!openaiApiKey) {
            toast({
                title: "APIキーが設定されていません",
                description: "設定ページでOpenAI APIキーを保存してください。",
                variant: "destructive",
            })
            return
        }

        setIsAnalyzing(true)
        try {
            const store = selectedStore
            if (!store) return

            const { data: { session } } = await supabase.auth.getSession()
            const googleToken = session?.provider_token
            const metaToken = localStorage.getItem('meta_access_token')

            const result = await analyzeStore(
                store.name,
                store.meta_campaign_id || 'none',
                store.ga4_property_id || '',
                googleToken || undefined,
                metaToken || undefined,
                store.meta_ad_account_id, // Pass Ad Account ID
                openaiApiKey, // Pass OpenAI Key
                remarks, // Pass remarks
                {
                    industry,
                    region,
                    adFormat,
                    adObjective,
                    targetAudience,
                    cvLabel,
                    ga4CvEvent
                },
                store.id // Pass Store ID for Refresh Token Lookup
            )

            if (result.success) {
                setAnalysisResult(result.analysis || "")
                setAnalysisMetrics(result.metrics)
                toast({
                    title: "分析完了",
                    description: "AI分析が完了しました。",
                })
            } else {
                throw new Error(result.error)
            }
        } catch (error) {
            toast({
                title: "エラー",
                description: "分析に失敗しました。",
                variant: "destructive",
            })
        } finally {
            setIsAnalyzing(false)
        }
    }



    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                    <Select
                        value={selectedStore?.id || ""}
                        onValueChange={(value) => {
                            const store = stores.find(s => s.id === value)
                            setSelectedStore(store || null)
                        }}
                    >
                        <SelectTrigger className="w-[200px] bg-card">
                            <StoreIcon className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="店舗を選択" />
                        </SelectTrigger>
                        <SelectContent>
                            {stores.map((store) => (
                                <SelectItem key={store.id} value={store.id}>
                                    {store.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                    <Button variant="outline" asChild disabled={!selectedStore}>
                        <Link href={selectedStore ? `/dashboard/stores/${selectedStore.id}/dashboard` : "#"}>
                            詳細レポート
                        </Link>
                    </Button>
                    <Button>Download Report</Button>
                </div>
            </div>

            {loading ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 w-32 bg-gray-200 rounded"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : metrics ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">¥{metrics.spend.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                期間中の広告消化金額
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.impressions.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                広告が表示された回数
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.clicks.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                CTR: {metrics.ctr}%
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.cvCount}</div>
                            <p className="text-xs text-muted-foreground">
                                CPA: ¥{metrics.cpa.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="text-center py-10 text-muted-foreground">
                    店舗を選択してデータを表示してください。
                </div>
            )}

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                <div className="col-span-1 lg:col-span-4">
                    <AIAnalysis
                        analysisResult={analysisResult}
                        analysisMetrics={analysisMetrics}
                        isAnalyzing={isAnalyzing}
                        onAnalyze={handleAnalyze}
                        industry={industry}
                        setIndustry={setIndustry}
                        region={region}
                        setRegion={setRegion}
                        adFormat={adFormat}
                        setAdFormat={setAdFormat}
                        adObjective={adObjective}
                        setAdObjective={setAdObjective}
                        targetAudience={targetAudience}
                        setTargetAudience={setTargetAudience}
                        cvLabel={cvLabel}
                        setCvLabel={setCvLabel}
                        ga4CvEvent={ga4CvEvent}
                        setGa4CvEvent={setGa4CvEvent}
                        remarks={remarks}
                        setRemarks={setRemarks}
                    />
                </div>
                <Card className="col-span-1 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">System Update</p>
                                    <p className="text-sm text-muted-foreground">
                                        Dashboard updated successfully.
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">Just now</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
