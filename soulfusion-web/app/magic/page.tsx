"use client"

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

function MagicPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    // Redirect if no token or email
    if (!token || !email) {
      router.push('/?error=invalid_magic_link')
      return
    }

    // Redirect to login page with params for verification
    router.push(`/auth/login?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)
  }, [searchParams, router])

  // Show loading while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        <p className="text-muted-foreground">Wird weitergeleitet...</p>
      </div>
    </div>
  )
}

// Wrap with Suspense to avoid useSearchParams SSR issue
export default function MagicPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <MagicPageContent />
    </Suspense>
  )
}
