/**
 * Number formatting utilities for Calcx-Pro display readout.
 * Handles precision limit, thousand separators, and scientific notation.
 */

/**
 * Formats a raw number or numeric string for standard calculator display.
 *
 * @param value Number or numeric string to format
 * @param maxDecimals Maximum decimal places (defaults to 10)
 * @returns Formatted string for UI presentation
 */
export function formatDisplayNumber(value: number | string, maxDecimals: number = 10): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (Number.isNaN(num)) {
    return 'Error';
  }

  if (!Number.isFinite(num)) {
    return num > 0 ? 'Infinity' : '-Infinity';
  }

  // Handle scientific notation for very large/small numbers
  if (Math.abs(num) >= 1e15 || (Math.abs(num) > 0 && Math.abs(num) < 1e-7)) {
    return num.toExponential(6);
  }

  // Limit decimals without trailing zeros
  const rounded = Number(num.toFixed(maxDecimals));
  const parts = rounded.toString().split('.');
  const integerPart = parts[0] ?? '0';
  const decimalPart = parts[1];

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

/**
 * Cleans user input expression, sanitizing whitespace and standardizing symbols.
 */
export function sanitizeExpression(raw: string): string {
  return raw
    .replace(/\s+/g, '')
    .replace(/\*/g, '×')
    .replace(/\//g, '÷');
}
