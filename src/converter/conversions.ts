import type {
  ConversionResult,
  LengthUnitId,
  MassUnitId,
  VolumeUnitId,
  SpeedUnitId,
  PressureUnitId,
  EnergyUnitId,
  AngleUnitId,
  UnitId,
} from './types';
import { toRadians, fromRadians } from '../engine/trigonometry';
import { formatDisplayNumber } from '../utils/formatNumber';
import { getUnit } from './units';

/**
 * Linear Conversion Factors to Base Units.
 */

// Length -> Base: Meter (m)
export const LENGTH_TO_METERS: Record<LengthUnitId, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
  nmi: 1852, // Standard international nautical mile
};

// Mass -> Base: Gram (g)
export const MASS_TO_GRAMS: Record<MassUnitId, number> = {
  mg: 0.001,
  g: 1,
  kg: 1000,
  t: 1e6, // Metric ton
  oz: 28.349523125, // Avoirdupois ounce
  lb: 453.59237, // Avoirdupois pound
  st: 6350.29318, // Stone (14 lb)
};

// Volume -> Base: Milliliter (mL)
export const VOLUME_TO_ML: Record<VolumeUnitId, number> = {
  ml: 1,
  l: 1000,
  m3: 1e6, // 1 m³ = 1,000,000 mL
  floz: 29.5735295625, // US fluid ounce
  cup: 236.5882365, // US legal cup
  pt: 473.176473, // US liquid pint
  qt: 946.352946, // US liquid quart
  gal: 3785.411784, // US liquid gallon
  in3: 16.387064, // Cubic inch (2.54³ mL)
  ft3: 28316.846592, // Cubic foot (12³ in³)
};

// Speed -> Base: Meter per second (m/s)
export const SPEED_TO_MPS: Record<SpeedUnitId, number> = {
  mps: 1,
  kmh: 1 / 3.6, // 1 km/h = 5/18 m/s
  mph: 0.44704, // 1 mph = 1609.344 / 3600 m/s
  knot: 1852 / 3600, // 1 knot = 1852 / 3600 m/s
};

// Pressure -> Base: Pascal (Pa)
export const PRESSURE_TO_PA: Record<PressureUnitId, number> = {
  pa: 1,
  kpa: 1000,
  bar: 100000, // 100 kPa
  atm: 101325, // Standard atmosphere
  psi: 6894.757293168, // Pounds per square inch
  torr: 101325 / 760, // 1 Torr = 1/760 atm ≈ 133.322 Pa
  mmhg: 133.322387415, // Conventional mmHg
};

// Energy -> Base: Joule (J)
export const ENERGY_TO_JOULES: Record<string, number> = {
  j: 1,
  kj: 1000,
  cal: 4.184, // Thermochemical calorie
  kcal: 4184, // Kilocalorie
  wh: 3600, // Watt-hour = 3600 J
  kwh: 3600000, // Kilowatt-hour = 3.6 MJ
};

// Power -> Base: Watt (W)
export const POWER_TO_WATTS: Record<string, number> = {
  w: 1,
  kw: 1000,
  hp: 745.69987158227, // Mechanical horsepower (550 ft·lbf/s)
};

/**
 * Generic linear conversion helper.
 */
function convertLinearTable(
  value: number,
  from: string,
  to: string,
  table: Record<string, number>,
  unitType: string
): ConversionResult {
  if (!Number.isFinite(value)) {
    return {
      success: false,
      error: 'Invalid numeric input',
      code: 'INVALID_INPUT',
    };
  }

  const fromFactor = table[from];
  const toFactor = table[to];

  if (fromFactor === undefined || toFactor === undefined) {
    return {
      success: false,
      error: `Unknown ${unitType} unit: ${fromFactor === undefined ? from : to}`,
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

  const base = value * fromFactor;
  const result = base / toFactor;
  const rounded = Math.round(result * 1e10) / 1e10;

  return {
    success: true,
    value: rounded,
    formatted: formatDisplayNumber(rounded),
  };
}

export function convertLength(value: number, from: LengthUnitId, to: LengthUnitId): ConversionResult {
  return convertLinearTable(value, from, to, LENGTH_TO_METERS, 'length');
}

export function convertMass(value: number, from: MassUnitId, to: MassUnitId): ConversionResult {
  return convertLinearTable(value, from, to, MASS_TO_GRAMS, 'mass');
}

export function convertVolume(value: number, from: VolumeUnitId, to: VolumeUnitId): ConversionResult {
  return convertLinearTable(value, from, to, VOLUME_TO_ML, 'volume');
}

export function convertSpeed(value: number, from: SpeedUnitId, to: SpeedUnitId): ConversionResult {
  return convertLinearTable(value, from, to, SPEED_TO_MPS, 'speed');
}

export function convertPressure(value: number, from: PressureUnitId, to: PressureUnitId): ConversionResult {
  return convertLinearTable(value, from, to, PRESSURE_TO_PA, 'pressure');
}

/**
 * Energy and Power conversion.
 * Energy (J, kJ, cal, kcal, Wh, kWh) and Power (W, kW, hp) are distinct physical dimensions.
 * Converting between them is invalid and rejected.
 */
export function convertEnergyAndPower(
  value: number,
  from: EnergyUnitId,
  to: EnergyUnitId
): ConversionResult {
  const fromUnit = getUnit(from as UnitId);
  const toUnit = getUnit(to as UnitId);

  if (!fromUnit || !toUnit) {
    return {
      success: false,
      error: `Unknown unit: ${!fromUnit ? from : to}`,
      code: 'UNKNOWN_UNIT',
    };
  }

  if (fromUnit.dimension !== toUnit.dimension) {
    return {
      success: false,
      error: 'Cannot convert between Energy and Power (different physical dimensions)',
      code: 'INCOMPATIBLE_UNITS',
    };
  }

  if (fromUnit.dimension === 'energy') {
    return convertLinearTable(value, from, to, ENERGY_TO_JOULES, 'energy');
  }

  return convertLinearTable(value, from, to, POWER_TO_WATTS, 'power');
}

/**
 * Angle conversion using existing trigonometry engine.
 */
export function convertAngle(
  value: number,
  from: AngleUnitId,
  to: AngleUnitId
): ConversionResult {
  if (!Number.isFinite(value)) {
    return {
      success: false,
      error: 'Invalid numeric input',
      code: 'INVALID_INPUT',
    };
  }

  if (from !== 'deg' && from !== 'rad' && from !== 'grad') {
    return {
      success: false,
      error: `Unknown angle unit: ${from}`,
      code: 'UNKNOWN_UNIT',
    };
  }

  if (to !== 'deg' && to !== 'rad' && to !== 'grad') {
    return {
      success: false,
      error: `Unknown angle unit: ${to}`,
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

  // Reuse existing trigonometry functions
  const radians = toRadians(value, from);
  const result = fromRadians(radians, to);
  const rounded = Math.round(result * 1e10) / 1e10;

  return {
    success: true,
    value: rounded,
    formatted: formatDisplayNumber(rounded),
  };
}
