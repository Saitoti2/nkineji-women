/**
 * Currency Conversion Service
 * Fetches live exchange rates and handles currency conversions
 */

interface ExchangeRates {
  [key: string]: number; // e.g., { "USD": 0.0078, "EUR": 0.0072, "GBP": 0.0061 }
}

interface CurrencyCache {
  rates: ExchangeRates;
  baseCurrency: string;
  timestamp: number;
}

const API_BASE = import.meta.env.VITE_API_URL || '';

class CurrencyService {
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour cache
  // Our own backend, not a third-party API: the donor must be quoted from the
  // same rate PesaPal will be charged at, and the server owns that rate.
  private readonly API_URL = `${API_BASE}/currency/rates`;
  private cache: CurrencyCache | null = null;
  private fetchPromise: Promise<ExchangeRates> | null = null;

  /**
   * Fetch live exchange rates from API
   */
  private async fetchExchangeRates(): Promise<ExchangeRates> {
    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    this.fetchPromise = (async () => {
      try {
        console.log('🌍 Fetching live exchange rates...');
        const response = await fetch(this.API_URL);

        if (!response.ok) {
          throw new Error(`Exchange rate API error: ${response.status}`);
        }

        const payload = await response.json();
        // Backend returns { success: true, data: { USD: 1, KES: 129.84, ... } }
        const rates: ExchangeRates = payload?.data || payload?.rates || {};

        if (!rates || Object.keys(rates).length === 0) {
          throw new Error('Exchange rate response contained no rates');
        }

        // Cache the rates
        this.cache = {
          rates,
          baseCurrency: 'USD',
          timestamp: Date.now(),
        };

        // Also save to localStorage for offline use
        try {
          localStorage.setItem('currency_rates', JSON.stringify(this.cache));
        } catch (e) {
          console.warn('Could not save currency rates to localStorage:', e);
        }

        console.log('✅ Exchange rates fetched successfully');
        return rates;
      } catch (error) {
        console.error('❌ Error fetching exchange rates:', error);

        // Try to load from localStorage as fallback
        try {
          const cached = localStorage.getItem('currency_rates');
          if (cached) {
            const cachedData: CurrencyCache = JSON.parse(cached);
            const age = Date.now() - cachedData.timestamp;
            if (age < this.CACHE_DURATION * 24) { // Use cached data up to 24 hours old
              console.log('📦 Using cached exchange rates');
              this.cache = cachedData;
              return cachedData.rates;
            }
          }
        } catch (e) {
          console.warn('Could not load cached currency rates:', e);
        }

        // Fallback to default rates if API fails
        return this.getDefaultRates();
      } finally {
        this.fetchPromise = null;
      }
    })();

    return this.fetchPromise;
  }

  /**
   * Get default exchange rates (fallback if API fails)
   * Rates are from USD base (1 USD = X other currency)
   */
  private getDefaultRates(): ExchangeRates {
    // Last resort only: used when the API is unreachable and nothing is
    // cached. Approximate, so a quote from these is indicative, not exact.
    return {
      USD: 1.0,
      EUR: 0.89,
      GBP: 0.75,
      KES: 129.84,
    };
  }

  /**
   * Get exchange rates (cached or fresh)
   */
  async getExchangeRates(): Promise<ExchangeRates> {
    // Check cache first
    if (this.cache && (Date.now() - this.cache.timestamp) < this.CACHE_DURATION) {
      return this.cache.rates;
    }

    // Try loading from localStorage
    try {
      const cached = localStorage.getItem('currency_rates');
      if (cached) {
        const cachedData: CurrencyCache = JSON.parse(cached);
        const age = Date.now() - cachedData.timestamp;
        if (age < this.CACHE_DURATION) {
          this.cache = cachedData;
          return cachedData.rates;
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }

    // Fetch fresh rates
    return await this.fetchExchangeRates();
  }

  /**
   * Convert amount from one currency to another
   * All rates are from USD base (1 USD = X other currency)
   */
  async convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rates = await this.getExchangeRates();

    // Convert to base currency (USD) first
    let amountInUSD = amount;
    if (fromCurrency !== 'USD') {
      const fromRate = rates[fromCurrency.toUpperCase()];
      if (!fromRate) {
        console.warn(`Exchange rate not found for ${fromCurrency}, using 1:1`);
        return amount;
      }
      // Convert to USD: amount / rate (e.g., 12,800 KES / 128 = 100 USD)
      amountInUSD = amount / fromRate;
    }

    // Convert from USD to target currency
    if (toCurrency === 'USD') {
      return Math.round(amountInUSD * 100) / 100; // Round to 2 decimal places
    }

    const toRate = rates[toCurrency.toUpperCase()];
    if (!toRate) {
      console.warn(`Exchange rate not found for ${toCurrency}, using 1:1`);
      return amountInUSD;
    }

    // Convert from USD: amount * rate (e.g., 100 USD * 128 = 12,800 KES)
    const converted = amountInUSD * toRate;
    return Math.round(converted * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Format currency amount with proper symbol and formatting
   */
  formatCurrency(amount: number, currency: string): string {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      KES: 'KES ',
    };

    const symbol = symbols[currency?.toUpperCase()] || (currency?.toUpperCase() || 'USD') + ' ';

    // Defensive check for null/undefined/NaN
    if (amount === null || amount === undefined || isNaN(amount)) {
      return `${symbol}0.00`;
    }

    try {
      const formatted = amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return `${symbol}${formatted}`;
    } catch (error) {
      console.error('[CurrencyService] Error formatting currency:', error);
      return `${symbol}${amount}`;
    }
  }

  /**
   * Get all supported currencies
   */
  getSupportedCurrencies(): string[] {
    return ['KES', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'AED'];
  }
}

export const currencyService = new CurrencyService();
