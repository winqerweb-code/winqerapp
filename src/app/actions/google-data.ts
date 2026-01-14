'use server'

import { getStore } from "@/app/actions/store"
import { refreshGoogleAccessToken, GoogleApiClient } from "@/lib/google-api"

export async function getStoreGoogleDataAction(storeId: string) {
    const storeRes = await getStore(storeId)
    if (!storeRes.success || !storeRes.store) {
        return { success: false, error: storeRes.error || "Store not found" }
    }

    const refreshToken = storeRes.store.google_refresh_token
    if (!refreshToken) {
        return { success: false, error: "No Google Refresh Token found for this store" }
    }

    try {
        const tokens = await refreshGoogleAccessToken(refreshToken)
        if (!tokens || !tokens.accessToken) {
            return { success: false, error: "Failed to refresh Google Access Token" }
        }

        const client = new GoogleApiClient(tokens.accessToken)

        // Parallel fetch
        const [locations, properties] = await Promise.all([
            client.getLocations(),
            client.getGa4Properties()
        ])

        return {
            success: true,
            locations,
            properties
        }

    } catch (error: any) {
        console.error("Server-side Google Data Fetch Error:", error)
        return { success: false, error: error.message || "Failed to fetch Google Data" }
    }
}
