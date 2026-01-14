import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { session } } = await supabase.auth.getSession()

    // Protect /dashboard routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        // Bypass for Demo Mode
        const demoMode = request.cookies.get('demo_mode')?.value === 'true'
        if (demoMode) {
            return NextResponse.next()
        }

        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Check Profile & Role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

        // If no profile exists, it might be a new user (trigger should handle it, but race condition possible)
        // For now, allow access but maybe redirect to a "setup" page if needed.
        // If we want strict RBAC, we could check role here.
        // e.g. if (request.nextUrl.pathname.startsWith('/dashboard/admin') && profile?.role !== 'PROVIDER_ADMIN') ...
    }

    // Redirect /login to /dashboard if already logged in
    if (request.nextUrl.pathname.startsWith('/login')) {
        if (session) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - auth/callback (auth callback route)
         */
        '/((?!_next/static|_next/image|favicon.ico|auth/callback).*)',
    ],
}
