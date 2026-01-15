import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from './auth-store';

export interface BreakoutRoom {
  id: string;
  name: string;
  roomName: string;
  participants: BreakoutParticipant[];
  maxParticipants: number;
  status: string;
  createdAt?: Date;
  startedAt?: Date;
}

export interface BreakoutParticipant {
  id: string;
  name: string;
  avatar?: string;
  joinedAt?: Date;
}

export interface BreakoutSession {
  sessionId: string;
  rooms: BreakoutRoom[];
  createdAt: Date;
  endsAt: Date | null;
  isActive: boolean;
}

interface BreakoutState {
  // Session State
  currentSession: BreakoutSession | null;
  isLoading: boolean;
  error: string | null;

  // UI State
  isSidebarOpen: boolean;
  selectedRoomId: string | null;

  // Timer - nur Endzeit speichern, Rest wird berechnet
  sessionEndsAt: Date | null;
  isTimerRunning: boolean;

  // Actions
  loadSession: (mainRoom: string) => Promise<void>;
  createSession: (mainRoom: string, roomCount: number, durationMinutes?: number) => Promise<void>;
  endSession: (mainRoom: string) => Promise<void>;
  extendTimer: (mainRoom: string, minutes: number) => Promise<void>;
  moveParticipant: (mainRoom: string, breakoutId: string, participantId: string, participantName: string, participantAvatar?: string) => Promise<void>;
  removeParticipant: (mainRoom: string, breakoutId: string, participantId: string) => Promise<void>;

  // UI Actions
  toggleSidebar: () => void;
  selectRoom: (roomId: string | null) => void;

  // Internal
  startTimer: () => void;

  // Helper
  getRemainingTime: () => number;

  // Reset
  reset: () => void;
}

// Helper für Zeit-Berechnung
const calculateRemainingTime = (endsAt: Date | null): number => {
  if (!endsAt) return 0;
  const remaining = Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000);
  return Math.max(0, remaining);
};

