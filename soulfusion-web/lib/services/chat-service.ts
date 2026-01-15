// Chat Service für Anonymous Chat
import { apiClient } from '@/lib/api/client';
import type {
  AnonymousChat,
  ChatMessage,
  ChatListResponse,
  MessagesResponse,
  RevealRequest,
} from '@/lib/types/chat';

const REVEAL_MESSAGE_THRESHOLD = 15;

export class ChatService {
  /**
   * Meine anonymen Chats auflisten
   */
  async getMyAnonymousChats(params?: { state?: string; limit?: number; cursor?: string }): Promise<AnonymousChat[]> {
    try {
      // Cache-Buster um Browser-Caching zu vermeiden
      const cacheBuster = Date.now();
      const response = await apiClient.getClient().get<{ items: AnonymousChat[] }>('/chats/anonymous/my', {
        params: { ...params, _t: cacheBuster }
      });
      return response.data.items || [];
    } catch (error) {
      console.error('[ChatService] Error fetching chats:', error);
      throw error;
    }
  }

  /**
   * Anonymen Chat starten (oder existierenden holen)
   */
  async startAnonymousChat(targetUserId: string): Promise<AnonymousChat> {
    try {
      const response = await apiClient.getClient().post<AnonymousChat>('/chats/anonymous/start', {
        target_user_id: targetUserId,
      });
      return response.data;
    } catch (error) {
      console.error('[ChatService] Error starting chat:', error);
      throw error;
    }
  }

  /**
   * Chat Details holen
   */
  async getChatDetails(chatId: string): Promise<AnonymousChat> {
    try {
      const response = await apiClient.getClient().get<AnonymousChat>(`/chats/anonymous/${chatId}`);
      return response.data;
    } catch (error) {
      console.error('[ChatService] Error fetching chat details:', error);
      throw error;
    }
  }

  /**
   * Nachrichten holen
   */
  async getMessages(chatId: string, params?: { limit?: number; before?: string }): Promise<ChatMessage[]> {
    try {
      const response = await apiClient.getClient().get<MessagesResponse>(`/chats/anonymous/${chatId}/messages`, { params });
      return response.data.items || [];
    } catch (error) {
      console.error('[ChatService] Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Nachricht senden
   */
  async sendMessage(chatId: string, content: string, messageType: string = 'text'): Promise<ChatMessage> {
    try {
      const response = await apiClient.getClient().post<ChatMessage>(`/chats/anonymous/${chatId}/messages`, {
        content,
        message_type: messageType,
      });
      return response.data;
    } catch (error) {
      console.error('[ChatService] Error sending message:', error);
      throw error;
    }
  }

  /**
   * Aufdecken anfragen
   */
  async requestReveal(chatId: string): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.getClient().post<{ success: boolean }>(`/chats/anonymous/${chatId}/reveal`, {});
      return response.data;
    } catch (error) {
      console.error('[ChatService] Error requesting reveal:', error);
      throw error;
    }
  }

  /**
   * Aufdecken beantworten
   */
  async respondToReveal(chatId: string, accept: boolean): Promise<{ success: boolean; accepted: boolean }> {
    try {
      const response = await apiClient.getClient().post<{ success: boolean; accepted: boolean }>(
        `/chats/anonymous/${chatId}/reveal/respond`,
        { accept }
      );
      return response.data;
    } catch (error) {
      console.error('[ChatService] Error responding to reveal:', error);
      throw error;
    }
  }

  /**
   * Read State aktualisieren
   */
  async markAsRead(chatId: string): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.getClient().post<{ success: boolean }>(`/chats/anonymous/${chatId}/read`, {});
      return response.data;
    } catch (error) {
      console.error('[ChatService] Error marking as read:', error);
      throw error;
    }
  }

  /**
   * Chat löschen
   */
  async deleteChat(chatId: string): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.getClient().delete<{ success: boolean }>(`/chats/anonymous/${chatId}`);
      return response.data;
    } catch (error) {
      console.error('[ChatService] Error deleting chat:', error);
      throw error;
    }
  }

  /**
   * Prüfen ob aufdecken möglich ist
   */
  canRequestReveal(chat: AnonymousChat): RevealRequest {
    const canRequest = chat.message_count >= REVEAL_MESSAGE_THRESHOLD;
    return {
      canRequestReveal: canRequest,
      messagesUntilReveal: Math.max(0, REVEAL_MESSAGE_THRESHOLD - chat.message_count),
      required: REVEAL_MESSAGE_THRESHOLD,
      current: chat.message_count,
    };
  }

  /**
   * Partner-Name abhängig vom State
   */
  getPartnerName(chat: AnonymousChat): string {
    if (chat.is_revealed && chat.partner_real_name) {
      return chat.partner_real_name;
    }
    return chat.partner_anonymous_name;
  }

  /**
   * Ist dieser Chat aufgedeckt?
   */
  isRevealed(chat: AnonymousChat): boolean {
    return chat.state === 'normal';
  }

  /**
   * Ist eine Reveal-Anfrage pending?
   */
  isRevealPending(chat: AnonymousChat): boolean {
    return chat.state === 'reveal_pending';
  }

  /**
   * Hat ich die Reveal-Anfrage gesendet?
   */
  didIRequestReveal(chat: AnonymousChat, myUserId: string): boolean {
    return chat.reveal_requested_by === myUserId;
  }
}

// Singleton Instance
let chatServiceInstance: ChatService | null = null;

export function getChatService(): ChatService {
  if (!chatServiceInstance) {
    chatServiceInstance = new ChatService();
  }
  return chatServiceInstance;
}
