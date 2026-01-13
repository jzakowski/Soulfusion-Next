"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth-store"
import { AppLayout } from "@/components/layout/app-layout"
import { Loader2, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AppPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, loadUser, logout, user } = useAuthStore()
  const [posts, setPosts] = useState<any[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasTriedAuth, setHasTriedAuth] = useState(false)
  const [isRefreshingUser, setIsRefreshingUser] = useState(false)

  // Load user from server if authenticated but no user data
  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking auth with server...", { isAuthenticated, hasUser: !!user })
      setIsRefreshingUser(true)
      try {
        await loadUser()
        console.log("User loaded successfully", { user })
      } catch (err) {
        console.log("Not authenticated", err)
      } finally {
        setHasTriedAuth(true)
        setIsRefreshingUser(false)
      }
    }
    checkAuth()
  }, [loadUser])

  // Redirect to landing if not authenticated
  useEffect(() => {
    console.log("Auth check:", { isLoading, isAuthenticated, hasTriedAuth, hasUser: !!user, userEmail: user?.email })
    if (hasTriedAuth && !isLoading && !isAuthenticated) {
      console.log("Redirecting to /")
      router.push("/")
    }
  }, [isAuthenticated, isLoading, hasTriedAuth, router, user])

  // Load posts
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Loading posts...")
      fetch("/api/beitraege", {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => {
          console.log("Posts loaded:", data)
          const items = data.items || []
          console.log("Items count:", items.length)
          setPosts(items)
          setIsLoadingPosts(false)
        })
        .catch(err => {
          console.error("Error:", err)
          setError("Fehler beim Laden")
          setIsLoadingPosts(false)
        })
    }
  }, [isAuthenticated])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  if (isLoading || isRefreshingUser) {
    return (
      <AppLayout>
        <div className="flex min-h-[50vh] items-center justify-center flex-col gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">{isLoading ? "Auth loading..." : "User loading..."}</span>
          {user && (
            <div className="text-sm text-muted-foreground">
              User: {user.email} ({user.display_name})
            </div>
          )}
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </AppLayout>
    )
  }

  if (isLoadingPosts) {
    return (
      <AppLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">Posts loading...</span>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Home</h1>
            <p className="text-muted-foreground">{posts.length} Beiträge</p>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Noch keine Beiträge</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="border rounded-lg p-4 bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm">
                      {(post.author_display_name || "A").charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{post.author_display_name || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">
                      {post.created_at ? new Date(post.created_at).toLocaleDateString("de-DE") : "Kein Datum"}
                    </p>
                  </div>
                </div>
                <p className="whitespace-pre-wrap">{post.text || ""}</p>
                <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                  <span>{post.likes_count || 0} Likes</span>
                  <span>{post.comments_count || 0} Kommentare</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
