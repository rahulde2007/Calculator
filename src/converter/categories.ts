import type { CategoryDefinition, CategoryId } from './types';

export const CATEGORIES: readonly CategoryDefinition[] = [
  {
    id: 'length',
    name: 'Length',
    icon: 'ruler',
    description: 'Convert between metric and imperial distances',
    defaultFrom: 'm',
    defaultTo: 'cm',
    unitIds: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi', 'nmi'],
  },
  {
    id: 'mass',
    name: 'Mass & Weight',
    icon: 'scale',
    description: 'Convert weights from milligrams to tons and stones',
    defaultFrom: 'kg',
    defaultTo: 'lb',
    unitIds: ['mg', 'g', 'kg', 't', 'oz', 'lb', 'st'],
  },
  {
    id: 'temperature',
    name: 'Temperature',
    icon: 'thermometer',
    description: 'Convert Celsius, Fahrenheit, and Kelvin',
    defaultFrom: 'celsius',
    defaultTo: 'fahrenheit',
    unitIds: ['celsius', 'fahrenheit', 'kelvin'],
  },
  {
    id: 'area',
    name: 'Area',
    icon: 'grid',
    description: 'Metric, imperial, and regional standards (Bigha, Katha)',
    defaultFrom: 'm2',
    defaultTo: 'ft2',
    unitIds: ['mm2', 'cm2', 'm2', 'ha', 'km2', 'in2', 'ft2', 'acre', 'mi2', 'bigha', 'katha', 'satak'],
  },
  {
    id: 'volume',
    name: 'Volume',
    icon: 'cylinder',
    description: 'Liters, milliliters, gallons, cups, and cubic units',
    defaultFrom: 'l',
    defaultTo: 'gal',
    unitIds: ['ml', 'l', 'm3', 'floz', 'cup', 'pt', 'qt', 'gal', 'in3', 'ft3'],
  },
  {
    id: 'speed',
    name: 'Speed',
    icon: 'gauge',
    description: 'm/s, km/h, mph, and nautical knots',
    defaultFrom: 'kmh',
    defaultTo: 'mph',
    unitIds: ['mps', 'kmh', 'mph', 'knot'],
  },
  {
    id: 'time',
    name: 'Time',
    icon: 'clock',
    description: 'Seconds to weeks, Julian astronomical month & year',
    defaultFrom: 'h',
    defaultTo: 'min',
    unitIds: ['ms', 's', 'min', 'h', 'day', 'week', 'month', 'year'],
  },
  {
    id: 'data',
    name: 'Digital Data',
    icon: 'database',
    description: 'Decimal SI data storage (1 KB = 1,000 Bytes)',
    defaultFrom: 'GB',
    defaultTo: 'MB',
    unitIds: ['b', 'B', 'KB', 'MB', 'GB', 'TB', 'PB'],
  },
  {
    id: 'pressure',
    name: 'Pressure',
    icon: 'gauge-pressure',
    description: 'Pascal, Bar, Atmosphere, PSI, Torr, and mmHg',
    defaultFrom: 'bar',
    defaultTo: 'psi',
    unitIds: ['pa', 'kpa', 'bar', 'atm', 'psi', 'torr', 'mmhg'],
  },
  {
    id: 'energy',
    name: 'Energy & Power',
    icon: 'zap',
    description: 'Energy (Joules, Calories, kWh) and Power (Watts, HP)',
    defaultFrom: 'j',
    defaultTo: 'cal',
    unitIds: ['j', 'kj', 'cal', 'kcal', 'wh', 'kwh', 'w', 'kw', 'hp'],
  },
  {
    id: 'currency',
    name: 'Currency',
    icon: 'banknotes',
    description: 'Exchange rates for USD, EUR, INR, BDT, GBP, JPY',
    defaultFrom: 'USD',
    defaultTo: 'EUR',
    unitIds: ['USD', 'EUR', 'INR', 'BDT', 'GBP', 'JPY'],
  },
  {
    id: 'angle',
    name: 'Angle',
    icon: 'compass',
    description: 'Degree, Radian, and Gradian (integrated with Scientific mode)',
    defaultFrom: 'deg',
    defaultTo: 'rad',
    unitIds: ['deg', 'rad', 'grad'],
  },
];

const CATEGORY_MAP = new Map<CategoryId, CategoryDefinition>(
  CATEGORIES.map((c) => [c.id, c])
);

export function getCategory(id: CategoryId): CategoryDefinition | undefined {
  return CATEGORY_MAP.get(id);
}
