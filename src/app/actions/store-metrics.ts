'use server'

import { MOCK_ADS, MOCK_GA4_REPORT } from '@/lib/mock-data'
import { cookies } from 'next/headers'
import { getSupabase } from '@/lib/supabase-server'
import { getCachedAnalytics, upsertAnalyticsCache, isCacheValid, VOLATILE_WINDOW_DAYS, getServiceSupabase } from '@/lib/analytics-cache'
import { subDays, format, parseISO, eachDayOfInterval, isAfter, isBefore } from 'date-fns'

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
    storeId: string, // NEW: Required for Caching
    metaCampaignId: string,
    ga4PropertyId: string,
    accessToken?: string,
    metaAccessToken?: string,
    cvEventName: string = 'フッター予約リンク',
    adAccountId?: string,
    googleRefreshToken?: string, // Add refresh token param
    dateRange?: { from: Date, to: Date } // New optional param
) {
    // Determine Date Range (Default: Last 30 days)
    // Use JST to ensure "today" is today in Japan
    const endDateObj = dateRange?.to || new Date()
    const startDateObj = dateRange?.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const endDate = formatJST(endDateObj)
    const startDate = formatJST(startDateObj)

    // Fallback to Cookie for Google Token if not provided explicitly
    let effectiveGoogleToken = accessToken
    if (!effectiveGoogleToken) {
        const cookieStore = cookies()
        effectiveGoogleToken = cookieStore.get('google_access_token')?.value
    }

    // Refresh Token Logic (Client -> Server Action)
    // If not provided by client, try to fetch from DB (Securely)
    let tokenToUse = googleRefreshToken
    if (!tokenToUse && storeId) {
        // Fetch from DB using Service Role (to bypass RLS if viewer)
        const adminClient = getServiceSupabase()
        if (adminClient) {
            const { data: storeSecret } = await adminClient
                .from('stores')
                .select('google_refresh_token')
                .eq('id', storeId)
                .single()
            if (storeSecret?.google_refresh_token) {
                tokenToUse = storeSecret.google_refresh_token
            }
        }
    }

    if (tokenToUse) {
        try {
            const { refreshGoogleAccessToken } = await import('@/lib/google-api')
            const newTokens = await refreshGoogleAccessToken(tokenToUse)
            if (newTokens?.accessToken) {
                effectiveGoogleToken = newTokens.accessToken
            }
        } catch (e) {
            console.warn('⚠️ [GA4] Failed to refresh token from store:', e)
        }
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
            const { getMetaToken } = await import('@/lib/api-key-service')
            const metaToken = await getMetaToken()
            if (metaToken) {
                effectiveMetaToken = metaToken
            }
        }

        if (effectiveMetaToken) {
            const { metaApiServer } = await import('@/lib/meta-api')

            // Determine Ad Account
            let targetAccountId = adAccountId
            if (!targetAccountId) {
                const accounts = await metaApiServer.getAdAccounts(effectiveMetaToken)
                if (accounts && accounts.length > 0) {
                    // Default fallback (legacy)
                    const defaultId = "act_864591462413204"
                    const selectedAccount = accounts.find((a: any) => a.id === defaultId || a.id === "864591462413204") || accounts[0]
                    targetAccountId = selectedAccount.id
                }
            }

            if (targetAccountId) {
                try {
                    dailyMeta = await metaApiServer.getDailyAdsInsights(effectiveMetaToken, targetAccountId, { startDate, endDate }, metaCampaignId)
                } catch (e) {
                    console.warn('Failed to fetch daily insights', e)
                }

                if (dailyMeta.length > 0) {
                    metaMetrics = {
                        spend: dailyMeta.reduce((sum, day) => sum + day.spend, 0),
                        impressions: dailyMeta.reduce((sum, day) => sum + day.impressions, 0),
                        clicks: dailyMeta.reduce((sum, day) => sum + day.clicks, 0),
                        conversions: dailyMeta.reduce((sum, day) => sum + day.conversions, 0),
                    }
                }
            }
        } else if (metaCampaignId) {
            // Mock Data (Legacy fallback)
            const campaignAds = MOCK_ADS.filter(ad => ad.campaign_id === metaCampaignId)
            metaMetrics = {
                spend: campaignAds.reduce((sum, ad) => sum + ad.insights.spend, 0),
                impressions: campaignAds.reduce((sum, ad) => sum + ad.insights.impressions, 0),
                clicks: campaignAds.reduce((sum, ad) => sum + ad.insights.clicks, 0),
                conversions: campaignAds.reduce((sum, ad) => sum + (ad.insights.lp_views || 0), 0),
            }
            // Mock Daily Generation... (Skipped for brevity as not main focus)
        }
    } catch (error: any) {
        console.error('❌ [Meta] Dashboard Fetch Error:', error)
        if (error.message?.includes('Session has expired')) {
            return { success: false, error: 'Meta連携の有効期限が切れています。' }
        }
    }

    // 2. Fetch GA4 Data (Smart Cache Implementation)
    let ga4Metrics = { specificEventCount: 0 }
    let dailyGa4: any[] = []

    // DEBUG: Log Token status
    console.log('🔍 [metrics] Token Status:', {
        hasRef: !!googleRefreshToken,
        hasAccess: !!effectiveGoogleToken,
        storeId
    })

    try {
        // ALLOW entry if we have storeId (to read cache), even without token
        if (ga4PropertyId && storeId) {
            const supabaseClient = await getSupabase()

            // Define Ranges
            const today = new Date()
            const volatileStartDate = subDays(today, VOLATILE_WINDOW_DAYS)

            // 2a. Fetch Cache (Read-only does not need Google Token)
            const cachedMap = await getCachedAnalytics(supabaseClient, storeId, startDate, endDate, 'ga4')

            // 2b. Identify Missing Dates
            const datesToFetch: string[] = []

            const daysInterval = eachDayOfInterval({
                start: parseISO(startDate),
                end: parseISO(endDate)
            })

            daysInterval.forEach(day => {
                const dayStr = formatJST(day)
                const entry = cachedMap.get(dayStr)
                const isVolatile = isAfter(day, volatileStartDate) || dayStr === formatJST(today)

                if (!entry) {
                    datesToFetch.push(dayStr)
                } else if (isVolatile && !isCacheValid(entry.updated_at)) {
                    datesToFetch.push(dayStr)
                }
            })

            // 2c. Fetch Missing Data (Batch)
            if (datesToFetch.length > 0) {
                // We ONLY need token here
                if (!effectiveGoogleToken) {
                    console.warn('⚠️ [GA4] Missing data but no token available. Skipping API fetch.')
                    // We can't fetch, so we just use what we have (or 0 for missing)
                } else {
                    datesToFetch.sort()
                    const fetchStart = datesToFetch[0]
                    const fetchEnd = datesToFetch[datesToFetch.length - 1]

                    console.log(`📡 [GA4 Cache] Miss/Expired. Fetching API from ${fetchStart} to ${fetchEnd}`)

                    const { GoogleApiClient } = await import('@/lib/google-api')
                    const googleClient = new GoogleApiClient(effectiveGoogleToken)
                    const searchString = cvEventName || "予約"

                    const fetchedDaily = await googleClient.getDailyGa4EventsContaining(
                        ga4PropertyId,
                        searchString,
                        { startDate: fetchStart, endDate: fetchEnd }
                    )

                    const upsertData: { date: string, data: any }[] = []
                    const apiResultsMap = new Map()
                    fetchedDaily.forEach((d: { date: string, count: number }) => {
                        apiResultsMap.set(d.date, d.count)
                    })

                    datesToFetch.forEach(dateStr => {
                        const count = apiResultsMap.get(dateStr) || 0
                        upsertData.push({ date: dateStr, data: { count } })
                    })

                    if (upsertData.length > 0) {
                        await upsertAnalyticsCache(storeId, 'ga4', upsertData)
                        upsertData.forEach(item => {
                            cachedMap.set(item.date, { metrics: item.data })
                        })
                    }
                }
            } else {
                console.log('⚡️ [GA4 Cache] All data served from DB Cache')
            }

            // 2e. Reconstruct Daily List
            dailyGa4 = daysInterval.map(day => {
                const dayStr = formatJST(day)
                const entry = cachedMap.get(dayStr)
                return {
                    date: dayStr,
                    count: entry ? entry.metrics.count : 0
                }
            })

            ga4Metrics.specificEventCount = dailyGa4.reduce((sum, d) => sum + d.count, 0)

        } else if (ga4PropertyId) {
            // Legacy fallback (shouldn't be hit if storeId provided)
            ga4Metrics.specificEventCount = 0
        }
    } catch (error: any) {
        console.error('❌ [GA4] Dashboard Fetch Error:', error)
        if (error.message?.includes('401') || error.message?.includes('UNAUTHENTICATED')) {
            return { success: false, error: 'Google連携の有効期限が切れています。' }
        }
    }

    // 3. Merge Daily Data (Calculations...)
    const dailyMetrics = dailyMeta.map(metaDay => {
        const ga4Day = dailyGa4.find(g => g.date === metaDay.date)
        const cv = ga4Day ? ga4Day.count : 0

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

