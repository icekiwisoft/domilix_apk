import type { Subscription } from '@/types/notification';

// A Domicoin pack (subscription) is usable while it still has credits and
// hasn't reached its expiry — mirrors the domilix.com web app's logic since
// the API itself has no "status" field.
export function isPackUsable(sub: Subscription): boolean {
  if (sub.credits <= 0) return false;
  const now = Date.now();
  const expiresAt = sub.expires_at ? new Date(sub.expires_at).getTime() : null;
  const endDate = sub.end_date ? new Date(sub.end_date).getTime() : null;
  if (expiresAt != null) return expiresAt > now;
  if (endDate != null) return endDate > now;
  return true;
}
