// Voice Match Display - Show compatibility between two voices
"use client";

import { Heart, MessageCircle, Users, Sparkles, TrendingUp } from 'lucide-react';
import { VoiceMatch } from '@/lib/services/voice-service';

interface VoiceMatchDisplayProps {
  match: VoiceMatch;
  partnerName?: string;
  partnerAvatarUrl?: string;
}

export function VoiceMatchDisplay({
  match,
  partnerName,
  partnerAvatarUrl,
}: VoiceMatchDisplayProps) {
  const getCompatibilityColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getMatchLevel = (score: number) => {
    if (score >= 80) return { label: 'Perfekt', emoji: '🌟', color: 'bg-gradient-to-r from-green-400 to-emerald-500' };
    if (score >= 60) return { label: 'Sehr gut', emoji: '✨', color: 'bg-gradient-to-r from-blue-400 to-indigo-500' };
    if (score >= 40) return { label: 'Gut', emoji: '👍', color: 'bg-gradient-to-r from-yellow-400 to-orange-500' };
    return { label: 'Interessant', emoji: '🤔', color: 'bg-gradient-to-r from-gray-400 to-slate-500' };
  };

  const matchLevel = getMatchLevel(match.compatibility.overall);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      {/* Header with Overall Score */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${matchLevel.color} text-white mb-3 shadow-lg`}>
          <div className="text-center">
            <div className="text-2xl font-bold">{match.match_score}%</div>
            <div className="text-xs opacity-90">Match</div>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
          {matchLevel.emoji} {matchLevel.label}
        </h3>
        <p className="text-gray-500 mt-1">
          {partnerName ? `Kompatibilität mit ${partnerName}` : 'Stimmen-Match'}
        </p>
      </div>

      {/* Partner Avatar */}
      {partnerAvatarUrl && (
        <div className="flex justify-center mb-6">
          <img
            src={partnerAvatarUrl}
            alt={partnerName || 'Partner'}
            className="w-20 h-20 rounded-full object-cover border-4 border-primary/20 shadow-lg"
          />
        </div>
      )}

      {/* Detailed Compatibility Scores */}
      <div className="space-y-4 mb-6">
        {/* Overall Compatibility */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                Gesamt
              </span>
              <span className={`text-sm font-semibold px-2 py-0.5 rounded ${getCompatibilityColor(match.compatibility.overall)}`}>
                {Math.round(match.compatibility.overall)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-400 to-pink-500 transition-all duration-500"
                style={{ width: `${match.compatibility.overall}%` }}
              />
            </div>
          </div>
        </div>

        {/* Personality Match */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Persönlichkeit
              </span>
              <span className={`text-sm font-semibold px-2 py-0.5 rounded ${getCompatibilityColor(match.compatibility.personality)}`}>
                {Math.round(match.compatibility.personality)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
                style={{ width: `${match.compatibility.personality}%` }}
              />
            </div>
          </div>
        </div>

        {/* Communication Style */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-500" />
                Kommunikation
              </span>
              <span className={`text-sm font-semibold px-2 py-0.5 rounded ${getCompatibilityColor(match.compatibility.communication_style)}`}>
                {Math.round(match.compatibility.communication_style)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                style={{ width: `${match.compatibility.communication_style}%` }}
              />
            </div>
          </div>
        </div>

        {/* Emotional Alignment */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Emotionale Resonanz
              </span>
              <span className={`text-sm font-semibold px-2 py-0.5 rounded ${getCompatibilityColor(match.compatibility.emotional_alignment)}`}>
                {Math.round(match.compatibility.emotional_alignment)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-500"
                style={{ width: `${match.compatibility.emotional_alignment}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      {match.insights && match.insights.length > 0 && (
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Einblicke
          </h4>
          <ul className="space-y-2">
            {match.insights.map((insight, index) => (
              <li key={index} className="text-sm text-gray-700">
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
