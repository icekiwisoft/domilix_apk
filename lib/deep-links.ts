const LISTING_TYPES: Record<string, string> = {
  houses: 'realestate',
  furnitures: 'furniture',
  terrains: 'land',
};

export const WEB_HOSTS = new Set(['domilix.com', 'www.domilix.com']);

/**
 * Maps a website path (https://domilix.com/..., or the `link` of a backend
 * notification such as "/houses/12" or "/settings?tab=packs") to the matching
 * app screen. Unknown pages open the home tab instead of a 404.
 */
export function webPathToAppPath(pathname: string, search: URLSearchParams = new URLSearchParams()) {
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
  if (section === 'settings') {
    const tab = search.get('tab');
    if (tab === 'packs') return '/profile/subscriptions';
    if (tab === 'announcer') return '/profile/announcer-profile';
    return '/profile/settings';
  }
  if (section === 'users') return '/profile';
  if (section === 'maps') return '/explore/map';
  if (section === 'favorite' || section === 'favorites') return '/favorites';
  if (section === 'notifications') return '/notifications';
  return '/';
}

/** App route for a notification link (relative website path or full URL). */
export function notificationLinkToAppPath(link: string | null | undefined) {
  if (!link) return '/notifications';
  try {
    const url = new URL(link, 'https://domilix.com');
    if (!WEB_HOSTS.has(url.hostname)) return '/notifications';
    return webPathToAppPath(url.pathname, url.searchParams);
  } catch {
    return '/notifications';
  }
}

export function isListingSection(section: string) {
  return Object.hasOwn(LISTING_TYPES, section);
}
