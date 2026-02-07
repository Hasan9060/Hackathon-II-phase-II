'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { removeAuthToken } from '@/lib/auth-api'

/**
 * SignOutButton component
 * Signs the user out and redirects to signin page
 */
export function SignOutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleSignOut() {
    setIsLoading(true)

    try {
      // Remove the auth token
      removeAuthToken()

      // Redirect to signin
      router.push('/signin')
      router.refresh()
    } catch (error) {
      console.error('Sign out error:', error)
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? 'Signing out...' : 'Sign out'}
    </button>
  )
}
