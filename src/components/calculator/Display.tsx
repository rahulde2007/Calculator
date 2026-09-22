import React from 'react';

export interface DisplayProps {
  readonly expression?: string | undefined;
  readonly value: string;
  readonly isError?: boolean | undefined;
  readonly errorMessage?: string | null | undefined;
  readonly modeBadge?: string | undefined;
  readonly hasMemory?: boolean | undefined;
  readonly memoryValue?: number | undefined;
  readonly isCompact?: boolean | undefined;
  /** Live evaluated result shown while user types — null hides it */
  readonly livePreview?: string | null | undefined;
}

// Dynamically scale typography based on number length to prevent overflow (static utility)
function getDynamicFontSize(str: string, compact: boolean): string {
  const len = str.length;
  if (compact) {
    if (len > 18) return 'text-lg sm:text-xl';
    if (len > 14) return 'text-xl sm:text-2xl';
    if (len > 10) return 'text-2xl sm:text-3xl';
    if (len > 7) return 'text-3xl sm:text-4xl';
    return 'text-3xl xs:text-4xl sm:text-[2.6rem]';
  }
  if (len > 18) return 'text-xl sm:text-2xl';
  if (len > 14) return 'text-2xl sm:text-3xl';
  if (len > 10) return 'text-3xl sm:text-4xl';
  if (len > 7) return 'text-4xl sm:text-[2.75rem]';
  return 'text-4xl sm:text-5xl';
}

/**
 * Premium Calculator Display.
 * Features responsive typography scaling, expression history, status badges (DEG/RAD, M),
 * long-number overflow protection, memoization, and accessible live regions.
 */
export const Display: React.FC<DisplayProps> = React.memo(({
  expression = '',
  value,
  isError = false,
  errorMessage = null,
  modeBadge = 'DEG',
  hasMemory = false,
  memoryValue,
  isCompact = false,
  livePreview = null,
}) => {
  const isMemoryActive = Boolean(hasMemory || (memoryValue !== undefined && memoryValue !== 0));

  const displayText = isError ? (errorMessage ?? 'Error') : value;
  const fontSizeClass = isError
    ? (isCompact ? 'text-xl sm:text-2xl font-medium text-calc-error' : 'text-2xl sm:text-3xl font-medium text-calc-error')
    : `${getDynamicFontSize(displayText, isCompact)} font-semibold text-calc-text-primary`;

  return (
    <div
      role="region"
      aria-label="Calculator Display"
      className={`
        group relative w-full rounded-calc-lg bg-calc-surface border border-calc-border-subtle
        shadow-calc-display flex flex-col justify-between shrink-0
        ${isCompact
          ? 'p-2 xs:p-2.5 sm:p-3'
          : 'p-3 sm:p-4'}
      `}
    >
      {/* Top Status & Expression Row */}
      <div className={`flex items-center justify-between gap-2 select-none ${isCompact ? 'mb-1 sm:mb-1.5' : 'mb-2'}`}>
        {/* Indicators on the left */}
        <div className="flex items-center gap-1.5">
          {modeBadge && (
            <span
              className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-calc-surface-secondary border border-calc-border-subtle text-calc-text-muted uppercase tracking-wider"
              aria-label={`Angle mode: ${modeBadge}`}
            >
              {modeBadge}
            </span>
          )}
          {isMemoryActive && (
            <span
              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-calc-accent tracking-wider shadow-sm"
              aria-label={memoryValue !== undefined ? `Memory stored: ${memoryValue}` : 'Memory stored'}
            >
              M
            </span>
          )}
        </div>

        {/* Expression buffer */}
        <div
          className="flex-1 text-right font-mono-calc text-xs sm:text-sm text-calc-text-secondary tracking-wider overflow-x-auto whitespace-nowrap scrollbar-none pl-2"
          aria-label={`Current expression: ${expression || 'none'}`}
        >
          {expression || '\u00A0'}
        </div>
      </div>

      {/* Main Result Display */}
      <div
        className="relative flex flex-col items-end w-full overflow-hidden"
        aria-live="polite"
        aria-atomic="true"
      >
        <span
          className={`
            font-mono-calc tracking-tight text-right
            select-all overflow-x-auto whitespace-nowrap scrollbar-none
            ${fontSizeClass}
          `}
        >
          {displayText}
        </span>

        {/* Live preview: shown while typing a valid evaluable expression */}
        {livePreview && !isError && (
          <span
            className={`
              font-mono-calc tracking-tight text-right text-calc-accent
              overflow-x-auto whitespace-nowrap scrollbar-none opacity-85
              ${isCompact ? 'text-base xs:text-lg' : 'text-lg sm:text-xl'}
            `}
            aria-label={`Live result: ${livePreview}`}
          >
            = {livePreview}
          </span>
        )}
      </div>

      {/* Subtle bottom glow reflection bar */}
      <div className="absolute bottom-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-calc-accent/20 to-transparent pointer-events-none" />
    </div>
  );
});

Display.displayName = 'Display';
