import type { CurrencyUnitId } from '../types';
import type { CurrencyRateProvider, CurrencyRates } from './types';

/**
 * Live Currency Rate Provider.
 * Uses open.er-api.com (free, open exchange rates, no API key required).
 * Handles network failures, timeouts, and validation safely.
 */
export class LiveCurrencyProvider implements CurrencyRateProvider {
  private readonly timeoutMs: number;

  constructor(timeoutMs: number = 8000) {
    this.timeoutMs = timeoutMs;
  }

  async fetchRates(base: CurrencyUnitId): Promise<CurrencyRates | null> {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller
      ? setTimeout(() => controller.abort(), this.timeoutMs)
      : null;

    try {
      // Primary: open.er-api.com (Supports USD, EUR, INR, BDT, GBP, JPY with no API key)
      const url = `https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`;
      const response = await fetch(url, {
        signal: controller ? controller.signal : null,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (
        data &&
        typeof data === 'object' &&
        data.result === 'success' &&
        data.rates &&
        typeof data.rates === 'object'
      ) {
        const rates: Record<string, number> = {};
        for (const [curr, rate] of Object.entries(data.rates)) {
          if (typeof rate === 'number' && Number.isFinite(rate) && rate > 0) {
            rates[curr] = rate;
          }
        }

        // Ensure base currency has 1
        rates[base] = 1;

        return {
          base,
          date: typeof data.time_last_update_utc === 'string'
            ? data.time_last_update_utc.substring(0, 16)
            : new Date().toISOString().substring(0, 10),
          rates,
          source: 'open.er-api.com (Live)',
          timestamp: Date.now(),
        };
      }

      return null;
    } catch {
      // Network error, timeout, or abort
      return null;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }
}

/**
 * Mock Currency Provider for testing and offline development.
 * Allows simulating success, error, network timeout, and missing currencies.
 */
export class MockCurrencyProvider implements CurrencyRateProvider {
  private mockRates: Record<string, number> | null;
  private shouldFail: boolean;
  private delayMs: number;

  constructor(
    mockRates: Record<string, number> | null = {
      USD: 1,
      EUR: 0.92,
      INR: 83.5,
      BDT: 117.2,
      GBP: 0.79,
      JPY: 155.0,
    },
    shouldFail: boolean = false,
    delayMs: number = 0
  ) {
    this.mockRates = mockRates;
    this.shouldFail = shouldFail;
    this.delayMs = delayMs;
  }

  async fetchRates(base: CurrencyUnitId): Promise<CurrencyRates | null> {
    if (this.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }

    if (this.shouldFail || !this.mockRates) {
      return null;
    }

    return {
      base,
      date: '2026-09-22',
      rates: { ...this.mockRates, [base]: 1 },
      source: 'Mock Provider (Test)',
      timestamp: Date.now(),
    };
  }
}
