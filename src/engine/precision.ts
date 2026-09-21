/**
 * Controlled Floating-Point Precision Strategy for Calcx-Pro.
 *
 * Problem:
 * In IEEE 754 double-precision arithmetic, binary representations can introduce
 * representation jitter (e.g., 0.1 + 0.2 = 0.30000000000000004).
 *
 * Strategy:
 * Instead of blindly rounding to an arbitrary fixed number of decimal places (which damages
 * small scientific numbers or large integers), we normalize numbers to 14 significant digits
 * (`toPrecision(14)`). Double-precision floats have ~15.95 decimal digits of precision;
 * truncating the last 2 digits eliminates IEEE 754 representation noise while preserving full
 * mathematical meaning for integers up to 10^14 and decimals down to 10^-300.
 */

export const MAX_SAFE_CALCULATION_PRECISION = 14;

/**
 * Normalizes an IEEE 754 floating-point number, eliminating representation noise
 * while preserving up to 14 significant digits of mathematical precision.
 * Also normalizes IEEE 754 negative zero (-0) to positive 0.
 *
 * @param value Raw computed float value
 * @returns Cleaned numeric value
 */
export function normalizePrecision(value: number): number {
  if (!Number.isFinite(value)) {
    return value;
  }

  // Eliminate representation noise by sampling 14 significant digits
  const normalized = parseFloat(value.toPrecision(MAX_SAFE_CALCULATION_PRECISION));

  // Normalize negative zero (-0) to 0
  if (Object.is(normalized, -0)) {
    return 0;
  }

  return normalized;
}

/**
 * Checks whether a number is within safe finite calculation bounds.
 */
export function isSafeCalculationNumber(value: number): boolean {
  return Number.isFinite(value) && !Number.isNaN(value);
}
