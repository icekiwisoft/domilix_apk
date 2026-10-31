import { isAxiosError } from 'axios';

/**
 * True when a request never reached the server (no connection, DNS failure):
 * axios reports it as ERR_NETWORK with no response. A timeout or an HTTP
 * error status is not "offline", so those keep the generic error state.
 * Use it on the screen's main query only, never to conclude the device is
 * offline from a secondary request (team lessons, cache §4).
 */
export function isNetworkError(error: unknown): boolean {
  return isAxiosError(error) && !error.response && error.code === 'ERR_NETWORK';
}
