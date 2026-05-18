export interface Announcer {
  id: string;
  name: string;
  company_name?: string;
  bio?: string | null;
  contact?: string;
  professional_phone?: string;
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
