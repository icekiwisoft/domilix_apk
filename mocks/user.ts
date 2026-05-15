import type { User } from '@/types/auth';
import { MOCK_ANNOUNCERS } from './announcers';

export const MOCK_CURRENT_USER: User = {
  id: 'user-1',
  name: 'Wilfried Ngueguim',
  email: 'wilfried@domilix.com',
  phone_number: '+237 690 123 456',
  phone_verified: true,
  is_admin: false,
  is_announcer: true,
  credits_count: 12,
  announcer: MOCK_ANNOUNCERS[0],
  created_at: '2024-08-01T10:00:00.000Z',
  updated_at: '2026-04-30T16:00:00.000Z',
};

export const MOCK_GUEST_USER: User = {
  id: 'user-2',
  name: 'Jean-Paul Fouda',
  email: 'jpfouda@example.com',
  phone_number: '+237 677 987 654',
  phone_verified: true,
  is_admin: false,
  is_announcer: false,
  credits_count: 3,
  created_at: '2025-01-15T08:00:00.000Z',
  updated_at: '2026-05-10T12:00:00.000Z',
};
