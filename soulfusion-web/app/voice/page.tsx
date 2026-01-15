// Voice Analysis & Matching Page
"use client";

import { VoiceRecorder } from '@/components/voice/voice-recorder';
import { VoiceProfileDisplay } from '@/components/voice/voice-profile-display';
import { VoiceMatchDisplay } from '@/components/voice/voice-match-display';
import { voiceService, VoiceAnalysis, VoiceProfile, VoiceMatch } from '@/lib/services/voice-service';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Loader2, TrendingUp } from 'lucide-react';

export default function VoiceAnalysisPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ stage: '', value: 0 });
  const [profile, setProfile] = useState<VoiceProfile | null>(null);
  const [latestAnalysis, setLatestAnalysis] = useState<VoiceAnalysis | null>(null);
  const [matches, setMatches] = useState<VoiceMatch[]>([]);

  useEffect(() => {
    loadVoiceProfile();
  }, []);

  const loadVoiceProfile = async () => {
    try {
      setLoading(true);
      const voiceProfile = await voiceService.getVoiceProfile();
      if (voiceProfile) {
        setProfile(voiceProfile);
        // The API returns 'analysis' not 'latest_analysis'
        if ('analysis' in voiceProfile) {
          setLatestAnalysis((voiceProfile as any).analysis);
        }
        // Load matches
        const voiceMatches = await voiceService.findMatches(5);
        setMatches(voiceMatches);
      }
    } catch (error) {
      console.error('Failed to load voice profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordingComplete = async (audioBlob: Blob) => {
    try {
      setAnalyzing(true);
      setProgress({ stage: 'uploading', value: 10 });

      const analysis = await voiceService.submitVoiceRecording(
        audioBlob,
        'de',
        (stage, value) => {
          setProgress({ stage, value });

          // Translate stages to German
          const stageMap: Record<string, string> = {
            uploading: 'Upload...',
            analyzing: 'Analyse...',
            complete: 'Fertig!',
          };
          setProgress({ stage: stageMap[stage] || stage, value });
        }
      );

      setLatestAnalysis(analysis);
      setAnalyzing(false);

      // Reload profile and matches
      await loadVoiceProfile();
    } catch (error) {
      console.error('Voice analysis failed:', error);
      setAnalyzing(false);
      alert('Analyse fehlgeschlagen. Bitte versuche es erneut.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-gray-600">Lade Stimmprofil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-primary/70 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Stimmenanalyse & Matching
              </h1>
              <p className="text-sm text-gray-500">
                Entdecke die einzigartige Art, Menschen anhand ihrer Stimme zu matchen
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Intro Card */}
        {!profile && !analyzing && (
          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-6 border border-primary/20">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              🎤 Wie funktioniert das Stimmen-Matching?
            </h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>1. Nimm eine Sprachnachricht auf</strong> - Sprich 30 Sekunden natürlich und entspannt
              </p>
              <p>
                <strong>2. KI analysiert deine Stimme</strong> - Basierend auf wissenschaftlicher Forschung werden 9 Persönlichkeitsmerkmale ermittelt
              </p>
              <p>
                <strong>3. Finde Matches</strong> - Entdecke Personen, deren Stimme harmonisch mit deiner zusammenpasst
              </p>
              <p className="text-sm text-gray-500 mt-3">
                Als einzige App weltweit bieten wir dieses einzigartige Matching-Erlebnis!
              </p>
            </div>
          </div>
        )}

        {/* Voice Recorder */}
        <VoiceRecorder onRecordingComplete={handleRecordingComplete} />

        {/* Analyzing State */}
        {analyzing && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <div>
                <p className="font-medium text-gray-900">{progress.stage}</p>
                <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.value}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Voice Profile Display */}
        {latestAnalysis && (
          <VoiceProfileDisplay
            metrics={latestAnalysis.persona_metrics}
            acousticFeatures={latestAnalysis.acoustic_features}
            auraImageUrl={latestAnalysis.aura_image_url}
            userName={user?.display_name || undefined}
            onReanalyze={() => {
              setLatestAnalysis(null);
              setProfile(null);
            }}
          />
        )}

        {/* Matches Section */}
        {matches.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Deine Top Matches
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((match) => (
                <VoiceMatchDisplay key={match.user_id} match={match} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
