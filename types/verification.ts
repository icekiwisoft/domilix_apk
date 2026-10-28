export type VerificationStatus = 'pending' | 'approved' | 'rejected';

// Announcer identity verification (CNI) — GET/POST /announcer-requests
export interface AnnouncerVerificationRequest {
  id: number;
  client_id?: string;
  user_id: number;
  status: VerificationStatus | string;
  identity_document_media_id?: string | null;
  identity_document?: string | null;
  contact_phone?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Student status verification — GET/POST /student-verification
export interface StudentVerificationRequest {
  id: number;
  client_id?: string;
  user_id: number;
  status: VerificationStatus | string;
  student_id_media_id?: string | null;
  student_id_document?: string | null;
  receipt_media_id?: string | null;
  receipt_document?: string | null;
  approved_at?: string | null;
  expires_at?: string | null;
  // Computed server-side from expires_at, never stored: a student status
  // can never be permanent.
  is_currently_verified: boolean;
  is_expired: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type UploadType =
  | 'media'
  | 'avatar'
  | 'presentation-image'
  | 'id-document'
  | 'student-id'
  | 'student-receipt';

export interface UploadResponse {
  id: string;
  type: UploadType;
  purpose: string;
  mime_type: string;
  size?: number | null;
  original_name?: string;
}
