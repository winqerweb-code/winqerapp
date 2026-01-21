import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const cookieStore = cookies()
        const supabase = createServerClient(
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
                        cookieStore.delete({ name, ...options })
                    },
                },
            }
        )

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Save Google Access Token to Cookie for Server Actions
            const providerToken = data.session?.provider_token
            if (providerToken) {
                cookieStore.set('google_access_token', providerToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 60 * 60 // 1 hour
                })
            }

            // Save Google Refresh Token to Cookie (if available, mostly on first login)
            const refreshToken = data.session?.provider_refresh_token
            if (refreshToken) {
                console.log("Saving Google Refresh Token to Cookie")
                cookieStore.set('google_refresh_token', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 30 // 30 days
                })
            }

            // Check Role for Redirect
            const { data: { user } } = await supabase.auth.getUser()
            let redirectUrl = next

            if (user) {
                // Determine Role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                // If not Provider Admin, force redirect to Stores Hub
                // (e.g. Client Admin, Store Admin, Viewer)
                if (profile?.role !== 'PROVIDER_ADMIN') {
                    redirectUrl = '/dashboard/stores'
                }
            }

            return NextResponse.redirect(`${origin}${redirectUrl}`)
        } else {
            console.error('Auth Callback Error:', error)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
