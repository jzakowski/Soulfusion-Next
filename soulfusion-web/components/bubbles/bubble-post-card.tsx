// Bubble Post Card - Instagram-style post card
"use client"

import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, MoreHorizontal, Flag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import type { BubblePost } from "@/lib/services/bubble-service";
import { useBubbleStore } from "@/lib/stores/bubble-store";

interface BubblePostCardProps {
  post: BubblePost;
  onClick?: () => void;
}

export function BubblePostCard({ post, onClick }: BubblePostCardProps) {
  const { toggleLike, reportPost } = useBubbleStore();

  const [imageIndex, setImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Handle swipe/dot navigation for multiple images
  const images = useMemo(() => {
    if (!post.media_urls || post.media_urls.length === 0) return [];
    return post.media_urls.filter(url => url && (url.includes('jpg') || url.includes('jpeg') || url.includes('png') || url.includes('gif') || url.includes('webp')));
  }, [post.media_urls]);

  const displayName = post.is_anonymous ? post.display_name_safe : post.display_name;
  const avatarUrl = post.is_anonymous ? null : post.avatar_url_safe || post.avatar_url;
  const avatarFallback = displayName?.charAt(0)?.toUpperCase() || '?';

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleLike(post.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: 'Post von Soulfusion Bubbles',
        text: post.content,
        url: window.location.href,
      });
    }
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    const reason = prompt('Warum möchtest du diesen Post melden?');
    if (reason) {
      reportPost(post.id, reason);
    }
  };

  const hasNextImage = imageIndex < images.length - 1;
  const hasPrevImage = imageIndex > 0;

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      {/* Header - User Info */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={displayName} />
            ) : null}
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
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: de,
                })}
              </p>
              {/* Bubble Tag */}
              {post.bubble_name && (
                <>
                  <span className="text-gray-300">•</span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: post.bubble_color || '#6366f1' }}
                  >
                    {post.bubble_icon || ''} {post.bubble_name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleReport(e); }}>
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Content - TEXT ON TOP (Instagram/Jodel hybrid) */}
      <div className="p-4">
        <p className="text-sm whitespace-pre-wrap">{post.content}</p>

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {post.hashtags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-primary hover:underline"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Media - Swipeable Images */}
      {images.length > 0 && (
        <div
          className="relative bg-black aspect-square"
          onClick={(e) => {
            e.stopPropagation();
            if (hasNextImage) setImageIndex(imageIndex + 1);
            else setImageIndex(0); // Loop back to start
          }}
        >
          {!imageError ? (
            <img
              src={images[imageIndex]}
              alt={`Post ${imageIndex + 1}`}
              className="w-full h-full object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              Bild nicht verfügbar
            </div>
          )}

          {/* Navigation Arrows */}
          {hasPrevImage && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setImageIndex(imageIndex - 1);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
            >
              ←
            </button>
          )}
          {hasNextImage && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setImageIndex(imageIndex + 1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
            >
              →
            </button>
          )}

          {/* Image Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === imageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-4 p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLike}
          className={post.liked_by_user ? 'text-red-500' : ''}
        >
          <Heart
            className={`h-6 w-6 ${post.liked_by_user ? 'fill-current' : ''}`}
          />
        </Button>
        <Button variant="ghost" size="icon">
          <MessageCircle className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleShare}>
          <Share2 className="h-6 w-6" />
        </Button>
      </div>

      {/* Engagement Counts */}
      <div className="px-4 pb-2">
        {post.like_count > 0 && (
          <p className="text-sm font-semibold">
            {post.like_count.toLocaleString()} {post.like_count === 1 ? 'Like' : 'Likes'}
          </p>
        )}
        {post.comment_count > 0 && (
          <p className="text-sm text-gray-500">
            {post.comment_count.toLocaleString()} {post.comment_count === 1 ? 'Kommentar' : 'Kommentare'}
          </p>
        )}
      </div>

      {/* Location (if any) */}
      {post.location_name && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500">📍 {post.location_name}</p>
        </div>
      )}
    </Card>
  );
}
