import {
  Room,
  RoomEvent,
  Participant,
  RemoteParticipant,
  LocalParticipant,
  Track,
  TrackPublication,
  VideoTrack,
  AudioTrack,
  ConnectionState,
} from 'livekit-client';

// Participant Info für UI
export interface ParticipantInfo {
  identity: string;
  name: string;
  sid: string;
  isLocal: boolean;
  isSpeaking: boolean;
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  screenShareEnabled: boolean;
  videoTrack?: VideoTrack;
  audioTrack?: AudioTrack;
  screenShareTrack?: VideoTrack;
  avatarUrl?: string;
}

// LiveKit Events für React
export type LiveKitEventType =
  | 'connected'
  | 'disconnected'
  | 'participantJoined'
  | 'participantLeft'
  | 'localVideoEnabled'
  | 'localVideoDisabled'
  | 'localAudioEnabled'
  | 'localAudioDisabled'
  | 'localScreenShareEnabled'
  | 'localScreenShareDisabled'
  | 'remoteScreenShareEnabled'
  | 'remoteScreenShareDisabled'
  | 'error';

export interface LiveKitEventData {
  type: LiveKitEventType;
  participant?: ParticipantInfo;
  error?: string;
}

/**
 * LiveKit Service - Wrapper für livekit-client SDK
 * Bietet eine einfache API für Video-Calls im Club
 */
export class LiveKitService {
  private room: Room | null = null;
  private eventCallbacks: Set<(data: LiveKitEventData) => void> = new Set();

