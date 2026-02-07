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

    document.cookie = `auth_token=${demoToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`

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

      // Set the token in a cookie
      if (result.access_token) {
        document.cookie = `auth_token=${result.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
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

    document.cookie = `auth_token=${demoToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`

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

      // Set the token in a cookie
      if (result.access_token) {
        document.cookie = `auth_token=${result.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
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
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null

  const match = document.cookie.match(new RegExp('(^| )' + 'auth_token' + '=([^;]+)'))
  return match ? match[2] : null
}

/**
 * Remove the auth token (sign out)
 */
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    document.cookie = 'auth_token=; path=/; max-age=0'
  }
}
