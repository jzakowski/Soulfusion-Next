// Chats Page - Hauptseite für anonyme Chats
"use client";

import { useState } from 'react';
import { ChatList } from '@/components/chats/chat-list';
import { ChatView } from '@/components/chats/chat-view';
import { MessageCircle } from 'lucide-react';

export default function ChatsPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Mobile: Zeige entweder Liste ODER Chat
  // Desktop: Zeige Liste links UND Chat rechts
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (isMobile) {
    // Mobile View
    return (
      <div className="h-screen bg-white">
        {selectedChatId ? (
          <ChatView
            chatId={selectedChatId}
            onBack={() => setSelectedChatId(null)}
          />
        ) : (
          <div className="h-screen flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <h1 className="text-gray-900 text-2xl font-bold">Nachrichten</h1>
              <p className="text-gray-500 text-sm mt-1">Anonyme Chats</p>
            </div>

            {/* Chat List */}
            <div className="flex-1">
              <ChatList
                onSelectChat={setSelectedChatId}
                selectedChatId={selectedChatId}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop View
  return (
    <div className="h-screen flex bg-white">
      {/* Linke Seite: Chat Liste */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <h1 className="text-gray-900 text-2xl font-bold">Nachrichten</h1>
          <p className="text-gray-500 text-sm mt-1">Anonyme Chats</p>
        </div>

        {/* Chat List */}
        <div className="flex-1">
          <ChatList
            onSelectChat={setSelectedChatId}
            selectedChatId={selectedChatId}
          />
        </div>
      </div>

      {/* Rechte Seite: Chat View */}
      <div className="flex-1">
        {selectedChatId ? (
          <ChatView
            chatId={selectedChatId}
            onBack={() => setSelectedChatId(null)}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-400">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Wähle einen Chat aus</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
