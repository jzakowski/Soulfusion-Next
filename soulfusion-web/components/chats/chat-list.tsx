// Chat List - Liste aller anonymen Chats
"use client";

import { useEffect } from 'react';
import { useChatStore } from '@/lib/stores/chat-store';
import { ChatListItem } from './chat-list-item';
import { MessageCircle, Loader2 } from 'lucide-react';

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  selectedChatId: string | null;
}

export function ChatList({ onSelectChat, selectedChatId }: ChatListProps) {
  const { chats, isLoading } = useChatStore();

  useEffect(() => {
    useChatStore.getState().loadChats();
  }, []);

  if (isLoading && chats.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-gray-700 font-semibold mb-2">Keine Chats</h3>
        <p className="text-gray-500 text-sm">
          Du hast noch keine anonymen Chats gestartet.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {chats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          onClick={() => onSelectChat(chat.id)}
          isActive={selectedChatId === chat.id}
        />
      ))}
    </div>
  );
}
