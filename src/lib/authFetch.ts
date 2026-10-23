/**
 * Keeps the admin signed in across access-token expiry.
 *
 * Access tokens last 7 days and every call site uses bare fetch, so once one
 * expired the whole admin kept rendering (isAuthenticated is persisted) while
 * every request returned 401 and each page came up empty. Rather than threading
 * refresh logic through ~96 call sites, fetch is wrapped once here: a 401 from
 * our API triggers a single refresh, and the original request is replayed with
 * the new token.
 */

import { useAuthStore } from '@/stores/authStore';

const API_BASE = import.meta.env.VITE_API_URL || '';

/** Captured before the override so retries and refresh bypass the wrapper. */
const originalFetch = window.fetch.bind(window);

/** Concurrent 401s share one refresh rather than each firing their own. */
let refreshInFlight: Promise<string | null> | null = null;

const isApiRequest = (url: string): boolean => {
    if (!API_BASE) return false;
    try {
        return new URL(url, window.location.origin).href.startsWith(new URL(API_BASE, window.location.origin).href);
    } catch {
        return false;
    }
};

/** The refresh call itself must never be retried, or a failure loops. */
const isAuthEndpoint = (url: string): boolean =>
    url.includes('/auth/refresh') || url.includes('/auth/login') || url.includes('/auth/logout');

async function refreshAccessToken(): Promise<string | null> {
    if (refreshInFlight) return refreshInFlight;

    refreshInFlight = (async () => {
        const refreshToken = useAuthStore.getState().refreshToken
            || localStorage.getItem('mara_bloom_refresh_token');

        if (!refreshToken) return null;

        try {
            const res = await originalFetch(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (!res.ok) return null;

            const data = await res.json();
            const accessToken = data?.accessToken || data?.data?.accessToken;
            if (!accessToken) return null;

            useAuthStore.getState().refreshAccessToken(accessToken);
            return accessToken;
        } catch {
            return null;
        } finally {
            refreshInFlight = null;
        }
    })();

    return refreshInFlight;
}

/** Replaces the Authorization header on a replayed request. */
function withToken(init: RequestInit | undefined, token: string): RequestInit {
    const headers = new Headers(init?.headers || {});
    headers.set('Authorization', `Bearer ${token}`);
    return { ...init, headers };
}

export function installAuthFetch() {
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

        const response = await originalFetch(input as any, init);

        if (response.status !== 401 || !isApiRequest(url) || isAuthEndpoint(url)) {
            return response;
        }

        // A request with no Authorization header was never authenticated, so a
        // 401 is the endpoint's own answer, not an expired session.
        const hadAuth = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined)).has('Authorization');
        if (!hadAuth) return response;

        const token = await refreshAccessToken();

        if (!token) {
            useAuthStore.getState().logout();
            if (!window.location.pathname.startsWith('/login')) {
                window.location.href = '/login';
            }
            return response;
        }

        // Replay the original request with the refreshed token.
        if (input instanceof Request) {
            return originalFetch(new Request(input, withToken(init, token)));
        }
        return originalFetch(input as any, withToken(init, token));
    };
}
