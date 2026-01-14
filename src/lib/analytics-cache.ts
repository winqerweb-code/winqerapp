import { createClient } from '@supabase/supabase-js'
import { SupabaseClient } from '@supabase/supabase-js'

export const VOLATILE_WINDOW_DAYS = 3
export const CACHE_TTL_MINUTES = 30

export interface DailyMetric {
    date: string
    metrics: any
    platform: 'ga4' | 'meta'
}

// Function to get Service Role Client for writing
export function getServiceSupabase() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        console.error("SUPABASE_SERVICE_ROLE_KEY is missing. Cache writes will fail.")
        return null
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

/**
 * Validates if a cache entry is fresh enough
 */
export function isCacheValid(updatedAt: string): boolean {
    const lastUpdate = new Date(updatedAt).getTime()
    const now = Date.now()
    const diffMinutes = (now - lastUpdate) / (1000 * 60)
    return diffMinutes < CACHE_TTL_MINUTES
}

/**
 * Fetch cached analytics for a date range
 * Returns a map of date -> DailyMetric
 */
export async function getCachedAnalytics(
    supabase: SupabaseClient,
    storeId: string,
    startDate: string,
    endDate: string,
    platform: 'ga4' | 'meta'
): Promise<Map<string, any>> {
    const { data, error } = await supabase
        .from('daily_analytics_cache')
        .select('*')
        .eq('store_id', storeId)
        .eq('platform', platform)
        .gte('date', startDate)
        .lte('date', endDate)

    if (error) {
        console.error('Cache Fetch Error:', error)
        return new Map() // Fail gracefully/Safe fallback (will trigger fetch)
    }

    const map = new Map()
    if (data) {
        data.forEach((row: any) => {
            map.set(row.date, row)
        })
    }
    return map
}

/**
 * Upsert metrics into cache
 * REQUIRED: Service Role Key (to bypass RLS for writes if user is viewer)
 */
export async function upsertAnalyticsCache(
    storeId: string,
    platform: 'ga4' | 'meta',
    metrics: { date: string, data: any }[]
) {
    const adminSupabase = getServiceSupabase()
    if (!adminSupabase) return

    if (metrics.length === 0) return

    const records = metrics.map(m => ({
        store_id: storeId,
        date: m.date,
        platform: platform,
        metrics: m.data,
        updated_at: new Date().toISOString() // Force update time
    }))

    const { error } = await adminSupabase
        .from('daily_analytics_cache')
        .upsert(records, {
            onConflict: 'store_id, date, platform'
        })

    if (error) {
        console.error('Cache Upsert Error:', error)
    }
}
