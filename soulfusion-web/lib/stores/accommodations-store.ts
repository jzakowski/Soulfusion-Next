import { create } from 'zustand';
import type { Accommodation, AccommodationsResponse, AccommodationFilters } from '@/types/features/accommodation';
import { apiClient } from '@/lib/api/client';

interface AccommodationsState {
  accommodations: Accommodation[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  nextCursor: string | null;
  filters: AccommodationFilters;
}

interface AccommodationsStore extends AccommodationsState {
  fetchAccommodations: (params?: AccommodationFilters) => Promise<void>;
  fetchAccommodation: (id: string) => Promise<Accommodation | null>;
  setFilters: (filters: AccommodationFilters) => void;
  clearFilters: () => void;
  createAccommodation: (data: any) => Promise<void>;
  reset: () => void;
}

export const useAccommodationsStore = create<AccommodationsStore>((set, get) => ({
  accommodations: [],
  loading: false,
  error: null,
  hasMore: true,
  nextCursor: null,
  filters: {},

  fetchAccommodations: async (params = {}) => {
    const { filters, accommodations: existing } = get();
    const queryParams = { ...filters, ...params };

    set({ loading: true, error: null });

    try {
      const response: AccommodationsResponse = await apiClient.getAccommodations(queryParams);
      set({
        accommodations: response.accommodations,
        total: response.total,
        nextCursor: response.next_cursor || null,
        hasMore: response.has_more,
        loading: false,
      });
    } catch (error) {
      set({ error: 'Failed to fetch accommodations', loading: false });
    }
  },

  fetchAccommodation: async (id: string) => {
    try {
      const accommodation = await apiClient.getAccommodation(id);
      return accommodation;
    } catch (error) {
      set({ error: 'Failed to fetch accommodation' });
      return null;
    }
  },

  setFilters: (filters) => {
    set({ filters });
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  createAccommodation: async (data) => {
    set({ loading: true });
    try {
      await apiClient.createAccommodation(data);
      set({ loading: false });
    } catch (error) {
      set({ error: 'Failed to create accommodation', loading: false });
    }
  },

  reset: () => {
    set({
      accommodations: [],
      nextCursor: null,
      hasMore: true,
      error: null,
      filters: {},
    });
  },
}));
