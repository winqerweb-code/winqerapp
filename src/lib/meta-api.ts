import { MOCK_AD_ACCOUNTS, MOCK_CAMPAIGNS, MOCK_ADS } from "./mock-data"

// Helper to get token from storage safely (client-side only)
const getCredentials = () => {
    if (typeof window === "undefined") return null
    const token = localStorage.getItem("meta_access_token")
    return token ? { token } : null
}

// Server-compatible API functions
export const metaApiServer = {
    getAdAccounts: async (accessToken: string) => {
        try {
            const res = await fetch(
                `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,currency,account_status&access_token=${accessToken}`
            )
            const data = await res.json()
            if (data.error) throw new Error(data.error.message)
            return data.data
        } catch (e) {
            console.warn("Meta API Error (Accounts):", e)
            throw e // Propagate error instead of returning mock data
        }
    },

    getCampaigns: async (accessToken: string, adAccountId: string) => {
        try {
            console.log(`🔍 [Meta API Server] Fetching campaigns for account: ${adAccountId}`)
            const res = await fetch(
                `https://graph.facebook.com/v18.0/${adAccountId}/campaigns?fields=id,name,objective,status,created_time&access_token=${accessToken}`
            )
            const data = await res.json()
            if (data.error) throw new Error(data.error.message)
            return data.data
        } catch (e) {
            console.warn("Meta API Error (Campaigns):", e)
            throw e // Propagate error instead of returning mock data
        }
    },

    getAds: async (accessToken: string, adAccountId: string) => {
        try {
            const fields = "id,name,status,campaign{id,name,objective},creative{id,title,body,image_url,thumbnail_url},insights.date_preset(last_90d){impressions,clicks,spend,cpc,cpm,ctr,frequency,cost_per_action_type,actions}"
            const res = await fetch(
                `https://graph.facebook.com/v18.0/${adAccountId}/ads?fields=${fields}&access_token=${accessToken}`
            )
            const data = await res.json()
            if (data.error) throw new Error(data.error.message)

            if (!data.data || data.data.length === 0) {
                console.warn("Real API returned no ads, falling back to mock data for demo.")
                return MOCK_ADS
            }

            // Transform real data to match our app's expected shape
            return data.data.map((ad: any) => {
                const insight = ad.insights?.data?.[0] || {}
                const actions = insight.actions || []
                const lpViewAction = actions.find((a: any) => a.action_type === "landing_page_view")
                const lpViews = Number(lpViewAction?.value || 0)
                const spend = Number(insight.spend || 0)

                return {
                    id: ad.id,
                    name: ad.name,
                    campaign_id: ad.campaign?.id,
                    campaign_name: ad.campaign?.name || "Unknown Campaign",
                    campaign_objective: ad.campaign?.objective || "OUTCOME_TRAFFIC",
                    creative: {
                        id: ad.creative?.id,
                        title: ad.creative?.title || "No Title",
                        body: ad.creative?.body || "No Body",
                        image_url: ad.creative?.image_url || ad.creative?.thumbnail_url || "https://placehold.co/600x400?text=No+Image",
                    },
                    insights: {
                        impressions: Number(insight.impressions || 0),
                        clicks: Number(insight.clicks || 0),
                        spend: spend,
                        ctr: Number(insight.ctr || 0),
                        cpm: Number(insight.cpm || 0),
                        cpc: Number(insight.cpc || 0),
                        frequency: Number(insight.frequency || 0),
                        lp_views: lpViews,
                        cost_per_lp_view: lpViews > 0 ? spend / lpViews : 0,
                        cpa: 0,
                        roas: 0,
                        raw_actions: actions,
                    }
                }
            })
        } catch (e) {
            console.warn("Meta API Error (Ads):", e)
            return MOCK_ADS
        }
    },

    getDailyAdsInsights: async (accessToken: string, adAccountId: string, dateRange: { startDate: string, endDate: string }, campaignId?: string) => {
        try {
            const fields = "spend,clicks,impressions,actions"
            let url = `https://graph.facebook.com/v18.0/${adAccountId}/insights?level=account&time_increment=1&time_range={'since':'${dateRange.startDate}','until':'${dateRange.endDate}'}&fields=${fields}&access_token=${accessToken}`

            if (campaignId && campaignId !== 'none') {
                // Fetch insights specifically for this campaign
                url = `https://graph.facebook.com/v18.0/${campaignId}/insights?time_increment=1&time_range={'since':'${dateRange.startDate}','until':'${dateRange.endDate}'}&fields=${fields}&access_token=${accessToken}`
            }

            const res = await fetch(url)
            const data = await res.json()
            if (data.error) throw new Error(data.error.message)

            return data.data.map((day: any) => {
                const actions = day.actions || []
                const lpViewAction = actions.find((a: any) => a.action_type === "landing_page_view")
                const conversions = Number(lpViewAction?.value || 0)

                return {
                    date: day.date_start,
                    spend: Number(day.spend || 0),
                    clicks: Number(day.clicks || 0),
                    impressions: Number(day.impressions || 0),
                    conversions: conversions
                }
            })
        } catch (e) {
            console.warn("Meta API Error (Daily Insights):", e)
            return []
        }
    },

    getRegionInsights: async (accessToken: string, adAccountId: string, dateRange: { startDate: string, endDate: string }, campaignId?: string) => {
        try {
            const fields = "spend,clicks,impressions,actions"
            let url = `https://graph.facebook.com/v18.0/${adAccountId}/insights?level=account&time_range={'since':'${dateRange.startDate}','until':'${dateRange.endDate}'}&fields=${fields}&breakdowns=region&access_token=${accessToken}`

            if (campaignId && campaignId !== 'none') {
                url = `https://graph.facebook.com/v18.0/${campaignId}/insights?time_range={'since':'${dateRange.startDate}','until':'${dateRange.endDate}'}&fields=${fields}&breakdowns=region&access_token=${accessToken}`
            }

            const res = await fetch(url)
            const data = await res.json()
            if (data.error) throw new Error(data.error.message)

            return data.data.map((item: any) => {
                const actions = item.actions || []
                const lpViewAction = actions.find((a: any) => a.action_type === "landing_page_view")
                const conversions = Number(lpViewAction?.value || 0)

                return {
                    region: item.region,
                    spend: Number(item.spend || 0),
                    clicks: Number(item.clicks || 0),
                    impressions: Number(item.impressions || 0),
                    conversions: conversions
                }
            })
        } catch (e) {
            console.warn("Meta API Error (Region Insights):", e)
            return []
        }
    },
}

