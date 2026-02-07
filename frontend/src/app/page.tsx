import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

/**
 * Landing page - redirects to dashboard if authenticated, otherwise to signin
 */
export default async function HomePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (token) {
    redirect('/dashboard')
  } else {
    redirect('/signin')
  }
}
