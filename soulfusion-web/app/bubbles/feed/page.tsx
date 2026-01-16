// Unified Bubbles Feed - Threads-style algorithmic feed
"use client"

import { useEffect, useState, useRef } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, TrendingUp, Hash, Settings, MessageCircle, SlidersHorizontal } from "lucide-react";
import { useBubbleStore } from "@/lib/stores/bubble-store";
import { BubblePostCard } from "@/components/bubbles/bubble-post-card";
import { BubbleCreatePost } from "@/components/bubbles/bubble-create-post";
import { BubblePostModal } from "@/components/bubbles/bubble-post-modal";
import { BubblePreferencesModal } from "@/components/bubbles/bubble-preferences-modal";
import type { BubblePost } from "@/lib/services/bubble-service";
import { Bubble } from "@/lib/services/bubble-service";

export default function UnifiedBubbleFeedPage() {
  const [selectedPost, setSelectedPost] = useState<BubblePost | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showBubbleSelector, setShowBubbleSelector] = useState(false);
  const [showBubblePreferences, setShowBubblePreferences] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'trending' | 'loudest'>('feed');
  const [selectedBubbleId, setSelectedBubbleId] = useState<string | undefined>(undefined);
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    bubbles,
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
    fetchUnifiedFeed,
    fetchMoreFeed,
    fetchTrendingFeed,
    fetchLoudestFeed,
    fetchTrendingHashtags,
    fetchBubbles,
    resetFeed,
  } = useBubbleStore();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchBubbles();
      await fetchUnifiedFeed();
      await fetchTrendingHashtags();
    };

    loadInitialData();

    return () => {
      resetFeed();
    };
  }, []);

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
      fetchTrendingFeed();
    } else if (activeTab === 'loudest') {
      fetchLoudestFeed();
    }
  }, [activeTab]);

  // Reload feed when bubble filter changes
  useEffect(() => {
    if (activeTab === 'feed') {
      fetchUnifiedFeed();
    }
  }, [selectedBubbleId, feedFilter]);

  const handlePostCreated = () => {
    setShowCreatePost(false);
    fetchUnifiedFeed();
  };

  const handleBubbleSelect = (bubble: Bubble) => {
    setSelectedBubbleId(bubble.id);
    setShowBubbleSelector(false);
  };

  const currentPosts = activeTab === 'feed' ? feedPosts : activeTab === 'trending' ? trendingPosts : loudestPosts;
  const currentLoading = activeTab === 'feed' ? feedLoading : activeTab === 'trending' ? trendingLoading : loudestLoading;

  // Get visible bubbles for selector
  const visibleBubbles = bubbles.filter(b => b.is_visible !== false && b.is_hidden !== true);

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Bubbles Feed</h1>
                <p className="text-sm text-gray-500">
                  {selectedBubbleId
                    ? `Gefiltert: ${visibleBubbles.find(b => b.id === selectedBubbleId)?.name || 'Bubble'}`
                    : 'Alle deine Bubbles'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBubbleSelector(!showBubbleSelector)}
                >
                  {selectedBubbleId
                    ? visibleBubbles.find(b => b.id === selectedBubbleId)?.name || 'Filter'
                    : 'Filter'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowBubblePreferences(true)}
                  title="Bubble-Einstellungen"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
                <Button onClick={() => setShowCreatePost(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erstellen
                </Button>
              </div>
            </div>

            {/* Bubble Filter Bar */}
            {showBubbleSelector && (
              <div className="mt-4 flex flex-wrap gap-2 pb-2 border-b">
                <Button
                  variant={!selectedBubbleId ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedBubbleId(undefined)}
                >
                  Alle
                </Button>
                {visibleBubbles.map((bubble) => (
                  <Button
                    key={bubble.id}
                    variant={selectedBubbleId === bubble.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleBubbleSelect(bubble)}
                  >
                    <span className="mr-1">{bubble.icon}</span>
                    {bubble.name}
                  </Button>
                ))}
              </div>
            )}
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
                    <button
                      key={tag.hashtag}
                      className="block text-sm text-gray-600 hover:text-primary transition-colors w-full text-left"
                      onClick={() => {/* TODO: Implement hashtag search */}}
                    >
                      #{tag.hashtag}
                    </button>
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
                <p>Noch keine Beiträge.</p>
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
          {activeTab === 'feed' && feedHasMore && (
            <div ref={observerTarget} className="py-8 text-center text-gray-500">
              {feedLoading ? 'Lade mehr...' : 'Scroll für mehr'}
            </div>
          )}
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <BubbleCreatePost
            bubbleId={currentBubble?.id || bubbles[0]?.id || ''}
            allowBubbleSelection={true}
            onClose={() => setShowCreatePost(false)}
            onPostCreated={handlePostCreated}
          />
        )}

        {/* Bubble Preferences Modal */}
        {showBubblePreferences && (
          <BubblePreferencesModal
            onClose={() => setShowBubblePreferences(false)}
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