// Original client-side API (uses localStorage)
export const metaApi = {
    getAdAccounts: async (accessToken?: string) => {
        const creds = getCredentials()
        const token = accessToken || creds?.token

        if (token) {
            try {
                const res = await fetch(
                    `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,currency,account_status&access_token=${token}`
                )
                const data = await res.json()
                if (data.error) throw new Error(data.error.message)
                return data.data
            } catch (e) {
                console.warn("Meta API Error (Accounts):", e)
                return MOCK_AD_ACCOUNTS
            }
        }
        await new Promise((resolve) => setTimeout(resolve, 500))
        return MOCK_AD_ACCOUNTS
    },

    getCampaigns: async (adAccountId: string, accessToken?: string) => {
        const creds = getCredentials()
        const token = accessToken || creds?.token

        if (token) {
            try {
                console.log(`🔍 [Meta API] Fetching campaigns for account: ${adAccountId}`)
                const res = await fetch(
                    `https://graph.facebook.com/v18.0/${adAccountId}/campaigns?fields=id,name,objective,status,created_time&access_token=${token}`
                )
                const data = await res.json()
                if (data.error) throw new Error(data.error.message)
                console.log(`✅ [Meta API] Fetched ${data.data?.length} campaigns`)
                return data.data
            } catch (e) {
                console.error("❌ [Meta API] Error fetching campaigns:", e)
                throw e
            }
        }
        await new Promise((resolve) => setTimeout(resolve, 600))
        return MOCK_CAMPAIGNS
    },

    getAds: async (adAccountId: string) => {
        const creds = getCredentials()
        if (creds) {
            try {
                const fields = "id,name,status,campaign{id,name,objective},creative{id,title,body,image_url,thumbnail_url},insights.date_preset(last_90d){impressions,clicks,spend,cpc,cpm,ctr,frequency,cost_per_action_type,actions}"
                const res = await fetch(
                    `https://graph.facebook.com/v18.0/${adAccountId}/ads?fields=${fields}&access_token=${creds.token}`
                )
                const data = await res.json()
                if (data.error) throw new Error(data.error.message)

                if (!data.data || data.data.length === 0) {
                    console.warn("Real API returned no ads, falling back to mock data for demo.")
                    return MOCK_ADS
                }

                return data.data.map((ad: any) => {
                    const insight = ad.insights?.data?.[0] || {}
                    const actions = insight.actions || []
                    const lpViewAction = actions.find((a: any) => a.action_type === "landing_page_view")
                    const lpViews = Number(lpViewAction?.value || 0)
                    const spend = Number(insight.spend || 0)

                    return {
                        id: ad.id,
                        name: ad.name,
                        campaign_id: ad.campaign?.id,
                        campaign_name: ad.campaign?.name || "Unknown Campaign",
                        campaign_objective: ad.campaign?.objective || "OUTCOME_TRAFFIC",
                        creative: {
                            id: ad.creative?.id,
                            title: ad.creative?.title || "No Title",
                            body: ad.creative?.body || "No Body",
                            image_url: ad.creative?.image_url || ad.creative?.thumbnail_url || "https://placehold.co/600x400?text=No+Image",
                        },
                        insights: {
                            impressions: Number(insight.impressions || 0),
                            clicks: Number(insight.clicks || 0),
                            spend: spend,
                            ctr: Number(insight.ctr || 0),
                            cpm: Number(insight.cpm || 0),
                            cpc: Number(insight.cpc || 0),
                            frequency: Number(insight.frequency || 0),
                            lp_views: lpViews,
                            cost_per_lp_view: lpViews > 0 ? spend / lpViews : 0,
                            cpa: 0,
                            roas: 0,
                            raw_actions: actions,
                        }
                    }
                })
            } catch (e) {
                console.warn("Meta API Error (Ads):", e)
                return MOCK_ADS
            }
        }
        await new Promise((resolve) => setTimeout(resolve, 800))
        return MOCK_ADS
    },

    getAdInsights: async (adId: string, dateRange: { from: Date; to: Date }) => {
        await new Promise((resolve) => setTimeout(resolve, 300))
        const ad = MOCK_ADS.find((a) => a.id === adId)
        return ad?.insights || null
    },
}
