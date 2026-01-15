// Reveal Card - Animierte Aufdeckungs-Karte
"use client";

import { useState, useEffect } from 'react';
import { User, Sparkles, X } from 'lucide-react';

interface RevealCardProps {
  partnerName: string;
  partnerAvatarUrl?: string | null;
  partnerPosts?: Array<{ id: string; content: string; created_at: string }>;
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
}

export function RevealCard({
  partnerName,
  partnerAvatarUrl,
  partnerPosts = [],
  onAccept,
  onDecline,
  onClose,
}: RevealCardProps) {
  const [revealing, setRevealing] = useState(false);
  const [revealedSections, setRevealedSections] = useState(0);

  const sections = [
    { id: 'avatar', title: 'Profilbild' },
    { id: 'name', title: 'Name' },
    { id: 'posts', title: 'Beiträge' },
  ];

  useEffect(() => {
    if (revealing) {
      const interval = setInterval(() => {
        setRevealedSections((prev) => {
          if (prev < sections.length) {
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 800);

      return () => clearInterval(interval);
    }
  }, [revealing]);

  const getSectionVisibility = (index: number) => {
    if (!revealing) return false;
    return revealedSections > index;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-semibold">Profil aufdecken</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!revealing && (
            <p className="text-sm opacity-90">
              Möchtest du sehen, wer sich hinter "{partnerName}" verbirgt?
            </p>
          )}

          {revealing && (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/30 rounded-full h-1">
                <div
                  className="bg-white h-1 rounded-full transition-all duration-700"
                  style={{ width: `${(revealedSections / sections.length) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">{revealedSections}/{sections.length}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div
            className={`transition-all duration-700 ${
              getSectionVisibility(0)
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4 blur-sm'
            }`}
          >
            <div className="flex justify-center mb-4">
              {partnerAvatarUrl ? (
                <img
                  src={partnerAvatarUrl}
                  alt={partnerName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Name Section */}
          <div
            className={`text-center transition-all duration-700 delay-200 ${
              getSectionVisibility(1)
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4 blur-sm'
            }`}
          >
            <h4 className="text-2xl font-bold text-gray-900">
              {getSectionVisibility(1) ? partnerName : '???'}
            </h4>
            <p className="text-sm text-gray-500 mt-1">SoulFusion Mitglied</p>
          </div>

          {/* Posts Section */}
          {getSectionVisibility(2) && partnerPosts.length > 0 && (
            <div
              className={`transition-all duration-700 delay-400 opacity-100 translate-y-0`}
            >
              <h5 className="text-sm font-semibold text-gray-700 mb-3">
                Letzte Beiträge
              </h5>
              <div className="space-y-2">
                {partnerPosts.slice(0, 3).map((post) => (
                  <div
                    key={post.id}
                    className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700"
                  >
                    <p className="line-clamp-2">{post.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 pt-0">
          {!revealing ? (
            <div className="flex gap-3">
              <button
                onClick={onDecline}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Jetzt nicht
              </button>
              <button
                onClick={() => setRevealing(true)}
                className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Aufdecken
              </button>
            </div>
          ) : (
            <div className="text-center text-sm text-gray-500">
              ✨ Profil erfolgreich aufgedeckt!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
