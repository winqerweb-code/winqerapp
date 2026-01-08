import { SupabaseClient } from "@supabase/supabase-js"
import { getSupabase } from "@/lib/supabase-server"

export type UserRole = 'PROVIDER_ADMIN' | 'CLIENT_ADMIN'
export type StoreRole = 'STORE_ADMIN' | 'STORE_VIEWER'

export interface UserProfile {
    id: string
    email: string
    role: UserRole
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
    const supabase = await getSupabase()
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error || !data) return null
    return data as UserProfile
}

export async function isProviderAdmin(userId: string): Promise<boolean> {
    const profile = await getProfile(userId)
    return profile?.role === 'PROVIDER_ADMIN'
}

export async function verifyStoreAccess(userId: string, storeId: string): Promise<{ hasAccess: boolean, role?: StoreRole }> {
    // 1. Check if Provider Admin (Global Access)
    if (await isProviderAdmin(userId)) {
        return { hasAccess: true, role: 'STORE_ADMIN' }
    }

    // 2. Check Assignment
    const supabase = await getSupabase()
    const { data, error } = await supabase
        .from('store_assignments')
        .select('role')
        .eq('user_id', userId)
        .eq('store_id', storeId)
        .single()

    if (error || !data) {
        return { hasAccess: false }
    }

    return { hasAccess: true, role: data.role as StoreRole }
}

export async function getAssignedStores(userId: string) {
    const supabase = await getSupabase()

    // If Provider, return all stores
    if (await isProviderAdmin(userId)) {
        const { data } = await supabase.from('stores').select('*')
        return data || []
    }

    // If Client, return assigned stores
    // Since RLS is enabled on 'stores' table with a policy checking 'store_assignments',
    // we can just select * from stores. The RLS will filter it automatically.
    const { data, error } = await supabase
        .from('stores')
        .select('*')

    if (error) {
        console.error("Error fetching assigned stores:", error)
        return []
    }

    return data || []
}
