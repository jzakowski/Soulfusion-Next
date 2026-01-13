import { create } from 'zustand';
import type { Post, PostsResponse } from '@/types/features/post';
import { apiClient } from '@/lib/api/client';

interface PostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  nextCursor: string | null;
}

interface MediaFiles {
  images: File[];
  video?: File | null;
  audio?: File | null;
}

interface PostsStore extends PostsState {
  fetchPosts: (params?: { cursor?: string; limit?: number; bubble_id?: string }) => Promise<void>;
  fetchPost: (id: string) => Promise<void>;
  likePost: (id: string) => Promise<void>;
  savePost: (id: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  reset: () => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  createPost: (formData: any, mediaFiles: MediaFiles) => Promise<void>;
  uploading: boolean;
  uploadProgress: number;
}

export const usePostsStore = create<PostsStore>((set, get) => ({
  posts: [],
  loading: false,
  error: null,
  hasMore: true,
  nextCursor: null,
  uploading: false,
  uploadProgress: 0,

  fetchPosts: async (params = {}) => {
    const { posts: existingPosts } = get();
    if (params.cursor === undefined && existingPosts.length > 0) {
      // Reset if fetching from beginning
      set({ posts: [], nextCursor: null, hasMore: true });
    }

    set({ loading: true, error: null });
    try {
      const response: PostsResponse = await apiClient.getPosts(params);
      set({
        posts: params.cursor ? [...existingPosts, ...response.posts] : response.posts,
        nextCursor: response.next_cursor || null,
        hasMore: response.has_more,
        loading: false,
      });
    } catch (error) {
      set({ error: 'Failed to fetch posts', loading: false });
    }
  },

  fetchPost: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { post } = await apiClient.getPost(id);
      set({ loading: false });
      return post;
    } catch (error) {
      set({ error: 'Failed to fetch post', loading: false });
      throw error;
    }
  },

  likePost: async (id: string) => {
    const { posts } = get();
    const post = posts.find(p => p.id === id);
    if (!post) return;

    // Optimistic update
    const updatedPosts = posts.map(p =>
      p.id === id
        ? {
            ...p,
            is_liked_by_me: !p.is_liked_by_me,
            likes_count: p.is_liked_by_me ? p.likes_count - 1 : p.likes_count + 1,
          }
        : p
    );
    set({ posts: updatedPosts });

    try {
      await apiClient.likePost(id);
    } catch (error) {
      // Revert on error
      set({ posts });
    }
  },

  savePost: async (id: string) => {
    const { posts } = get();
    const post = posts.find(p => p.id === id);
    if (!post) return;

    // Optimistic update
    const updatedPosts = posts.map(p =>
      p.id === id
        ? { ...p, is_saved_by_me: !p.is_saved_by_me }
        : p
    );
    set({ posts: updatedPosts });

    try {
      await apiClient.savePost(id);
    } catch (error) {
      // Revert on error
      set({ posts });
    }
  },

  addComment: async (postId: string, text: string) => {
    try {
      const comment = await apiClient.addComment(postId, text);
      const { posts } = get();
      const updatedPosts = posts.map(p =>
        p.id === postId
          ? {
              ...p,
              comments: [...(p.comments || []), comment],
              comments_count: p.comments_count + 1,
            }
          : p
      );
      set({ posts: updatedPosts });
    } catch (error) {
      set({ error: 'Failed to add comment' });
    }
  },

  updatePost: (id: string, updates: Partial<Post>) => {
    const { posts } = get();
    const updatedPosts = posts.map(p =>
      p.id === id ? { ...p, ...updates } : p
    );
    set({ posts: updatedPosts });
  },

  reset: () => {
    set({ posts: [], nextCursor: null, hasMore: true, error: null });
  },

  createPost: async (formData: any, mediaFiles: MediaFiles) => {
    set({ uploading: true, uploadProgress: 0 });
    try {
      // Upload media first if present
      const imageUrls: string[] = [];
      let videoUrl: string | undefined;
      let audioUrl: string | undefined;

      // Upload images
      if (mediaFiles.images.length > 0) {
        set({ uploadProgress: 10 });
        for (let i = 0; i < mediaFiles.images.length; i++) {
          const uploadResponse = await apiClient.getPresignedUpload({
            file_name: mediaFiles.images[i].name,
            file_type: mediaFiles.images[i].type,
            file_size: mediaFiles.images[i].size,
          });

          // Upload directly to S3
          await fetch(uploadResponse.upload_url, {
            method: 'PUT',
            body: mediaFiles.images[i],
            headers: {
              'Content-Type': mediaFiles.images[i].type,
            },
          });

          imageUrls.push(uploadResponse.file_url);
          set({ uploadProgress: 10 + ((i + 1) / mediaFiles.images.length) * 40 });
        }
      }

      // Upload video
      if (mediaFiles.video) {
        set({ uploadProgress: 60 });
        const uploadResponse = await apiClient.getPresignedUpload({
          file_name: mediaFiles.video.name,
          file_type: mediaFiles.video.type,
          file_size: mediaFiles.video.size,
        });

        await fetch(uploadResponse.upload_url, {
          method: 'PUT',
          body: mediaFiles.video,
          headers: {
            'Content-Type': mediaFiles.video.type,
          },
        });

        videoUrl = uploadResponse.file_url;
        set({ uploadProgress: 80 });
      }

      // Upload audio
      if (mediaFiles.audio) {
        set({ uploadProgress: 85 });
        const uploadResponse = await apiClient.getPresignedUpload({
          file_name: mediaFiles.audio.name,
          file_type: mediaFiles.audio.type,
          file_size: mediaFiles.audio.size,
        });

        await fetch(uploadResponse.upload_url, {
          method: 'PUT',
          body: mediaFiles.audio,
          headers: {
            'Content-Type': mediaFiles.audio.type,
          },
        });

        audioUrl = uploadResponse.file_url;
        set({ uploadProgress: 90 });
      }

      // Create post with media URLs
      const postData = {
        ...formData,
        images: imageUrls.map(url => ({ url })),
        video_url: videoUrl,
        audio_url: audioUrl,
      };

      const newPost = await apiClient.createPost(postData);

      // Add new post to the beginning of the feed
      set({
        posts: [newPost, ...get().posts],
        uploading: false,
        uploadProgress: 100,
      });
    } catch (error) {
      set({ error: 'Failed to create post', uploading: false, uploadProgress: 0 });
      throw error;
    }
  },
}));
