// Chat Types für Anonymous Chat System

export type ChatState = 'anonymous' | 'reveal_pending' | 'normal';
export type MessageType = 'text' | 'system' | 'reveal_request' | 'reveal_accepted' | 'reveal_declined';

export interface AnonymousChat {
  id: string;
  user1_id: string;
  user2_id: string;
  state: ChatState;
  message_count: number;
  reveal_requested_by: string | null;
  reveal_requested_at: string | null;
  revealed_at: string | null;
  user1_anonymous_name: string;
  user2_anonymous_name: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  partner_anonymous_name: string;
  partner_avatar_url: string | null;
  partner_real_name: string | null;
  partner_id: string;
  is_revealed: boolean;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  created_at: string;
  deleted_by: string | null;
  deleted_at: string | null;
  // Computed fields
  is_own: boolean;
  sender_anonymous_name: string;
  sender_real_name: string | null;
  sender_avatar_url: string | null;
}

export interface ChatReadState {
  chat_id: string;
  user_id: string;
  last_read_at: string;
}

export interface RevealRequest {
  canRequestReveal: boolean;
  messagesUntilReveal: number;
  required: number;
  current: number;
}

export interface ChatListResponse {
  items: AnonymousChat[];
  nextCursor?: string;
}

export interface MessagesResponse {
  items: ChatMessage[];
  nextCursor?: string;
}
