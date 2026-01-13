import { redirect } from 'next/navigation'

export default function MagicPage({
  searchParams,
}: {
  searchParams: { token?: string; email?: string }
}) {
  const { token, email } = searchParams

  // Redirect if no token or email
  if (!token || !email) {
    redirect('/?error=invalid_magic_link')
  }

  // Redirect to login page with params for verification
  // The login page will verify the magic link with the backend
  redirect(`/auth/login?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)
}
