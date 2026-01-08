'use server'

import { getSupabase } from "@/lib/supabase-server"
import { isProviderAdmin, verifyStoreAccess } from "@/lib/rbac"
import { revalidatePath } from "next/cache"

// --- Store Management ---

export async function createStoreAction(name: string, industry?: string) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isProviderAdmin(user.id))) {
        return { success: false, error: "Unauthorized: Provider Access Required" }
    }

    const { data, error } = await supabase
        .from('stores')
        .insert({ name, industry })
        .select()
        .single()

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard')
    return { success: true, store: data }
}

export async function deleteStoreAction(storeId: string) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isProviderAdmin(user.id))) {
        return { success: false, error: "Unauthorized: Provider Access Required" }
    }

    const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', storeId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard')
    return { success: true }
}

// --- User Assignment ---

export async function assignUserToStoreAction(targetUserId: string, storeId: string, role: 'STORE_ADMIN' | 'STORE_VIEWER' = 'STORE_ADMIN') {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isProviderAdmin(user.id))) {
        return { success: false, error: "Unauthorized: Provider Access Required" }
    }

    const { error } = await supabase
        .from('store_assignments')
        .upsert({ user_id: targetUserId, store_id: storeId, role })

    if (error) return { success: false, error: error.message }

    return { success: true }
}

export async function removeUserFromStoreAction(targetUserId: string, storeId: string) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isProviderAdmin(user.id))) {
        return { success: false, error: "Unauthorized: Provider Access Required" }
    }

    const { error } = await supabase
        .from('store_assignments')
        .delete()
        .eq('user_id', targetUserId)
        .eq('store_id', storeId)

    if (error) return { success: false, error: error.message }

    return { success: true }
}

// --- Secret Management (Write-Only) ---

export async function updateStoreSecretsAction(storeId: string, secrets: {
    gemini_api_key?: string,
    openai_api_key?: string,
    meta_access_token?: string,
    meta_ad_account_id?: string,
    meta_campaign_id?: string,
    ga4_property_id?: string,
    gbp_location_id?: string
}) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: "Unauthorized" }
    }

    const { hasAccess, role } = await verifyStoreAccess(user.id, storeId)
    if (!hasAccess || (role !== 'STORE_ADMIN' && !(await isProviderAdmin(user.id)))) {
        return { success: false, error: "Unauthorized: Access Denied" }
    }

    // Filter out undefined/empty values to avoid overwriting with null if not intended
    // But here we probably want to allow clearing if explicitly passed as empty string?
    // Let's assume empty string means "clear", undefined means "no change".
    const updates: any = {}
    if (secrets.meta_access_token !== undefined) updates.meta_access_token = secrets.meta_access_token
    if (secrets.meta_ad_account_id !== undefined) updates.meta_ad_account_id = secrets.meta_ad_account_id
    if (secrets.meta_campaign_id !== undefined) updates.meta_campaign_id = secrets.meta_campaign_id // Added campaign ID
    if (secrets.ga4_property_id !== undefined) updates.ga4_property_id = secrets.ga4_property_id
    if (secrets.gbp_location_id !== undefined) updates.gbp_location_id = secrets.gbp_location_id

    const { error } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', storeId)

    if (error) {
        console.error("Save Error Details:", error)
        return { success: false, error: `Save failed: ${error.message} (Code: ${error.code})` }
    }

    return { success: true }
}

export async function checkAdminStatusAction() {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { isAdmin: false, email: null, role: null }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', user.id)
        .single()

    return {
        isAdmin: profile?.role === 'PROVIDER_ADMIN',
        email: profile?.email || user.email,
        role: profile?.role
    }
}

export async function getStoreAssignmentsAction(storeId: string) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isProviderAdmin(user.id))) {
        return { success: false, error: "Unauthorized: Provider Access Required" }
    }

    const { data, error } = await supabase
        .from('store_assignments')
        .select('*, profiles(email)')
        .eq('store_id', storeId)

    if (error) return { success: false, error: error.message }

    // Flatten structure for easier consumption
    const assignments = data.map((item: any) => ({
        user_id: item.user_id,
        store_id: item.store_id,
        role: item.role,
        email: item.profiles?.email || 'Unknown'
    }))

    return { success: true, assignments }
}

export async function assignUserByEmailAction(email: string, storeId: string, role: 'STORE_ADMIN' | 'STORE_VIEWER' = 'STORE_ADMIN') {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isProviderAdmin(user.id))) {
        return { success: false, error: "Unauthorized: Provider Access Required" }
    }

    // 1. Find user by email
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

    if (profileError || !profile) {
        console.error("User Lookup Error:", profileError)
        return {
            success: false,
            error: profileError
                ? `検索エラー: ${profileError.message} (Code: ${profileError.code})`
                : "ユーザーが見つかりません (プロフィールが存在しません)"
        }
    }

    // 2. Assign
    return await assignUserToStoreAction(profile.id, storeId, role)
}

export async function getStoreMetaAdAccountsAction(storeId: string) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: "Unauthorized" }
    }

    const { hasAccess } = await verifyStoreAccess(user.id, storeId)
    if (!hasAccess) {
        return { success: false, error: "Unauthorized: Access Denied" }
    }

    // 1. Get Token from Store
    const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('meta_access_token')
        .eq('id', storeId)
        .single()

    if (storeError || !store?.meta_access_token) {
        return { success: false, error: "Meta Access Token not found for this store" }
    }

    // 2. Fetch Ad Accounts using the token
    try {
        // We can use the metaApiServer helper if we pass the token, 
        // OR just fetch directly since metaApiServer might be tied to global env?
        // Let's check meta-api.ts. It usually takes a token as arg.
        // Importing metaApiServer here.
        const { metaApiServer } = await import("@/lib/meta-api")
        const accounts = await metaApiServer.getAdAccounts(store.meta_access_token)
        return { success: true, accounts }
    } catch (error: any) {
        console.error("Meta Fetch Error:", error)
        return { success: false, error: error.message || "Failed to fetch ad accounts" }
    }
}

export async function getStoreMetaCampaignsAction(storeId: string, adAccountId: string) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: "Unauthorized" }
    }

    const { hasAccess } = await verifyStoreAccess(user.id, storeId)
    if (!hasAccess) {
        return { success: false, error: "Unauthorized: Access Denied" }
    }

    // 1. Get Token from Store
    const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('meta_access_token')
        .eq('id', storeId)
        .single()

    if (storeError || !store?.meta_access_token) {
        return { success: false, error: "Meta Access Token not found for this store" }
    }

    // 2. Fetch Campaigns using the token and adAccountId
    try {
        const { metaApiServer } = await import("@/lib/meta-api")
        const campaigns = await metaApiServer.getCampaigns(store.meta_access_token, adAccountId)
        return { success: true, campaigns }
    } catch (error: any) {
        console.error("Meta Fetch Error (Campaigns):", error)
        return { success: false, error: error.message || "Failed to fetch campaigns" }
    }
}
