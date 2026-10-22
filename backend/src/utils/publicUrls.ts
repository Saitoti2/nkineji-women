/**
 * Resolves the public base URLs this service is reachable on.
 *
 * FRONTEND_URL is a comma-separated allow-list used for CORS, so it must never
 * be interpolated into a URL as-is — the first entry is the canonical origin.
 */

const stripTrailingSlash = (url: string) => url.replace(/\/+$/, '');

const firstEntry = (value: string | undefined): string | undefined => {
    if (!value) return undefined;
    const first = value.split(',')[0]?.trim();
    return first ? stripTrailingSlash(first) : undefined;
};

/**
 * Origin donors are redirected back to after paying. In development the first
 * FRONTEND_URL entry wins, so a local payment returns to the local app rather
 * than to the live site.
 */
export const getFrontendBaseUrl = (): string => {
    const production = firstEntry(process.env.PRODUCTION_URL);
    const configured = firstEntry(process.env.FRONTEND_URL);

    if (process.env.NODE_ENV === 'production') {
        return production || configured || 'http://localhost:5173';
    }

    return configured || production || 'http://localhost:5173';
};

/**
 * Origin this API is publicly reachable on. PesaPal calls the IPN directly, so
 * this must be the API host — not the frontend domain, which serves the SPA and
 * would swallow the callback.
 */
export const getBackendBaseUrl = (): string => {
    const configured = firstEntry(process.env.BACKEND_PUBLIC_URL);
    if (configured) return configured;

    // Vercel exposes the deployment host but not the scheme.
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        return `https://${stripTrailingSlash(process.env.VERCEL_PROJECT_PRODUCTION_URL)}`;
    }

    return `http://localhost:${process.env.PORT || 3000}`;
};

/** Matches the API_PREFIX the routes are mounted under in index.ts. */
export const API_PREFIX = '/api/v1';

/** The one URL that must be registered with PesaPal as this service's IPN. */
export const getPesapalIpnUrl = (): string =>
    `${getBackendBaseUrl()}${API_PREFIX}/donations/webhooks/pesapal`;
