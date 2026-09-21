import type {
  CategoryId,
  UnitId,
  ConversionResult,
  LengthUnitId,
  MassUnitId,
  TemperatureUnitId,
  AreaUnitId,
  VolumeUnitId,
  SpeedUnitId,
  TimeUnitId,
  DataUnitId,
  PressureUnitId,
  EnergyUnitId,
  AngleUnitId,
} from './types';
import type { CurrencyRates } from './currency/types';
import { getCategory } from './categories';
import { convertTemperature } from './temperature';
import { convertTime } from './time';
import { convertData } from './data';
import { convertArea } from './area';
import {
  convertLength,
  convertMass,
  convertVolume,
  convertSpeed,
  convertPressure,
  convertEnergyAndPower,
  convertAngle,
} from './conversions';
import { formatDisplayNumber } from '../utils/formatNumber';

export * from './types';
export * from './categories';
export * from './units';
export * from './currency/types';
export * from './currency/provider';
export { convertTemperature } from './temperature';
export { convertTime } from './time';
export { convertData } from './data';
export { convertArea } from './area';
export {
  convertLength,
  convertMass,
  convertVolume,
  convertSpeed,
  convertPressure,
  convertEnergyAndPower,
  convertAngle,
} from './conversions';

/**
 * Universal Unit Converter Dispatcher.
 * Pure framework-independent conversion engine.
 */
export function convert(
  value: number,
  from: UnitId,
  to: UnitId,
  categoryId: CategoryId,
  currencyRates?: CurrencyRates | null
): ConversionResult {
  // 1. Validate numeric input
  if (!Number.isFinite(value)) {
    return {
      success: false,
      error: 'Invalid numeric input',
      code: 'INVALID_INPUT',
    };
  }

  // 2. Validate category
  const category = getCategory(categoryId);
  if (!category) {
    return {
      success: false,
      error: `Unknown category: ${categoryId}`,
      code: 'UNKNOWN_UNIT',
    };
  }

  // 3. Validate units belong to category
  if (!category.unitIds.includes(from) || !category.unitIds.includes(to)) {
    return {
      success: false,
      error: `Units "${from}" and "${to}" are incompatible with category "${category.name}"`,
      code: 'INCOMPATIBLE_UNITS',
    };
  }

  // 4. Same unit optimization (except when negative validation is needed, handled in respective sub-converters)
  if (from === to && categoryId !== 'temperature') {
    return {
      success: true,
      value,
      formatted: formatDisplayNumber(value),
    };
  }

  // 5. Category-specific conversion
  switch (categoryId) {
    case 'length':
      return convertLength(value, from as LengthUnitId, to as LengthUnitId);

    case 'mass':
      return convertMass(value, from as MassUnitId, to as MassUnitId);

    case 'temperature':
      return convertTemperature(value, from as TemperatureUnitId, to as TemperatureUnitId);

    case 'area':
      return convertArea(value, from as AreaUnitId, to as AreaUnitId);

    case 'volume':
      return convertVolume(value, from as VolumeUnitId, to as VolumeUnitId);

    case 'speed':
      return convertSpeed(value, from as SpeedUnitId, to as SpeedUnitId);

    case 'time':
      return convertTime(value, from as TimeUnitId, to as TimeUnitId);

    case 'data':
      return convertData(value, from as DataUnitId, to as DataUnitId);

    case 'pressure':
      return convertPressure(value, from as PressureUnitId, to as PressureUnitId);

    case 'energy':
      return convertEnergyAndPower(value, from as EnergyUnitId, to as EnergyUnitId);

    case 'angle':
      return convertAngle(value, from as AngleUnitId, to as AngleUnitId);

    case 'currency': {
      if (!currencyRates || !currencyRates.rates) {
        return {
          success: false,
          error: 'Live exchange rate unavailable',
          code: 'RATE_UNAVAILABLE',
        };
      }

      const fromRate = currencyRates.rates[from];
      const toRate = currencyRates.rates[to];

      if (fromRate === undefined || toRate === undefined || fromRate <= 0 || toRate <= 0) {
        return {
          success: false,
          error: `Exchange rate unavailable for ${fromRate === undefined ? from : to}`,
          code: 'RATE_UNAVAILABLE',
        };
      }

      if (from === to) {
        return {
          success: true,
          value,
          formatted: formatDisplayNumber(value, 4),
          note: `Source: ${currencyRates.source} (${currencyRates.date})`,
        };
      }

      // Convert from -> base -> to
      const converted = value * (toRate / fromRate);
      const rounded = Math.round(converted * 1e6) / 1e6;

      return {
        success: true,
        value: rounded,
        formatted: formatDisplayNumber(rounded, 4),
        note: `Rate: 1 ${from} = ${(toRate / fromRate).toFixed(4)} ${to} • ${currencyRates.source} (${currencyRates.date})`,
      };
    }

    default:
      return {
        success: false,
        error: `Unsupported category: ${categoryId}`,
        code: 'UNKNOWN_UNIT',
      };
  }
}
