import { create } from 'zustand';
import { apiClient } from '@/lib/api/client';

// Event types based on database schema
export interface Event {
  id: string;
  created_by: string;
  name: string;
  description: string | null;
  category: string;
  is_online: boolean;
  meeting_url: string | null;
  latitude: number | null;
  longitude: number | null;
  postcode: string | null;
  city: string | null;
  street: string | null;
  house_number: string | null;
  place_note: string | null;
  starts_at: string;
  ends_at: string | null;
  visibility: 'public' | 'private' | 'friends';
  is_shareable: boolean;
  capacity: number | null;
  price_type: 'free' | 'split' | 'fixed';
  price_cents: number | null;
  dogs_allowed: boolean;
  child_friendly: boolean;
  status: string;
  slug: string | null;
  created_at: string;
  updated_at: string;
  // Computed fields
  attendee_count?: number;
  is_joined?: boolean;
  is_interested?: boolean;
}

export interface EventsResponse {
  events: Event[];
  total?: number;
  has_more?: boolean;
  next_cursor?: string | null;
}

// Mock events for development/fallback
const mockEvents: Event[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    created_by: 'fb42aab2-4da2-4241-aae6-cc00263e5171',
    name: 'Morgendliche Meditation im Englischen Garten',
    description: 'Starte den Tag mit einer geführten Meditation im Grünen. Wir treffen uns am Chinesischen Turm und meditieren für 45 Minuten.',
    category: 'meditation',
    is_online: false,
    meeting_url: null,
    latitude: 48.1754,
    longitude: 11.5893,
    postcode: '80538',
    city: 'München',
    street: 'Englischer Garten',
    house_number: null,
    place_note: 'Am Chinesischen Turm',
    starts_at: '2025-01-20T07:00:00Z',
    ends_at: '2025-01-20T08:00:00Z',
    visibility: 'public',
    is_shareable: true,
    capacity: 15,
    price_type: 'free',
    price_cents: null,
    dogs_allowed: true,
    child_friendly: true,
    status: 'active',
    slug: 'morgendliche-meditation-muenchen',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attendee_count: 8,
    is_joined: false,
    is_interested: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    created_by: 'fb42aab2-4da2-4241-aae6-cc00263e5171',
    name: 'Yoga Flow Workshop',
    description: 'Entspanne dich mit einem sanften Yoga Flow. Perfekt für Anfänger und Fortgeschrittene. Bitte eigene Yogamatte mitbringen.',
    category: 'yoga',
    is_online: false,
    meeting_url: null,
    latitude: 52.5200,
    longitude: 13.4050,
    postcode: '10178',
    city: 'Berlin',
    street: 'Alexanderplatz',
    house_number: '5',
    place_note: 'Yoga Studio im 3. Stock',
    starts_at: '2025-01-25T18:30:00Z',
    ends_at: '2025-01-25T20:00:00Z',
    visibility: 'public',
    is_shareable: true,
    capacity: 12,
    price_type: 'fixed',
    price_cents: 1500,
    dogs_allowed: true,
    child_friendly: true,
    status: 'active',
    slug: 'yoga-flow-berlin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attendee_count: 5,
    is_joined: false,
    is_interested: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    created_by: 'fb42aab2-4da2-4241-aae6-cc00263e5171',
    name: 'Wanderung & Meditation im Taunus',
    description: 'Verbinde Natur und Spiritualität auf einer entspannten Wanderung durch den Taunus.',
    category: 'retreat',
    is_online: false,
    meeting_url: null,
    latitude: 50.2,
    longitude: 8.5,
    postcode: '61234',
    city: 'Frankfurt',
    street: 'Taunusstraße',
    house_number: '1',
    place_note: 'Treffpunkt: Wanderparkplatz Weilrod',
    starts_at: '2025-01-22T10:00:00Z',
    ends_at: '2025-01-22T14:00:00Z',
    visibility: 'public',
    is_shareable: true,
    capacity: 20,
    price_type: 'free',
    price_cents: null,
    dogs_allowed: true,
    child_friendly: false,
    status: 'active',
    slug: 'wanderung-meditation-taunus',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attendee_count: 12,
    is_joined: false,
    is_interested: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    created_by: 'fb42aab2-4da2-4241-aae6-cc00263e5171',
    name: 'Full Moon Circle - Vollmond-Zeremonie',
    description: 'Feiere den Vollmond mit einer spirituellen Zeremonie. Wir kommen zusammen, meditieren und lassen das Alte los.',
    category: 'ceremony',
    is_online: false,
    meeting_url: null,
    latitude: 53.5511,
    longitude: 9.9937,
    postcode: '20354',
    city: 'Hamburg',
    street: 'Alsterchaussee',
    house_number: null,
    place_note: 'Im Freien am Alsterufer',
    starts_at: '2025-01-25T20:00:00Z',
    ends_at: '2025-01-25T22:30:00Z',
    visibility: 'public',
    is_shareable: true,
    capacity: 30,
    price_type: 'fixed',
    price_cents: 2500,
    dogs_allowed: false,
    child_friendly: true,
    status: 'active',
    slug: 'full-moon-circle-hamburg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attendee_count: 18,
    is_joined: false,
    is_interested: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    created_by: 'fb42aab2-4da2-4241-aae6-cc00263e5171',
    name: 'Atemarbeit Workshop',
    description: 'Lerne verschiedene Atemtechniken für mehr Energie, Ruhe und Heilung. Der Workshop ist für alle geeignet.',
    category: 'workshop',
    is_online: false,
    meeting_url: null,
    latitude: 51.2277,
    longitude: 6.7735,
    postcode: '40212',
    city: 'Düsseldorf',
    street: 'Königsallee',
    house_number: '22',
    place_note: 'Studio im Erdgeschoss',
    starts_at: '2025-01-19T17:30:00Z',
    ends_at: '2025-01-19T19:30:00Z',
    visibility: 'public',
    is_shareable: true,
    capacity: 8,
    price_type: 'fixed',
    price_cents: 2000,
    dogs_allowed: false,
    child_friendly: true,
    status: 'active',
    slug: 'atemarbeit-duesseldorf',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attendee_count: 6,
    is_joined: false,
    is_interested: false,
  },
];

