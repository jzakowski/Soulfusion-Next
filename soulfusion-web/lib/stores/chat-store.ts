// Chat Store für Anonymous Chat Management
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getChatService } from '@/lib/services/chat-service';
import type { AnonymousChat, ChatMessage } from '@/lib/types/chat';

interface ChatState {
  // State
  chats: AnonymousChat[];
  activeChat: AnonymousChat | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadChats: () => Promise<void>;
  loadChat: (chatId: string) => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  requestReveal: (chatId: string) => Promise<void>;
  respondToReveal: (chatId: string, accept: boolean) => Promise<void>;
  markAsRead: (chatId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  setActiveChat: (chat: AnonymousChat | null) => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      // Initial State
      chats: [],
      activeChat: null,
      messages: [],
      isLoading: false,
      error: null,

      // Chats laden
      loadChats: async () => {
        set({ isLoading: true, error: null });
        try {
          const chatService = getChatService();
          const chats = await chatService.getMyAnonymousChats();
          set({ chats, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Fehler beim Laden der Chats',
            isLoading: false,
          });
        }
      },

      // Einzelnen Chat laden
      loadChat: async (chatId: string) => {
        set({ isLoading: true, error: null });
        try {
          const chatService = getChatService();
          const chat = await chatService.getChatDetails(chatId);
          set({ activeChat: chat, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Fehler beim Laden des Chats',
            isLoading: false,
          });
        }
      },

      // Nachrichten laden
      loadMessages: async (chatId: string) => {
        set({ isLoading: true, error: null });
        try {
          const chatService = getChatService();
          const messages = await chatService.getMessages(chatId);
          set({ messages, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Fehler beim Laden der Nachrichten',
            isLoading: false,
          });
        }
      },

      // Nachricht senden
      sendMessage: async (chatId: string, content: string) => {
        set({ error: null });
        try {
          const chatService = getChatService();
          const message = await chatService.sendMessage(chatId, content);

          // Nachrichten aktualisieren
          set((state) => ({
            messages: [...state.messages, message],
          }));

          // Chat-Liste aktualisieren (für last_message)
          get().loadChats();

          // Read state aktualisieren
          await chatService.markAsRead(chatId);
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Fehler beim Senden der Nachricht',
          });
        }
      },

      // Aufdecken anfragen
      requestReveal: async (chatId: string) => {
        set({ error: null });
        try {
          const chatService = getChatService();
          await chatService.requestReveal(chatId);

          // Chat neu laden
          await get().loadChat(chatId);
          await get().loadChats();
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Fehler beim Anfragen des Aufdeckens',
          });
        }
      },

      // Aufdecken beantworten
      respondToReveal: async (chatId: string, accept: boolean) => {
        set({ error: null });
        try {
          const chatService = getChatService();
          await chatService.respondToReveal(chatId, accept);

          // Chat neu laden
          await get().loadChat(chatId);
          await get().loadChats();
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Fehler beim Beantworten des Aufdeckens',
          });
        }
      },

      // Als gelesen markieren
      markAsRead: async (chatId: string) => {
        try {
          const chatService = getChatService();
          await chatService.markAsRead(chatId);

          // Unread counts aktualisieren
          get().loadChats();
        } catch (error) {
          console.error('[ChatStore] Error marking as read:', error);
        }
      },

      // Chat löschen
      deleteChat: async (chatId: string) => {
        set({ error: null });
        try {
          const chatService = getChatService();
          await chatService.deleteChat(chatId);

          // Aus Liste entfernen
          set((state) => ({
            chats: state.chats.filter((c) => c.id !== chatId),
            activeChat: state.activeChat?.id === chatId ? null : state.activeChat,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Fehler beim Löschen des Chats',
          });
        }
      },

      // Aktiven Chat setzen
      setActiveChat: (chat: AnonymousChat | null) => {
        set({ activeChat: chat });
      },

      // Error clearen
      clearError: () => {
        set({ error: null });
      },
    }),
    { name: 'ChatStore' }
  )
);
