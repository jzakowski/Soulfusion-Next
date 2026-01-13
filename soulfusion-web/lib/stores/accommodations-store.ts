import { create } from 'zustand';
import type { Accommodation, AccommodationsResponse, AccommodationFilters } from '@/types/features/accommodation';
import { apiClient } from '@/lib/api/client';

interface AccommodationsState {
  accommodations: Accommodation[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  nextCursor: string | null;
  total: number;
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
  total: 0,
  filters: {},

  fetchAccommodations: async (params = {}) => {
    const { filters } = get();
    const queryParams = { ...filters, ...params };

    set({ loading: true, error: null });

    try {
      const response = await apiClient.getAccommodations(queryParams);

      // Backend returns { ok: true, items: [...] }
      const items = response.items || response.accommodations || [];

      if (!items || items.length === 0) {
        set({
          accommodations: [],
          total: 0,
          loading: false,
        });
        return;
      }

      // Transform backend data to frontend format
      const accommodations: Accommodation[] = items.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        location_city: item.location_city,
        location_postal: item.location_postal,
        images: item.main_image_url
          ? [{ key: 'main', url: item.main_image_url }, ...(item.gallery_urls || []).map((url: string, i: number) => ({ key: `gallery-${i}`, url }))]
          : (item.gallery_urls || []).map((url: string, i: number) => ({ key: `gallery-${i}`, url })),
        host_id: item.host_id,
        host_name: item.host_name || 'Gastgeber',
        host_avatar_url: item.host_avatar_url,
        host_rating: undefined,
        type: item.type,
        offer_type: item.offer_type,
        max_guests: item.capacity,
        available_from: item.availability?.from,
        amenities: [
          ...(item.wifi ? [{ name: 'WiFi', category: 'basic' as const, available: true }] : []),
          ...(item.smoking_allowed ? [{ name: 'Rauchen erlaubt', category: 'other' as const, available: true }] : []),
          ...(item.children_allowed ? [{ name: 'Kinder willkommen', category: 'other' as const, available: true }] : []),
          ...(item.pets_allowed?.dogs ? [{ name: 'Haustiere erlaubt', category: 'other' as const, available: true }] : []),
        ],
        house_rules: [
          ...(item.smoking_allowed ? [] : ['Nicht rauchen']),
          ...(item.children_allowed ? [] : ['Keine Kinder']),
        ],
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      set({
        accommodations,
        total: items.length,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to fetch accommodations:', error);
      set({
        error: 'Failed to load accommodations',
        loading: false,
      });
    }
  },

  fetchAccommodation: async (id: string) => {
    try {
      const accommodation = await apiClient.getAccommodation(id);
      return accommodation;
    } catch (error) {
      console.error('Failed to fetch accommodation:', error);
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
      total: 0,
    });
  },
}));