interface EventsState {
  events: Event[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  nextCursor: string | null;
  total: number;
}

interface EventsStore extends EventsState {
  fetchEvents: (params?: { cursor?: string; limit?: number }) => Promise<void>;
  fetchEvent: (id: string) => Promise<Event | null>;
  joinEvent: (id: string) => Promise<void>;
  leaveEvent: (id: string) => Promise<void>;
  toggleInterest: (id: string) => Promise<void>;
  createEvent: (data: any) => Promise<void>;
  reset: () => void;
}

export const useEventsStore = create<EventsStore>((set, get) => ({
  events: [],
  loading: false,
  error: null,
  hasMore: true,
  nextCursor: null,
  total: 0,

  fetchEvents: async (params = {}) => {
    set({ loading: true, error: null });

    try {
      // Try to fetch from API
      const response = await fetch('https://api.soul-fusion.de/api/events', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();

      // Check if response has events
      if (data.events && Array.isArray(data.events)) {
        set({
          events: data.events,
          total: data.total || data.events.length,
          nextCursor: data.next_cursor || null,
          hasMore: data.has_more || false,
          loading: false,
        });
      } else if (Array.isArray(data)) {
        // Direct array response
        set({
          events: data,
          total: data.length,
          loading: false,
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.log('Using mock events due to API error:', error);
      // Use mock data as fallback
      set({
        events: mockEvents,
        total: mockEvents.length,
        loading: false,
      });
    }
  },

  fetchEvent: async (id: string) => {
    try {
      const response = await fetch(`https://api.soul-fusion.de/api/events/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }

      const event = await response.json();
      return event;
    } catch (error) {
      // Return mock event as fallback
      return mockEvents.find(e => e.id === id) || null;
    }
  },

  joinEvent: async (id: string) => {
    try {
      await apiClient.getClient().post(`/api/events/${id}/join`);

      // Update local state
      set(state => ({
        events: state.events.map(event =>
          event.id === id
            ? { ...event, is_joined: true, attendee_count: (event.attendee_count || 0) + 1 }
            : event
        ),
      }));
    } catch (error) {
      console.error('Failed to join event:', error);
      throw error;
    }
  },

  leaveEvent: async (id: string) => {
    try {
      await apiClient.getClient().post(`/api/events/${id}/leave`);

      // Update local state
      set(state => ({
        events: state.events.map(event =>
          event.id === id
            ? { ...event, is_joined: false, attendee_count: Math.max((event.attendee_count || 1) - 1, 0) }
            : event
        ),
      }));
    } catch (error) {
      console.error('Failed to leave event:', error);
      throw error;
    }
  },

  toggleInterest: async (id: string) => {
    try {
      await apiClient.getClient().post(`/api/events/${id}/interest`);

      // Update local state
      set(state => ({
        events: state.events.map(event =>
          event.id === id
            ? { ...event, is_interested: !event.is_interested }
            : event
        ),
      }));
    } catch (error) {
      console.error('Failed to toggle interest:', error);
      throw error;
    }
  },

  createEvent: async (data) => {
    set({ loading: true });
    try {
      await apiClient.getClient().post('/api/events', data);
      set({ loading: false });
    } catch (error) {
      set({ error: 'Failed to create event', loading: false });
      throw error;
    }
  },

  reset: () => {
    set({
      events: [],
      nextCursor: null,
      hasMore: true,
      error: null,
      total: 0,
    });
  },
}));
