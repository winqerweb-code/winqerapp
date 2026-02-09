'use server'

import { getSupabase } from "@/lib/supabase-server"
import { isProviderAdmin, verifyStoreAccess } from "@/lib/rbac"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

// --- Store Management ---

export async function createStoreAction(name: string, industry?: string) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isProviderAdmin(user.id))) {
        return { success: false, error: "権限がありません: プロバイダー権限が必要です" }
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
        return { success: false, error: "権限がありません: プロバイダー権限が必要です" }
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
        return { success: false, error: "権限がありません: プロバイダー権限が必要です" }
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
        return { success: false, error: "権限がありません: プロバイダー権限が必要です" }
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
    meta_ad_account_name?: string,
    meta_campaign_id?: string,
    meta_campaign_name?: string,
    ga4_property_id?: string,
    ga4_property_name?: string,
    gbp_location_id?: string,
    gbp_location_name?: string,
    google_refresh_token?: string
}) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: "Unauthorized" }
    }

    const { hasAccess, role } = await verifyStoreAccess(user.id, storeId)
    if (!hasAccess || (role !== 'STORE_ADMIN' && !(await isProviderAdmin(user.id)))) {
        return { success: false, error: "権限がありません: アクセスが拒否されました" }
    }

    // Filter out undefined/empty values to avoid overwriting with null if not intended
    // But here we probably want to allow clearing if explicitly passed as empty string?
    // Let's assume empty string means "clear", undefined means "no change".
    const updates: any = {}

    // API Keys
    if (secrets.gemini_api_key !== undefined) updates.gemini_api_key = secrets.gemini_api_key
    if (secrets.openai_api_key !== undefined) updates.openai_api_key = secrets.openai_api_key

    // Meta
    if (secrets.meta_access_token !== undefined) updates.meta_access_token = secrets.meta_access_token
    if (secrets.meta_ad_account_id !== undefined) updates.meta_ad_account_id = secrets.meta_ad_account_id
    if (secrets.meta_ad_account_name !== undefined) updates.meta_ad_account_name = secrets.meta_ad_account_name
    if (secrets.meta_campaign_id !== undefined) updates.meta_campaign_id = secrets.meta_campaign_id
    if (secrets.meta_campaign_name !== undefined) updates.meta_campaign_name = secrets.meta_campaign_name

    // Google
    if (secrets.ga4_property_id !== undefined) updates.ga4_property_id = secrets.ga4_property_id
    if (secrets.ga4_property_name !== undefined) updates.ga4_property_name = secrets.ga4_property_name
    if (secrets.gbp_location_id !== undefined) updates.gbp_location_id = secrets.gbp_location_id
    if (secrets.gbp_location_id !== undefined) updates.gbp_location_id = secrets.gbp_location_id
    if (secrets.gbp_location_name !== undefined) updates.gbp_location_name = secrets.gbp_location_name

    // Refresh Token
    if (secrets.google_refresh_token !== undefined) updates.google_refresh_token = secrets.google_refresh_token

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
        return { success: false, error: "権限がありません: プロバイダー権限が必要です" }
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
        return { success: false, error: "権限がありません: プロバイダー権限が必要です" }
    }

    // 1. Find user by email
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle()

    if (profileError) {
        console.error("User Lookup Error:", profileError)
        return { success: false, error: `検索エラー: ${profileError.message}` }
    }

    if (!profile) {
        return {
            success: false,
            error: "ユーザーが見つかりません。メールアドレスが正しいか、またはユーザーがアプリに一度ログイン（プロフィール作成）済みか確認してください。"
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
        return { success: false, error: "この店舗のMetaアクセストークンが見つかりません" }
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
        return { success: false, error: "この店舗のMetaアクセストークンが見つかりません" }
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

export async function getGoogleRefreshTokenFromCookie() {
    const cookieStore = cookies()
    const refreshToken = cookieStore.get('google_refresh_token')
    return refreshToken?.value || null
}

// --- Provider Admin Management ---

export async function getProviderAdminsAction() {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isProviderAdmin(user.id))) {
        return { success: false, error: "権限がありません: プロバイダー権限が必要です" }
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('role', 'PROVIDER_ADMIN')

    if (error) return { success: false, error: error.message }

    return { success: true, admins: data }
}

import { createClient } from '@supabase/supabase-js'

// Helper to get Admin Client
function getServiceSupabase() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables")
    }
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}

export async function assignProviderAdminAction(email: string, password?: string) {
    try {
        const supabase = await getSupabase()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user || !(await isProviderAdmin(user.id))) {
            return { success: false, error: "権限がありません: プロバイダー権限が必要です" }
        }

        const adminSupabase = getServiceSupabase()

        // 1. Check if user exists (by email) using Admin API
        let targetUserId = ""

        // Check Profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single()

        if (profile) {
            targetUserId = profile.id
            // User exists, update password if provided
            if (password && password.trim() !== "") {
                const { error: updateAuthError } = await adminSupabase.auth.admin.updateUserById(
                    targetUserId,
                    { password: password }
                )
                if (updateAuthError) {
                    return { success: false, error: `パスワード更新失敗: ${updateAuthError.message}` }
                }
            }
        } else {
            // User likely doesn't exist (or profile missing).
            // Try creating user with Admin API
            const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
                email: email,
                password: password || undefined,
                email_confirm: true // Auto confirm
            })

            if (createError) {
                return { success: false, error: `ユーザー作成失敗: ${createError.message}` }
            }

            if (!newUser.user) {
                return { success: false, error: "ユーザー作成に失敗しました (User object missing)" }
            }
            targetUserId = newUser.user.id
        }

        // 2. Update role (Upserting to ensure Profile exists)
        const { error: updateError } = await supabase
            .from('profiles')
            .upsert({
                id: targetUserId,
                email: email,
                role: 'PROVIDER_ADMIN'
            })

        if (updateError) return { success: false, error: `権限付与失敗: ${updateError.message}` }

        // 3. Audit Log
        try {
            await supabase.from('audit_logs').insert({
                actor_id: user.id,
                target_user_id: targetUserId,
                action: 'GRANT_PROVIDER_ADMIN',
                details: { target_email: email, password_set: !!password }
            })
        } catch (auditError) {
            console.error("Audit Log Error:", auditError)
        }

        return { success: true }
    } catch (error: any) {
        console.error("AssignProviderAdmin Error:", error)
        return { success: false, error: error.message || "予期せぬエラーが発生しました (Server)" }
    }
}

