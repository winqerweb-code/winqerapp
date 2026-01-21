'use server'

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Helper to get Supabase Server Client
async function getSupabase() {
    const cookieStore = cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    cookieStore.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    cookieStore.set({ name, value: '', ...options })
                },
            },
        }
    )
}

import { verifyStoreAccess, isProviderAdmin } from '@/lib/rbac'

export async function saveStrategy(storeId: string, inputData: any, outputData: any) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // RBAC Check (Only Provider Admin can update strategy currently, matching UI)
    // If we want Store Admin to update, we can check role === 'STORE_ADMIN'
    const { hasAccess } = await verifyStoreAccess(user.id, storeId)
    const isProvider = await isProviderAdmin(user.id)

    // Strict: Only Provider Admin can save strategy
    if (!hasAccess || !isProvider) {
        return { success: false, error: 'Unauthorized: Only Provider Admin can update strategy' }
    }

    // Upsert strategy
    const { data, error } = await supabase
        .from('strategies')
        .upsert(
            {
                store_id: storeId,
                input_data: inputData,
                output_data: outputData,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'store_id' }
        )
        .select()
        .single()

    if (error) {
        console.error('Failed to save strategy:', error)
        return { success: false, error: error.message }
    }

    return { success: true, strategy: data }
}

export async function getStrategy(storeId: string) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // RBAC Check (View access)
    // verifyStoreAccess returns true for Provider Admin OR Assigned User
    const { hasAccess } = await verifyStoreAccess(user.id, storeId)

    if (!hasAccess) {
        return { success: false, error: 'Unauthorized: Access Denied' }
    }

    const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('store_id', storeId)
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            // No rows found
            return { success: true, strategy: null }
        }
        console.error('Failed to fetch strategy:', error)
        return { success: false, error: 'Failed to fetch strategy' }
    }

    return { success: true, strategy: data }
}

// Internal helper to get Service Role client for bypass
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
        console.error("Missing Admin Credentials:", { url: !!url, key: !!key })
        return null
    }

    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}

// Special fetcher for generation that bypasses RLS if standard fetch fails
// This is secure because we verify Store Access first using standard user auth
export async function getStrategyForGeneration(storeId: string) {
    console.log(`[getStrategyForGeneration] Starting for storeId: ${storeId}`)
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        console.log("[getStrategyForGeneration] No user found")
        return { success: false, error: 'Unauthorized' }
    }

    // 1. Verify Access using STANDARD client (respecting assignments)
    const { hasAccess } = await verifyStoreAccess(user.id, storeId)
    console.log(`[getStrategyForGeneration] Access check: ${hasAccess} for user ${user.email}`)

    if (!hasAccess) {
        return { success: false, error: 'Unauthorized: Access Denied' }
    }

    // 2. Try Standard Fetch first
    const { data: standardData, error: standardError } = await supabase
        .from('strategies')
        .select('*')
        .eq('store_id', storeId)
        .single()

    if (standardData) {
        console.log("[getStrategyForGeneration] Standard fetch successful")
        return { success: true, strategy: standardData }
    } else {
        console.log("[getStrategyForGeneration] Standard fetch returned empty/error:", standardError?.message)
    }

    // 3. If Standard Fetch failed (likely due to RLS), and we are Authorized (by Assignment),
    //    use Service Role to fetch the data transparently.
    const adminSupabase = getSupabaseAdmin()

    if (adminSupabase) {
        console.log("[getStrategyForGeneration] Attempting Admin Bypass...")
        const { data: adminData, error: adminError } = await adminSupabase
            .from('strategies')
            .select('*')
            .eq('store_id', storeId)
            .single()

        if (adminData) {
            console.log("[getStrategyForGeneration] Admin Bypass Successful")
            return { success: true, strategy: adminData }
        } else {
            console.error("[getStrategyForGeneration] Admin Bypass Failed:", adminError?.message)
        }
    } else {
        console.warn("[getStrategyForGeneration] Admin Client could not be created (Missing Key?)")
    }

    return { success: true, strategy: null }
}
