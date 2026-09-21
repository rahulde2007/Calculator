import type { TemperatureUnitId, ConversionResult } from './types';
import { formatDisplayNumber } from '../utils/formatNumber';

/**
 * Temperature conversion engine.
 * Temperature cannot be converted with a simple multiplier because
 * scales have non-zero intercepts (Celsius 0° = 32°F = 273.15K).
 */

export function convertTemperature(
  value: number,
  from: TemperatureUnitId,
  to: TemperatureUnitId
): ConversionResult {
  if (!Number.isFinite(value)) {
    return {
      success: false,
      error: 'Invalid numeric input',
      code: 'INVALID_INPUT',
    };
  }

  // Kelvin cannot be below absolute zero
  if (from === 'kelvin' && value < 0) {
    return {
      success: false,
      error: 'Temperature below absolute zero (0 K) is physically invalid',
      code: 'NEGATIVE_NOT_ALLOWED',
    };
  }

  // Step 1: Convert source unit to Celsius (canonical base)
  let celsius: number;
  switch (from) {
    case 'celsius':
      celsius = value;
      break;
    case 'fahrenheit':
      celsius = ((value - 32) * 5) / 9;
      break;
    case 'kelvin':
      celsius = value - 273.15;
      break;
    default:
      return {
        success: false,
        error: `Unknown temperature unit: ${from}`,
        code: 'UNKNOWN_UNIT',
      };
  }

  // Check physical limit in Celsius (< -273.15°C)
  if (celsius < -273.15 - 1e-9) {
    return {
      success: false,
      error: 'Temperature below absolute zero (-273.15 °C) is physically invalid',
      code: 'NEGATIVE_NOT_ALLOWED',
    };
  }

  // Step 2: Convert Celsius to target unit
  let result: number;
  switch (to) {
    case 'celsius':
      result = celsius;
      break;
    case 'fahrenheit':
      result = (celsius * 9) / 5 + 32;
      break;
    case 'kelvin':
      result = celsius + 273.15;
      break;
    default:
      return {
        success: false,
        error: `Unknown temperature unit: ${to}`,
        code: 'UNKNOWN_UNIT',
      };
  }

  // Clean precision artifacts (e.g. -40°C -> -40°F)
  const roundedResult = Math.round(result * 1e10) / 1e10;

  return {
    success: true,
    value: roundedResult,
    formatted: formatDisplayNumber(roundedResult),
  };
}
