export interface User {
  id: string;
  name: string;
  email?: string;
  phone_number?: string;
  phone_verified: boolean;
  is_admin: boolean;
  is_announcer?: boolean;
  credits?: number;
  // The API returns just the announcer's id here (not the nested Announcer
  // object) — fetch the full record separately with useAnnouncer(announcerId)
  // when you need fields like avatar/bio/company_name.
  announcer?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

export interface RegisterDto {
  name: string;
  email?: string;
  phone_number?: string;
  password: string;
}

export interface LoginDto {
  email?: string;
  phone_number?: string;
  password: string;
}
