'use server'

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
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

import { verifyStoreAccess, getAssignedStores, isProviderAdmin } from '@/lib/rbac'

// ... (getSupabase helper remains same)

export async function getStore(id: string) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // RBAC Check
    const { hasAccess } = await verifyStoreAccess(user.id, id)
    if (!hasAccess) {
        return { success: false, error: 'Unauthorized: Access Denied' }
    }

    const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', id)
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

    // RBAC Check (Only Store Admin or Provider can update)
    const { hasAccess, role } = await verifyStoreAccess(user.id, id)
    if (!hasAccess || (role !== 'STORE_ADMIN' && !(await isProviderAdmin(user.id)))) {
        return { success: false, error: 'Unauthorized: Access Denied' }
    }

    const { data: updatedStore, error } = await supabase
        .from('stores')
        .update(data)
        .eq('id', id)
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

    // Fetch assigned stores via RBAC helper
    const stores = await getAssignedStores(user.id)

    return { success: true, stores: stores as Store[] }
}

export async function createStore(data: Omit<Store, 'id' | 'created_at' | 'user_id'>) {
    // Only Provider Admin can create stores now (via provider-actions)
    // But if we want to keep this for backward compatibility or self-serve (if allowed later):
    // For now, restrict to Provider Admin.
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isProviderAdmin(user.id))) {
        return { success: false, error: 'Unauthorized: Provider Access Required' }
    }

    const newStore = {
        ...data,
        // user_id is removed from schema, so we don't set it.
        // Assignments must be handled separately or immediately after creation.
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

export async function createStoreSelfService(data: Omit<Store, 'id' | 'created_at' | 'user_id'>) {
    const supabase = await getSupabase()

    // Debug: Check session explicitly
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
        console.error('CreateStore: Session Error:', sessionError)
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        console.error('CreateStore: Unauthorized:', userError, 'Session:', session ? 'Exists' : 'Missing')
        return { success: false, error: 'Unauthorized: ' + (userError?.message || 'No user') }
    }

    // 1. Create the store
    // Use user.id as user_id field if the schema expects it (based on types/store.ts user_id exists)
    const newStore = {
        ...data,
        user_id: user.id
    }

    const { data: createdStore, error: createError } = await supabase
        .from('stores')
        .insert(newStore)
        .select()
        .single()

    if (createError || !createdStore) {
        console.error('Failed to create store:', createError)
        return { success: false, error: 'Failed to create business' }
    }

    // 2. Assign the user as STORE_ADMIN using Admin Client (Bypass RLS)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        console.error('CreateStore: MISSING SUPABASE_SERVICE_ROLE_KEY. Cannot assign admin role.')
        await supabase.from('stores').delete().eq('id', createdStore.id)
        return { success: false, error: 'Configuration Error: Missing Service Role Key' }
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    const { error: assignError } = await supabaseAdmin
        .from('store_assignments')
        .insert({
            user_id: user.id,
            store_id: createdStore.id,
            role: 'STORE_ADMIN'
        })

    if (assignError) {
        console.error('Failed to assign admin role:', assignError)
        // Cleanup store on failure
        await supabaseAdmin.from('stores').delete().eq('id', createdStore.id)
        return { success: false, error: 'Failed to assign permissions: ' + assignError.message }
    }

    return { success: true, store: createdStore as Store }
}
