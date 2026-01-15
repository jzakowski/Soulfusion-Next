// Voice Analysis Service - API integration for voice analysis
import { apiClient } from '@/lib/api/client';

export interface PersonaMetrics {
  energy: number;
  expressiveness: number;
  warmth: number;
  coherence: number;
  sovereignty: number;
  valence: number;
  arousal: number;
  tension: number;
  intimacy: number;
}

export interface VoiceAnalysis {
  id: string;
  user_id: string;
  audio_file_url: string;
  persona_metrics: PersonaMetrics;
  acoustic_features?: AcousticFeatures;
  vector_128: number[];
  aura_image_url?: string;
  transcription?: string;
  language?: string;
  created_at: string;
}

// Akustische Features für erweiterte Anzeige
export interface AcousticFeatures {
  pitch_mean: number;      // Stimmlage (Hz) - tief/hoch
  pitch_range: number;     // Stimmlagen-Spektrum
  pitch_std: number;       // Melodie vs. Monotonie
  tempo_wps: number;       // Wörter pro Sekunde
  pause_rate: number;      // Pausenrate (0-1)
  pause_mean: number;      // Durchschnittliche Pausenlänge (Sekunden)
}

export interface VoiceProfile {
  user_id: string;
  latest_analysis: VoiceAnalysis;
  average_metrics: PersonaMetrics;
  total_recordings: number;
  created_at: string;
  updated_at: string;
}

export interface VoiceMatch {
  user_id: string;
  match_score: number;
  compatibility: {
    overall: number;
    personality: number;
    communication_style: number;
    emotional_alignment: number;
  };
  their_metrics: PersonaMetrics;
  your_metrics: PersonaMetrics;
  insights: string[];
}

class VoiceService {
  private static instance: VoiceService;

  private constructor() {}

  static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  /**
   * Get presigned URL for audio upload
   */
  async getUploadUrl(fileName: string, fileType: string): Promise<{
    upload_url: string;
    file_url: string;
  }> {
    const response = await apiClient.getPresignedUpload({
      file_name: fileName,
      file_type: fileType,
      file_size: 0, // Will be calculated before upload
    });
    return response;
  }

  /**
   * Upload audio to S3 using presigned URL
   */
  async uploadAudio(audioBlob: Blob, uploadUrl: string): Promise<void> {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: arrayBuffer,
      headers: {
        'Content-Type': audioBlob.type,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload audio');
    }
  }

  /**
   * Request voice analysis from backend
   */
  async analyzeVoice(fileUrl: string, language: string = 'de'): Promise<VoiceAnalysis> {
    const response = await apiClient.getClient().post<{
      analysis: VoiceAnalysis;
    }>('/voice-analyzer/analyze', {
      audio_url: fileUrl,
      language,
    });

    return response.data.analysis;
  }

  /**
   * Get user's voice profile
   */
  async getVoiceProfile(): Promise<VoiceProfile | null> {
    try {
      const response = await apiClient.getClient().get<VoiceProfile>(
        '/voice-analyzer/profile'
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No profile exists yet
      }
      throw error;
    }
  }

  /**
   * Get voice match with another user
   */
  async getVoiceMatch(userId: string): Promise<VoiceMatch> {
    const response = await apiClient.getClient().post<VoiceMatch>(
      '/voice-analyzer/match',
      { other_user_id: userId }
    );
    return response.data;
  }

  /**
   * Find best voice matches for current user
   */
  async findMatches(limit: number = 10): Promise<VoiceMatch[]> {
    const response = await apiClient.getClient().get<VoiceMatch[]>(
      '/voice-analyzer/matches',
      { params: { limit } }
    );
    return response.data;
  }

