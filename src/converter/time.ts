import type { TimeUnitId, ConversionResult } from './types';
import { formatDisplayNumber } from '../utils/formatNumber';

/**
 * Time conversion constants (base unit: second).
 *
 * Calendar Duration Convention:
 * - 1 Julian Year = 365.25 days = 31,557,600 seconds (astronomical standard Julian year).
 * - 1 Mean Month = 365.25 / 12 days = 30.4375 days = 2,629,800 seconds.
 * Note: Months and years are calendar concepts with varying physical durations (28-31 days/month, 365-366 days/year).
 * This converter uses the Julian astronomical standard for consistent physical conversions.
 */
export const TIME_TO_SECONDS: Record<TimeUnitId, number> = {
  ms: 0.001,
  s: 1,
  min: 60,
  h: 3600,
  day: 86400,
  week: 604800,
  month: 2629800, // 30.4375 days (Julian standard: 365.25 / 12)
  year: 31557600, // 365.25 days (Julian astronomical year)
};

export const TIME_NOTES: Partial<Record<TimeUnitId, string>> = {
  month: 'Based on 30.4375 days (Julian standard average)',
  year: 'Based on 365.25 days (Julian astronomical year)',
};

export function convertTime(
  value: number,
  from: TimeUnitId,
  to: TimeUnitId
): ConversionResult {
  if (!Number.isFinite(value)) {
    return {
      success: false,
      error: 'Invalid numeric input',
      code: 'INVALID_INPUT',
    };
  }

  const fromFactor = TIME_TO_SECONDS[from];
  const toFactor = TIME_TO_SECONDS[to];

  if (!fromFactor || !toFactor) {
    return {
      success: false,
      error: `Unknown time unit: ${!fromFactor ? from : to}`,
      code: 'UNKNOWN_UNIT',
    };
  }

  if (from === to) {
    return {
      success: true,
      value,
      formatted: formatDisplayNumber(value),
    };
  }

  // Convert from -> seconds -> to
  const seconds = value * fromFactor;
  const result = seconds / toFactor;
  const rounded = Math.round(result * 1e10) / 1e10;

  const note = TIME_NOTES[from] || TIME_NOTES[to];

  return {
    success: true,
    value: rounded,
    formatted: formatDisplayNumber(rounded),
    ...(note ? { note } : {}),
  };
}
