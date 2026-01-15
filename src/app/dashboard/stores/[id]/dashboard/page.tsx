"use client"

import { getStore } from "@/app/actions/store"
import { getStoreChartData } from "@/app/actions/store-chart-data"
import { supabase } from "@/lib/auth"
import { Store } from "@/types/store"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MOCK_STORES } from "@/lib/mock-data"
import { TrendingUp, BarChart3, PieChart, ArrowLeft, Download } from "lucide-react"
import { KpiMoMCards } from "@/components/charts/KpiMoMCards"
import { SpendTrend } from "@/components/charts/SpendTrend"
import { FunnelChart } from "@/components/charts/FunnelChart"
import { KpiTrend } from "@/components/charts/KpiTrend"
import { DailySpend } from "@/components/charts/DailySpend"
import { CreativeComparison } from "@/components/charts/CreativeComparison"
import { RegionComparison } from "@/components/charts/RegionComparison"
import { DemographicsCharts } from "@/components/charts/DemographicsCharts"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { DateRange } from "react-day-picker"
import { addDays } from "date-fns"

// Mock Data for Visualization
const MOCK_KPI_MOM = [
    { label: "CTR", current: 2.18, previous: 1.74, unit: "%", format: (v: number) => `${v.toFixed(2)}%` },
    { label: "CPC", current: 145, previous: 162, unit: "円", inverse: true },
    { label: "CVR", current: 3.5, previous: 2.8, unit: "%", format: (v: number) => `${v.toFixed(1)}%` },
    { label: "CPA", current: 4200, previous: 5500, unit: "円", inverse: true },
]

const MOCK_SPEND_TREND = [
    { month: "2024-01", spend: 150000, cv: 35, cpa: 4285 },
    { month: "2024-02", spend: 180000, cv: 42, cpa: 4285 },
    { month: "2024-03", spend: 200000, cv: 55, cpa: 3636 },
    { month: "2024-04", spend: 220000, cv: 68, cpa: 3235 },
    { month: "2024-05", spend: 250000, cv: 85, cpa: 2941 },
    { month: "2024-06", spend: 300000, cv: 110, cpa: 2727 },
]

const MOCK_FUNNEL = [
    { label: "Impressions", value: 150000, fill: "#8884d8" },
    { label: "Clicks", value: 4500, fill: "#83a6ed" },
    { label: "Sessions", value: 3800, fill: "#8dd1e1" },
    { label: "CV", value: 110, fill: "#82ca9d" },
]

const MOCK_DAILY_SPEND = Array.from({ length: 14 }, (_, i) => ({
    date: `2024-06-${i + 1}`,
    spend: Math.floor(Math.random() * 5000) + 10000
}))

const MOCK_KPI_TREND_CTR = Array.from({ length: 14 }, (_, i) => ({
    date: `2024-06-${i + 1}`,
    value: 1.5 + Math.random()
}))

const MOCK_KPI_TREND_CPC = Array.from({ length: 14 }, (_, i) => ({
    date: `2024-06-${i + 1}`,
    value: 120 + Math.random() * 50
}))

const MOCK_KPI_TREND_CVR = Array.from({ length: 14 }, (_, i) => ({
    date: `2024-06-${i + 1}`,
    value: 2.0 + Math.random() * 2
}))

const MOCK_CREATIVES = [
    { name: "Creative A", ctr: 2.5, cvr: 3.2, cpa: 3500 },
    { name: "Creative B", ctr: 1.8, cvr: 2.5, cpa: 4200 },
    { name: "Creative C", ctr: 3.1, cvr: 4.0, cpa: 2800 },
    { name: "Creative D", ctr: 2.0, cvr: 1.5, cpa: 5500 },
    { name: "Creative E", ctr: 1.5, cvr: 1.2, cpa: 6000 },
]

const MOCK_REGIONS = [
    { region: "Tokyo", cvr: 3.5, cpc: 150 },
    { region: "Osaka", cvr: 3.2, cpc: 140 },
    { region: "Fukuoka", cvr: 2.8, cpc: 130 },
    { region: "Nagoya", cvr: 2.5, cpc: 135 },
    { region: "Sapporo", cvr: 2.2, cpc: 120 },
]

