const AUTH_CALLBACK_SCHEMES = new Set([
  'domilix:',
  'com.jack0237.domilix:',
]);

export function redirectSystemPath({ path }: { path: string }) {
  try {
    const url = new URL(path, 'domilix://');
    const isAuthCallback = AUTH_CALLBACK_SCHEMES.has(url.protocol)
      && (url.hostname === 'oauthredirect' || url.pathname === '/oauthredirect');

    if (isAuthCallback) return null;
  } catch {
    // Let Expo Router handle malformed or unrelated links normally.
  }

  return path;
}
