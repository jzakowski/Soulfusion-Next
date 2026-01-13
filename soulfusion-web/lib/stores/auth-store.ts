import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState } from '@/types/features/user';
import { apiClient } from '@/lib/api/client';

interface AuthStore extends AuthState {
  login: (email: string) => Promise<void>;
  verifyMagicLink: (token: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: undefined,

      login: async (email: string) => {
        set({ isLoading: true, error: undefined });
        try {
          const response = await apiClient.login(email);
          if (response.success) {
            set({ isLoading: false });
          } else {
            set({ error: response.message || 'Login failed', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Failed to send magic link', isLoading: false });
        }
      },

      verifyMagicLink: async (token: string, email: string) => {
        set({ isLoading: true, error: undefined });
        try {
          const result = await apiClient.verifyMagicLink(token, email);
          if (result.ok) {
            // Load full user profile after successful magic link
            const response = await apiClient.getProfile();
            const user = response.user || response;
            set({ user, isAuthenticated: true, isLoading: false });
          } else {
            throw new Error('Invalid token');
          }
        } catch (error) {
          set({
            error: 'Failed to verify magic link',
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await apiClient.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      loadUser: async () => {
        set({ isLoading: true });
        try {
          const response = await apiClient.getProfile();
          const user = response.user || response;
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | undefined) => {
        set({ error });
      },
    }),
    {
      name: 'soulfusion-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
