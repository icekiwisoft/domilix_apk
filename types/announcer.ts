export interface Announcer {
  id: string;
  /** Structure / agency name (saved through `company_name`). */
  name: string;
  bio?: string | null;
  /** Professional phone (saved through `professional_phone`). */
  contact?: string;
  email?: string;
  avatar?: string;
  avatar_media_id?: string;
  user_id?: string;
  verified?: boolean;
  houses?: number;
  furnitures?: number;
  creation_date: string;
}

export interface AnnouncerRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}
