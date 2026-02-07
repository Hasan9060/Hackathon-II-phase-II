import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Middleware for route protection
 * Protects /dashboard/* routes by checking authentication token
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get auth token from cookies
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  // Check if user is authenticated (has token)
  const isAuthenticated = !!token

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      // Redirect to signin if not authenticated
      const signinUrl = new URL('/signin', request.url)
      return NextResponse.redirect(signinUrl)
    }
  }

  // Redirect authenticated users away from auth pages
  if ((pathname === '/signin' || pathname === '/signup') && isAuthenticated) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: ['/dashboard/:path*', '/signin', '/signup'],
}
