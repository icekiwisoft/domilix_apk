import type { Announcer } from './announcer';

// ─── Enums ────────────────────────────────────────────────────────────────────

export type AnnounceType = 'realestate' | 'furniture';
export type AdType = 'location' | 'sale';
export type Standing = 'standard' | 'confort' | 'haut_standing';
// Note: category type uses 'house' (not 'realestate') per the backend schema
export type CategoryType = 'furniture' | 'house';

// ─── Sub-entities ─────────────────────────────────────────────────────────────

export interface Media {
  id: string;
  file: string;
  thumbnail?: string;
  type?: string;
  announce_id?: string;
  announcer_id?: string;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  created_at?: string;
}

export interface Broadcast {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  cta?: string;
  image?: string;
  bg?: string;
  action_url?: string;
  active: boolean;
  position: number;
  starts_at?: string;
  ends_at?: string;
}

// ─── Announce ─────────────────────────────────────────────────────────────────

export interface Announce {
  id: string;
  type: AnnounceType;
  ad_type: AdType;
  price: number;
  devise: string;
  period?: string;
  description: string;
  address: string;
  city: string;
  neighborhood?: string;
  state?: string;
  country: string;
  postal_code?: string;
  contact_phone?: string;
  contact_email?: string;
  size?: number;
  bedrooms?: number;
  standing?: Standing;
  // Amenities (boolean flags — present on detail endpoint)
  wifi?: boolean;
  air_conditioning?: boolean;
  security_24h?: boolean;
  smart_tv?: boolean;
  equipped_kitchen?: boolean;
  gate?: boolean;
  pool?: boolean;
  // Relations
  category_id?: string;
  category?: Category;
  announcer_id?: string;
  announcer: Announcer;
  medias: Media[];
  // User interaction
  liked: boolean;
  unlocked: boolean;
  likes_count?: number;
  creation_date: string;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface AnnounceFilters {
  type?: AnnounceType;
  ad_type?: AdType;
  city?: string;
  address?: string;
  budget_min?: number;
  budget_max?: number;
  category_id?: string[];
  standing?: Standing;
  bedroom_min?: number;
  bedroom_max?: number;
  amenities?: string[];
  search?: string;
  orderBy?: string;
  AnnouncerId?: string;
  liked?: boolean;
  page?: number;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}
