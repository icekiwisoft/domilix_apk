export interface Announcer {
  id: string;
  name: string;
  company_name?: string;
  bio?: string;
  contact?: string;
  professional_phone?: string;
  avatar?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface AnnouncerRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}