  constructor() {
    // Cleanup on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.disconnect());
    }
  }

  /**
   * Mit LiveKit Room verbinden
   */
  async connect(options: { url: string; token: string }): Promise<void> {
    try {
      console.log('[LiveKit] Connecting to room...', { url: options.url });

      // Room erstellen
      this.room = new Room({
        adaptiveStream: true,
        dynacast: true, // Aktiviert für effiziente Bandbreitennutzung
        // Audio/Video Einstellungen
        audioCaptureDefaults: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
        videoCaptureDefaults: {
          resolution: {
            width: 1920,
            height: 1080,
          },
          frameRate: 30,
        },
      });

      // Event Listener einrichten
      this.setupRoomListeners();

      // Verbinden
      await this.room.connect(options.url, options.token);

      console.log('[LiveKit] Connected successfully', {
        roomId: this.room.name,
        localParticipant: this.room.localParticipant?.identity,
      });

      // Kamera und Mikrofon standardmäßig aktivieren
      const localParticipant = this.room.localParticipant;
      if (localParticipant) {
        try {
          await localParticipant.setCameraEnabled(true);
          console.log('[LiveKit] Camera enabled by default');
          this.emit({ type: 'localVideoEnabled' });

          await localParticipant.setMicrophoneEnabled(true);
          console.log('[LiveKit] Microphone enabled by default');
          this.emit({ type: 'localAudioEnabled' });
        } catch (error) {
          console.warn('[LiveKit] Could not enable camera/mic:', error);
        }
      }

      this.emit({ type: 'connected' });
    } catch (error) {
      console.error('[LiveKit] Connection failed:', error);
      this.emit({ type: 'error', error: String(error) });
      throw error;
    }
  }

  /**
   * Room verlassen
   */
  async disconnect(): Promise<void> {
    if (!this.room) return;

    try {
      console.log('[LiveKit] Disconnecting...');
      await this.room.disconnect();
      this.room = null;
      this.emit({ type: 'disconnected' });
    } catch (error) {
      console.error('[LiveKit] Disconnect error:', error);
    }
  }

  /**
   * Mikrofon umschalten
   */
  async toggleMicrophone(): Promise<boolean> {
    const localParticipant = this.room?.localParticipant;
    if (!localParticipant) {
      console.warn('[LiveKit] No local participant');
      return false;
    }

    try {
      // setMicrophoneEnabled verwenden (LiveKit v2 API)
      const currentState = this.isMicrophoneEnabled(localParticipant);
      const newState = !currentState;

      await localParticipant.setMicrophoneEnabled(newState);
      console.log('[LiveKit] Microphone toggled:', newState);
      this.emit({
        type: newState ? 'localAudioEnabled' : 'localAudioDisabled',
      });
      return newState;
    } catch (error) {
      console.error('[LiveKit] Toggle microphone error:', error);
      this.emit({ type: 'error', error: String(error) });
      return false;
    }
  }

  /**
   * Kamera umschalten
   */
  async toggleCamera(): Promise<boolean> {
    const localParticipant = this.room?.localParticipant;
    if (!localParticipant) {
      console.warn('[LiveKit] No local participant');
      return false;
    }

    try {
      // setCameraEnabled verwenden (LiveKit v2 API)
      const currentState = this.isCameraEnabled(localParticipant);
      const newState = !currentState;

      await localParticipant.setCameraEnabled(newState);
      console.log('[LiveKit] Camera toggled:', newState);
      this.emit({
        type: newState ? 'localVideoEnabled' : 'localVideoDisabled',
      });
      return newState;
    } catch (error) {
      console.error('[LiveKit] Toggle camera error:', error);
      this.emit({ type: 'error', error: String(error) });
      return false;
    }
  }

  /**
   * Screen Sharing umschalten
   */
  async toggleScreenShare(): Promise<boolean> {
    const localParticipant = this.room?.localParticipant;
    if (!localParticipant) {
      console.warn('[LiveKit] No local participant');
      return false;
    }

    try {
      // Prüfen ob bereits Screen Share aktiv
      let isSharing = false;
      for (const publication of localParticipant.videoTrackPublications.values()) {
        if (publication.source === 'screen_share') {
          isSharing = true;
          break;
        }
      }

      if (isSharing) {
        // Screen sharing stoppen
        await localParticipant.setScreenShareEnabled(false);
        console.log('[LiveKit] Screen share stopped');
        this.emit({ type: 'localScreenShareDisabled' });
        return false;
      } else {
        // Kamera Status merken
        const wasCameraEnabled = this.isCameraEnabled(localParticipant);

        // Kamera SAUBER stoppen vor Screen Share (wichtig für Browser)
        if (wasCameraEnabled) {
          console.log('[LiveKit] Disabling camera before screen share');
          await localParticipant.setCameraEnabled(false);
          // Kurz warten, damit der Browser die Kamera freigibt
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Screen sharing starten
        await localParticipant.setScreenShareEnabled(true);
        console.log('[LiveKit] Screen share started');

        // Kamera wieder aktivieren, falls sie vorher an war
        if (wasCameraEnabled) {
          console.log('[LiveKit] Re-enabling camera after screen share start');
          try {
            await localParticipant.setCameraEnabled(true);
            this.emit({ type: 'localVideoEnabled' });
          } catch (error) {
            console.warn('[LiveKit] Could not re-enable camera:', error);
          }
        }

        this.emit({ type: 'localScreenShareEnabled' });
        return true;
      }
    } catch (error) {
      console.error('[LiveKit] Toggle screen share error:', error);
      this.emit({ type: 'error', error: String(error) });
      return false;
    }
  }

  /**
   * Alle Teilnehmer (inklusive Local) als Info-Array
   */
  getParticipants(): ParticipantInfo[] {
    if (!this.room) return [];

    const participants: ParticipantInfo[] = [];

    // Local Participant
    const local = this.room.localParticipant;
    if (local) {
      participants.push({
        identity: local.identity,
        name: local.name || local.identity,
        sid: local.sid,
        isLocal: true,
        isSpeaking: local.isSpeaking,
        cameraEnabled: this.isCameraEnabled(local),
        microphoneEnabled: this.isMicrophoneEnabled(local),
        screenShareEnabled: this.isScreenShareEnabled(local),
        screenShareTrack: this.getScreenShareTrack(local),
        avatarUrl: this.extractAvatarUrl(local.metadata),
      });
    }

    // Remote Participants
    for (const participant of this.room.remoteParticipants.values()) {
      participants.push({
        identity: participant.identity,
        name: participant.name || participant.identity,
        sid: participant.sid,
        isLocal: false,
        isSpeaking: participant.isSpeaking,
        cameraEnabled: this.isCameraEnabled(participant),
        microphoneEnabled: this.isMicrophoneEnabled(participant),
        screenShareEnabled: this.isScreenShareEnabled(participant),
        screenShareTrack: this.getScreenShareTrack(participant),
        avatarUrl: this.extractAvatarUrl(participant.metadata),
      });
    }

    return participants;
  }

  /**
   * Local Participant holen
   */
  getLocalParticipant(): ParticipantInfo | null {
    if (!this.room?.localParticipant) return null;

    const local = this.room.localParticipant;
    return {
      identity: local.identity,
      name: local.name || local.identity,
      sid: local.sid,
      isLocal: true,
      isSpeaking: local.isSpeaking,
      cameraEnabled: this.isCameraEnabled(local),
      microphoneEnabled: this.isMicrophoneEnabled(local),
      screenShareEnabled: this.isScreenShareEnabled(local),
      screenShareTrack: this.getScreenShareTrack(local),
      avatarUrl: this.extractAvatarUrl(local.metadata),
    };
  }

  /**
   * Remote Participants holen
   */
  getRemoteParticipants(): ParticipantInfo[] {
    if (!this.room) return [];

    const participants: ParticipantInfo[] = [];
    for (const participant of this.room.remoteParticipants.values()) {
      participants.push({
        identity: participant.identity,
        name: participant.name || participant.identity,
        sid: participant.sid,
        isLocal: false,
        isSpeaking: participant.isSpeaking,
        cameraEnabled: this.isCameraEnabled(participant),
        microphoneEnabled: this.isMicrophoneEnabled(participant),
        screenShareEnabled: this.isScreenShareEnabled(participant),
        screenShareTrack: this.getScreenShareTrack(participant),
        avatarUrl: this.extractAvatarUrl(participant.metadata),
      });
    }
    return participants;
  }

  /**
   * Prüfen ob Mikrofon aktiviert ist
   */
  private isMicrophoneEnabled(participant: Participant): boolean {
    for (const publication of participant.audioTrackPublications.values()) {
      if (!publication.isMuted) return true;
    }
    return false;
  }

  /**
   * Prüfen ob Kamera aktiviert ist
   */
  private isCameraEnabled(participant: Participant): boolean {
    // Für Local Participant: DirektvideoTracks prüfen
    if (participant instanceof LocalParticipant) {
      for (const publication of participant.videoTrackPublications.values()) {
        if (publication.source === 'camera' && !publication.isMuted) return true;
      }
    } else {
      // Für Remote Participant: videoTrackPublications prüfen
      for (const publication of participant.videoTrackPublications.values()) {
        if (publication.source === 'camera' && !publication.isMuted) return true;
      }
    }
    return false;
  }

  /**
   * Prüfen ob Screen Share aktiviert ist
   */
  private isScreenShareEnabled(participant: Participant): boolean {
    for (const publication of participant.videoTrackPublications.values()) {
      if (publication.source === 'screen_share' && !publication.isMuted) return true;
    }
    return false;
  }

  /**
   * Screen Share Track für Participant holen
   */
  private getScreenShareTrack(participant: Participant): VideoTrack | undefined {
    for (const publication of participant.videoTrackPublications.values()) {
      if (publication.source === 'screen_share' && publication.track && !publication.isMuted) {
        return publication.track as VideoTrack;
      }
    }
    return undefined;
  }

  /**
   * Avatar URL aus Metadata extrahieren
   */
  private extractAvatarUrl(metadata: string | undefined): string | undefined {
    if (!metadata) return undefined;
    try {
      const parsed = JSON.parse(metadata);
      return parsed.avatar_url;
    } catch {
      return undefined;
    }
  }

  /**
   * Video Track für Participant holen
   */
  getVideoTrack(participantSid: string): VideoTrack | undefined {
    if (!this.room) return undefined;

    const participant =
      this.room.localParticipant?.sid === participantSid
        ? this.room.localParticipant
        : this.room.remoteParticipants.get(participantSid);

    if (!participant) return undefined;

    // Für Local Participant: Video Track Publications durchsuchen
    if (participant instanceof LocalParticipant) {
      for (const publication of participant.videoTrackPublications.values()) {
        if (publication.source === 'camera' && publication.track && !publication.isMuted) {
          return publication.track as VideoTrack;
        }
      }
    } else {
      // Für Remote Participant: Publications durchsuchen
      for (const publication of participant.videoTrackPublications.values()) {
        if (publication.track && !publication.isMuted) {
          return publication.track as VideoTrack;
        }
      }
    }
    return undefined;
  }

  /**
   * Video Track an ein Element attachen
   */
  attachVideo(
    participantSid: string,
    element: HTMLVideoElement
  ): void {
    const track = this.getVideoTrack(participantSid);
    if (track) {
      track.attach(element);
      console.log('[LiveKit] Video track attached:', participantSid);
    } else {
      console.warn('[LiveKit] No video track for:', participantSid);
    }
  }

  /**
   * Getter für Connection Status
   */
  get isConnected(): boolean {
    return this.room?.state === ConnectionState.Connected;
  }

  get isConnecting(): boolean {
    return this.room?.state === ConnectionState.Connecting;
  }

  get currentRoom(): string | null {
    return this.room?.name || null;
  }

  /**
   * Event Listener Management
   */
  on(callback: (data: LiveKitEventData) => void): () => void {
    this.eventCallbacks.add(callback);
    return () => this.eventCallbacks.delete(callback);
  }

  private emit(data: LiveKitEventData): void {
    this.eventCallbacks.forEach((callback) => callback(data));
  }

  /**
   * Room Event Listener einrichten
   */
  private setupRoomListeners(): void {
    if (!this.room) return;

    // Participant Joined
    this.room.on(RoomEvent.ParticipantConnected, (participant) => {
      console.log('[LiveKit] Participant joined:', participant.identity);
      this.emit({
        type: 'participantJoined',
        participant: this.participantToInfo(participant),
      });
    });

    // Participant Left
    this.room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      console.log('[LiveKit] Participant left:', participant.identity);
      this.emit({
        type: 'participantLeft',
        participant: this.participantToInfo(participant),
      });
    });

    // Track Subscribed
    this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      console.log('[LiveKit] Track subscribed:', {
        participant: participant.identity,
        track: track.kind,
        source: publication.source,
      });

      // Screen Share Track für Remote-Teilnehmer
      if (publication.source === 'screen_share' && participant instanceof RemoteParticipant) {
        console.log('[LiveKit] Remote screen share started:', participant.identity);
        this.emit({
          type: 'remoteScreenShareEnabled',
          participant: this.participantToInfo(participant),
        });
      }
    });

    // Track Unsubscribed
    this.room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
      console.log('[LiveKit] Track unsubscribed:', {
        participant: participant.identity,
        source: publication.source,
      });

      // Screen Share Track für Remote-Teilnehmer
      if (publication.source === 'screen_share' && participant instanceof RemoteParticipant) {
        console.log('[LiveKit] Remote screen share stopped:', participant.identity);
        this.emit({
          type: 'remoteScreenShareDisabled',
          participant: this.participantToInfo(participant),
        });
      }
    });

    // Local Track Published
    this.room.on(
      RoomEvent.LocalTrackPublished,
      (publication, participant) => {
        console.log('[LiveKit] Local track published:', publication.source);
      }
    );
  }

  /**
   * Participant zu Info konvertieren
   */
  private participantToInfo(participant: Participant): ParticipantInfo {
    const isLocal = participant instanceof LocalParticipant;
    return {
      identity: participant.identity,
      name: participant.name || participant.identity,
      sid: participant.sid,
      isLocal,
      isSpeaking: participant.isSpeaking,
      cameraEnabled: this.isCameraEnabled(participant),
      microphoneEnabled: this.isMicrophoneEnabled(participant),
      screenShareEnabled: this.isScreenShareEnabled(participant),
      screenShareTrack: this.getScreenShareTrack(participant),
      avatarUrl: this.extractAvatarUrl(participant.metadata),
    };
  }
}

// Singleton Instance
let liveKitServiceInstance: LiveKitService | null = null;

export function getLiveKitService(): LiveKitService {
  if (!liveKitServiceInstance) {
    liveKitServiceInstance = new LiveKitService();
  }
  return liveKitServiceInstance;
}
