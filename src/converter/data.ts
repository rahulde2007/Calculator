import type { DataUnitId, ConversionResult } from './types';
import { formatDisplayNumber } from '../utils/formatNumber';

/**
 * Digital Data Storage conversion constants (base unit: bit [b]).
 *
 * Convention: Decimal SI Units (Standard IEC/SI)
 * - 1 Byte (B) = 8 bits
 * - 1 Kilobyte (KB) = 1,000 Bytes = 8,000 bits
 * - 1 Megabyte (MB) = 1,000 KB = 1,000,000 Bytes
 * - 1 Gigabyte (GB) = 1,000 MB = 10^9 Bytes
 * - 1 Terabyte (TB) = 1,000 GB = 10^12 Bytes
 * - 1 Petabyte (PB) = 1,000 TB = 10^15 Bytes
 *
 * Note: Binary prefixes (KiB, MiB, GiB using 1024) are distinct IEC standards and not silently mixed here.
 */
export const DATA_TO_BITS: Record<DataUnitId, number> = {
  b: 1,
  B: 8,
  KB: 8 * 1e3,
  MB: 8 * 1e6,
  GB: 8 * 1e9,
  TB: 8 * 1e12,
  PB: 8 * 1e15,
};

export function convertData(
  value: number,
  from: DataUnitId,
  to: DataUnitId
): ConversionResult {
  if (!Number.isFinite(value)) {
    return {
      success: false,
      error: 'Invalid numeric input',
      code: 'INVALID_INPUT',
    };
  }

  const fromBits = DATA_TO_BITS[from];
  const toBits = DATA_TO_BITS[to];

  if (!fromBits || !toBits) {
    return {
      success: false,
      error: `Unknown data unit: ${!fromBits ? from : to}`,
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

  const bits = value * fromBits;
  const result = bits / toBits;
  const rounded = Math.round(result * 1e10) / 1e10;

  return {
    success: true,
    value: rounded,
    formatted: formatDisplayNumber(rounded),
    note: 'Decimal SI standard (1 KB = 1,000 B)',
  };
}
