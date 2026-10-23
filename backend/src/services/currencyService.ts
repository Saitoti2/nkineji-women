import axios from 'axios';
import { logger } from '../utils/logger.js';

/**
 * Live exchange rates, shared by the API and the frontend.
 *
 * The donor is quoted a figure in the browser and then charged by PesaPal in
 * KES. Those two numbers have to come from the same rate, so this service is
 * the single source of truth: the frontend reads it through /currency/rates
 * rather than calling a third-party API of its own.
 *
 * Source: FawazAhmed0 Currency API — free, no key, no rate limit, 340+
 * currencies, updated daily.
 */
const RATES_API_URL = 'https://latest.currency-api.pages.dev/v1/currencies/usd.json';
const FALLBACK_API_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export type ExchangeRates = Record<string, number>;

interface RatesResponse {
    date: string;
    usd: Record<string, number>;
}

/**
 * Last-resort rates, used only when the API is unreachable and nothing has
 * been cached yet. Approximate by nature — treat a conversion made from these
 * as indicative, not exact.
 */
const FALLBACK_RATES: ExchangeRates = {
    USD: 1,
    KES: 129.84,
    EUR: 0.89,
    GBP: 0.75,
    CAD: 1.40,
    AUD: 1.43,
    AED: 3.67,
    ZAR: 17.2,
    TZS: 2645,
    UGX: 4204,
};

class CurrencyService {
    private ratesCache: ExchangeRates | null = null;
    private lastFetch = 0;
    private ratesDate: string | null = null;
    private inFlight: Promise<ExchangeRates> | null = null;

    /** True when the rates on hand came from the API rather than the fallback. */
    public get isLive(): boolean {
        return this.ratesCache !== null;
    }

    public get asOf(): string | null {
        return this.ratesDate;
    }

    async getExchangeRates(): Promise<ExchangeRates> {
        const age = Date.now() - this.lastFetch;

        if (this.ratesCache && age < CACHE_DURATION) {
            return this.ratesCache;
        }

        // Collapse concurrent refreshes into one upstream request.
        if (this.inFlight) return this.inFlight;

        this.inFlight = this.fetchRates(age).finally(() => {
            this.inFlight = null;
        });

        return this.inFlight;
    }

    private async fetchRates(cacheAge: number): Promise<ExchangeRates> {
        for (const url of [RATES_API_URL, FALLBACK_API_URL]) {
            try {
                const response = await axios.get<RatesResponse>(url, { timeout: 5000 });
                const rawRates = response.data?.usd;

                if (!rawRates || typeof rawRates !== 'object') {
                    throw new Error('Unexpected response shape');
                }

                const rates: ExchangeRates = { USD: 1 };
                for (const [code, rate] of Object.entries(rawRates)) {
                    if (typeof rate === 'number' && Number.isFinite(rate) && rate > 0) {
                        rates[code.toUpperCase()] = rate;
                    }
                }

                this.ratesCache = rates;
                this.ratesDate = response.data.date ?? null;
                this.lastFetch = Date.now();

                logger.info('Exchange rates updated', {
                    currencies: Object.keys(rates).length,
                    date: this.ratesDate,
                    usdKes: rates.KES,
                });

                return rates;
            } catch (error: any) {
                logger.warn('Exchange rate fetch failed', { url, message: error.message });
            }
        }

        // Stale rates still beat a wrong constant, so prefer them over the fallback.
        if (this.ratesCache) {
            logger.warn('Using stale exchange rates', { ageMinutes: Math.round(cacheAge / 60000) });
            return this.ratesCache;
        }

        logger.error('No exchange rates available; using hardcoded fallback');
        return FALLBACK_RATES;
    }

    /**
     * Converts between any two supported currencies via USD.
     * Throws rather than guessing when a rate is genuinely unavailable — a
     * silent 1:1 fallback would charge the wrong amount.
     */
    async convert(amount: number, from: string, to: string): Promise<number> {
        const fromCode = from?.toUpperCase() || 'USD';
        const toCode = to?.toUpperCase() || 'USD';

        if (fromCode === toCode) return amount;

        const rates = await this.getExchangeRates();
        const fromRate = rates[fromCode];
        const toRate = rates[toCode];

        if (!fromRate || !toRate) {
            throw new Error(`Unsupported currency conversion: ${fromCode} -> ${toCode}`);
        }

        const inUsd = fromCode === 'USD' ? amount : amount / fromRate;
        const converted = toCode === 'USD' ? inUsd : inUsd * toRate;

        // Money: two decimal places, half-up.
        return Math.round((converted + Number.EPSILON) * 100) / 100;
    }
}

export const currencyService = new CurrencyService();
