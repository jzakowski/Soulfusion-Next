import { redirect } from 'next/navigation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function MagicPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>
}) {
  const params = await searchParams
  const token = params.token
  const email = params.email

  if (!token || !email) {
    redirect('/?error=invalid_magic_link')
  }

  // Redirect to login page with params for verification
  redirect(`/auth/login?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)
}
