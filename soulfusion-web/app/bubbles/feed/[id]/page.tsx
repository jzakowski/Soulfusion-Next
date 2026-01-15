"use client"

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Heart, MessageCircle, Share2, TrendingUp, Hash, Filter } from "lucide-react";
import Link from "next/link";
import { useBubbleStore } from "@/lib/stores/bubble-store";
import { BubblePostCard } from "@/components/bubbles/bubble-post-card";
import { BubbleCreatePost } from "@/components/bubbles/bubble-create-post";
import { BubblePostModal } from "@/components/bubbles/bubble-post-modal";
import type { BubblePost } from "@/lib/services/bubble-service";

export default function BubbleFeedPage() {
  const params = useParams();
  const router = useRouter();
  const bubbleId = params.id as string;

  const [selectedPost, setSelectedPost] = useState<BubblePost | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'trending' | 'loudest'>('feed');
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    currentBubble,
    feedPosts,
    feedLoading,
    feedFilter,
    feedHasMore,
    trendingPosts,
    trendingLoading,
    loudestPosts,
    loudestLoading,
    trendingHashtags,
    setFeedFilter,
    setCurrentBubble,
    fetchFeed,
    fetchMoreFeed,
    fetchTrendingFeed,
    fetchLoudestFeed,
    fetchTrendingHashtags,
    resetFeed,
  } = useBubbleStore();

  // Load bubble and feed on mount
  useEffect(() => {
    const loadInitialData = async () => {
      // Fetch bubble details
      const bubble = await fetch(`/api/bubbles/${bubbleId}`).then(r => r.json()).catch(() => null);
      if (bubble) {
        setCurrentBubble(bubble);
      }

      // Fetch feed
      await fetchFeed(bubbleId);

      // Fetch trending hashtags
      await fetchTrendingHashtags();
    };

    loadInitialData();

    return () => {
      resetFeed();
    };
  }, [bubbleId]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && feedHasMore && !feedLoading) {
          fetchMoreFeed();
        }
      },
      { threshold: 1.0 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [feedHasMore, feedLoading, fetchMoreFeed]);

  // Load trending/loudest when tab changes
  useEffect(() => {
    if (activeTab === 'trending') {
      fetchTrendingFeed(bubbleId);
    } else if (activeTab === 'loudest') {
      fetchLoudestFeed(bubbleId);
    }
  }, [activeTab, bubbleId]);

  const handlePostCreated = () => {
    setShowCreatePost(false);
    fetchFeed(bubbleId);
  };

  const currentPosts = activeTab === 'feed' ? feedPosts : activeTab === 'trending' ? trendingPosts : loudestPosts;
  const currentLoading = activeTab === 'feed' ? feedLoading : activeTab === 'trending' ? trendingLoading : loudestLoading;

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/bubbles">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              {currentBubble && (
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-3xl">{currentBubble.icon}</span>
                  <div>
                    <h1 className="text-xl font-bold">{currentBubble.name}</h1>
                    <p className="text-sm text-gray-500">
                      {currentBubble.member_count.toLocaleString()} Mitglieder
                    </p>
                  </div>
                </div>
              )}
              <Button onClick={() => setShowCreatePost(true)}>
                Erstellen
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('feed')}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'feed'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Feed
              </button>
              <button
                onClick={() => setActiveTab('trending')}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-1 ${
                  activeTab === 'trending'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Trending
              </button>
              <button
                onClick={() => setActiveTab('loudest')}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'loudest'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Loud
              </button>
            </div>

            {/* Filter for feed tab */}
            {activeTab === 'feed' && (
              <div className="flex gap-2 pb-3">
                <Button
                  variant={feedFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFeedFilter('all')}
                >
                  Alle
                </Button>
                <Button
                  variant={feedFilter === 'friends' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFeedFilter('friends')}
                >
                  Freunde
                </Button>
                <Button
                  variant={feedFilter === 'anonymous' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFeedFilter('anonymous')}
                >
                  Anonym
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Trending Hashtags Sidebar (visible on desktop) */}
        {trendingHashtags.length > 0 && (
          <div className="hidden md:block fixed right-4 top-24 w-64">
            <Card>
              <CardContent className="p-4">
                <h3 className="flex items-center gap-2 font-semibold mb-3">
                  <Hash className="h-4 w-4 text-primary" />
                  Trending Hashtags
                </h3>
                <div className="space-y-2">
                  {trendingHashtags.slice(0, 5).map((tag) => (
                    <Link
                      key={tag.hashtag}
                      href={`/bubbles/feed/${bubbleId}?hashtag=${tag.hashtag}`}
                      className="block text-sm text-gray-600 hover:text-primary transition-colors"
                    >
                      #{tag.hashtag}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feed */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          {currentLoading && currentPosts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                Lade Beiträge...
              </CardContent>
            </Card>
          ) : currentPosts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <MessageCircle className="mx-auto mb-4 h-12 w-12" />
                <p>Noch keine Beiträge in dieser Bubble.</p>
                <p>Sei der Erste!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {currentPosts.map((post) => (
                <BubblePostCard
                  key={post.id}
                  post={post}
                  onClick={() => setSelectedPost(post)}
                />
              ))}
            </div>
          )}

          {/* Infinite scroll sentinel */}
          {feedHasMore && (
            <div ref={observerTarget} className="py-8 text-center text-gray-500">
              {feedLoading ? 'Lade mehr...' : 'Scroll für mehr'}
            </div>
          )}
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <BubbleCreatePost
            bubbleId={bubbleId}
            onClose={() => setShowCreatePost(false)}
            onPostCreated={handlePostCreated}
          />
        )}

        {/* Post Detail Modal */}
        {selectedPost && (
          <BubblePostModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
          />
        )}
      </div>
    </AppLayout>
  );
}
