// Chat List Item - Einzelner Chat in der Liste
"use client";

import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import type { AnonymousChat } from '@/lib/types/chat';
import { MessageCircle, Eye, EyeOff } from 'lucide-react';

interface ChatListItemProps {
  chat: AnonymousChat;
  onClick: () => void;
  isActive?: boolean;
}

export function ChatListItem({ chat, onClick, isActive = false }: ChatListItemProps) {
  const partnerName = chat.is_revealed && chat.partner_real_name
    ? chat.partner_real_name
    : chat.partner_anonymous_name;

  const lastMessageTime = chat.last_message_at
    ? formatDistanceToNow(new Date(chat.last_message_at), { addSuffix: true, locale: de })
    : '';

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-l-2 ${
        isActive ? 'bg-gray-50 border-primary' : 'border-transparent'
      }`}
    >
      {/* Avatar */}
      <div className="relative">
        {chat.partner_avatar_url ? (
          <img
            src={chat.partner_avatar_url}
            alt={partnerName}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
        )}
        {/* Online Status (für später) */}
        {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div> */}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-1">
          <p className="text-gray-900 font-medium truncate">
            {partnerName}
          </p>
          {chat.last_message_at && (
            <span className="text-gray-400 text-xs whitespace-nowrap ml-2">
              {lastMessageTime}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-sm truncate">
            {chat.last_message || 'Noch keine Nachrichten'}
          </p>
          <div className="flex items-center gap-2">
            {/* Reveal Status */}
            {chat.state === 'reveal_pending' && (
              <EyeOff className="w-4 h-4 text-amber-500" />
            )}
            {chat.state === 'normal' && (
              <Eye className="w-4 h-4 text-green-500" />
            )}
            {/* Unread Badge */}
            {chat.unread_count && chat.unread_count > 0 && (
              <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {chat.unread_count > 9 ? '9+' : chat.unread_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
