import type { CurrencyUnitId } from '../types';

export interface CurrencyRates {
  readonly base: CurrencyUnitId;
  readonly date: string;
  readonly rates: Record<string, number>;
  readonly source: string;
  readonly timestamp: number;
}

export type CurrencyProviderStatus = 'idle' | 'loading' | 'success' | 'error';

export interface CurrencyState {
  readonly status: CurrencyProviderStatus;
  readonly rates: CurrencyRates | null;
  readonly errorMessage: string | null;
  readonly lastFetched: number | null;
}

export interface CurrencyRateProvider {
  fetchRates(base: CurrencyUnitId): Promise<CurrencyRates | null>;
}

export const SUPPORTED_CURRENCIES: readonly {
  readonly id: CurrencyUnitId;
  readonly label: string;
  readonly symbol: string;
}[] = [
  { id: 'USD', label: 'US Dollar', symbol: '$' },
  { id: 'EUR', label: 'Euro', symbol: '€' },
  { id: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { id: 'BDT', label: 'Bangladeshi Taka', symbol: '৳' },
  { id: 'GBP', label: 'British Pound', symbol: '£' },
  { id: 'JPY', label: 'Japanese Yen', symbol: '¥' },
];