  /**
   * Complete flow: Record and analyze voice
   * Sends audio directly to backend for analysis (no S3 roundtrip)
   */
  async submitVoiceRecording(
    audioBlob: Blob,
    language: string = 'de',
    onProgress?: (stage: string, progress: number) => void
  ): Promise<VoiceAnalysis> {
    try {
      onProgress?.('uploading', 10);

      // Create FormData with audio file and language
      const formData = new FormData();
      formData.append('audio', audioBlob, `voice-analysis-${Date.now()}.wav`);
      formData.append('language', language);

      onProgress?.('analyzing', 30);

      // Send directly to analyze endpoint (backend forwards to Python service)
      const response = await apiClient.getClient().post<{
        ok: boolean;
        profile_id: string;
        analysis: VoiceAnalysis;
      }>('/voice-analyzer/analyze-direct', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.data.ok || !response.data.analysis) {
        throw new Error('Analysis failed');
      }

      onProgress?.('complete', 100);

      return response.data.analysis;
    } catch (error) {
      console.error('Voice submission failed:', error);
      throw error;
    }
  }

  /**
   * Format metrics for display
   */
  formatMetrics(metrics: PersonaMetrics): {
    label: string;
    value: number;
    description: string;
    color: string;
  }[] {
    return [
      {
        label: 'Energie',
        value: metrics.energy,
        description: 'Dein allgemeines Energieniveau',
        color: 'bg-yellow-500',
      },
      {
        label: 'Ausdrucksstärke',
        value: metrics.expressiveness,
        description: 'Wie expresiv du sprichst',
        color: 'bg-orange-500',
      },
      {
        label: 'Wärme',
        value: metrics.warmth,
        description: 'Wahrgenommene Wärme',
        color: 'bg-red-500',
      },
      {
        label: 'Kohärenz',
        value: metrics.coherence,
        description: 'Deine Gedankenklarheit',
        color: 'bg-blue-500',
      },
      {
        label: 'Souveränität',
        value: metrics.sovereignty,
        description: 'Dein Selbstbewusstsein',
        color: 'bg-purple-500',
      },
      {
        label: 'Valenz',
        value: metrics.valence,
        description: 'Positive vs. negative Emotionen',
        color: 'bg-green-500',
      },
      {
        label: 'Arousal',
        value: metrics.arousal,
        description: 'Dein Erregungsniveau',
        color: 'bg-pink-500',
      },
      {
        label: 'Spannung',
        value: metrics.tension,
        description: 'Wahrgenommene Anspannung',
        color: 'bg-indigo-500',
      },
      {
        label: 'Intimität',
        value: metrics.intimacy,
        description: 'Intimer Tonfall',
        color: 'bg-rose-500',
      },
    ];
  }

  /**
   * Get compatibility insights
   */
  getCompatibilityInsights(match: VoiceMatch): string[] {
    const insights: string[] = [];

    // Overall compatibility
    if (match.compatibility.overall > 80) {
      insights.push('🌟 Ausgezeichnete Kompatibilität! Eure Stimmen harmonieren sehr gut.');
    } else if (match.compatibility.overall > 60) {
      insights.push('✨ Gute Kompatibilität mit Potenzial für tiefe Gespräche.');
    } else if (match.compatibility.overall > 40) {
      insights.push('🤔 Interessante Kombination - verschieden aber ergänzend.');
    }

    // Personality match
    if (match.compatibility.personality > 70) {
      insights.push('💫 Ähnliche Persönlichkeiten - ihr versteht euch auf einer Wellenlänge.');
    } else if (match.compatibility.personality < 30) {
      insights.push('⚖️ Gegensätze ziehen sich an - ihr könnt voneinander lernen.');
    }

    // Communication style
    if (match.compatibility.communication_style > 70) {
      insights.push('🗣️ Ähnlicher Kommunikationsstil für harmonische Gespräche.');
    }

    // Emotional alignment
    if (match.compatibility.emotional_alignment > 70) {
      insights.push('💚 Starke emotionale Resonanz zwischen euch.');
    }

    return insights;
  }
}

export const voiceService = VoiceService.getInstance();
