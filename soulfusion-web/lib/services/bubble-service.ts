// Bubble Service - API Client for Bubbles Feed System
import { apiClient } from '@/lib/api/client';

// Types
export interface Bubble {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  member_count: number;
  post_count: number;
  is_public: boolean;
  is_member?: boolean;
  created_at: string;
}

export interface BubblePost {
  id: string;
  bubble_id: string;
  user_id?: string;
  is_anonymous: boolean;
  anonymous_id?: string;
  content: string;
  media_urls: string[];
  like_count: number;
  comment_count: number;
  view_count: number;
  trending_score: number;
  hashtags: string[];
  location_name?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  // Safe display fields
  display_name?: string;
  display_name_safe?: string;
  avatar_url?: string;
  avatar_url_safe?: string;
  username?: string;
  liked_by_user?: boolean;
}

export interface BubbleComment {
  id: string;
  post_id: string;
  user_id?: string;
  is_anonymous: boolean;
  anonymous_id?: string;
  content: string;
  parent_id?: string;
  like_count: number;
  created_at: string;
  updated_at: string;
  display_name?: string;
  display_name_safe?: string;
  avatar_url?: string;
  avatar_url_safe?: string;
}

export interface TrendingHashtag {
  hashtag: string;
  post_count: number;
  trending_score: number;
  last_posted_at: string;
}

export interface FeedResponse {
  items: BubblePost[];
  cursor?: string;
}

class BubbleService {
  private static instance: BubbleService;

  private constructor() {}

  static getInstance(): BubbleService {
    if (!BubbleService.instance) {
      BubbleService.instance = new BubbleService();
    }
    return BubbleService.instance;
  }

  // ========== BUBBLES ==========

  /**
   * List all public bubbles
   */
  async getBubbles(): Promise<{ items: Bubble[] }> {
    const response = await apiClient.getClient().get<{ items: Bubble[] }>('/bubbles');
    return response.data;
  }

  /**
   * Get bubble details
   */
  async getBubble(id: string): Promise<Bubble> {
    const response = await apiClient.getClient().get<Bubble>(`/bubbles/${id}`);
    return response.data;
  }

  /**
   * Join a bubble
   */
  async joinBubble(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.getClient().post<{ success: boolean }>(`/bubbles/${id}/join`);
    return response.data;
  }

  /**
   * Leave a bubble
   */
  async leaveBubble(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.getClient().delete<{ success: boolean }>(`/bubbles/${id}/join`);
    return response.data;
  }

  // ========== FEED ==========

  /**
   * Get feed with optional filter
   * @param bubbleId - Bubble ID
   * @param filter - 'all' | 'friends' | 'anonymous'
   * @param cursor - Pagination cursor
   * @param limit - Items per page
   */
  async getFeed(
    bubbleId: string,
    filter: 'all' | 'friends' | 'anonymous' = 'all',
    cursor?: string,
    limit = 20
  ): Promise<FeedResponse> {
    const params: any = { filter, limit };
    if (cursor) params.cursor = cursor;

    const response = await apiClient.getClient().get<FeedResponse>(
      `/bubbles/${bubbleId}/feed`,
      { params }
    );
    return response.data;
  }

  /**
   * Get trending feed
   * @param bubbleId - Bubble ID
   * @param timeframe - '24h' | '7d' | '30d'
   * @param limit - Items per page
   */
  async getTrendingFeed(
    bubbleId: string,
    timeframe: '24h' | '7d' | '30d' = '24h',
    limit = 20
  ): Promise<{ items: BubblePost[] }> {
    const response = await apiClient.getClient().get<{ items: BubblePost[] }>(
      `/bubbles/${bubbleId}/feed/trending`,
      { params: { timeframe, limit } }
    );
    return response.data;
  }

  /**
   * Get loudest feed (most commented)
   * @param bubbleId - Bubble ID
   * @param limit - Items per page
   */
  async getLoudestFeed(
    bubbleId: string,
    limit = 20
  ): Promise<{ items: BubblePost[] }> {
    const response = await apiClient.getClient().get<{ items: BubblePost[] }>(
      `/bubbles/${bubbleId}/feed/loudest`,
      { params: { limit } }
    );
    return response.data;
  }

  // ========== POSTS ==========

