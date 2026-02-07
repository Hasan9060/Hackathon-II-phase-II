/**
 * Direct API calls to FastAPI backend for authentication
 * Uses cookies for token storage (works with middleware)
 * Includes demo mode for testing without backend
 */

import { getApiBaseUrl } from './utils'

const API_BASE_URL = getApiBaseUrl()

// Demo mode - set to false to use real backend
const DEMO_MODE = false

export interface AuthResponse {
  access_token: string
  token_type: string
  user?: {
    id: string
    email: string
    name?: string
  }
}

export interface SignUpRequest {
  email: string
  password: string
  name?: string
}

// Demo user storage (for testing without backend)
const demoUsers = new Map<string, { password: string; user: any }>()

/**
 * Sign up a new user
 */
export async function signUp(data: SignUpRequest): Promise<AuthResponse> {
  // Demo mode - simulate signup
  if (DEMO_MODE) {
    console.log('Demo mode: Simulating signup for', data.email)

    // Check if user already exists
    if (demoUsers.has(data.email.toLowerCase())) {
      throw new Error('User with this email already exists')
    }

    // Create demo user
    const demoUser = {
      id: 'demo-user-' + Date.now(),
      email: data.email,
      name: data.name || '',
    }
    demoUsers.set(data.email.toLowerCase(), {
      password: data.password,
      user: demoUser,
    })

    // Create demo token
    const demoToken = btoa(JSON.stringify({
      sub: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
      exp: Date.now() + 60 * 60 * 24 * 7 * 1000, // 7 days
    }))

    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:'
    const cookieAttrs = [
      `auth_token=${demoToken}`,
      'path=/',
      `max-age=${60 * 60 * 24 * 7}`,
      'SameSite=Lax',
      isSecure ? 'Secure' : '',
    ].filter(Boolean).join('; ')
    document.cookie = cookieAttrs

    return {
      access_token: demoToken,
      token_type: 'Bearer',
      user: demoUser,
    }
  }

  // Call backend API directly
  const endpoint = `${API_BASE_URL}/api/auth/signup`

  try {
    console.log('Signup request to:', endpoint)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    })

    console.log('Signup response status:', response.status)

    if (response.ok) {
      const result = await response.json()
      console.log('Signup success:', result)

      // Set the token in a cookie with proper security attributes
      if (result.access_token) {
        const isSecure = window.location.protocol === 'https:'
        const cookieAttrs = [
          `auth_token=${result.access_token}`,
          'path=/',
          `max-age=${60 * 60 * 24 * 7}`,
          'SameSite=Lax',
          isSecure ? 'Secure' : '',
        ].filter(Boolean).join('; ')
        document.cookie = cookieAttrs
        console.log('Token stored in cookie. Cookie value:', result.access_token.substring(0, 20) + '...')
      }

      return result
    }

    // Handle error response
    const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }))
    console.error('Signup error response:', errorData)

    throw new Error(errorData.detail || errorData.message || 'Failed to sign up')
  } catch (err) {
    // Network error or other issues
    if (err instanceof Error) {
      console.error('Signup error:', err.message)
      throw err
    }
    throw new Error('An unexpected error occurred')
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  // Demo mode - simulate signin
  if (DEMO_MODE) {
    console.log('Demo mode: Simulating signin for', email)

    const storedUser = demoUsers.get(email.toLowerCase())
    if (!storedUser) {
      throw new Error('Invalid email or password')
    }

    if (storedUser.password !== password) {
      throw new Error('Invalid email or password')
    }

    // Create demo token
    const demoToken = btoa(JSON.stringify({
      sub: storedUser.user.id,
      email: storedUser.user.email,
      name: storedUser.user.name,
      exp: Date.now() + 60 * 60 * 24 * 7 * 1000, // 7 days
    }))

    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:'
    const cookieAttrs = [
      `auth_token=${demoToken}`,
      'path=/',
      `max-age=${60 * 60 * 24 * 7}`,
      'SameSite=Lax',
      isSecure ? 'Secure' : '',
    ].filter(Boolean).join('; ')
    document.cookie = cookieAttrs

    return {
      access_token: demoToken,
      token_type: 'Bearer',
      user: storedUser.user,
    }
  }

  // Call backend API directly
  const endpoint = `${API_BASE_URL}/api/auth/signin`

  try {
    console.log('Signin request to:', endpoint)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email,
        password: password,
      }),
      credentials: 'include',
    })

    console.log('Signin response status:', response.status)

    if (response.ok) {
      const result = await response.json()
      console.log('Signin success:', result)

      // Set the token in a cookie with proper security attributes
      if (result.access_token) {
        const isSecure = window.location.protocol === 'https:'
        const cookieAttrs = [
          `auth_token=${result.access_token}`,
          'path=/',
          `max-age=${60 * 60 * 24 * 7}`,
          'SameSite=Lax',
          isSecure ? 'Secure' : '',
        ].filter(Boolean).join('; ')
        document.cookie = cookieAttrs
        console.log('Token stored in cookie. Cookie value:', result.access_token.substring(0, 20) + '...')
      }

      return result
    }

    // Handle error response
    const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }))
    console.error('Signin error response:', errorData)

    throw new Error(errorData.detail || errorData.message || 'Failed to sign in')
  } catch (err) {
    // Network error or other issues
    if (err instanceof Error) {
      console.error('Signin error:', err.message)
      throw err
    }
    throw new Error('An unexpected error occurred')
  }
}

/**
 * Get the auth token from cookies
 * Uses a more robust parsing method
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null

  try {
    // Parse cookies more robustly
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=')
      if (name && value !== undefined) {
        acc[name] = value
      }
      return acc
    }, {} as Record<string, string>)

    const token = cookies['auth_token']
    if (token) {
      console.log('[getAuthToken] Found token, length:', token.length)
      return token
    }
  } catch (error) {
    console.warn('[getAuthToken] Error parsing auth token from cookie:', error)
  }

  console.log('[getAuthToken] No token found')
  return null
}

/**
 * Remove the auth token (sign out)
 */
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    const isSecure = window.location.protocol === 'https:'
    const cookieAttrs = [
      'auth_token=',
      'path=/',
      'max-age=0',
      'SameSite=Lax',
      isSecure ? 'Secure' : '',
    ].filter(Boolean).join('; ')
    document.cookie = cookieAttrs
  }
}
