import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  CategoryId,
  UnitId,
  ConversionResult,
} from '../../converter/types';
import type { CurrencyState } from '../../converter/currency/types';
import { CATEGORIES, getCategory } from '../../converter/categories';
import { getUnit, getUnitsForCategory } from '../../converter/units';
import { convert } from '../../converter/index';
import { LiveCurrencyProvider } from '../../converter/currency/provider';
import { CategorySelector } from './CategorySelector';
import { UnitSelect } from './UnitSelect';
import { ConverterResult } from './ConverterResult';
import { CurrencyStatus } from './CurrencyStatus';

export interface UnitConverterProps {
  readonly onClose?: (() => void) | undefined;
  readonly className?: string | undefined;
}

const currencyProvider = new LiveCurrencyProvider();

export const UnitConverter: React.FC<UnitConverterProps> = React.memo(({
  onClose,
  className = '',
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryId>('length');
  const [fromUnitId, setFromUnitId] = useState<UnitId>('m');
  const [toUnitId, setToUnitId] = useState<UnitId>('cm');
  const [inputValue, setInputValue] = useState<string>('1');

  // Currency State
  const [currencyState, setCurrencyState] = useState<CurrencyState>({
    status: 'idle',
    rates: null,
    errorMessage: null,
    lastFetched: null,
  });


  // Available units for current category
  const availableUnits = useMemo(
    () => getUnitsForCategory(selectedCategoryId),
    [selectedCategoryId]
  );

  // Fetch currency rates when currency category is active
  const fetchCurrencyRates = useCallback(async () => {
    setCurrencyState((prev) => ({ ...prev, status: 'loading', errorMessage: null }));
    try {
      const rates = await currencyProvider.fetchRates('USD');
      if (rates) {
        setCurrencyState({
          status: 'success',
          rates,
          errorMessage: null,
          lastFetched: Date.now(),
        });
      } else {
        setCurrencyState({
          status: 'error',
          rates: null,
          errorMessage: 'Live exchange rate unavailable',
          lastFetched: null,
        });
      }
    } catch {
      setCurrencyState({
        status: 'error',
        rates: null,
        errorMessage: 'Failed to connect to currency service',
        lastFetched: null,
      });
    }
  }, []);

  useEffect(() => {
    if (selectedCategoryId === 'currency' && currencyState.status === 'idle') {
      void fetchCurrencyRates();
    }
  }, [selectedCategoryId, currencyState.status, fetchCurrencyRates]);

  // Handle category change
  const handleCategoryChange = (catId: CategoryId) => {
    setSelectedCategoryId(catId);
    const cat = getCategory(catId);
    if (cat) {
      setFromUnitId(cat.defaultFrom);
      setToUnitId(cat.defaultTo);
    }
  };

  // Swap From and To units
  const handleSwap = () => {
    setFromUnitId(toUnitId);
    setToUnitId(fromUnitId);
  };

  // Clear / Reset
  const handleReset = () => {
    setInputValue('1');
    const cat = getCategory(selectedCategoryId);
    if (cat) {
      setFromUnitId(cat.defaultFrom);
      setToUnitId(cat.defaultTo);
    }
  };

  // Execute conversion
  const result: ConversionResult | null = useMemo(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return null;

    const numericVal = parseFloat(trimmed);
    if (Number.isNaN(numericVal)) {
      return {
        success: false,
        error: 'Please enter a valid number',
        code: 'INVALID_INPUT',
      };
    }

    return convert(
      numericVal,
      fromUnitId,
      toUnitId,
      selectedCategoryId,
      currencyState.rates
    );
  }, [inputValue, fromUnitId, toUnitId, selectedCategoryId, currencyState.rates]);

  const fromUnit = getUnit(fromUnitId);
  const toUnit = getUnit(toUnitId);

  return (
    <aside
      aria-label="Unit Converter"
      className={`
        w-full flex flex-col
        ${className ?? 'rounded-calc-shell border border-calc-border-subtle p-3.5 xs:p-4 sm:p-5 shadow-calc-shell bg-calc-surface'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-calc-border-subtle/60 mb-2.5 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-calc-accent" />
          </span>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-calc-text-primary">
            Unit Converter
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleReset}
            title="Reset conversion input"
            aria-label="Reset conversion input"
            className="
              min-h-[32px] px-2 py-0.5 text-[11px] rounded-md font-medium transition-colors
              text-calc-text-muted hover:text-calc-text-primary hover:bg-calc-surface-secondary
              border border-calc-border-subtle hover:border-calc-border-strong
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calc-accent
            "
          >
            Reset
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close unit converter"
              title="Close unit converter"
              className="
                min-h-[32px] min-w-[32px] p-1 text-xs rounded-md font-medium transition-colors flex items-center justify-center
                text-calc-text-muted hover:text-calc-text-primary hover:bg-calc-surface-secondary
                border border-calc-border-subtle hover:border-calc-border-strong
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calc-accent
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="shrink-0 mb-2.5">
        <CategorySelector
          categories={CATEGORIES}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleCategoryChange}
        />
      </div>

      {/* Converter Body */}
      <div className="flex flex-col gap-2.5">
        {/* Currency Status Banner */}
        {selectedCategoryId === 'currency' && (
          <CurrencyStatus state={currencyState} onRetry={fetchCurrencyRates} />
        )}

        {/* Numeric Input */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-calc-text-secondary">
            <span>Value</span>
            {fromUnit && (
              <span className="text-calc-text-muted font-normal truncate max-w-[200px]">
                {fromUnit.label} ({fromUnit.symbol})
              </span>
            )}
          </div>
          <div className="relative">
            <input
              id="converter-input-value"
              type="text"
              inputMode="decimal"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter value..."
              className="
                w-full min-h-[40px] xs:min-h-[42px] sm:min-h-[44px] px-3 py-1.5 rounded-calc-md border border-calc-border-subtle
                bg-calc-surface-secondary text-calc-text-primary text-base sm:text-lg font-mono
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calc-accent
                transition-colors placeholder:text-calc-text-muted/50
              "
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => setInputValue('')}
                aria-label="Clear input"
                title="Clear input"
                className="
                  absolute inset-y-0 right-0 px-2.5 flex items-center text-calc-text-muted
                  hover:text-calc-text-primary transition-colors
                "
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* From & To Unit Selection with Swap Button */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-1.5 xs:gap-2">
          <UnitSelect
            id="converter-from-unit"
            label="From"
            value={fromUnitId}
            units={availableUnits}
            onChange={setFromUnitId}
          />

          {/* Swap Button */}
          <div className="flex justify-center pb-0.5">
            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap From and To units"
              title="Swap From and To units"
              className="
                min-h-[40px] min-w-[36px] xs:min-w-[40px] sm:min-h-[44px] p-2 rounded-calc-md border border-calc-border-subtle
                bg-calc-surface-secondary hover:bg-calc-surface-elevated text-calc-text-secondary hover:text-calc-text-primary
                flex items-center justify-center transition-transform duration-150 active:rotate-180
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calc-accent
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          <UnitSelect
            id="converter-to-unit"
            label="To"
            value={toUnitId}
            units={availableUnits}
            onChange={setToUnitId}
          />
        </div>

        {/* Result Readout */}
        <ConverterResult
          result={result}
          toUnit={toUnit}
          inputValue={inputValue}
        />

        {/* Quick Value Presets */}
        <div className="pt-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-calc-text-muted mb-1 block">
            Quick Values
          </span>
          <div className="grid grid-cols-5 gap-1.5">
            {['1', '5', '10', '50', '100'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setInputValue(preset)}
                className="
                  min-h-[32px] xs:min-h-[36px] py-1 text-xs font-mono font-medium rounded-calc-sm
                  bg-calc-surface-secondary/70 hover:bg-calc-surface-elevated text-calc-text-secondary hover:text-calc-text-primary
                  border border-calc-border-subtle transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calc-accent
                "
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
});

UnitConverter.displayName = 'UnitConverter';
