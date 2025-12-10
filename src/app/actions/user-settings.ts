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

export async function saveMetaToken(token: string) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // Upsert the token
    const { error } = await supabase
        .from('user_settings')
        .upsert({
            user_id: user.id,
            meta_access_token: token,
            updated_at: new Date().toISOString()
        })

    if (error) {
        console.error('Failed to save meta token:', error)
        return { success: false, error: 'Failed to save token' }
    }

    return { success: true }
}

export async function getMetaToken() {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    const { data, error } = await supabase
        .from('user_settings')
        .select('meta_access_token')
        .eq('user_id', user.id)
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
        console.error('Failed to get meta token:', error)
        return { success: false, error: 'Failed to get token' }
    }

    return { success: true, token: data?.meta_access_token || null }
}
