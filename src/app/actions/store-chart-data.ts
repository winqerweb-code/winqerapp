'use server'

import { MOCK_ADS } from '@/lib/mock-data'
import { metaApiServer } from '@/lib/meta-api'
import { googleApi } from '@/lib/google-api'
import { getMetaToken } from '@/app/actions/user-settings'

// Helper to format date in JST (YYYY-MM-DD)
function formatJST(date: Date): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date)
}

export async function getStoreChartData(
    storeId: string,
    metaCampaignId: string,
    ga4PropertyId: string,
    accessToken?: string,
    metaAccessToken?: string,
    cvEventName: string = 'フッター予約リンク',
    adAccountId?: string,
    dateRange?: { from: Date, to: Date }
) {
    // 1. Determine Date Ranges
    const today = new Date()
    const currentFrom = dateRange?.from || new Date(today.getFullYear(), today.getMonth(), 1)
    const currentTo = dateRange?.to || today

    // Previous Period (Month over Month)
    const prevFrom = new Date(currentFrom)
    prevFrom.setMonth(prevFrom.getMonth() - 1)
    const prevTo = new Date(currentTo)
    prevTo.setMonth(prevTo.getMonth() - 1)

    const dateParams = {
        startDate: formatJST(currentFrom),
        endDate: formatJST(currentTo)
    }
    const prevDateParams = {
        startDate: formatJST(prevFrom),
        endDate: formatJST(prevTo)
    }

    // 2. Get Tokens
    let effectiveMetaToken = metaAccessToken
    if (!effectiveMetaToken) {
        const result = await getMetaToken()
        if (result.success && result.token) {
            effectiveMetaToken = result.token
        }
    }

    // 3. Fetch Data
    let dailyMeta: any[] = []
    let regionMeta: any[] = []
    let adsMeta: any[] = []
    let dailyGa4: any[] = []
    let prevDailyMeta: any[] = []
    let prevDailyGa4: any[] = []
    let ga4Report = { sessions: 0 }

    try {
        if (effectiveMetaToken) {
            // Determine Ad Account
            let targetAccountId = adAccountId
            if (!targetAccountId) {
                const accounts = await metaApiServer.getAdAccounts(effectiveMetaToken)
                if (accounts && accounts.length > 0) {
                    targetAccountId = accounts[0].id
                }
            }

            if (targetAccountId) {
                // Fetch Current Period Data
                const [daily, region, ads] = await Promise.all([
                    metaApiServer.getDailyAdsInsights(effectiveMetaToken, targetAccountId, dateParams, metaCampaignId),
                    metaApiServer.getRegionInsights(effectiveMetaToken, targetAccountId, dateParams, metaCampaignId),
                    metaApiServer.getAds(effectiveMetaToken, targetAccountId)
                ])
                dailyMeta = daily
                regionMeta = region

                // Filter ads by campaign if needed
                if (metaCampaignId && metaCampaignId !== 'none') {
                    adsMeta = ads.filter((ad: any) => ad.campaign_id === metaCampaignId)
                } else {
                    adsMeta = ads
                }

                // Fetch Previous Period Data (for MoM)
                prevDailyMeta = await metaApiServer.getDailyAdsInsights(effectiveMetaToken, targetAccountId, prevDateParams, metaCampaignId)
            }
        } else {
            // Mock Data Fallback
            console.log("No Meta Token, using mock data. Campaign ID:", metaCampaignId)
        }

        // If dailyMeta is still empty (either no token or fetch failed/empty) AND it's a mock campaign, force mock data
        if (dailyMeta.length === 0 && (metaCampaignId === 'cam_111' || metaCampaignId === 'cam_222')) {
            console.log("Forcing Mock Data for Demo Campaign:", metaCampaignId)
            const campaignAds = MOCK_ADS.filter(ad => ad.campaign_id === metaCampaignId)
            adsMeta = campaignAds

            // Generate Mock Daily Data based on ads
            const totalSpend = campaignAds.reduce((sum, ad) => sum + ad.insights.spend, 0)
            const totalClicks = campaignAds.reduce((sum, ad) => sum + ad.insights.clicks, 0)
            const totalImpressions = campaignAds.reduce((sum, ad) => sum + ad.insights.impressions, 0)
            const totalConversions = campaignAds.reduce((sum, ad) => sum + (ad.insights.lp_views || 0), 0)

            const generateDaily = (start: Date, end: Date) => {
                const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
                const daily = []
                for (let i = 0; i < days; i++) {
                    const d = new Date(start)
                    d.setDate(d.getDate() + i)
                    daily.push({
                        date: d.toISOString().split('T')[0],
                        spend: Math.round(totalSpend / 30), // Rough average
                        clicks: Math.round(totalClicks / 30),
                        impressions: Math.round(totalImpressions / 30),
                        conversions: Math.round(totalConversions / 30)
                    })
                }
                return daily
            }

            dailyMeta = generateDaily(currentFrom, currentTo)
            prevDailyMeta = generateDaily(prevFrom, prevTo)

            // Mock Region Data
            regionMeta = [
                { region: "Tokyo", spend: totalSpend * 0.4, clicks: totalClicks * 0.4, impressions: totalImpressions * 0.4, conversions: totalConversions * 0.45 },
                { region: "Osaka", spend: totalSpend * 0.2, clicks: totalClicks * 0.2, impressions: totalImpressions * 0.2, conversions: totalConversions * 0.15 },
                { region: "Fukuoka", spend: totalSpend * 0.1, clicks: totalClicks * 0.1, impressions: totalImpressions * 0.1, conversions: totalConversions * 0.1 },
                { region: "Nagoya", spend: totalSpend * 0.1, clicks: totalClicks * 0.1, impressions: totalImpressions * 0.1, conversions: totalConversions * 0.1 },
                { region: "Sapporo", spend: totalSpend * 0.05, clicks: totalClicks * 0.05, impressions: totalImpressions * 0.05, conversions: totalConversions * 0.05 },
            ]
        }

        if (accessToken && ga4PropertyId) {
            const { GoogleApiClient } = await import('@/lib/google-api')
            const googleClient = new GoogleApiClient(accessToken)

            // Current Period GA4 Daily Events
            dailyGa4 = await googleClient.getDailyGa4EventCount(ga4PropertyId, cvEventName, dateParams)

            // Previous Period GA4 Daily Events
            prevDailyGa4 = await googleClient.getDailyGa4EventCount(ga4PropertyId, cvEventName, prevDateParams)

            // Fetch GA4 Report for Sessions
            ga4Report = await googleClient.getGa4Report(ga4PropertyId, dateParams)
        }

    } catch (error) {
        console.error("Failed to fetch chart data", error)
    }

    // 4. Aggregate Data

    // --- KPI MoM ---
    const calcTotals = (meta: any[], ga4: any[]) => {
        const spend = meta.reduce((sum, d) => sum + d.spend, 0)
        const impressions = meta.reduce((sum, d) => sum + d.impressions, 0)
        const clicks = meta.reduce((sum, d) => sum + d.clicks, 0)
        // Use GA4 CV if available, else Meta CV
        const cv = ga4.length > 0
            ? ga4.reduce((sum, d) => sum + d.count, 0)
            : meta.reduce((sum, d) => sum + d.conversions, 0)

        return {
            spend,
            impressions,
            clicks,
            cv,
            cpa: cv > 0 ? Math.round(spend / cv) : 0,
            ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
            cvr: clicks > 0 ? (cv / clicks) * 100 : 0
        }
    }

    const currentTotals = calcTotals(dailyMeta, dailyGa4)
    const prevTotals = calcTotals(prevDailyMeta, prevDailyGa4)

    const kpiMoM = [
        {
            label: "消化金額",
            current: currentTotals.spend,
            previous: prevTotals.spend,
            unit: "円",
            inverse: true
        },
        {
            label: "CV数",
            current: currentTotals.cv,
            previous: prevTotals.cv,
            unit: "件",
            inverse: false
        },
        {
            label: "CPA",
            current: currentTotals.cpa,
            previous: prevTotals.cpa,
            unit: "円",
            inverse: true
        },
        {
            label: "ROAS",
            current: 0, // Placeholder
            previous: 0,
            unit: "",
            inverse: false
        },
    ]

    // --- KPI Trend (Daily) ---
    // Merge Meta and GA4 daily data
    const kpiTrend = dailyMeta.map(metaDay => {
        const ga4Day = dailyGa4.find(g => g.date === metaDay.date)
        const cv = ga4Day ? ga4Day.count : metaDay.conversions

        return {
            date: metaDay.date,
            ctr: metaDay.impressions > 0 ? ((metaDay.clicks / metaDay.impressions) * 100).toFixed(2) : 0,
            cpc: metaDay.clicks > 0 ? Math.round(metaDay.spend / metaDay.clicks) : 0,
            cvr: metaDay.clicks > 0 ? ((cv / metaDay.clicks) * 100).toFixed(2) : 0,
        }
    }).sort((a, b) => a.date.localeCompare(b.date))

    // --- Daily Spend ---
    const dailySpend = dailyMeta.map(d => ({
        date: d.date,
        amount: d.spend
    })).sort((a, b) => a.date.localeCompare(b.date))

    // --- Funnel ---
    const funnel = [
        { label: "Impressions", value: currentTotals.impressions, fill: "#3b82f6" },
        { label: "Clicks", value: currentTotals.clicks, fill: "#22c55e" },
        { label: "Sessions", value: ga4Report.sessions, fill: "#8b5cf6" }, // Added Sessions
        { label: "Conversions", value: currentTotals.cv, fill: "#eab308" },
    ]

    // --- Creative Ranking ---
    // Sort by Spend (descending)
    const creativeRanking = adsMeta
        .sort((a, b) => b.insights.spend - a.insights.spend)
        .slice(0, 5)
        .map(ad => ({
            name: ad.name,
            impressions: ad.insights.impressions,
            clicks: ad.insights.clicks,
            ctr: ad.insights.ctr,
            spend: ad.insights.spend,
            cv: ad.insights.lp_views, // Using LP views as proxy for ad-level CV if GA4 not linked per ad
            cpa: ad.insights.cost_per_lp_view,
            thumbnail: ad.creative.image_url
        }))

    // --- Region Performance ---
    const regionPerformance = regionMeta
        .sort((a, b) => b.spend - a.spend)
        .slice(0, 5)
        .map(r => ({
            region: r.region,
            cpa: r.conversions > 0 ? Math.round(r.spend / r.conversions) : 0,
            cvr: r.clicks > 0 ? ((r.conversions / r.clicks) * 100).toFixed(2) : 0,
            spend: r.spend
        }))

    // --- Spend Trend (Monthly) ---
    // For now, we only have current month daily data. 
    // To show a real trend, we'd need to fetch multiple months.
    // For this iteration, we'll just aggregate the current daily data by month (which will be just one month)
    // or we can simulate it if needed. 
    // --- Spend Trend (Monthly) ---
    const monthlyData = new Map<string, { spend: number, cv: number, impressions: number, clicks: number }>()

    // Helper to add data to monthly map
    const addToMonth = (date: string, metrics: { spend: number, cv: number, impressions: number, clicks: number }) => {
        const month = date.substring(0, 7) // YYYY-MM
        const current = monthlyData.get(month) || { spend: 0, cv: 0, impressions: 0, clicks: 0 }
        monthlyData.set(month, {
            spend: current.spend + metrics.spend,
            cv: current.cv + metrics.cv,
            impressions: current.impressions + metrics.impressions,
            clicks: current.clicks + metrics.clicks
        })
    }

    // Process Meta Data
    dailyMeta.forEach(d => {
        addToMonth(d.date, {
            spend: d.spend,
            cv: d.conversions,
            impressions: d.impressions,
            clicks: d.clicks
        })
    })

    // Process GA4 Data (if available, overwrite CV with GA4 data)
    // Note: If we want to mix sources, we need to be careful. 
    // Here we assume if GA4 data exists, we use it for CV counts for that day.
    if (dailyGa4.length > 0) {
        // Reset CVs in map first if we are strictly using GA4 for CV
        // But since we aggregated above, we might be double counting if we just add.
        // Strategy: Re-aggregate using a merged daily list or adjust here.
        // Simpler approach: Iterate GA4 and *add* to a separate tracking or adjust the map.
        // Let's iterate GA4 and update the CV count for the month.
        // However, we already added Meta CVs. We should probably zero out Meta CVs if we prefer GA4.
        // For now, let's assume we use the same logic as calcTotals: if GA4 exists, use it.

        // Re-initialize map to be safe or subtract Meta CVs? 
        // Better: Iterate distinct months and set CV based on GA4 totals for that month.

        dailyGa4.forEach(d => {
            const month = d.date.substring(0, 7)
            const current = monthlyData.get(month)
            if (current) {
                // We need to be careful not to double add if we iterate.
                // Actually, let's just sum GA4 CVs per month and replace/add.
                // Since we don't know which day corresponds to which Meta day easily without a join,
                // let's just accumulate GA4 CVs separately and merge.
            }
        })
    }

    // Refined Approach:
    // 1. Create a set of all unique months from both sources.
    // 2. For each month, sum Meta Spend/Impressions/Clicks.
    // 3. For each month, sum CVs (preferring GA4 if available for that month, else Meta).

    const allMonths = new Set<string>()
    dailyMeta.forEach(d => allMonths.add(d.date.substring(0, 7)))
    dailyGa4.forEach(d => allMonths.add(d.date.substring(0, 7)))

    const spendTrend = Array.from(allMonths).sort().map(month => {
        // Filter daily data for this month
        const metaInMonth = dailyMeta.filter(d => d.date.startsWith(month))
        const ga4InMonth = dailyGa4.filter(d => d.date.startsWith(month))

        const spend = metaInMonth.reduce((sum, d) => sum + d.spend, 0)
        // const impressions = metaInMonth.reduce((sum, d) => sum + d.impressions, 0)
        // const clicks = metaInMonth.reduce((sum, d) => sum + d.clicks, 0)

        const cv = ga4InMonth.length > 0
            ? ga4InMonth.reduce((sum, d) => sum + d.count, 0)
            : metaInMonth.reduce((sum, d) => sum + d.conversions, 0)

        return {
            month,
            spend,
            cv,
            cpa: cv > 0 ? Math.round(spend / cv) : 0
        }
    })

    return {
        success: true,
        data: {
            kpiMoM,
            spendTrend,
            funnel,
            kpiTrend,
            dailySpend,
            creativeRanking,
            regionPerformance
        }
    }
}
