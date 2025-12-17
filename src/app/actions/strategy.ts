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

export async function saveStrategy(storeId: string, inputData: any, outputData: any) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // Verify store ownership
    const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('id', storeId)
        .eq('user_id', user.id)
        .single()

    if (storeError || !store) {
        return { success: false, error: 'Store not found or unauthorized' }
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

    // Verify store ownership (implicitly handled by RLS, but good to be explicit or rely on RLS)
    // Here we rely on RLS policies defined in the migration

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
