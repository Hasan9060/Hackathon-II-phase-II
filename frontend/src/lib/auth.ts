/**
 * Better Auth client configuration
 * This file configures the Better Auth client for JWT-based authentication
 */

import { betterAuth } from "better-auth"
import { getAppUrl } from './utils'

/**
 * Better Auth client instance
 * Provides authentication methods for signin, signup, signout, and session management
 */
export const authClient = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET || 'dev-secret-key-change-in-production-32chars',
})

/**
 * Get the current session (server-side)
 * Use this in Server Components to get the authenticated user
 */
export async function getSession() {
  try {
    const { headers } = await import('next/headers')
    const cookieStore = await headers()

    const session = await authClient.api.getSession({
      headers: {
        cookie: cookieStore.get('cookie') || ''
      }
    })
    return session
  } catch {
    return null
  }
}