export const useBreakoutStore = create<BreakoutState>()(
  devtools(
    (set, get) => ({
      // Initial State
      currentSession: null,
      isLoading: false,
      error: null,
      isSidebarOpen: false,
      selectedRoomId: null,
      sessionEndsAt: null,
      isTimerRunning: false,

      // Load Session
      loadSession: async (mainRoom: string) => {
        set({ isLoading: true, error: null });

        try {
          console.log('[Breakout] Loading session for:', mainRoom);

          const response = await apiClient.getBreakoutSession(mainRoom);

          if (response.isActive) {
            set({
              currentSession: response,
              sessionEndsAt: response.endsAt ? new Date(response.endsAt) : null,
              isTimerRunning: !!response.endsAt,
              isLoading: false,
            });

            // Start countdown timer
            get().startTimer();
          } else {
            set({
              currentSession: null,
              sessionEndsAt: null,
              isLoading: false,
            });
          }

        } catch (error) {
          console.error('[Breakout] Load session error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Session konnte nicht geladen werden',
          });
        }
      },

      // Create Breakout Session
      createSession: async (mainRoom: string, roomCount: number, durationMinutes: number = 30) => {
        const authState = useAuthStore.getState();

        if (!authState.user || !authState.isAuthenticated) {
          set({ error: 'Nicht eingeloggt' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          console.log('[Breakout] Creating session:', { mainRoom, roomCount, durationMinutes });

          const response = await apiClient.createBreakoutSession({
            mainRoom,
            roomCount,
            durationMinutes,
          });

          const endTime = new Date(response.endsAt);

          set({
            currentSession: response,
            sessionEndsAt: endTime,
            isTimerRunning: true,
            isLoading: false,
            isSidebarOpen: true,
          });

          // Start countdown timer
          get().startTimer();

          console.log('[Breakout] Session created:', response.sessionId);

        } catch (error) {
          console.error('[Breakout] Create session error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Session konnte nicht erstellt werden',
          });
        }
      },

      // End Breakout Session
      endSession: async (mainRoom: string) => {
        set({ isLoading: true, error: null });

        try {
          console.log('[Breakout] Ending session for:', mainRoom);

          await apiClient.endBreakoutSession(mainRoom);

          set({
            currentSession: null,
            sessionEndsAt: null,
            isTimerRunning: false,
            isLoading: false,
            isSidebarOpen: false,
          });

          console.log('[Breakout] Session ended');

        } catch (error) {
          console.error('[Breakout] End session error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Session konnte nicht beendet werden',
          });
        }
      },

      // Extend Timer
      extendTimer: async (mainRoom: string, minutes: number) => {
        set({ isLoading: true, error: null });

        try {
          console.log('[Breakout] Extending timer:', minutes, 'minutes');

          const response = await apiClient.extendBreakoutTimer(mainRoom, minutes);

          set({
            sessionEndsAt: response.endsAt ? new Date(response.endsAt) : null,
            isLoading: false,
          });

        } catch (error) {
          console.error('[Breakout] Extend timer error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Timer konnte nicht verlängert werden',
          });
        }
      },

      // Move Participant
      moveParticipant: async (
        mainRoom: string,
        breakoutId: string,
        participantId: string,
        participantName: string,
        participantAvatar?: string
      ) => {
        set({ isLoading: true, error: null });

        try {
          console.log('[Breakout] Moving participant:', { participantId, breakoutId });

          await apiClient.moveBreakoutParticipant(
            mainRoom,
            breakoutId,
            participantId,
            participantName,
            participantAvatar
          );

          // Reload session to get updated state
          await get().loadSession(mainRoom);

        } catch (error) {
          console.error('[Breakout] Move participant error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Teilnehmer konnte nicht verschoben werden',
          });
        }
      },

      // Remove Participant
      removeParticipant: async (mainRoom: string, breakoutId: string, participantId: string) => {
        set({ isLoading: true, error: null });

        try {
          console.log('[Breakout] Removing participant:', { participantId, breakoutId });

          await apiClient.removeBreakoutParticipant(mainRoom, breakoutId, participantId);

          // Reload session to get updated state
          await get().loadSession(mainRoom);

        } catch (error) {
          console.error('[Breakout] Remove participant error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Teilnehmer konnte nicht entfernt werden',
          });
        }
      },

      // Toggle Sidebar
      toggleSidebar: () => {
        set(state => ({ isSidebarOpen: !state.isSidebarOpen }));
      },

      // Select Room
      selectRoom: (roomId: string | null) => {
        set({ selectedRoomId: roomId });
      },

      // Get remaining time (computed from sessionEndsAt)
      getRemainingTime: () => {
        const state = get();
        return calculateRemainingTime(state.sessionEndsAt);
      },

      // Start Timer (internal method)
      startTimer: () => {
        // Timer bereits aktiv?
        if ((useBreakoutStore as any)._timerInterval) {
          clearInterval((useBreakoutStore as any)._timerInterval);
        }

        const interval = setInterval(() => {
          const state = get();
          const remaining = calculateRemainingTime(state.sessionEndsAt);

          // Timer beenden wenn keine Zeit mehr
          if (remaining <= 0 || !state.isTimerRunning) {
            clearInterval((useBreakoutStore as any)._timerInterval);
            (useBreakoutStore as any)._timerInterval = null;

            if (remaining <= 0) {
              useBreakoutStore.setState({ isTimerRunning: false });
            }
            return;
          }

          // State update mit neuer verbleibender Zeit
          useBreakoutStore.setState({});

        }, 1000); // Jede Sekunde aktualisieren

        (useBreakoutStore as any)._timerInterval = interval;
      },

      // Reset State
      reset: () => {
        // Timer cleanup
        if ((useBreakoutStore as any)._timerInterval) {
          clearInterval((useBreakoutStore as any)._timerInterval);
          (useBreakoutStore as any)._timerInterval = null;
        }

        set({
          currentSession: null,
          isLoading: false,
          error: null,
          isSidebarOpen: false,
          selectedRoomId: null,
          sessionEndsAt: null,
          isTimerRunning: false,
        });
      },
    }),
    { name: 'BreakoutStore' }
  )
);
