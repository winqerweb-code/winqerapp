'use server'

import { MOCK_ADS, MOCK_GA4_REPORT } from '@/lib/mock-data'
import { cookies } from 'next/headers'

// Helper to format date in JST (YYYY-MM-DD)
function formatJST(date: Date): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date)
}

export async function getStoreMetrics(
    metaCampaignId: string,
    ga4PropertyId: string,
    accessToken?: string,
    metaAccessToken?: string,
    cvEventName: string = 'フッター予約リンク',
    adAccountId?: string,
    dateRange?: { from: Date, to: Date } // New optional param
) {
    // Determine Date Range (Default: Last 30 days)
    // Use JST to ensure "today" is today in Japan
    const endDate = dateRange?.to ? formatJST(dateRange.to) : formatJST(new Date())
    const startDate = dateRange?.from ? formatJST(dateRange.from) : formatJST(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))

    // Fallback to Cookie for Google Token
    let effectiveGoogleToken = accessToken
    if (!effectiveGoogleToken) {
        const cookieStore = cookies()
        effectiveGoogleToken = cookieStore.get('google_access_token')?.value
    }

    // 1. Fetch Meta Ads Data
    let metaMetrics = {
        spend: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
    }
    let dailyMeta: any[] = []

    try {
        // Try to get token from DB if not provided
        let effectiveMetaToken = metaAccessToken
        if (!effectiveMetaToken) {
            // Get Meta Token
            const { getMetaToken } = await import('@/lib/api-key-service')
            const metaToken = await getMetaToken()

            if (!metaToken) {
                console.warn('⚠️ No Meta Token found')
                return { success: false, error: 'Meta Token not found' }
            }
            effectiveMetaToken = metaToken
        }

        if (effectiveMetaToken) {
            const { metaApiServer } = await import('@/lib/meta-api')

            // Determine which account to use
            let targetAccountId = adAccountId

            if (!targetAccountId) {
                const accounts = await metaApiServer.getAdAccounts(effectiveMetaToken)
                if (accounts && accounts.length > 0) {
                    const defaultId = "act_864591462413204"
                    const selectedAccount = accounts.find((a: any) => a.id === defaultId || a.id === "864591462413204") || accounts[0]
                    targetAccountId = selectedAccount.id
                }
            }

            if (targetAccountId) {
                // Fetch Daily Insights
                try {
                    dailyMeta = await metaApiServer.getDailyAdsInsights(effectiveMetaToken, targetAccountId, { startDate, endDate }, metaCampaignId)
                } catch (e) {
                    console.warn('Failed to fetch daily insights, falling back to mock', e)
                }

                // Fallback to mock daily data if API returned empty (or failed) but we want to show something
                /*
                if (dailyMeta.length === 0) {
                    const days = Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
                    for (let i = 0; i < days; i++) {
                        const d = new Date(startDate)
                        d.setDate(d.getDate() + i)
                        dailyMeta.push({
                            date: d.toISOString().split('T')[0],
                            spend: Math.round(Math.random() * 10000),
                            clicks: Math.round(Math.random() * 100),
                            impressions: Math.round(Math.random() * 5000),
                            conversions: Math.round(Math.random() * 5)
                        })
                    }
                }
                */

                // Calculate Totals from Daily Data (more accurate for the range)
                if (dailyMeta.length > 0) {
                    metaMetrics = {
                        spend: dailyMeta.reduce((sum, day) => sum + day.spend, 0),
                        impressions: dailyMeta.reduce((sum, day) => sum + day.impressions, 0),
                        clicks: dailyMeta.reduce((sum, day) => sum + day.clicks, 0),
                        conversions: dailyMeta.reduce((sum, day) => sum + day.conversions, 0),
                    }
                } else {
                    // Fallback to previous logic if daily fetch fails or returns empty
                    // ... (existing logic could go here, but let's rely on daily for consistency if token exists)
                }
            }
        } else if (metaCampaignId) {
            // Mock Data
            const campaignAds = MOCK_ADS.filter(ad => ad.campaign_id === metaCampaignId)
            metaMetrics = {
                spend: campaignAds.reduce((sum, ad) => sum + ad.insights.spend, 0),
                impressions: campaignAds.reduce((sum, ad) => sum + ad.insights.impressions, 0),
                clicks: campaignAds.reduce((sum, ad) => sum + ad.insights.clicks, 0),
                conversions: campaignAds.reduce((sum, ad) => sum + (ad.insights.lp_views || 0), 0),
            }
            // Generate Mock Daily Data
            const days = Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
            for (let i = 0; i < days; i++) {
                const d = new Date(startDate)
                d.setDate(d.getDate() + i)
                dailyMeta.push({
                    date: d.toISOString().split('T')[0],
                    spend: Math.round(metaMetrics.spend / days),
                    clicks: Math.round(metaMetrics.clicks / days),
                    impressions: Math.round(metaMetrics.impressions / days),
                    conversions: 0
                })
            }
        }
    } catch (error) {
        console.error('❌ [Meta] Dashboard Fetch Error:', error)
    }

    // 2. Fetch GA4 Data
    let ga4Metrics = {
        specificEventCount: 0
    }
    let dailyGa4: any[] = []

    try {
        if (effectiveGoogleToken && ga4PropertyId) {
            const { GoogleApiClient } = await import('@/lib/google-api')
            const googleClient = new GoogleApiClient(effectiveGoogleToken)

            // Fetch Total for "予約" (Reservation) related events
            // User Request: "conversionsをアナリティクスの予約ってつくイベントの合計にして"
            const searchString = "予約"
            console.log('🔍 [StoreMetrics] Fetching events containing:', searchString)
            const eventCount = await googleClient.getGa4EventsContaining(ga4PropertyId, searchString, { startDate, endDate })
            console.log('✅ [StoreMetrics] Event count for "予約":', eventCount)
            ga4Metrics.specificEventCount = eventCount

            // Fetch Daily
            dailyGa4 = await googleClient.getDailyGa4EventsContaining(ga4PropertyId, searchString, { startDate, endDate })
        } else if (ga4PropertyId) {
            // Mock Data
            ga4Metrics.specificEventCount = 0
        }
    } catch (error) {
        console.error('❌ [GA4] Dashboard Fetch Error:', error)
    }

    // 3. Merge Daily Data
    const dailyMetrics = dailyMeta.map(metaDay => {
        const ga4Day = dailyGa4.find(g => g.date === metaDay.date)
        const cv = ga4Day ? ga4Day.count : 0 // Use GA4 CV if available, else 0 (or Meta CV if we wanted)

        // Use GA4 CV for CPA/CVR calculations if available
        const cpa = cv > 0 ? Math.round(metaDay.spend / cv) : 0
        const cvr = metaDay.clicks > 0 ? ((cv / metaDay.clicks) * 100).toFixed(2) : 0

        return {
            date: metaDay.date,
            spend: metaDay.spend,
            clicks: metaDay.clicks,
            impressions: metaDay.impressions,
            cpa: cpa,
            cvr: cvr,
            cv: cv
        }
    }).sort((a, b) => a.date.localeCompare(b.date))

    // 4. Calculate Derived Metrics (Totals)
    const cvCount = ga4Metrics.specificEventCount || 0
    const cpa = cvCount > 0 ? Math.round(metaMetrics.spend / cvCount) : 0
    const ctr = metaMetrics.impressions > 0 ? ((metaMetrics.clicks / metaMetrics.impressions) * 100).toFixed(2) : "0.00"
    const cvr = metaMetrics.clicks > 0 ? ((cvCount / metaMetrics.clicks) * 100).toFixed(2) : "0.00"

    return {
        success: true,
        metrics: {
            spend: metaMetrics.spend,
            impressions: metaMetrics.impressions,
            clicks: metaMetrics.clicks,
            cpa: cpa,
            ctr: ctr,
            cvr: cvr,
            cvCount: cvCount,
            cvEventName: '予約(合計)'
        }
    }
}
