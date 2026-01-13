"use client"

import { useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { usePostsStore } from "@/lib/stores/posts-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Heart, MessageCircle, Bookmark, Share2, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const { posts, loading, fetchPosts, likePost, savePost } = usePostsStore();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLike = (postId: string) => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }
    likePost(postId);
  };

  const handleSave = (postId: string) => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }
    savePost(postId);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="mb-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-primary">Willkommen bei SoulFusion</h1>
          <p className="text-muted-foreground">
            Entdecke Events, Übernachtungen und gleichgesinnte Menschen
          </p>
        </div>

        {/* Create Post Button */}
        {isAuthenticated && (
          <div className="mb-6 flex justify-end">
            <Button asChild>
              <Link href="/posts/create">Neuer Beitrag</Link>
            </Button>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {loading && posts.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Noch keine Beiträge. Sei der Erste!</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {post.author_display_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-base">{post.author_display_name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString('de-DE')}
                        {post.location && ` • ${post.location}`}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {post.title && (
                    <h3 className="mb-3 text-xl font-semibold">{post.title}</h3>
                  )}
                  {post.text && (
                    <p className="mb-4 whitespace-pre-wrap">{post.text}</p>
                  )}

                  {/* Images */}
                  {post.images.length > 0 && (
                    <div className="mb-4 grid gap-2">
                      {post.images.slice(0, 3).map((image, index) => (
                        <div
                          key={image.url}
                          className={cn(
                            "relative overflow-hidden rounded-md",
                            post.images.length === 1
                              ? "aspect-video"
                              : post.images.length === 2
                              ? "aspect-[2/1]"
                              : "aspect-square"
                          )}
                        >
                          <Image
                            src={image.url}
                            alt={`Bild ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Video/Audio placeholders */}
                  {post.video_url && (
                    <div className="mb-4 flex aspect-video items-center justify-center rounded-md bg-muted">
                      <p className="text-sm text-muted-foreground">Video (Coming Soon)</p>
                    </div>
                  )}
                  {post.audio_url && (
                    <div className="mb-4 flex items-center gap-2 rounded-md bg-muted p-4">
                      <div className="h-8 w-8 rounded-full bg-primary/20" />
                      <p className="text-sm text-muted-foreground">Audio Nachricht</p>
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-secondary px-3 py-1 text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 border-t pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={cn(
                        "gap-2",
                        post.is_liked_by_me && "text-red-500"
                      )}
                    >
                      <Heart className={cn("h-5 w-5", post.is_liked_by_me && "fill-current")} />
                      <span>{post.likes_count}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2" asChild>
                      <Link href={`/beitraege/${post.id}`}>
                        <MessageCircle className="h-5 w-5" />
                        <span>{post.comments_count}</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSave(post.id)}
                      className={cn("gap-2", post.is_saved_by_me && "text-primary")}
                    >
                      <Bookmark className={cn("h-5 w-5", post.is_saved_by_me && "fill-current")} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Bubble Badge */}
                  {post.bubble_name && (
                    <div className="mt-4 inline-flex rounded-full px-3 py-1 text-xs" style={{ backgroundColor: post.bubble_color }}>
                      {post.bubble_name}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More */}
        {posts.length > 0 && !loading && (
          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              onClick={() => fetchPosts({ cursor: usePostsStore.getState().nextCursor || undefined })}
              disabled={!usePostsStore.getState().hasMore}
            >
              Mehr laden
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
