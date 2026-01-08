'use server'

import { metaApiServer } from "@/lib/meta-api"
import { getMetaToken } from "@/lib/api-key-service"

export async function getAdAccountsAction() {
    try {
        const token = await getMetaToken()
        if (!token) {
            return { success: false, error: "Meta Access Token not configured" }
        }

        const accounts = await metaApiServer.getAdAccounts(token)
        return { success: true, accounts }
    } catch (error: any) {
        console.error("Meta Action Error (Accounts):", error)
        return { success: false, error: error.message || "Failed to fetch ad accounts" }
    }
}

export async function getCampaignsAction(adAccountId: string) {
    try {
        const token = await getMetaToken()
        if (!token) {
            return { success: false, error: "Meta Access Token not configured" }
        }

        // Note: metaApiServer doesn't have getCampaigns, but metaApi (client) does.
        // We need to implement getCampaigns in metaApiServer or here.
        // Looking at meta-api.ts, metaApiServer ONLY has getAdAccounts, getAds, getDailyAdsInsights, getRegionInsights.
        // It DOES NOT have getCampaigns.
        // We should implement it here using the same logic as client-side but with server fetch.

        console.log(`🔍 [Meta Action] Fetching campaigns for account: ${adAccountId}`)
        const res = await fetch(
            `https://graph.facebook.com/v18.0/${adAccountId}/campaigns?fields=id,name,objective,status,created_time&access_token=${token}`
        )
        const data = await res.json()

        if (data.error) throw new Error(data.error.message)

        return { success: true, campaigns: data.data || [] }

    } catch (error: any) {
        console.error("Meta Action Error (Campaigns):", error)
        return { success: false, error: error.message || "Failed to fetch campaigns" }
    }
}
