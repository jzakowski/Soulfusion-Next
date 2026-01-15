import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  getLiveKitService,
  ParticipantInfo,
  LiveKitEventData,
} from '@/lib/services/livekit-service';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from './auth-store';

interface ClubState {
  // Connection State
  isConnected: boolean;
  isConnecting: boolean;
  currentRoom: string | null;
  error: string | null;

  // Local Media State
  isMicrophoneEnabled: boolean;
  isCameraEnabled: boolean;
  isScreenSharing: boolean;

  // Participants
  participants: ParticipantInfo[];
  localParticipant: ParticipantInfo | null;

  // Actions
  connectToRoom: (roomName: string) => Promise<void>;
  disconnect: () => Promise<void>;
  toggleMicrophone: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;

  // Reset
  reset: () => void;
}

export const useClubStore = create<ClubState>()(
  devtools(
    (set, get) => ({
      // Initial State
      isConnected: false,
      isConnecting: false,
      currentRoom: null,
      error: null,

      isMicrophoneEnabled: false,
      isCameraEnabled: false,
      isScreenSharing: false,

      participants: [],
      localParticipant: null,

      // Connect to Room
      connectToRoom: async (roomName: string) => {
        const state = get();
        const authState = useAuthStore.getState();

        // Prüfen ob User eingeloggt ist
        if (!authState.user || !authState.isAuthenticated) {
          set({ error: 'Nicht eingeloggt' });
          return;
        }

        // Schon verbunden?
        if (state.isConnected) {
          console.log('[Club] Already connected to room:', state.currentRoom);
          return;
        }

        set({ isConnecting: true, error: null });

        try {
          console.log('[Club] Connecting to room:', roomName);

          // Token von API holen
          const tokenResponse = await apiClient.getLiveKitToken({
            room: roomName,
            displayName: authState.user.display_name || authState.user.username || 'User',
            avatarUrl: authState.user.avatar_url,
          });

          console.log('[Club] Token received:', {
            url: tokenResponse.url,
          });

          // LiveKit Service holen und Event Listener einrichten
          const liveKitService = getLiveKitService();

          // Event Listener registrieren
          const unsubscribe = liveKitService.on((data: LiveKitEventData) => {
            console.log('[Club] LiveKit event:', data);

            switch (data.type) {
              case 'connected':
                const localParticipant = liveKitService.getLocalParticipant();
                set({
                  isConnected: true,
                  isConnecting: false,
                  currentRoom: roomName,
                  localParticipant,
                  participants: liveKitService.getParticipants(),
                  isCameraEnabled: localParticipant?.cameraEnabled ?? false,
                  isMicrophoneEnabled: localParticipant?.microphoneEnabled ?? false,
                  isScreenSharing: localParticipant?.screenShareEnabled ?? false,
                });
                break;

              case 'disconnected':
                set({
                  isConnected: false,
                  isConnecting: false,
                  currentRoom: null,
                  participants: [],
                  localParticipant: null,
                });
                break;

              case 'participantJoined':
                set({
                  participants: liveKitService.getParticipants(),
                });
                break;

              case 'participantLeft':
                set({
                  participants: liveKitService.getParticipants(),
                });
                break;

              case 'localVideoEnabled':
                set({
                  isCameraEnabled: true,
                  localParticipant: liveKitService.getLocalParticipant(),
                });
                break;

              case 'localVideoDisabled':
                set({
                  isCameraEnabled: false,
                  localParticipant: liveKitService.getLocalParticipant(),
                });
                break;

              case 'localAudioEnabled':
                set({
                  isMicrophoneEnabled: true,
                  localParticipant: liveKitService.getLocalParticipant(),
                });
                break;

              case 'localAudioDisabled':
                set({
                  isMicrophoneEnabled: false,
                  localParticipant: liveKitService.getLocalParticipant(),
                });
                break;

              case 'localScreenShareEnabled':
                set({
                  isScreenSharing: true,
                  localParticipant: liveKitService.getLocalParticipant(),
                  participants: liveKitService.getParticipants(),
                });
                break;

              case 'localScreenShareDisabled':
                set({
                  isScreenSharing: false,
                  localParticipant: liveKitService.getLocalParticipant(),
                  participants: liveKitService.getParticipants(),
                });
                break;

              case 'remoteScreenShareEnabled':
              case 'remoteScreenShareDisabled':
                set({
                  participants: liveKitService.getParticipants(),
                });
                break;

              case 'error':
                set({ error: data.error || 'Unbekannter Fehler' });
                break;
            }
          });

          // Mit LiveKit verbinden
          await liveKitService.connect({
            url: tokenResponse.url,
            token: tokenResponse.token,
          });

          console.log('[Club] Connected to room:', roomName);

        } catch (error) {
          console.error('[Club] Connection error:', error);
          set({
            isConnecting: false,
            error: error instanceof Error ? error.message : 'Verbindung fehlgeschlagen',
          });
        }
      },

      // Disconnect from Room
      disconnect: async () => {
        const state = get();

        if (!state.isConnected) {
          console.log('[Club] Not connected, nothing to disconnect');
          return;
        }

        try {
          console.log('[Club] Disconnecting...');
          const liveKitService = getLiveKitService();
          await liveKitService.disconnect();

          set({
            isConnected: false,
            isConnecting: false,
            currentRoom: null,
            participants: [],
            localParticipant: null,
            error: null,
          });

        } catch (error) {
          console.error('[Club] Disconnect error:', error);
        }
      },

      // Toggle Microphone
      toggleMicrophone: async () => {
        const state = get();

        if (!state.isConnected) {
          console.warn('[Club] Not connected, cannot toggle microphone');
          return;
        }

        try {
          const liveKitService = getLiveKitService();
          const newState = await liveKitService.toggleMicrophone();

          set({ isMicrophoneEnabled: newState });

        } catch (error) {
          console.error('[Club] Toggle microphone error:', error);
          set({ error: 'Mikrofon konnte nicht umgeschaltet werden' });
        }
      },

      // Toggle Camera
      toggleCamera: async () => {
        const state = get();

        if (!state.isConnected) {
          console.warn('[Club] Not connected, cannot toggle camera');
          return;
        }

        try {
          const liveKitService = getLiveKitService();
          const newState = await liveKitService.toggleCamera();

          set({ isCameraEnabled: newState });

        } catch (error) {
          console.error('[Club] Toggle camera error:', error);
          set({ error: 'Kamera konnte nicht umgeschaltet werden' });
        }
      },

      // Toggle Screen Share
      toggleScreenShare: async () => {
        const state = get();

        if (!state.isConnected) {
          console.warn('[Club] Not connected, cannot toggle screen share');
          return;
        }

        try {
          const liveKitService = getLiveKitService();
          const newState = await liveKitService.toggleScreenShare();

          set({ isScreenSharing: newState });

        } catch (error) {
          console.error('[Club] Toggle screen share error:', error);
          set({ error: 'Screen Sharing konnte nicht umgeschaltet werden' });
        }
      },

      // Reset State
      reset: () => {
        set({
          isConnected: false,
          isConnecting: false,
          currentRoom: null,
          error: null,
          isMicrophoneEnabled: false,
          isCameraEnabled: false,
          isScreenSharing: false,
          participants: [],
          localParticipant: null,
        });
      },
    }),
    { name: 'ClubStore' }
  )
);
