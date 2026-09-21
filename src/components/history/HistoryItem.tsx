import React, { useState } from 'react';
import type { CalculationHistoryItem } from '../../types/calculator';
import { copyToClipboard } from '../../utils/clipboard';

export interface HistoryItemProps {
  readonly item: CalculationHistoryItem;
  readonly onSelect?: ((item: CalculationHistoryItem) => void) | undefined;
  readonly onDelete?: ((id: string) => void) | undefined;
}

/**
 * Renders an individual calculation entry matching Calcx-Pro design tokens.
 * Features quick reuse, copy result, copy expression, individual deletion,
 * accessible feedback, and WCAG AA minimum 44px touch targets.
 */
export const HistoryItem: React.FC<HistoryItemProps> = ({
  item,
  onSelect,
  onDelete,
}) => {
  const [copiedTarget, setCopiedTarget] = useState<'result' | 'expression' | null>(null);

  const handleCopy = async (target: 'result' | 'expression', e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = target === 'result' ? item.result : item.expression;
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopiedTarget(target);
      setTimeout(() => {
        setCopiedTarget((current) => (current === target ? null : current));
      }, 1500);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(item.id);
  };

  return (
    <div
      role="group"
      aria-label={`Calculation: ${item.expression} = ${item.result}`}
      className="
        group relative rounded-calc-md bg-calc-surface-secondary hover:bg-calc-surface-elevated
        border border-calc-border-subtle p-3 transition-all duration-150 shadow-sm
        flex flex-col gap-2
      "
    >
      {/* Primary Clickable Area for Calculation Reuse */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect?.(item)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect?.(item);
          }
        }}
        aria-label={`Reuse calculation: ${item.expression} = ${item.result}`}
        className="
          w-full text-right cursor-pointer select-none rounded p-1
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calc-accent
        "
      >
        <div className="text-xs font-mono-calc text-calc-text-secondary truncate tracking-wide">
          {item.expression}
        </div>
        <div className="text-base font-semibold font-mono-calc text-calc-text-primary mt-0.5 tracking-tight truncate">
          = {item.result}
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center justify-between pt-1 border-t border-calc-border-subtle/50 text-xs">
        {/* Left Action: Reuse */}
        <button
          type="button"
          onClick={() => onSelect?.(item)}
          aria-label="Reuse calculation"
          title="Recall into calculator"
          className="
            min-h-[44px] min-w-[44px] px-2 py-1.5 rounded-md flex items-center justify-center gap-1
            text-[11px] font-medium text-calc-text-muted hover:text-calc-accent hover:bg-calc-surface
            transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calc-accent
          "
        >
          <span aria-hidden="true" className="text-sm">↺</span>
          <span className="hidden xs:inline">Reuse</span>
        </button>

        {/* Right Actions: Copy Result, Copy Expr, Delete */}
        <div className="flex items-center gap-0.5">
          {/* Copy Result */}
          <button
            type="button"
            onClick={(e) => handleCopy('result', e)}
            aria-label={copiedTarget === 'result' ? 'Result copied to clipboard' : 'Copy result'}
            title="Copy result"
            className={`
              min-h-[44px] min-w-[44px] px-2 py-1.5 rounded-md flex items-center justify-center gap-1
              text-[11px] font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calc-accent
              ${
                copiedTarget === 'result'
                  ? 'text-emerald-400 bg-emerald-500/10 font-bold'
                  : 'text-calc-text-muted hover:text-calc-text-primary hover:bg-calc-surface'
              }
            `}
          >
            {copiedTarget === 'result' ? (
              <>
                <span aria-hidden="true">✓</span>
                <span className="text-[10px]">Copied</span>
              </>
            ) : (
              <>
                <span aria-hidden="true" className="text-xs">⎘</span>
                <span className="text-[10px] hidden xs:inline">Ans</span>
              </>
            )}
          </button>

          {/* Copy Expression */}
          <button
            type="button"
            onClick={(e) => handleCopy('expression', e)}
            aria-label={copiedTarget === 'expression' ? 'Expression copied to clipboard' : 'Copy expression'}
            title="Copy expression"
            className={`
              min-h-[44px] min-w-[44px] px-2 py-1.5 rounded-md flex items-center justify-center gap-1
              text-[11px] font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calc-accent
              ${
                copiedTarget === 'expression'
                  ? 'text-emerald-400 bg-emerald-500/10 font-bold'
                  : 'text-calc-text-muted hover:text-calc-text-primary hover:bg-calc-surface'
              }
            `}
          >
            {copiedTarget === 'expression' ? (
              <>
                <span aria-hidden="true">✓</span>
                <span className="text-[10px]">Copied</span>
              </>
            ) : (
              <>
                <span aria-hidden="true" className="text-xs">⎘</span>
                <span className="text-[10px] hidden xs:inline">Expr</span>
              </>
            )}
          </button>

          {/* Delete Item */}
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Delete history item"
            title="Delete item"
            className="
              min-h-[44px] min-w-[44px] p-2 rounded-md flex items-center justify-center
              text-calc-text-muted hover:text-rose-400 hover:bg-rose-500/10
              transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500
            "
          >
            <span aria-hidden="true" className="text-sm font-semibold">✕</span>
          </button>
        </div>
      </div>
    </div>
  );
};