export async function removeProviderAdminAction(targetUserId: string) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isProviderAdmin(user.id))) {
        return { success: false, error: "権限がありません: プロバイダー権限が必要です" }
    }

    if (user.id === targetUserId) {
        return { success: false, error: "自分自身の権限を削除することはできません" }
    }

    const { error } = await supabase
        .from('profiles')
        .update({ role: null }) // Or whatever default role is appropriate, null implies no specific administrative role
        .eq('id', targetUserId)

    if (error) return { success: false, error: error.message }

    // Audit Log
    try {
        await supabase.from('audit_logs').insert({
            actor_id: user.id,
            target_user_id: targetUserId,
            action: 'REVOKE_PROVIDER_ADMIN',
            details: {}
        })
    } catch (auditError) {
        console.error("Audit Log Error:", auditError)
    }

    return { success: true }
}

export async function adminResetUserPasswordAction(targetEmail: string, newPassword: string) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isProviderAdmin(user.id))) {
        return { success: false, error: "権限がありません: プロバイダー権限が必要です" }
    }

    /*
     * Password Strength Validation (Basic)
     * You might want to enforce stronger rules here
     */
    if (!newPassword || newPassword.length < 6) {
        return { success: false, error: "パスワードは6文字以上である必要があります" }
    }

    try {
        const adminSupabase = getServiceSupabase()

        // 1. Find user by email
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', targetEmail)
            .maybeSingle()

        if (profileError) {
            return { success: false, error: `ユーザー検索エラー: ${profileError.message}` }
        }

        if (!profile) {
            return { success: false, error: "ユーザーが見つかりません" }
        }

        // 2. Update Password
        const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
            profile.id,
            { password: newPassword }
        )

        if (updateError) {
            return { success: false, error: `パスワードリセット失敗: ${updateError.message}` }
        }

        // 3. Audit Log
        try {
            await supabase.from('audit_logs').insert({
                actor_id: user.id,
                target_user_id: profile.id,
                action: 'FORCE_PASSWORD_RESET',
                details: { target_email: targetEmail }
            })
        } catch (auditError) {
            console.error("Audit Log Error:", auditError)
        }

        return { success: true }

    } catch (error: any) {
        console.error("AdminResetPassword Error:", error)
        return { success: false, error: error.message || "予期せぬエラーが発生しました" }
    }
}

export async function getAllUsersAction() {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isProviderAdmin(user.id))) {
        return { success: false, error: "権限がありません: プロバイダー権限が必要です" }
    }

    // Fetch profiles sorted by created_at desc
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true, users: data }
}

export async function deleteUserAction(targetUserId: string) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isProviderAdmin(user.id))) {
        return { success: false, error: "権限がありません: プロバイダー権限が必要です" }
    }

    if (user.id === targetUserId) {
        return { success: false, error: "自分自身を削除することはできません" }
    }

    try {
        const adminSupabase = getServiceSupabase()

        // 1. Delete User from Auth
        const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(targetUserId)

        if (deleteError) {
            return { success: false, error: `ユーザー削除失敗: ${deleteError.message}` }
        }

        // 2. Audit Log
        try {
            await supabase.from('audit_logs').insert({
                actor_id: user.id,
                target_user_id: targetUserId,
                action: 'DELETE_USER',
                details: {}
            })
        } catch (auditError) {
            console.error("Audit Log Error:", auditError)
        }

        return { success: true }
    } catch (error: any) {
        console.error("DeleteUser Error:", error)
        return { success: false, error: error.message || "予期せぬエラーが発生しました" }
    }
}

// --- System Settings (Global Config) ---

export async function getSystemSettingsAction() {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isProviderAdmin(user.id))) {
        return { success: false, error: "権限がありません" }
    }

    const { data, error } = await supabase
        .from('system_settings')
        .select('*')

    if (error) {
        // If table doesn't exist yet, return empty but no error
        if (error.code === '42P01') {
            return { success: true, settings: {} }
        }
        return { success: false, error: error.message }
    }

    // Convert array to object
    const settings: Record<string, string> = {}
    data?.forEach((item: any) => {
        settings[item.key] = item.value
    })

    return { success: true, settings }
}

export async function updateSystemSettingsAction(settings: Record<string, string>) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isProviderAdmin(user.id))) {
        return { success: false, error: "権限がありません" }
    }

    const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString()
    }))

    const { error } = await supabase
        .from('system_settings')
        .upsert(updates)

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

export async function checkSystemKeyAvailabilityAction() {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { available: false }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) return { available: false }

    const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey,
        { auth: { persistSession: false } }
    )

    const { data } = await adminSupabase
        .from('system_settings')
        .select('key')
        .eq('key', 'openai_api_key')
        .single()

    return { available: !!data }
}
