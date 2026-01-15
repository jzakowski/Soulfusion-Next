// Chat Message - Einzelne Nachricht im Chat
"use client";

import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import type { ChatMessage } from '@/lib/types/chat';
import { Check, CheckCheck, Eye, User } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessage;
  partnerName?: string;
  partnerAvatarUrl?: string | null;
  isRevealed: boolean;
}

export function ChatMessage({
  message,
  partnerName,
  partnerAvatarUrl,
  isRevealed,
}: ChatMessageProps) {
  const isOwn = message.is_own;
  const isSystem = message.message_type !== 'text';

  // Systemnachrichten
  if (isSystem) {
    let systemIcon = null;
    let systemText = message.content;
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-600';

    if (message.message_type === 'reveal_request') {
      systemIcon = <Eye className="w-4 h-4" />;
      systemText = `${isOwn ? 'Du hast' : partnerName || 'Jemand'} möchte sich aufdecken`;
      bgColor = 'bg-amber-100';
      textColor = 'text-amber-700';
    } else if (message.message_type === 'reveal_accepted') {
      systemIcon = <Eye className="w-4 h-4 text-green-600" />;
      systemText = 'Profil sichtbar!';
      bgColor = 'bg-green-100';
      textColor = 'text-green-700';
    } else if (message.message_type === 'reveal_declined') {
      systemIcon = <Eye className="w-4 h-4 text-red-600" />;
      systemText = 'Aufdecken abgelehnt';
      bgColor = 'bg-red-100';
      textColor = 'text-red-700';
    }

    return (
      <div className={`flex justify-center my-2`}>
        <div className={`${bgColor} ${textColor} px-4 py-2 rounded-full text-xs flex items-center gap-2`}>
          {systemIcon}
          <span>{systemText}</span>
        </div>
      </div>
    );
  }

  // Normale Nachrichten
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
        {/* Avatar (nur bei Partner-Nachrichten wenn nicht aufgedeckt) */}
        {!isOwn && !isRevealed && (
          <div className="flex-shrink-0">
            {partnerAvatarUrl ? (
              <img
                src={partnerAvatarUrl}
                alt={partnerName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        )}

        {/* Message Bubble */}
        <div>
          {/* Name (nur bei Partner-Nachrichten) */}
          {!isOwn && !isRevealed && partnerName && (
            <p className="text-gray-500 text-xs mb-1 px-2">{partnerName}</p>
          )}

          <div
            className={`px-4 py-2 rounded-2xl ${
              isOwn
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-white text-gray-900 rounded-bl-sm shadow-sm border border-gray-200'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          </div>

          {/* Timestamp & Read Receipt */}
          <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-gray-400 text-xs">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: de })}
            </span>
            {isOwn && (
              <CheckCheck className="w-3 h-3 text-primary" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
