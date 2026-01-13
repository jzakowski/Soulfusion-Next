import { redirect } from 'next/navigation'

export default async function MagicPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>
}) {
  const { token, email } = await searchParams

  // Redirect if no token or email
  if (!token || !email) {
    redirect('/?error=invalid_magic_link')
  }

  // Redirect to login page with params for verification
  // The login page will verify the magic link with the backend
  redirect(`/auth/login?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)
}
