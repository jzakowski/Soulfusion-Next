// Chat View - Hauptkomponente für einen Chat
"use client";

import { useEffect, useState, useRef } from 'react';
import { useChatStore } from '@/lib/stores/chat-store';
import { getChatService } from '@/lib/services/chat-service';
import { useAuthStore } from '@/lib/stores/auth-store';
import { ChatMessage } from './chat-message';
import { RevealCard } from './reveal-card';
import { ArrowLeft, Send, Eye, MoreVertical, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceMatchDisplay } from '@/components/voice/voice-match-display';
import { voiceService, VoiceMatch } from '@/lib/services/voice-service';

interface ChatViewProps {
  chatId: string;
  onBack: () => void;
}

export function ChatView({ chatId, onBack }: ChatViewProps) {
  const { user } = useAuthStore();
  const { activeChat, messages, isLoading, error, loadChat, loadMessages, sendMessage, requestReveal, markAsRead, clearError } = useChatStore();
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reveal Card State
  const [showRevealCard, setShowRevealCard] = useState(false);
  const [partnerPosts, setPartnerPosts] = useState<Array<{ id: string; content: string; created_at: string }>>([]);

  // Voice Match State
  const [showVoiceMatch, setShowVoiceMatch] = useState(false);
  const [voiceMatch, setVoiceMatch] = useState<VoiceMatch | null>(null);
  const [loadingVoiceMatch, setLoadingVoiceMatch] = useState(false);

  const chatService = getChatService();

  useEffect(() => {
    loadChat(chatId);
    loadMessages(chatId);
    markAsRead(chatId);
  }, [chatId, loadChat, loadMessages, markAsRead]);

  // Check for reveal_accepted message and show card
  useEffect(() => {
    const revealAccepted = messages.find(m => m.message_type === 'reveal_accepted');
    if (revealAccepted && activeChat?.is_revealed && !showRevealCard) {
      // Load partner posts
      loadPartnerPosts();
      setShowRevealCard(true);
    }
  }, [messages, activeChat]);

  const loadPartnerPosts = async () => {
    try {
      // TODO: Load partner posts from API
      // For now, use mock data
      setPartnerPosts([
        { id: '1', content: 'Das sollte wirklich cool sein!', created_at: new Date().toISOString() },
        { id: '2', content: 'Ich freue mich schon darauf', created_at: new Date().toISOString() },
        { id: '3', content: 'Wann können wir uns treffen?', created_at: new Date().toISOString() },
      ]);
    } catch (error) {
      console.error('Error loading partner posts:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeChat) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-gray-500">Chat wird geladen...</div>
      </div>
    );
  }

  const partnerName = chatService.getPartnerName(activeChat);
  const canRequestReveal = chatService.canRequestReveal(activeChat);
  const didIRequest = chatService.didIRequestReveal(activeChat, user?.id || '');
  const isRevealed = chatService.isRevealed(activeChat);
  const isRevealPending = chatService.isRevealPending(activeChat);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(chatId, inputValue.trim());
      setInputValue('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRequestReveal = async () => {
    if (!canRequestReveal.canRequestReveal) return;

    try {
      await requestReveal(chatId);
    } catch (err) {
      console.error('Error requesting reveal:', err);
    }
  };

  const handleRespondToReveal = async (accept: boolean) => {
    try {
      await useChatStore.getState().respondToReveal(chatId, accept);
    } catch (err) {
      console.error('Error responding to reveal:', err);
    }
  };

  const handleVoiceMatch = async () => {
    // Get partner user ID from active chat
    const currentUserId = (user as any)?.user_id || user?.id;
    const partnerId = activeChat.user1_id === currentUserId ? activeChat.user2_id : activeChat.user1_id;

    if (!partnerId) return;

    setLoadingVoiceMatch(true);
    try {
      const match = await voiceService.getVoiceMatch(partnerId);
      setVoiceMatch(match);
      setShowVoiceMatch(true);
    } catch (error) {
      console.error('Error loading voice match:', error);
      alert('Konnte Stimmen-Match nicht laden. Einer von euch hat noch keine Stimmanalyse.');
    } finally {
      setLoadingVoiceMatch(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Reveal Card Overlay */}
      {showRevealCard && (
        <RevealCard
          partnerName={activeChat.partner_real_name || partnerName}
          partnerAvatarUrl={activeChat.partner_avatar_url}
          partnerPosts={partnerPosts}
          onAccept={() => setShowRevealCard(false)}
          onDecline={() => setShowRevealCard(false)}
          onClose={() => setShowRevealCard(false)}
        />
      )}

      {/* Voice Match Overlay */}
      {showVoiceMatch && voiceMatch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full max-h-[90vh] overflow-y-auto">
            <VoiceMatchDisplay
              match={voiceMatch}
              partnerName={activeChat.partner_real_name || partnerName}
              partnerAvatarUrl={isRevealed && activeChat.partner_avatar_url ? activeChat.partner_avatar_url : undefined}
            />
            <button
              onClick={() => setShowVoiceMatch(false)}
              className="w-full mt-4 py-3 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          {activeChat.partner_avatar_url && isRevealed ? (
            <img
              src={activeChat.partner_avatar_url}
              alt={partnerName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : null}
          <div>
            <p className="text-gray-900 font-semibold">{partnerName}</p>
            <p className="text-gray-500 text-xs">
              {isRevealed && activeChat.partner_real_name
                ? activeChat.partner_real_name
                : activeChat.message_count > 0
                ? `${activeChat.message_count} Nachrichten`
                : 'Anonymer Chat'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleVoiceMatch}
            disabled={loadingVoiceMatch}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Stimmen-Match"
          >
            <Mic className="w-5 h-5 text-gray-700" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Reveal Pending Banner */}
      {isRevealPending && !didIRequest && (
        <div className="bg-amber-50 border-b border-amber-200 p-4">
          <div className="text-center">
            <p className="text-gray-900 font-medium mb-2">
              <Eye className="w-4 h-4 inline mr-2" />
              Dein Gesprächspartner möchte sich aufdecken
            </p>
            <div className="flex justify-center gap-2">
              <Button
                onClick={() => handleRespondToReveal(true)}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                Ja, ich möchte auch
              </Button>
              <Button
                onClick={() => handleRespondToReveal(false)}
                size="sm"
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Nein
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 mt-8">
            <p>Sagt hallo! 👋</p>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            partnerName={partnerName}
            partnerAvatarUrl={isRevealed ? activeChat.partner_avatar_url : null}
            isRevealed={isRevealed}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-t border-red-200 p-3">
          <p className="text-red-900 text-sm text-center">{error}</p>
          <button
            onClick={clearError}
            className="text-red-700 text-xs underline mt-1 w-full"
          >
            Schließen
          </button>
        </div>
      )}

      {/* Input + Reveal Button */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {/* Reveal Button (wenn möglich) */}
        {canRequestReveal.canRequestReveal && !isRevealed && !isRevealPending && (
          <div className="mb-3">
            <button
              onClick={handleRequestReveal}
              className="w-full py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Ich würde diesen Chat gerne aufdecken
            </button>
          </div>
        )}

        {/* Message Count Info */}
        {!isRevealed && !isRevealPending && !canRequestReveal.canRequestReveal && (
          <div className="mb-3 text-center">
            <p className="text-gray-500 text-xs">
              Noch {canRequestReveal.messagesUntilReveal} Nachrichten bis zum Aufdecken
            </p>
          </div>
        )}

        {/* Input */}
        <div className="flex items-end gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Schreibe eine Nachricht..."
            className="flex-1 bg-gray-100 text-gray-900 placeholder:text-gray-400 rounded-2xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary max-h-32"
            rows={1}
            disabled={isSending}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="p-3 bg-primary text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
