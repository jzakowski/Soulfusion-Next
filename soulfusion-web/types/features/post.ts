export interface PostImage {
  url: string;
  key: string;
  thumbnail_urls?: {
    small?: string;
    medium?: string;
    large?: string;
  };
}

export interface Comment {
  id: string;
  user_id: string;
  user_display_name: string;
  user_avatar_url?: string;
  text: string;
  created_at: string;
  likes_count: number;
  is_liked_by_me: boolean;
}

export type PostType = 'text' | 'image' | 'video' | 'voice' | 'mixed';
export type PostAudience = 'public' | 'friends' | 'members' | 'private';

export interface Post {
  id: string;
  user_id: string;
  author_display_name: string;
  author_avatar_url?: string;
  author_username?: string;
  title?: string;
  text?: string;
  images: PostImage[];
  video_url?: string;
  video_thumbnail_url?: string;
  audio_url?: string;
  type: PostType;
  audience: PostAudience;
  location?: string;
  tags: string[];
  bubble_id?: string;
  bubble_name?: string;
  bubble_color?: string;
  created_at: string;
  updated_at?: string;
  likes_count: number;
  comments_count: number;
  is_liked_by_me: boolean;
  is_saved_by_me: boolean;
  comments?: Comment[];
  is_anonymous?: boolean;
}

export interface PostFormData {
  title?: string;
  text?: string;
  images?: File[];
  video?: File;
  audio?: File;
  type: PostType;
  audience: PostAudience;
  location?: string;
  tags: string[];
  bubble_id?: string;
  is_anonymous?: boolean;
}

export interface PostsResponse {
  posts: Post[];
  next_cursor?: string;
  has_more: boolean;
}

export interface CreatePostResponse {
  post: Post;
  presigned_urls?: {
    image_url?: string;
    thumbnail_urls?: Record<string, string>;
    video_url?: string;
    audio_url?: string;
  };
}