  /**
   * Create a new post
   * @param bubbleId - Bubble ID
   * @param content - Post text content
   * @param mediaUrls - Array of S3 URLs
   * @param isAnonymous - Post anonymously
   */
  async createPost(
    bubbleId: string,
    content: string,
    mediaUrls: string[] = [],
    isAnonymous = false
  ): Promise<BubblePost> {
    const response = await apiClient.getClient().post<BubblePost>(
      `/bubbles/${bubbleId}/posts`,
      {
        content,
        media_urls: mediaUrls,
        is_anonymous: isAnonymous,
      }
    );
    return response.data;
  }

  /**
   * Get post details
   */
  async getPost(id: string): Promise<BubblePost> {
    const response = await apiClient.getClient().get<BubblePost>(`/bubbles/posts/${id}`);
    return response.data;
  }

  /**
   * Update a post (within 5 minutes)
   */
  async updatePost(id: string, content: string, mediaUrls?: string[]): Promise<BubblePost> {
    const response = await apiClient.getClient().put<BubblePost>(
      `/bubbles/posts/${id}`,
      {
        content,
        media_urls: mediaUrls,
      }
    );
    return response.data;
  }

  /**
   * Delete a post
   */
  async deletePost(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.getClient().delete<{ success: boolean }>(
      `/bubbles/posts/${id}`
    );
    return response.data;
  }

  // ========== LIKES ==========

  /**
   * Toggle like on a post
   */
  async toggleLike(postId: string): Promise<{ liked: boolean }> {
    const response = await apiClient.getClient().post<{ liked: boolean }>(
      `/bubbles/posts/${postId}/like`
    );
    return response.data;
  }

  // ========== COMMENTS ==========

  /**
   * Get comments for a post
   * @param postId - Post ID
   * @param parentId - Parent comment ID (for replies)
   */
  async getComments(postId: string, parentId?: string): Promise<{ items: BubbleComment[] }> {
    const params = parentId ? { parent_id: parentId } : {};
    const response = await apiClient.getClient().get<{ items: BubbleComment[] }>(
      `/bubbles/posts/${postId}/comments`,
      { params }
    );
    return response.data;
  }

  /**
   * Create a comment
   * @param postId - Post ID
   * @param content - Comment text
   * @param isAnonymous - Comment anonymously
   * @param parentId - Parent comment ID (for replies)
   */
  async createComment(
    postId: string,
    content: string,
    isAnonymous = false,
    parentId?: string
  ): Promise<BubbleComment> {
    const response = await apiClient.getClient().post<BubbleComment>(
      `/bubbles/posts/${postId}/comments`,
      {
        content,
        is_anonymous: isAnonymous,
        parent_id: parentId,
      }
    );
    return response.data;
  }

  /**
   * Update a comment
   */
  async updateComment(commentId: string, content: string): Promise<BubbleComment> {
    const response = await apiClient.getClient().put<BubbleComment>(
      `/bubbles/comments/${commentId}`,
      { content }
    );
    return response.data;
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<{ success: boolean }> {
    const response = await apiClient.getClient().delete<{ success: boolean }>(
      `/bubbles/comments/${commentId}`
    );
    return response.data;
  }

  // ========== ANONYMOUS CHAT ==========

  /**
   * Request anonymous chat with post author
   * @param postId - Post ID
   * @param anonymousId - Anonymous ID to chat with
   */
  async requestAnonymousChat(
    postId: string,
    anonymousId: string
  ): Promise<{ chat_id: string; exists: boolean }> {
    const response = await apiClient.getClient().post<{ chat_id: string; exists: boolean }>(
      `/bubbles/posts/${postId}/chat-request`,
      { anonymous_id: anonymousId }
    );
    return response.data;
  }

  // ========== HASHTAGS ==========

  /**
   * Get trending hashtags
   * @param limit - Number of hashtags to return
   * @param timeframe - '24h' | '7d' | '30d'
   */
  async getTrendingHashtags(
    limit = 10,
    timeframe: '24h' | '7d' | '30d' = '24h'
  ): Promise<{ items: TrendingHashtag[] }> {
    const response = await apiClient.getClient().get<{ items: TrendingHashtag[] }>(
      '/bubbles/hashtags/trending',
      { params: { limit, timeframe } }
    );
    return response.data;
  }

  // ========== REPORT ==========

  /**
   * Report a post
   * @param postId - Post ID
   * @param reason - Report reason
   * @param description - Optional description
   */
  async reportPost(
    postId: string,
    reason: string,
    description?: string
  ): Promise<{ success: boolean }> {
    const response = await apiClient.getClient().post<{ success: boolean }>(
      `/bubbles/posts/${postId}/report`,
      { reason, description }
    );
    return response.data;
  }
}

export const bubbleService = BubbleService.getInstance();
