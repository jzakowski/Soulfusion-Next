export interface AccommodationImage {
  url: string;
  key: string;
  thumbnail_url?: string;
}

export type AccommodationType =
  | 'komplette_unterkunft'
  | 'zimmer'
  | 'bett'
  | 'couch'
  | 'zelt'
  | 'camperplatz';

export type OfferType = 'kostenlos' | 'gegen_hand';

export interface Accommodation {
  id: string;
  title: string;
  description?: string;
  location_city: string;
  location_postal: string;
  location_country?: string;
  location_coordinates?: {
    latitude: number;
    longitude: number;
  };
  images: AccommodationImage[];
  host_id: string;
  host_name: string;
  host_avatar_url?: string;
  host_rating?: number;
  type: AccommodationType;
  offer_type: OfferType;
  max_guests?: number;
  available_from?: string;
  available_until?: string;
  amenities: AccommodationAmenity[];
  house_rules?: string[];
  price_note?: string;
  created_at: string;
  updated_at?: string;
}

export interface AccommodationAmenity {
  name: string;
  category: 'basic' | 'comfort' | 'kitchen' | 'bathroom' | 'outdoor' | 'other';
  available: boolean;
}

export interface AccommodationFilters {
  location?: string;
  type?: AccommodationType;
  offer_type?: OfferType;
  max_guests?: number;
  available_from?: string;
  available_until?: string;
  amenities?: string[];
  price_min?: number;
  price_max?: number;
}

export interface AccommodationsResponse {
  accommodations: Accommodation[];
  total: number;
  next_cursor?: string;
  has_more: boolean;
}

export interface CreateAccommodationData {
  title: string;
  description?: string;
  location_city: string;
  location_postal: string;
  location_country?: string;
  type: AccommodationType;
  offer_type: OfferType;
  max_guests?: number;
  available_from?: string;
  available_until?: string;
  amenities: AccommodationAmenity[];
  house_rules?: string[];
  price_note?: string;
  main_image_url?: string;
  gallery_urls?: string[];
  private_bathroom?: boolean;
  washing_machine_allowed?: boolean;
  home_office_allowed?: boolean;
}
