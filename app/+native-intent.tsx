import { WEB_HOSTS, isListingSection, webPathToAppPath } from '@/lib/deep-links';

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

    if ((url.protocol === 'https:' || url.protocol === 'http:') && WEB_HOSTS.has(url.hostname)) {
      return webPathToAppPath(url.pathname, url.searchParams);
    }

    // domilix://houses/12 → same mapping as the website; domilix://announces/12
    // and other app routes keep working as before.
    if (url.protocol === 'domilix:' && url.hostname) {
      const pathname = `/${url.hostname}${url.pathname}`;
      const first = url.hostname;
      if (isListingSection(first) || first === 'subscriptions' || first === 'maps') {
        return webPathToAppPath(pathname, url.searchParams);
      }
    }
  } catch {
    // Let Expo Router handle malformed or unrelated links normally.
  }

  return path;
}
