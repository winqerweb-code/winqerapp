import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    let dbCheck = { success: false, error: null as any }

    if (url && key) {
        try {
            const supabase = createClient(url, key, {
                auth: { persistSession: false, autoRefreshToken: false }
            })

            // Try to select count to verify connection & permission
            const { count, error } = await supabase
                .from('daily_analytics_cache')
                .select('*', { count: 'exact', head: true })

            if (error) {
                dbCheck.error = error
            } else {
                dbCheck.success = true
                dbCheck.error = `Connection OK. Row Count: ${count}`
            }

        } catch (e: any) {
            dbCheck.error = e.message
        }
    }

    return NextResponse.json({
        env: {
            NEXT_PUBLIC_SUPABASE_URL: !!url,
            SUPABASE_SERVICE_ROLE_KEY: !!key ? `Present (Starts with ${key.substring(0, 5)}...)` : 'MISSING',
            KEY_LENGTH: key ? key.length : 0
        },
        dbConnection: dbCheck
    })
}
