import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly ariaLabel: string;
  readonly children: React.ReactNode;
  readonly variant?: 'default' | 'ghost' | 'active' | undefined;
  readonly size?: 'sm' | 'md' | 'lg' | undefined;
}

const SIZE_CLASSES = {
  sm: 'p-1.5 text-xs',
  md: 'p-2 text-sm',
  lg: 'p-3 text-base',
} as const;

const VARIANT_CLASSES = {
  default:
    'bg-calc-surface-secondary hover:bg-calc-surface-elevated text-calc-text-secondary hover:text-calc-text-primary border border-calc-border-subtle shadow-calc-button',
  ghost:
    'bg-transparent hover:bg-calc-surface-secondary text-calc-text-muted hover:text-calc-text-primary',
  active:
    'bg-calc-accent text-white hover:bg-calc-accent-hover shadow-calc-equals font-semibold',
} as const;

/**
 * Reusable icon button component adhering to Calcx-Pro design tokens.
 * Memoized for high performance and minimum re-renders.
 */
export const IconButton: React.FC<IconButtonProps> = React.memo(({
  ariaLabel,
  children,
  variant = 'default',
  size = 'md',
  className = '',
  disabled = false,
  ...rest
}) => {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-calc-md font-medium
        select-none transition-all duration-150 ease-out
        active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calc-accent focus-visible:ring-offset-2 focus-visible:ring-offset-calc-surface
        disabled:opacity-40 disabled:cursor-not-allowed
        motion-reduce:transition-none motion-reduce:active:scale-100
        ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}
      `}
      {...rest}
    >
      {children}
    </button>
  );
});

IconButton.displayName = 'IconButton';
