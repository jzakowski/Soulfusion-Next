export interface User {
  id: string;
  display_name: string;
  email: string;
  username?: string;
  avatar_url?: string;
  avatar_key?: string;
  birthdate?: string;
  gender?: string;
  orientation?: string;
  city?: string;
  country?: string;
  relationship_status?: string;
  height_cm?: number;
  children?: string;
  intro_audio_url?: string;
  intro_audio_key?: string;
  gallery_urls?: string[];
  gallery_keys?: string[];
  bio?: string;
  interests?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile extends User {
  // Additional computed fields
  age?: number;
  location_display?: string;
  is_complete?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
}

export interface MagicLinkResponse {
  success: boolean;
  message?: string;
}

export interface AuthSession {
  token?: string;
  user?: User;
}
