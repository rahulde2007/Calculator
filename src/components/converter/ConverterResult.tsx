import React from 'react';
import type { ConversionResult, UnitDefinition } from '../../converter/types';

export interface ConverterResultProps {
  readonly result: ConversionResult | null;
  readonly toUnit: UnitDefinition | undefined;
  readonly inputValue: string;
}

export const ConverterResult: React.FC<ConverterResultProps> = ({
  result,
  toUnit,
  inputValue,
}) => {
  if (!inputValue.trim()) {
    return (
      <div className="flex flex-col gap-0.5 p-2.5 xs:p-3 rounded-calc-md bg-calc-surface-secondary/40 border border-calc-border-subtle">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-calc-text-muted">Result</span>
        <div className="text-xl xs:text-2xl font-mono text-calc-text-muted select-none">—</div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  if (!result.success) {
    return (
      <div className="flex flex-col gap-0.5 p-2.5 xs:p-3 rounded-calc-md bg-red-500/10 border border-red-500/20 text-red-400">
        <span className="text-[10px] font-semibold uppercase tracking-wider">Result</span>
        <div className="text-xs xs:text-sm font-medium">{result.error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 p-2.5 xs:p-3 rounded-calc-md bg-calc-surface-secondary border border-calc-border-subtle shadow-calc-button">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-calc-text-secondary">Result</span>
        {toUnit && (
          <span className="text-[11px] font-medium text-calc-accent truncate max-w-[180px]">
            {toUnit.label} ({toUnit.symbol})
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2 overflow-x-auto py-0.5">
        <span className="text-xl xs:text-2xl font-mono font-bold text-calc-text-primary tracking-tight">
          {result.formatted}
        </span>
        {toUnit && (
          <span className="text-xs font-medium text-calc-text-secondary shrink-0">
            {toUnit.symbol}
          </span>
        )}
      </div>

      {result.note && (
        <div className="text-[10px] text-calc-text-muted pt-1 border-t border-calc-border-subtle/60 leading-tight">
          ℹ {result.note}
        </div>
      )}
    </div>
  );
};
