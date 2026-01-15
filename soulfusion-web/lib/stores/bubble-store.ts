// Bubble Store - Zustand store for Bubbles feed system
import { create } from 'zustand';
import type {
  Bubble,
  BubblePost,
  BubbleComment,
  TrendingHashtag,
  FeedResponse,
} from '@/lib/services/bubble-service';
import { bubbleService } from '@/lib/services/bubble-service';

interface BubbleState {
  // Bubbles
  bubbles: Bubble[];
  currentBubble: Bubble | null;
  bubblesLoading: boolean;
  bubblesError: string | null;

  // Feed
  feedPosts: BubblePost[];
  feedFilter: 'all' | 'friends' | 'anonymous';
  feedLoading: boolean;
  feedError: string | null;
  feedHasMore: boolean;
  feedCursor: string | null;

  // Trending
  trendingPosts: BubblePost[];
  trendingLoading: boolean;

  // Loudest
  loudestPosts: BubblePost[];
  loudestLoading: boolean;

  // Hashtags
  trendingHashtags: TrendingHashtag[];

  // Post creation
  creatingPost: boolean;
}

interface BubbleStore extends BubbleState {
  // Bubbles actions
  fetchBubbles: () => Promise<void>;
  setCurrentBubble: (bubble: Bubble | null) => void;
  joinBubble: (bubbleId: string) => Promise<void>;
  leaveBubble: (bubbleId: string) => Promise<void>;

  // Feed actions
  setFeedFilter: (filter: 'all' | 'friends' | 'anonymous') => void;
  fetchFeed: (bubbleId: string, cursor?: string) => Promise<void>;
  fetchMoreFeed: () => Promise<void>;
  resetFeed: () => void;

  // Trending actions
  fetchTrendingFeed: (bubbleId: string, timeframe?: '24h' | '7d' | '30d') => Promise<void>;
  fetchLoudestFeed: (bubbleId: string) => Promise<void>;
  fetchTrendingHashtags: (timeframe?: '24h' | '7d' | '30d') => Promise<void>;

  // Post actions
  createPost: (bubbleId: string, content: string, mediaUrls: string[], isAnonymous?: boolean) => Promise<BubblePost | null>;
  updatePost: (postId: string, content: string, mediaUrls?: string[]) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;

  // Comment actions
  fetchComments: (postId: string, parentId?: string) => Promise<BubbleComment[]>;
  createComment: (postId: string, content: string, isAnonymous?: boolean, parentId?: string) => Promise<BubbleComment | undefined>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;

  // Report action
  reportPost: (postId: string, reason: string, description?: string) => Promise<void>;

  // Chat action
  requestAnonymousChat: (postId: string, anonymousId: string) => Promise<{ chat_id: string; exists: boolean }>;

  // Helpers
  updatePostInFeed: (postId: string, updates: Partial<BubblePost>) => void;
}

