import React from 'react';
import type { AngleUnit } from '../../types/calculator';

export interface AngleUnitSelectorProps {
  readonly currentUnit: AngleUnit;
  readonly onSelectUnit: (unit: AngleUnit) => void;
  readonly className?: string | undefined;
}

interface UnitOption {
  readonly id: AngleUnit;
  readonly label: string;
  readonly ariaLabel: string;
}

const UNITS: readonly UnitOption[] = [
  { id: 'deg', label: 'DEG', ariaLabel: 'Degrees' },
  { id: 'rad', label: 'RAD', ariaLabel: 'Radians' },
  { id: 'grad', label: 'GRAD', ariaLabel: 'Gradians' },
];

/**
 * Premium, accessible segmented angle unit selector for Scientific Mode.
 * Controls trigonometric evaluation mode across DEG, RAD, and GRAD.
 * Memoized to prevent re-renders when numbers are typed.
 */
export const AngleUnitSelector: React.FC<AngleUnitSelectorProps> = React.memo(({
  currentUnit,
  onSelectUnit,
  className = '',
}) => {
  return (
    <div
      role="radiogroup"
      aria-label="Angle measurement unit"
      className={`
        flex items-center justify-between p-0.5 sm:p-1 rounded-calc-md
        bg-calc-surface-secondary border border-calc-border-subtle
        shadow-sm w-full
        ${className}
      `}
    >
      {UNITS.map((unit) => {
        const isActive = currentUnit === unit.id;
        return (
          <button
            key={unit.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={unit.ariaLabel}
            onClick={() => onSelectUnit(unit.id)}
            className={`
              flex-1 min-h-[32px] sm:min-h-[36px] flex items-center justify-center py-1 sm:py-1.5 px-2 text-[11px] sm:text-xs font-mono font-semibold tracking-wider rounded
              select-none transition-colors duration-100 ease-out text-center
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calc-accent focus-visible:ring-offset-1 focus-visible:ring-offset-calc-surface
              active:scale-[0.98]
              ${isActive
                ? 'bg-calc-accent text-white shadow-calc-button font-bold'
                : 'text-calc-text-muted hover:text-calc-text-primary hover:bg-calc-surface-elevated/60'}
            `}
          >
            {unit.label}
          </button>
        );
      })}
    </div>
  );
});

AngleUnitSelector.displayName = 'AngleUnitSelector';
