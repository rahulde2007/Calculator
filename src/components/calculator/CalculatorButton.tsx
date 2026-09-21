import React from 'react';
import type { ButtonVariant } from '../../types/calculator';

export interface CalculatorButtonProps {
  readonly id?: string | undefined;
  readonly label: string | React.ReactNode;
  readonly ariaLabel?: string | undefined;
  readonly variant?: ButtonVariant | undefined;
  readonly spanCols?: number | undefined;
  readonly disabled?: boolean | undefined;
  readonly subLabel?: string | undefined;
  readonly isHighlighted?: boolean | undefined;
  readonly onClick?: (() => void) | undefined;
  readonly className?: string | undefined;
}

/**
 * Premium Calculator Button primitive.
 * Supports design tokens, tactile micro-interactions, responsive sizing,
 * and WCAG AA accessibility focus rings.
 */
export const CalculatorButton: React.FC<CalculatorButtonProps> = ({
  id,
  label,
  ariaLabel,
  variant = 'number',
  spanCols = 1,
  disabled = false,
  subLabel,
  isHighlighted = false,
  onClick,
  className = '',
}) => {
  // Map variant to design token classes
  const variantStyles: Record<ButtonVariant, string> = {
    number:
      'bg-calc-key-number text-calc-text-primary hover:bg-calc-key-number-hover border border-calc-border-subtle shadow-calc-button',
    digit:
      'bg-calc-key-number text-calc-text-primary hover:bg-calc-key-number-hover border border-calc-border-subtle shadow-calc-button',
    operator:
      'bg-calc-key-operator text-white font-semibold hover:bg-calc-key-operator-hover border border-amber-400/20 shadow-calc-button',
    function:
      'bg-calc-key-action text-calc-text-secondary hover:bg-calc-key-action-hover hover:text-calc-text-primary border border-calc-border-subtle shadow-calc-button',
    action:
      'bg-calc-key-action text-calc-text-secondary hover:bg-calc-key-action-hover hover:text-calc-text-primary border border-calc-border-subtle shadow-calc-button',
    danger:
      'bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/40 shadow-calc-button',
    equals:
      'bg-calc-key-equals text-white font-bold hover:bg-calc-key-equals-hover border border-blue-400/30 shadow-calc-equals',
    special:
      'bg-calc-surface text-calc-text-muted hover:bg-calc-surface-elevated hover:text-calc-text-secondary border border-calc-border-subtle',
    secondary:
      'bg-calc-key-action text-calc-text-secondary hover:bg-calc-key-action-hover hover:text-calc-text-primary border border-calc-border-subtle shadow-calc-button',
  };

  const spanClasses: Record<number, string> = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
  };

  const computedAriaLabel = ariaLabel ?? (typeof label === 'string' ? label : undefined);
  const hasCustomHeight = Boolean(className && /\b(h-|min-h-)/.test(className));
  const defaultHeightClass = hasCustomHeight ? '' : 'h-14 sm:h-16';

  const hasCustomText = Boolean(className && /\btext-/.test(className));
  const defaultTextClass = hasCustomText ? '' : 'text-lg sm:text-xl';

  return (
    <button
      id={id}
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={computedAriaLabel}
      className={`
        group relative flex items-center justify-center
        ${defaultHeightClass} w-full rounded-calc-button
        font-sans font-medium ${defaultTextClass}
        select-none transition-all duration-150 ease-out
        active:scale-[0.96] active:brightness-95 active:shadow-calc-button-active
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calc-accent focus-visible:ring-offset-2 focus-visible:ring-offset-calc-surface
        disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
        motion-reduce:transition-none motion-reduce:active:scale-100
        ${variantStyles[variant]}
        ${spanClasses[spanCols] ?? 'col-span-1'}
        ${isHighlighted ? 'ring-2 ring-calc-accent ring-offset-1 ring-offset-calc-surface' : ''}
        ${className}
      `}
    >
      <span className="relative z-10 flex items-center justify-center gap-1">
        {label}
      </span>

      {/* Optional sub-label (e.g. keyboard shortcut or alternate operation) */}
      {subLabel && (
        <span className="absolute bottom-1 right-2 text-[10px] font-mono text-calc-text-muted group-hover:text-calc-text-secondary transition-colors">
          {subLabel}
        </span>
      )}
    </button>
  );
};
