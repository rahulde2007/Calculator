import React from 'react';
import { CalculatorButton } from './CalculatorButton';

export interface MemoryControlsProps {
  readonly hasMemory: boolean;
  readonly onMemoryClear: () => void;
  readonly onMemoryRecall: () => void;
  readonly onMemoryAdd: () => void;
  readonly onMemorySubtract: () => void;
  readonly className?: string | undefined;
  readonly isCompact?: boolean | undefined;
}

/**
 * Compact memory control bar (MC, MR, M+, M−).
 * Integrates seamlessly above keypads in both Standard and Scientific modes.
 */
export const MemoryControls: React.FC<MemoryControlsProps> = ({
  hasMemory,
  onMemoryClear,
  onMemoryRecall,
  onMemoryAdd,
  onMemorySubtract,
  className = '',
  isCompact = false,
}) => {
  const btnHeightClass = isCompact ? 'h-7 sm:h-8 text-xs' : 'h-8 sm:h-9 text-xs sm:text-sm';
  const gapClass = isCompact ? 'gap-1 xs:gap-1.5' : 'gap-1.5 sm:gap-2';

  return (
    <div
      role="group"
      aria-label="Memory Controls"
      className={`grid grid-cols-4 ${gapClass} w-full ${className}`}
    >
      <CalculatorButton
        id="btn-mc"
        label="MC"
        ariaLabel="Memory Clear"
        variant="secondary"
        className={`${btnHeightClass} font-mono font-medium tracking-wide ${
          hasMemory ? 'text-calc-text-primary hover:text-rose-400' : 'text-calc-text-muted opacity-70'
        }`}
        onClick={onMemoryClear}
      />
      <CalculatorButton
        id="btn-mr"
        label="MR"
        ariaLabel="Memory Recall"
        variant="secondary"
        className={`${btnHeightClass} font-mono font-medium tracking-wide ${
          hasMemory ? 'text-calc-accent font-semibold' : 'text-calc-text-muted opacity-70'
        }`}
        onClick={onMemoryRecall}
      />
      <CalculatorButton
        id="btn-m-plus"
        label="M+"
        ariaLabel="Memory Add"
        variant="secondary"
        className={`${btnHeightClass} font-mono font-medium tracking-wide text-calc-text-primary hover:text-emerald-400`}
        onClick={onMemoryAdd}
      />
      <CalculatorButton
        id="btn-m-minus"
        label="M−"
        ariaLabel="Memory Subtract"
        variant="secondary"
        className={`${btnHeightClass} font-mono font-medium tracking-wide text-calc-text-primary hover:text-amber-400`}
        onClick={onMemorySubtract}
      />
    </div>
  );
};
