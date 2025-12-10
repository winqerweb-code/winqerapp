'use server'

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Store } from '@/types/store'

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

export async function getStore(id: string) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id) // Security: Ensure user owns the store
        .single()

    if (error || !data) {
        console.error('Failed to fetch store:', error)
        return { success: false, error: 'Store not found' }
    }

    return { success: true, store: data as Store }
}

export async function updateStore(id: string, data: Partial<Store>) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    const { data: updatedStore, error } = await supabase
        .from('stores')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id) // Security: Ensure user owns the store
        .select()
        .single()

    if (error) {
        console.error('Failed to update store:', error)
        return { success: false, error: 'Failed to update store' }
    }

    return { success: true, store: updatedStore as Store }
}

export async function getStores() {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id) // Security: Fetch only user's stores
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Failed to fetch stores:', error)
        return { success: false, stores: [] }
    }

    return { success: true, stores: data as Store[] }
}

export async function createStore(data: Omit<Store, 'id' | 'created_at' | 'user_id'>) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    const newStore = {
        ...data,
        user_id: user.id,
        // id and created_at are handled by DB default if configured, 
        // but let's assume we might need to pass them or let DB handle it.
        // If DB handles id (uuid) and created_at, we don't send them.
        // Assuming 'stores' table has defaults.
    }

    const { data: createdStore, error } = await supabase
        .from('stores')
        .insert(newStore)
        .select()
        .single()

    if (error) {
        console.error('Failed to create store:', error)
        return { success: false, error: 'Failed to create store' }
    }

    return { success: true, store: createdStore as Store }
}
