// Bubble Post Modal - Quick popup for post details
"use client"

import { useState, useEffect } from "react";
import { X, Heart, MessageCircle, Share2, Send, Flag, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useBubbleStore } from "@/lib/stores/bubble-store";
import type { BubblePost, BubbleComment } from "@/lib/services/bubble-service";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface BubblePostModalProps {
  post: BubblePost;
  onClose: () => void;
}

export function BubblePostModal({ post, onClose }: BubblePostModalProps) {
  const {
    fetchComments,
    createComment,
    toggleLike,
    reportPost,
    requestAnonymousChat,
  } = useBubbleStore();

  const [comments, setComments] = useState<BubbleComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isAnonymousComment, setIsAnonymousComment] = useState(false);
  const [replyTo, setReplyTo] = useState<BubbleComment | null>(null);

  useEffect(() => {
    loadComments();
  }, [post.id]);

  const loadComments = async () => {
    setCommentsLoading(true);
    try {
      const fetchedComments = await fetchComments(post.id);
      setComments(fetchedComments);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    await createComment(
      post.id,
      newComment.trim(),
      isAnonymousComment,
      replyTo?.id
    );

    setNewComment("");
    setReplyTo(null);
    loadComments();
  };

  const displayName = post.is_anonymous ? post.display_name_safe : post.display_name;
  const avatarUrl = post.is_anonymous ? null : post.avatar_url_safe || post.avatar_url;
  const avatarFallback = displayName?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white rounded-full p-2"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Side - Media */}
        <div className="md:w-1/2 bg-black flex items-center justify-center">
          {post.media_urls && post.media_urls.length > 0 ? (
            <img
              src={post.media_urls[0]}
              alt="Post content"
              className="max-w-full max-h-[90vh] object-contain"
            />
          ) : (
            <div className="p-8 text-center text-white">
              <p className="text-lg">{post.content}</p>
            </div>
          )}
        </div>

        {/* Right Side - Details */}
        <div className="md:w-1/2 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b">
            <Avatar className="h-10 w-10">
              {avatarUrl ? <AvatarImage src={avatarUrl} /> : null}
              <AvatarFallback className={post.is_anonymous ? 'bg-gray-200' : undefined}>
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">
                {displayName}
                {post.is_anonymous && (
                  <span className="ml-2 text-xs text-gray-500">(anonym)</span>
                )}
              </p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: de,
                })}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Content & Comments Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Content */}
            <div>
              <p className="text-sm whitespace-pre-wrap">{post.content}</p>

              {/* Hashtags */}
              {post.hashtags && post.hashtags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {post.hashtags.map((tag) => (
                    <span key={tag} className="text-xs text-primary hover:underline">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Location */}
              {post.location_name && (
                <p className="mt-2 text-xs text-gray-500">📍 {post.location_name}</p>
              )}
            </div>

            {/* Engagement Stats */}
            <div className="text-xs text-gray-500">
              {post.like_count > 0 && <span>{post.like_count} Likes</span>}
              {(post.like_count > 0 && post.comment_count > 0) && <span> • </span>}
              {post.comment_count > 0 && <span>{post.comment_count} Kommentare</span>}
            </div>

            {/* Comments */}
            {commentsLoading ? (
              <p className="text-sm text-gray-500">Lade Kommentare...</p>
            ) : comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((comment) => {
                  const commentDisplayName = comment.is_anonymous
                    ? comment.display_name_safe
                    : comment.display_name;
                  const commentAvatarUrl = comment.is_anonymous
                    ? null
                    : comment.avatar_url_safe || comment.avatar_url;
                  const commentAvatarFallback = commentDisplayName?.charAt(0)?.toUpperCase() || '?';

                  return (
                    <div key={comment.id} className="flex gap-2">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        {commentAvatarUrl ? (
                          <AvatarImage src={commentAvatarUrl} />
                        ) : null}
                        <AvatarFallback className={comment.is_anonymous ? 'bg-gray-200' : undefined}>
                          {commentAvatarFallback}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-xs">
                            {commentDisplayName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.created_at), {
                              addSuffix: true,
                              locale: de,
                            })}
                          </p>
                        </div>
                        <p className="text-sm">{comment.content}</p>

                        {/* Reply button for comments (could be expanded) */}
                        <button
                          onClick={() => setReplyTo(comment)}
                          className="text-xs text-gray-500 hover:text-primary mt-1"
                        >
                          Antworten
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Noch keine Kommentare. Sei der Erste!</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 p-4 border-t">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleLike(post.id)}
              className={post.liked_by_user ? 'text-red-500' : ''}
            >
              <Heart className={`h-6 w-6 ${post.liked_by_user ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon">
              <MessageCircle className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => reportPost(post.id, 'user reported')}>
              <Flag className="h-6 w-6" />
            </Button>

            {/* Anonymous Chat Button */}
            {post.is_anonymous && (
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => {
                  const anonymousId = post.anonymous_id;
                  if (anonymousId) {
                    requestAnonymousChat(post.id, anonymousId).then(result => {
                      window.location.href = `/chats/${result.chat_id}`;
                    });
                  }
                }}
              >
                Chat
              </Button>
            )}
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t space-y-2">
            {replyTo && (
              <div className="flex items-center justify-between bg-gray-100 rounded p-2 text-xs">
                <span>Antwort an {replyTo.display_name_safe || replyTo.display_name}</span>
                <button onClick={() => setReplyTo(null)} className="text-gray-500">×</button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Switch
                checked={isAnonymousComment}
                onCheckedChange={setIsAnonymousComment}
                id="anon-comment"
              />
              <label htmlFor="anon-comment" className="text-xs text-gray-500">
                Anonym
              </label>
            </div>

            <div className="flex gap-2">
              <Textarea
                placeholder="Kommentieren..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="resize-none flex-1"
              />
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                size="icon"
                className="self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
