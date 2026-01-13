import { redirect } from 'next/navigation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function MagicPage({
  searchParams,
}: {
  searchParams: { token?: string; email?: string }
}) {
  const token = searchParams.token
  const email = searchParams.email

  if (!token || !email) {
    redirect('/?error=invalid_magic_link')
  }

  // Redirect to login page with params for verification
  redirect(`/auth/login?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)
}
