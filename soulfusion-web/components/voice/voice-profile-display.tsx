// Voice Profile Display - Show persona metrics from voice analysis
"use client";

import { Sparkles, User, RefreshCw, Waves, Gauge, Clock } from 'lucide-react';
import { PersonaMetrics, AcousticFeatures } from '@/lib/services/voice-service';

interface VoiceProfileDisplayProps {
  metrics: PersonaMetrics;
  acousticFeatures?: AcousticFeatures;
  auraImageUrl?: string;
  userName?: string;
  onReanalyze?: () => void;
}

export function VoiceProfileDisplay({
  metrics,
  acousticFeatures,
  auraImageUrl,
  userName,
  onReanalyze,
}: VoiceProfileDisplayProps) {
  const metricDefinitions = [
    { key: 'energy' as keyof PersonaMetrics, label: 'Energie', description: 'Dein allgemeines Energieniveau', color: 'from-yellow-400 to-orange-500' },
    { key: 'expressiveness' as keyof PersonaMetrics, label: 'Ausdrucksstärke', description: 'Wie expresiv du sprichst', color: 'from-orange-400 to-red-500' },
    { key: 'warmth' as keyof PersonaMetrics, label: 'Wärme', description: 'Wahrgenommene Wärme', color: 'from-red-400 to-pink-500' },
    { key: 'coherence' as keyof PersonaMetrics, label: 'Kohärenz', description: 'Deine Gedankenklarheit', color: 'from-blue-400 to-indigo-500' },
    { key: 'sovereignty' as keyof PersonaMetrics, label: 'Souveränität', description: 'Dein Selbstbewusstsein', color: 'from-purple-400 to-violet-500' },
    { key: 'valence' as keyof PersonaMetrics, label: 'Valenz', description: 'Positive vs. negative Emotionen', color: 'from-green-400 to-emerald-500' },
    { key: 'arousal' as keyof PersonaMetrics, label: 'Arousal', description: 'Dein Erregungsniveau', color: 'from-pink-400 to-rose-500' },
    { key: 'tension' as keyof PersonaMetrics, label: 'Spannung', description: 'Wahrgenommene Anspannung', color: 'from-indigo-400 to-blue-500' },
    { key: 'intimacy' as keyof PersonaMetrics, label: 'Intimität', description: 'Intimer Tonfall', color: 'from-rose-400 to-pink-500' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary to-primary/70 rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Stimmprofil</h3>
            <p className="text-sm text-gray-500">
              {userName ? `Analyse von ${userName}` : 'Deine Stimmanalyse'}
            </p>
          </div>
        </div>
        {onReanalyze && (
          <button
            onClick={onReanalyze}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Neue Aufnahme"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Aura Image */}
      {auraImageUrl && (
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-500/30 blur-3xl rounded-full" />
            <img
              src={auraImageUrl}
              alt="Voice Aura"
              className="relative w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="space-y-4">
        {metricDefinitions.map((metric) => {
          const value = metrics[metric.key];
          const normalizedValue = Math.min(100, Math.max(0, (value + 1) * 50)); // Convert from -1..1 to 0..100

          return (
            <div key={metric.key} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${metric.color}`} />
                  <span className="font-medium text-gray-900">{metric.label}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {Math.round(normalizedValue)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${metric.color} transition-all duration-500`}
                  style={{ width: `${normalizedValue}%` }}
                />
              </div>

              {/* Description */}
              <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
            </div>
          );
        })}
      </div>

      {/* Akustische Features */}
      {acousticFeatures && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Waves className="w-5 h-5 text-primary" />
            Akustische Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stimmlage */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-900">Stimmlage</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(acousticFeatures.pitch_mean)} Hz
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {acousticFeatures.pitch_mean < 140 ? 'Tiefe' : acousticFeatures.pitch_mean < 180 ? 'Mittlere' : 'Hohe'} Stimme
              </p>
            </div>

            {/* Sprechtempo */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="font-medium text-gray-900">Sprechtempo</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {acousticFeatures.tempo_wps.toFixed(1)} W/s
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {acousticFeatures.tempo_wps < 2.5 ? 'Langsam' : acousticFeatures.tempo_wps < 3.5 ? 'Normal' : 'Schnell'}
              </p>
            </div>

            {/* Pausenrate */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4">
              <span className="font-medium text-gray-900 block mb-2">Pausenrate</span>
              <div className="text-2xl font-bold text-purple-600">
                {(acousticFeatures.pause_rate * 100).toFixed(0)}%
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {acousticFeatures.pause_rate < 0.12 ? 'Spontan' : acousticFeatures.pause_rate < 0.18 ? 'Normal' : 'Überlegt'}
              </p>
            </div>

            {/* Melodie */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4">
              <span className="font-medium text-gray-900 block mb-2">Stimmlagen-Variation</span>
              <div className="text-2xl font-bold text-orange-600">
                {acousticFeatures.pitch_std.toFixed(1)} Hz
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {acousticFeatures.pitch_std < 25 ? 'Monoton' : acousticFeatures.pitch_std < 35 ? 'Ausgeglichen' : 'Melodisch'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl">
        <div className="flex items-start gap-3">
          <User className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              Deine Stimme sagt viel über dich aus
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Diese Werte basieren auf wissenschaftlicher Forschung zur Stimmanalyse.
              Sie helfen, passende Gesprächspartner zu finden.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