export const useBubbleStore = create<BubbleStore>((set, get) => ({
  // Initial state
  bubbles: [],
  currentBubble: null,
  bubblesLoading: false,
  bubblesError: null,

  feedPosts: [],
  feedFilter: 'all',
  feedLoading: false,
  feedError: null,
  feedHasMore: true,
  feedCursor: null,

  trendingPosts: [],
  trendingLoading: false,

  loudestPosts: [],
  loudestLoading: false,

  trendingHashtags: [],

  creatingPost: false,

  // ========== BUBBLES ACTIONS ==========

  fetchBubbles: async () => {
    set({ bubblesLoading: true, bubblesError: null });
    try {
      const response = await bubbleService.getBubbles();
      set({ bubbles: response.items, bubblesLoading: false });
    } catch (error) {
      set({ bubblesError: 'Failed to load bubbles', bubblesLoading: false });
    }
  },

  setCurrentBubble: (bubble) => set({ currentBubble: bubble }),

  joinBubble: async (bubbleId) => {
    await bubbleService.joinBubble(bubbleId);
    // Update bubble in list
    const { bubbles } = get();
    const updatedBubbles = bubbles.map((b) =>
      b.id === bubbleId ? { ...b, is_member: true, member_count: b.member_count + 1 } : b
    );
    set({ bubbles: updatedBubbles });
  },

  leaveBubble: async (bubbleId) => {
    await bubbleService.leaveBubble(bubbleId);
    // Update bubble in list
    const { bubbles } = get();
    const updatedBubbles = bubbles.map((b) =>
      b.id === bubbleId ? { ...b, is_member: false, member_count: b.member_count - 1 } : b
    );
    set({ bubbles: updatedBubbles });
  },

  // ========== FEED ACTIONS ==========

  setFeedFilter: (filter) => set({ feedFilter: filter, feedPosts: [], feedCursor: null }),

  fetchFeed: async (bubbleId, cursor) => {
    const { feedFilter } = get();

    // Reset if no cursor (new fetch)
    if (!cursor) {
      set({ feedPosts: [], feedCursor: null, feedHasMore: true });
    }

    set({ feedLoading: true, feedError: null });
    try {
      const response = await bubbleService.getFeed(bubbleId, feedFilter, cursor);
      const { feedPosts } = get();

      const newPosts = cursor ? [...feedPosts, ...response.items] : response.items;

      set({
        feedPosts: newPosts,
        feedCursor: response.cursor || null,
        feedHasMore: !!response.cursor,
        feedLoading: false,
      });
    } catch (error) {
      set({ feedError: 'Failed to load feed', feedLoading: false });
    }
  },

  fetchMoreFeed: async () => {
    const { feedCursor, currentBubble } = get();
    if (!feedCursor || !currentBubble || !get().feedHasMore) return;

    await get().fetchFeed(currentBubble.id, feedCursor);
  },

  resetFeed: () => set({ feedPosts: [], feedCursor: null, feedHasMore: true, feedError: null }),

  // ========== TRENDING ACTIONS ==========

  fetchTrendingFeed: async (bubbleId, timeframe = '24h') => {
    set({ trendingLoading: true });
    try {
      const response = await bubbleService.getTrendingFeed(bubbleId, timeframe);
      set({ trendingPosts: response.items, trendingLoading: false });
    } catch (error) {
      set({ trendingLoading: false });
    }
  },

  fetchLoudestFeed: async (bubbleId) => {
    set({ loudestLoading: true });
    try {
      const response = await bubbleService.getLoudestFeed(bubbleId);
      set({ loudestPosts: response.items, loudestLoading: false });
    } catch (error) {
      set({ loudestLoading: false });
    }
  },

  fetchTrendingHashtags: async (timeframe = '24h') => {
    try {
      const response = await bubbleService.getTrendingHashtags(10, timeframe);
      set({ trendingHashtags: response.items });
    } catch (error) {
      console.error('Failed to fetch trending hashtags', error);
    }
  },

  // ========== POST ACTIONS ==========

  createPost: async (bubbleId, content, mediaUrls, isAnonymous = false) => {
    set({ creatingPost: true });
    try {
      const post = await bubbleService.createPost(bubbleId, content, mediaUrls, isAnonymous);

      // Add to beginning of feed
      set((state) => ({
        feedPosts: [post, ...state.feedPosts],
        creatingPost: false,
      }));

      return post;
    } catch (error) {
      set({ creatingPost: false });
      return null;
    }
  },

  updatePost: async (postId, content, mediaUrls) => {
    try {
      const updatedPost = await bubbleService.updatePost(postId, content, mediaUrls);
      get().updatePostInFeed(postId, updatedPost);
    } catch (error) {
      console.error('Failed to update post', error);
    }
  },

  deletePost: async (postId) => {
    try {
      await bubbleService.deletePost(postId);
      set((state) => ({
        feedPosts: state.feedPosts.filter((p) => p.id !== postId),
      }));
    } catch (error) {
      console.error('Failed to delete post', error);
    }
  },

  toggleLike: async (postId) => {
    const { feedPosts } = get();
    const post = feedPosts.find((p) => p.id === postId);
    if (!post) return;

    // Optimistic update
    const wasLiked = post.liked_by_user;
    get().updatePostInFeed(postId, {
      liked_by_user: !wasLiked,
      like_count: post.like_count + (wasLiked ? -1 : 1),
    });

    try {
      await bubbleService.toggleLike(postId);
    } catch (error) {
      // Revert on error
      get().updatePostInFeed(postId, {
        liked_by_user: wasLiked,
        like_count: post.like_count,
      });
    }
  },

  // ========== COMMENT ACTIONS ==========

  fetchComments: async (postId, parentId) => {
    try {
      const response = await bubbleService.getComments(postId, parentId);
      return response.items;
    } catch (error) {
      console.error('Failed to fetch comments', error);
      return [];
    }
  },

  createComment: async (postId, content, isAnonymous = false, parentId) => {
    try {
      const comment = await bubbleService.createComment(postId, content, isAnonymous, parentId);

      // Update comment count
      get().updatePostInFeed(postId, {
        comment_count: get().feedPosts.find((p) => p.id === postId)!.comment_count + 1,
      });

      return comment;
    } catch (error) {
      console.error('Failed to create comment', error);
    }
  },

  updateComment: async (commentId, content) => {
    try {
      await bubbleService.updateComment(commentId, content);
    } catch (error) {
      console.error('Failed to update comment', error);
    }
  },

  deleteComment: async (commentId) => {
    try {
      await bubbleService.deleteComment(commentId);
      // Note: We'd need to track which post the comment belongs to for updating count
    } catch (error) {
      console.error('Failed to delete comment', error);
    }
  },

  // ========== REPORT ACTION ==========

  reportPost: async (postId, reason, description) => {
    try {
      await bubbleService.reportPost(postId, reason, description);
      // Could show a success toast here
    } catch (error) {
      console.error('Failed to report post', error);
    }
  },

  // ========== CHAT ACTION ==========

  requestAnonymousChat: async (postId, anonymousId) => {
    return await bubbleService.requestAnonymousChat(postId, anonymousId);
  },

  // ========== HELPERS ==========

  updatePostInFeed: (postId, updates) => {
    set((state) => ({
      feedPosts: state.feedPosts.map((p) =>
        p.id === postId ? { ...p, ...updates } : p
      ),
    }));
  },
}));
