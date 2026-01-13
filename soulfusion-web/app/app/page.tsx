"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth-store"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, MessageCircle, Heart, Bookmark, User } from "lucide-react"
import { apiClient } from "@/lib/api/client"

interface Post {
  id: string
  content?: string
  text?: string
  type?: string
  author?: {
    id?: string
    display_name?: string
    avatar_url?: string
  }
  author_name?: string
  author_id?: string
  user_id?: string
  created_at?: string
  updated_at?: string
  created_date?: string
  likes_count?: number
  comments_count?: number
  is_liked?: boolean
  is_saved?: boolean
}

export default function AppPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuthStore()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect to landing if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  // Load posts
  useEffect(() => {
    if (isAuthenticated) {
      loadPosts()
    } else {
      setIsLoadingPosts(false)
    }
  }, [isAuthenticated])

  const loadPosts = async () => {
    try {
      console.log("Loading posts...")
      const response = await apiClient.getPosts()
      console.log("Posts response:", response)
      console.log("Response items:", response?.items)
      console.log("Response as array:", Array.isArray(response) ? response : "not an array")

      const postsData = response?.items || (Array.isArray(response) ? response : [])
      console.log("Final posts data:", postsData)
      console.log("Posts length:", postsData.length)
      setPosts(postsData)
    } catch (error) {
      console.error("Failed to load posts:", error)
      setError("Beiträge konnten nicht geladen werden")
    } finally {
      setIsLoadingPosts(false)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      await apiClient.likePost(postId)
      setPosts(posts.map(post =>
        post.id === postId
          ? {
              ...post,
              is_liked: !post.is_liked,
              likes_count: (post.likes_count || 0) + (post.is_liked ? -1 : 1)
            }
          : post
      ))
    } catch (error) {
      console.error("Failed to like post:", error)
    }
  }

  const handleSave = async (postId: string) => {
    try {
      await apiClient.savePost(postId)
      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, is_saved: !post.is_saved }
          : post
      ))
    } catch (error) {
      console.error("Failed to save post:", error)
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Home</h1>
          <p className="text-muted-foreground">Willkommen zurück! Hier ist dein Feed.</p>
        </div>

        {error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={loadPosts}>Erneut versuchen</Button>
            </CardContent>
          </Card>
        ) : isLoadingPosts ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Noch keine Beiträge</h3>
              <p className="mb-4 text-center text-sm text-muted-foreground">
                Sei der Erste, der etwas postet!
              </p>
              <Button onClick={() => router.push("/posts/create")}>
                Beitrag erstellen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader className="flex flex-row items-center gap-3 pb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium">
                      {post.author?.display_name || post.author_name || "Anonymous"}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {post.created_at ? new Date(post.created_at).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }) : post.updated_at ? new Date(post.updated_at).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }) : "Kein Datum"}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 whitespace-pre-wrap">{post.content || post.text || ""}</p>
                  <div className="flex items-center gap-4 border-t pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-2 ${post.is_liked ? "text-red-500" : ""}`}
                      onClick={() => handleLike(post.id)}
                    >
                      <Heart className={`h-4 w-4 ${post.is_liked ? "fill-current" : ""}`} />
                      <span>{post.likes_count || 0}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => router.push(`/beitraege/${post.id}`)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments_count || 0}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`ml-auto gap-2 ${post.is_saved ? "text-primary" : ""}`}
                      onClick={() => handleSave(post.id)}
                    >
                      <Bookmark className={`h-4 w-4 ${post.is_saved ? "fill-current" : ""}`} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
