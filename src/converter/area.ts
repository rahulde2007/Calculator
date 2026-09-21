import type { AreaUnitId, ConversionResult } from './types';
import { formatDisplayNumber } from '../utils/formatNumber';

/**
 * Area conversion constants (base unit: square meter [m²]).
 *
 * Regional Units Standard:
 * - Bigha & Katha: Configured to the widely recognized West Bengal / Bangladesh standard:
 *     1 Bigha = 20 Katha = 14,400 sq ft ≈ 1,337.8038 m²
 *     1 Katha = 1/20 Bigha = 720 sq ft ≈ 66.8902 m²
 *   (Note: In Northern/Western India, e.g. UP, Bihar, Punjab, Rajasthan, Bigha definitions vary from ~800 m² to ~2,500 m²).
 * - Satak / Decimal: 1/100 of an acre = 435.6 sq ft ≈ 40.4686 m².
 */
export const AREA_TO_M2: Record<AreaUnitId, number> = {
  mm2: 1e-6,
  cm2: 1e-4,
  m2: 1,
  ha: 10000,
  km2: 1e6,
  in2: 0.00064516,
  ft2: 0.09290304,
  acre: 4046.8564224,
  mi2: 2589988.110336,
  // Regional (WB/BD standard: 1 Bigha = 14,400 sq ft; 1 Katha = 720 sq ft; 1 Satak = 435.6 sq ft)
  bigha: 14400 * 0.09290304, // 1337.803776 m²
  katha: 720 * 0.09290304,   // 66.8901888 m²
  satak: 435.6 * 0.09290304, // 40.468564224 m²
};

export const AREA_NOTES: Partial<Record<AreaUnitId, string>> = {
  bigha: 'West Bengal / Bangladesh standard (1 Bigha = 14,400 sq ft ≈ 1,338 m²). Note: Regional standards vary across states.',
  katha: 'West Bengal / Bangladesh standard (1 Katha = 720 sq ft ≈ 66.9 m²). Note: Regional standards vary across states.',
  satak: '1 Satak / Decimal = 1/100 Acre = 435.6 sq ft ≈ 40.47 m²',
};

export function convertArea(
  value: number,
  from: AreaUnitId,
  to: AreaUnitId
): ConversionResult {
  if (!Number.isFinite(value)) {
    return {
      success: false,
      error: 'Invalid numeric input',
      code: 'INVALID_INPUT',
    };
  }

  const fromM2 = AREA_TO_M2[from];
  const toM2 = AREA_TO_M2[to];

  if (!fromM2 || !toM2) {
    return {
      success: false,
      error: `Unknown area unit: ${!fromM2 ? from : to}`,
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

  const m2 = value * fromM2;
  const result = m2 / toM2;
  const rounded = Math.round(result * 1e10) / 1e10;

  const note = AREA_NOTES[from] || AREA_NOTES[to];

  return {
    success: true,
    value: rounded,
    formatted: formatDisplayNumber(rounded),
    ...(note ? { note } : {}),
  };
}
