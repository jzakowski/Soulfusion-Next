"use client"

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePostsStore } from "@/lib/stores/posts-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUIStore } from "@/lib/stores/ui-store";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Send,
  ArrowLeft,
  Loader2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Comment } from "@/types/features/post";

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { likePost, savePost, addComment } = usePostsStore();
  const { addToast } = useUIStore();
  const [postId, setPostId] = useState<string | null>(null);

  useEffect(() => {
    params.then(p => setPostId(p.id));
  }, [params]);

  if (!postId) {
    return (
      <AppLayout>
        <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const { fetchPost: getPost } = usePostsStore.getState();
      const postData = await getPost(postId);
      setPost(postData);
    } catch (error) {
      addToast({
        message: "Fehler beim Laden des Beitrags",
        variant: "error",
      });
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    likePost(post.id);
    setPost((prev: any) => ({
      ...prev,
      is_liked_by_me: !prev.is_liked_by_me,
      likes_count: prev.is_liked_by_me ? prev.likes_count - 1 : prev.likes_count + 1,
    }));
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    savePost(post.id);
    setPost((prev: any) => ({
      ...prev,
      is_saved_by_me: !prev.is_saved_by_me,
    }));
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !isAuthenticated) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      }
      return;
    }

    setSubmittingComment(true);
    try {
      await addComment(post.id, commentText);
      setCommentText("");
      // Refresh post to get updated comments
      await fetchPost();
    } catch (error) {
      addToast({
        message: "Fehler beim Senden des Kommentars",
        variant: "error",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!post) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Beitrag nicht gefunden</p>
              <Button className="mt-4" asChild>
                <Link href="/">Zurück zur Startseite</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Beitrag</h1>
        </div>

        {/* Post */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                {post.user_display_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <CardTitle>{post.user_display_name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {post.location && ` • ${post.location}`}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {post.title && (
              <h2 className="mb-4 text-2xl font-bold">{post.title}</h2>
            )}
            {post.text && (
              <p className="mb-6 whitespace-pre-wrap text-lg">{post.text}</p>
            )}

            {/* Images */}
            {post.images?.length > 0 && (
              <div className="mb-6">
                {post.images.length === 1 && (
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    <img
                      src={post.images[0].url}
                      alt="Bild"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                {post.images.length === 2 && (
                  <div className="grid grid-cols-2 gap-2">
                    {post.images.map((image: any, index: number) => (
                      <div key={index} className="relative aspect-video overflow-hidden rounded-lg">
                        <img
                          src={image.url}
                          alt={`Bild ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                {post.images.length > 2 && (
                  <div className="grid grid-cols-2 gap-2">
                    {post.images.slice(0, 3).map((image: any, index: number) => (
                      <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
                        <img
                          src={image.url}
                          alt={`Bild ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        {index === 2 && post.images.length > 3 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold">
                            +{post.images.length - 3}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Video */}
            {post.video_url && (
              <div className="mb-6 aspect-video overflow-hidden rounded-lg bg-muted">
                <video
                  src={post.video_url}
                  controls
                  className="h-full w-full"
                />
              </div>
            )}

            {/* Audio */}
            {post.audio_url && (
              <div className="mb-6 rounded-lg bg-muted p-4">
                <audio controls className="w-full">
                  <source src={post.audio_url} type="audio/mpeg" />
                  Dein Browser unterstützt das Audio Element nicht.
                </audio>
              </div>
            )}

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary px-3 py-1 text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Bubble Badge */}
            {post.bubble_name && (
              <div className="mb-6 inline-flex rounded-full px-3 py-1 text-sm" style={{ backgroundColor: post.bubble_color }}>
                {post.bubble_name}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 border-t pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={post.is_liked_by_me ? "text-red-500" : ""}
              >
                <Heart className={`mr-2 h-5 w-5 ${post.is_liked_by_me ? "fill-current" : ""}`} />
                {post.likes_count || 0}
              </Button>
              <Button variant="ghost" size="sm">
                <MessageCircle className="mr-2 h-5 w-5" />
                {post.comments_count || 0}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className={post.is_saved_by_me ? "text-primary" : ""}
              >
                <Bookmark className={`mr-2 h-5 w-5 ${post.is_saved_by_me ? "fill-current" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle>Kommentare ({post.comments?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add Comment */}
            {isAuthenticated ? (
              <div className="mb-6 flex gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {user?.display_name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <Textarea
                    placeholder="Schreibe einen Kommentar..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <div className="mt-2 flex justify-end">
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!commentText.trim() || submittingComment}
                      size="sm"
                    >
                      {submittingComment ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Senden
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6 rounded-md bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Melde dich an, um zu kommentieren
                </p>
                <Button className="mt-2" asChild>
                  <Link href="/auth/login">Einloggen</Link>
                </Button>
              </div>
            )}

            {/* Comments List */}
            {post.comments?.length > 0 ? (
              <div className="space-y-4">
                {post.comments.map((comment: Comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {comment.user_display_name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="mb-1">
                        <span className="font-medium">{comment.user_display_name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm">{comment.text}</p>

                      {/* Comment Actions */}
                      <div className="mt-2 flex gap-2">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          <Heart className="mr-1 h-3 w-3" />
                          {comment.likes_count || 0}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          Antworten
                        </Button>
                      </div>

                      {/* Nested Replies */}
                      {(comment as any).replies && (comment as any).replies.length > 0 && (
                        <div className="mt-3 space-y-3 border-l-2 border-muted pl-4">
                          {(comment as any).replies.map((reply: any) => (
                            <div key={reply.id} className="flex gap-2">
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs">
                                {reply.user_display_name?.charAt(0)}
                              </div>
                              <div>
                                <div className="mb-1">
                                  <span className="text-sm font-medium">{reply.user_display_name}</span>
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    {new Date(reply.created_at).toLocaleDateString('de-DE', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{reply.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <MessageCircle className="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p>Noch keine Kommentare. Sei der Erste!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
