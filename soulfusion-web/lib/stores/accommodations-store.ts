import { create } from 'zustand';
import type { Accommodation, AccommodationsResponse, AccommodationFilters } from '@/types/features/accommodation';
import { apiClient } from '@/lib/api/client';

// Mock accommodations for development/fallback
const mockAccommodations: Accommodation[] = [
  {
    id: '1',
    title: 'Ruhiges Zimmer im Grünen',
    description: 'Gemütliches Zimmer mit Gartenblick',
    location_city: 'Berlin',
    location_postal: '10243',
    images: [{ key: '1-1', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800' }],
    host_id: '1',
    host_name: 'Sarah',
    host_avatar_url: undefined,
    host_rating: 4.8,
    type: 'zimmer',
    offer_type: 'gegen_hand',
    amenities: [
      { name: 'WiFi', category: 'basic', available: true },
      { name: 'Küche', category: 'kitchen', available: true },
      { name: 'Bad', category: 'bathroom', available: true },
    ],
    max_guests: 2,
    available_from: new Date().toISOString(),
    house_rules: ['Ruhe nach 22 Uhr'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Campingplatz am See',
    description: 'Schöner Platz für Zelte und Wohnmobile',
    location_city: 'München',
    location_postal: '80331',
    images: [{ key: '2-1', url: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800' }],
    host_id: '2',
    host_name: 'Tom',
    host_avatar_url: undefined,
    host_rating: 4.5,
    type: 'zelt',
    offer_type: 'kostenlos',
    amenities: [
      { name: 'Feuerstelle', category: 'outdoor', available: true },
    ],
    max_guests: undefined,
    available_from: new Date().toISOString(),
    house_rules: ['Ruhe nach 22 Uhr'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Gemütliche Wohnung in Hamburg',
    description: 'Helles Zimmer in zentraler Lage',
    location_city: 'Hamburg',
    location_postal: '22087',
    images: [{ key: '3-1', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800' }],
    host_id: '3',
    host_name: 'Lisa',
    host_avatar_url: undefined,
    host_rating: 4.9,
    type: 'komplette_unterkunft',
    offer_type: 'kostenlos',
    amenities: [
      { name: 'WiFi', category: 'basic', available: true },
      { name: 'Küche', category: 'kitchen', available: true },
      { name: 'Waschmaschine', category: 'basic', available: true },
    ],
    max_guests: 4,
    available_from: new Date().toISOString(),
    house_rules: ['Nicht rauchen'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

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
    const { filters, accommodations: existing } = get();
    const queryParams = { ...filters, ...params };

    set({ loading: true, error: null });

    try {
      const response: AccommodationsResponse = await apiClient.getAccommodations(queryParams);
      set({
        accommodations: response.accommodations,
        total: response.total || response.accommodations.length,
        nextCursor: response.next_cursor || null,
        hasMore: response.has_more,
        loading: false,
      });
    } catch (error) {
      console.log('Using mock accommodations due to API error');
      // Use mock data as fallback
      set({
        accommodations: mockAccommodations,
        total: mockAccommodations.length,
        loading: false,
      });
    }
  },

  fetchAccommodation: async (id: string) => {
    try {
      const accommodation = await apiClient.getAccommodation(id);
      return accommodation;
    } catch (error) {
      // Return mock accommodation as fallback
      return mockAccommodations.find(a => a.id === id) || null;
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
