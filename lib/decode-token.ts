interface JwtPayload {
  sub?: string;
  iat?: number;
  exp?: number;
  is_announcer?: boolean;
  is_admin?: boolean;
  [key: string]: unknown;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isAnnouncerToken(token: string | null): boolean {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  return !!payload?.is_announcer;
}
