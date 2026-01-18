import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const response = NextResponse.next()

    // Security Headers
    // Prevent XSS attacks
    response.headers.set('X-Content-Type-Options', 'nosniff')

    // Prevent Clickjacking
    response.headers.set('X-Frame-Options', 'DENY')

    // Control Referrer Information
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Optional: Strict Transport Security (HSTS) - Vercel handles this automatically for .app domains, good to have explicit
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')

    return response
}

export const config = {
    matcher: '/:path*',
}
