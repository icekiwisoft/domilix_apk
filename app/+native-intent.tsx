const AUTH_CALLBACK_SCHEMES = new Set([
  'domilix:',
  'com.jack0237.domilix:',
]);

const WEB_HOSTS = new Set(['domilix.com', 'www.domilix.com']);
const LISTING_TYPES: Record<string, string> = {
  houses: 'realestate',
  furnitures: 'furniture',
  terrains: 'land',
};

// Maps a website path (https://domilix.com/...) or a domilix:// link to the
// matching app screen. Unknown pages open the home tab instead of a 404.
function webPathToAppPath(pathname: string, search: URLSearchParams) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] === 'fr' || segments[0] === 'en') segments.shift();
  const [section, id] = segments;

  if (!section) return '/';
  if (Object.hasOwn(LISTING_TYPES, section)) {
    if (id) return /^\d+$/.test(id) && segments.length === 2 ? `/announces/${id}` : '/';
    const params = new URLSearchParams({ type: LISTING_TYPES[section] });
    const q = search.get('search') ?? search.get('q');
    if (q) params.set('q', q);
    return `/explore?${params.toString()}`;
  }
  if (section === 'announces' && id) return `/announces/${encodeURIComponent(id)}`;
  if (section === 'announcers' && id) return `/announcers/${encodeURIComponent(id)}`;
  if (section === 'subscriptions') return '/profile/subscriptions';
  if (section === 'maps') return '/explore/map';
  if (section === 'favorite' || section === 'favorites') return '/favorites';
  if (section === 'notifications') return '/notifications';
  return '/';
}

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
      if (Object.hasOwn(LISTING_TYPES, first) || first === 'subscriptions' || first === 'maps') {
        return webPathToAppPath(pathname, url.searchParams);
      }
    }
  } catch {
    // Let Expo Router handle malformed or unrelated links normally.
  }

  return path;
}
