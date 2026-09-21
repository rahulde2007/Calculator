/**
 * Unit Converter Types for Calcx-Pro
 */

export type CategoryId =
  | 'length'
  | 'mass'
  | 'temperature'
  | 'area'
  | 'volume'
  | 'speed'
  | 'time'
  | 'data'
  | 'pressure'
  | 'energy'
  | 'currency'
  | 'angle';

export type LengthUnitId =
  | 'mm'
  | 'cm'
  | 'm'
  | 'km'
  | 'in'
  | 'ft'
  | 'yd'
  | 'mi'
  | 'nmi';

export type MassUnitId =
  | 'mg'
  | 'g'
  | 'kg'
  | 't'
  | 'oz'
  | 'lb'
  | 'st';

export type TemperatureUnitId =
  | 'celsius'
  | 'fahrenheit'
  | 'kelvin';

export type AreaUnitId =
  | 'mm2'
  | 'cm2'
  | 'm2'
  | 'ha'
  | 'km2'
  | 'in2'
  | 'ft2'
  | 'acre'
  | 'mi2'
  | 'bigha'
  | 'katha'
  | 'satak';

export type VolumeUnitId =
  | 'ml'
  | 'l'
  | 'm3'
  | 'floz'
  | 'cup'
  | 'pt'
  | 'qt'
  | 'gal'
  | 'in3'
  | 'ft3';

export type SpeedUnitId =
  | 'mps'
  | 'kmh'
  | 'mph'
  | 'knot';

export type TimeUnitId =
  | 'ms'
  | 's'
  | 'min'
  | 'h'
  | 'day'
  | 'week'
  | 'month'
  | 'year';

export type DataUnitId =
  | 'b'
  | 'B'
  | 'KB'
  | 'MB'
  | 'GB'
  | 'TB'
  | 'PB';

export type PressureUnitId =
  | 'pa'
  | 'kpa'
  | 'bar'
  | 'atm'
  | 'psi'
  | 'torr'
  | 'mmhg';

export type EnergyUnitId =
  | 'j'
  | 'kj'
  | 'cal'
  | 'kcal'
  | 'wh'
  | 'kwh'
  | 'w'
  | 'kw'
  | 'hp';

export type CurrencyUnitId =
  | 'USD'
  | 'EUR'
  | 'INR'
  | 'BDT'
  | 'GBP'
  | 'JPY';

export type AngleUnitId =
  | 'deg'
  | 'rad'
  | 'grad';

export type UnitId =
  | LengthUnitId
  | MassUnitId
  | TemperatureUnitId
  | AreaUnitId
  | VolumeUnitId
  | SpeedUnitId
  | TimeUnitId
  | DataUnitId
  | PressureUnitId
  | EnergyUnitId
  | CurrencyUnitId
  | AngleUnitId;

export interface UnitDefinition {
  readonly id: UnitId;
  readonly label: string;
  readonly symbol: string;
  readonly categoryId: CategoryId;
  readonly group?: string;
  readonly dimension?: 'energy' | 'power' | undefined;
  readonly note?: string;
}

export interface CategoryDefinition {
  readonly id: CategoryId;
  readonly name: string;
  readonly icon: string;
  readonly description?: string;
  readonly defaultFrom: UnitId;
  readonly defaultTo: UnitId;
  readonly unitIds: readonly UnitId[];
}

export type ConversionErrorCode =
  | 'INVALID_INPUT'
  | 'EMPTY_INPUT'
  | 'UNKNOWN_UNIT'
  | 'INCOMPATIBLE_UNITS'
  | 'RATE_UNAVAILABLE'
  | 'NEGATIVE_NOT_ALLOWED';

export interface ConversionSuccess {
  readonly success: true;
  readonly value: number;
  readonly formatted: string;
  readonly formula?: string;
  readonly note?: string;
}

export interface ConversionFailure {
  readonly success: false;
  readonly error: string;
  readonly code: ConversionErrorCode;
}

export type ConversionResult = ConversionSuccess | ConversionFailure;
