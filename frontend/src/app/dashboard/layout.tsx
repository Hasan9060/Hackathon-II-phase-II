import { SignOutButton } from '@/components/auth/SignOutButton'
import { cookies } from 'next/headers'

/**
 * Dashboard layout with header and sign-out button
 * Protected route - requires authentication
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is authenticated (has token)
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) {
    // This should be handled by middleware, but redirect as fallback
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Redirecting to signin...</p>
      </div>
    )
  }

  // Extract user email from token
  let userEmail = ''
  try {
    // Handle both real JWT (3 parts) and demo token (single base64)
    const payloadPart = token.includes('.') ? token.split('.')[1] : token
    const decoded = JSON.parse(Buffer.from(payloadPart, 'base64').toString())
    userEmail = decoded.email || ''
  } catch (err) {
    console.error('Error decoding token:', err)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Todo Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Welcome to your task manager
            </p>
          </div>
          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {userEmail}
              </span>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

