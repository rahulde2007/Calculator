import React from 'react';
import type { CurrencyState } from '../../converter/currency/types';

export interface CurrencyStatusProps {
  readonly state: CurrencyState;
  readonly onRetry: () => void;
}

export const CurrencyStatus: React.FC<CurrencyStatusProps> = ({ state, onRetry }) => {
  if (state.status === 'loading') {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-calc-md bg-calc-surface-secondary border border-calc-border-subtle text-xs text-calc-text-muted">
        <svg className="animate-spin h-3.5 w-3.5 text-calc-accent" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span>Fetching live exchange rates...</span>
      </div>
    );
  }

  if (state.status === 'error' || !state.rates) {
    return (
      <div className="flex items-center justify-between p-2.5 rounded-calc-md bg-red-500/10 border border-red-500/20 text-xs text-red-400">
        <div className="flex items-center gap-1.5">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Live exchange rate unavailable</span>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="underline hover:text-red-300 font-semibold focus-visible:outline-none ml-2"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-2 rounded-calc-md bg-calc-surface-secondary/60 border border-calc-border-subtle text-[11px] text-calc-text-muted">
      <span>
        Source: <strong className="text-calc-text-secondary">{state.rates.source}</strong> ({state.rates.date})
      </span>
      <button
        type="button"
        onClick={onRetry}
        title="Refresh live exchange rates"
        aria-label="Refresh live exchange rates"
        className="text-calc-accent hover:underline ml-2"
      >
        Refresh
      </button>
    </div>
  );
};