export default function StoreDashboardPage() {
    const params = useParams()
    const [store, setStore] = useState<Store | null>(null)
    const [loading, setLoading] = useState(true)
    const [chartData, setChartData] = useState<any>(null)

    // Default to current month
    const today = new Date()
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(today.getFullYear(), today.getMonth(), 1),
        to: today,
    })

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                // 1. Get Store Info (Real Data)
                const storeId = Array.isArray(params.id) ? params.id[0] : params.id
                let currentStore: Store | null = null

                // MOCK / DEMO MODE CHECK
                if (storeId === 'demo-store') {
                    // Set a dummy store compatible with our Mock Data in lib/mock-data.ts
                    currentStore = {
                        id: 'demo-store',
                        name: 'デモ店舗 (Test Mode)',
                        created_at: new Date().toISOString(),
                        user_id: 'demo-user',
                        // triggers Meta Mock Logic in getStoreChartData (if campaign matches cam_111)
                        meta_campaign_ids: ['cam_111'],
                        // triggers GA4 Mock Logic (matches entry in MOCK_GA4_REPORT)
                        ga4_property_id: 'properties/demo-ga4',
                        cv_event_name: '予約'
                    } as Store
                    setStore(currentStore)
                } else {
                    const result = await getStore(storeId)

                    if (result.success && result.store) {
                        setStore(result.store)
                        currentStore = result.store
                    } else {
                        // Fallback to mock if not found
                        const foundStore = MOCK_STORES.find((s) => s.id === storeId)
                        if (foundStore) {
                            // Cast mock store to Store type ensuring required fields
                            currentStore = foundStore as unknown as Store
                            setStore(currentStore)
                        } else {
                            // Only set Unknown if we really tried everything
                            // But for demo purposes, we might want to just show mocks
                            setStore({ name: "Unknown Store", id: storeId } as Store)
                        }
                    }
                }

                // 2. Get Chart Data
                if (currentStore) {
                    const { data: { session } } = await supabase.auth.getSession()
                    const googleToken = session?.provider_token
                    const metaToken = localStorage.getItem('meta_access_token')

                    const campaignId = currentStore.meta_campaign_id || currentStore.meta_campaign_ids?.[0] || 'none'

                    // Use Server Action (even for Demo Store)
                    // The server action handles mock logic internally when tokens/properties match mock patterns
                    const chartResult = await getStoreChartData(
                        currentStore.id,
                        campaignId,
                        currentStore.ga4_property_id || '',
                        googleToken || undefined,
                        metaToken || undefined,
                        currentStore.cv_event_name || '',
                        currentStore.meta_ad_account_id,
                        dateRange && dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined
                    )

                    if (chartResult.success && chartResult.data) {
                        setChartData(chartResult.data)
                    }
                }

            } catch (error) {
                console.error("Failed to load store or charts", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [params.id, dateRange]) // Re-fetch when dateRange changes

    if (!store) return <div className="p-8">Loading...</div>

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{store.name} ダッシュボード</h2>
                    <p className="text-muted-foreground">
                        店舗の広告パフォーマンス分析ダッシュボード
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                    <Button variant="outline" size="icon" onClick={() => window.print()} title="レポートをダウンロード">
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                {/* 1. KPI Cards (MoM) */}
                <KpiMoMCards data={chartData?.kpiMoM || MOCK_KPI_MOM} />

                {/* 2. Spend Trend */}
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4">
                    <SpendTrend data={chartData?.spendTrend || MOCK_SPEND_TREND} />
                </div>

                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4">
                    {/* 3. Funnel Chart */}
                    <FunnelChart data={chartData?.funnel || MOCK_FUNNEL} />

                    {/* 4. KPI Trends (3 small charts) */}
                    <div className="col-span-4 lg:col-span-2 grid gap-4">
                        <KpiTrend title="CTR (クリック率)" data={chartData?.kpiTrend || MOCK_KPI_TREND_CTR} dataKey="ctr" color="#8884d8" unit="%" height={160} />
                        <KpiTrend title="CPC (クリック単価)" data={chartData?.kpiTrend || MOCK_KPI_TREND_CPC} dataKey="cpc" color="#82ca9d" unit="円" height={160} />
                        <KpiTrend title="CVR (コンバージョン率)" data={chartData?.kpiTrend || MOCK_KPI_TREND_CVR} dataKey="cvr" color="#ffc658" unit="%" height={160} />
                    </div>
                </div>

                {/* 5. Daily Spend */}
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4">
                    <DailySpend data={chartData?.dailySpend || MOCK_DAILY_SPEND} />
                </div>

                {/* 6 & 7. Creative & Region Comparison */}
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4">
                    <CreativeComparison data={chartData?.creativeRanking || MOCK_CREATIVES} />
                    {(chartData?.regionPerformance || MOCK_REGIONS) && (chartData?.regionPerformance || MOCK_REGIONS).length > 0 && (
                        <RegionComparison data={chartData?.regionPerformance || MOCK_REGIONS} />
                    )}
                </div>

                {/* 7. Demographics */}
                <DemographicsCharts data={chartData?.demographics} />
                <div className="text-xs text-gray-300 text-center mt-8">v1.1.0 (Detailed Report Update)</div>
            </div>
        </div>
    )
}
