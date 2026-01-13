export interface LiveKitRoom {
  id: string;
  name: string;
  participant_count: number;
  max_participants?: number;
  is_active: boolean;
  created_at: string;
}

export interface LiveKitTokenResponse {
  url: string;
  token: string;
  room_name: string;
  participant_name: string;
}

export interface LiveKitParticipant {
  sid: string;
  identity: string;
  name: string;
  state: 'connected' | 'disconnected' | 'connecting';
  is_speaking: boolean;
  video_tracks: VideoTrack[];
  audio_tracks: AudioTrack[];
  metadata?: string;
}

export interface VideoTrack {
  sid: string;
  name: string;
  source: 'camera' | 'screen_share' | 'unknown';
  is_muted: boolean;
  is_subscribed: boolean;
}

export interface AudioTrack {
  sid: string;
  name: string;
  source: 'microphone' | 'unknown';
  is_muted: boolean;
  is_subscribed: boolean;
}

export interface LiveKitEvent {
  type: 'participant_joined' | 'participant_left' | 'track_subscribed' | 'track_unsubscribed' | 'room_connected' | 'room_disconnected';
  participant?: LiveKitParticipant;
  track?: VideoTrack | AudioTrack;
  error?: string;
}

export interface BreakoutRoom {
  id: string;
  name: string;
  parent_room_id: string;
  participant_count: number;
  max_participants?: number;
}

export interface VideoCallSettings {
  enable_noise_cancellation: boolean;
  enable_echo_cancellation: boolean;
  enable_vad: boolean;
  input_volume: number;
  output_volume: number;
}
