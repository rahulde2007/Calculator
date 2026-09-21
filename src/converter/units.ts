import type { UnitDefinition, UnitId } from './types';

export const ALL_UNITS: readonly UnitDefinition[] = [
  // 1. LENGTH
  { id: 'mm', label: 'Millimeter', symbol: 'mm', categoryId: 'length', group: 'Metric' },
  { id: 'cm', label: 'Centimeter', symbol: 'cm', categoryId: 'length', group: 'Metric' },
  { id: 'm', label: 'Meter', symbol: 'm', categoryId: 'length', group: 'Metric' },
  { id: 'km', label: 'Kilometer', symbol: 'km', categoryId: 'length', group: 'Metric' },
  { id: 'in', label: 'Inch', symbol: 'in', categoryId: 'length', group: 'Imperial' },
  { id: 'ft', label: 'Foot', symbol: 'ft', categoryId: 'length', group: 'Imperial' },
  { id: 'yd', label: 'Yard', symbol: 'yd', categoryId: 'length', group: 'Imperial' },
  { id: 'mi', label: 'Mile', symbol: 'mi', categoryId: 'length', group: 'Imperial' },
  { id: 'nmi', label: 'Nautical Mile', symbol: 'nmi', categoryId: 'length', group: 'Imperial' },

  // 2. MASS / WEIGHT
  { id: 'mg', label: 'Milligram', symbol: 'mg', categoryId: 'mass', group: 'Metric' },
  { id: 'g', label: 'Gram', symbol: 'g', categoryId: 'mass', group: 'Metric' },
  { id: 'kg', label: 'Kilogram', symbol: 'kg', categoryId: 'mass', group: 'Metric' },
  { id: 't', label: 'Metric Ton', symbol: 't', categoryId: 'mass', group: 'Metric' },
  { id: 'oz', label: 'Ounce', symbol: 'oz', categoryId: 'mass', group: 'Imperial' },
  { id: 'lb', label: 'Pound', symbol: 'lb', categoryId: 'mass', group: 'Imperial' },
  { id: 'st', label: 'Stone', symbol: 'st', categoryId: 'mass', group: 'Imperial' },

  // 3. TEMPERATURE
  { id: 'celsius', label: 'Celsius', symbol: '°C', categoryId: 'temperature' },
  { id: 'fahrenheit', label: 'Fahrenheit', symbol: '°F', categoryId: 'temperature' },
  { id: 'kelvin', label: 'Kelvin', symbol: 'K', categoryId: 'temperature' },

  // 4. AREA
  { id: 'mm2', label: 'Square Millimeter', symbol: 'mm²', categoryId: 'area', group: 'Metric' },
  { id: 'cm2', label: 'Square Centimeter', symbol: 'cm²', categoryId: 'area', group: 'Metric' },
  { id: 'm2', label: 'Square Meter', symbol: 'm²', categoryId: 'area', group: 'Metric' },
  { id: 'ha', label: 'Hectare', symbol: 'ha', categoryId: 'area', group: 'Metric' },
  { id: 'km2', label: 'Square Kilometer', symbol: 'km²', categoryId: 'area', group: 'Metric' },
  { id: 'in2', label: 'Square Inch', symbol: 'in²', categoryId: 'area', group: 'Imperial' },
  { id: 'ft2', label: 'Square Foot', symbol: 'ft²', categoryId: 'area', group: 'Imperial' },
  { id: 'acre', label: 'Acre', symbol: 'ac', categoryId: 'area', group: 'Imperial' },
  { id: 'mi2', label: 'Square Mile', symbol: 'mi²', categoryId: 'area', group: 'Imperial' },
  { id: 'bigha', label: 'Bigha (WB/BD standard)', symbol: 'bigha', categoryId: 'area', group: 'Regional', note: '14,400 sq ft ≈ 1,338 m²' },
  { id: 'katha', label: 'Katha (WB/BD standard)', symbol: 'katha', categoryId: 'area', group: 'Regional', note: '720 sq ft ≈ 66.9 m²' },
  { id: 'satak', label: 'Satak / Decimal', symbol: 'satak', categoryId: 'area', group: 'Regional', note: '435.6 sq ft ≈ 40.47 m²' },

  // 5. VOLUME
  { id: 'ml', label: 'Milliliter', symbol: 'mL', categoryId: 'volume', group: 'Metric' },
  { id: 'l', label: 'Liter', symbol: 'L', categoryId: 'volume', group: 'Metric' },
  { id: 'm3', label: 'Cubic Meter', symbol: 'm³', categoryId: 'volume', group: 'Metric' },
  { id: 'floz', label: 'Fluid Ounce (US)', symbol: 'fl oz', categoryId: 'volume', group: 'Imperial' },
  { id: 'cup', label: 'Cup (US)', symbol: 'cup', categoryId: 'volume', group: 'Imperial' },
  { id: 'pt', label: 'Pint (US)', symbol: 'pt', categoryId: 'volume', group: 'Imperial' },
  { id: 'qt', label: 'Quart (US)', symbol: 'qt', categoryId: 'volume', group: 'Imperial' },
  { id: 'gal', label: 'Gallon (US)', symbol: 'gal', categoryId: 'volume', group: 'Imperial' },
  { id: 'in3', label: 'Cubic Inch', symbol: 'in³', categoryId: 'volume', group: 'Imperial' },
  { id: 'ft3', label: 'Cubic Foot', symbol: 'ft³', categoryId: 'volume', group: 'Imperial' },

  // 6. SPEED
  { id: 'mps', label: 'Meter per second', symbol: 'm/s', categoryId: 'speed' },
  { id: 'kmh', label: 'Kilometer per hour', symbol: 'km/h', categoryId: 'speed' },
  { id: 'mph', label: 'Mile per hour', symbol: 'mph', categoryId: 'speed' },
  { id: 'knot', label: 'Knot', symbol: 'kn', categoryId: 'speed' },

  // 7. TIME
  { id: 'ms', label: 'Millisecond', symbol: 'ms', categoryId: 'time' },
  { id: 's', label: 'Second', symbol: 's', categoryId: 'time' },
  { id: 'min', label: 'Minute', symbol: 'min', categoryId: 'time' },
  { id: 'h', label: 'Hour', symbol: 'h', categoryId: 'time' },
  { id: 'day', label: 'Day', symbol: 'd', categoryId: 'time' },
  { id: 'week', label: 'Week', symbol: 'wk', categoryId: 'time' },
  { id: 'month', label: 'Month (Julian standard)', symbol: 'mo', categoryId: 'time', note: '30.4375 days average' },
  { id: 'year', label: 'Year (Julian astronomical)', symbol: 'yr', categoryId: 'time', note: '365.25 days' },

  // 8. DATA STORAGE / DIGITAL DATA (Decimal SI convention)
  { id: 'b', label: 'Bit', symbol: 'b', categoryId: 'data' },
  { id: 'B', label: 'Byte', symbol: 'B', categoryId: 'data' },
  { id: 'KB', label: 'Kilobyte (10³ B)', symbol: 'KB', categoryId: 'data', note: 'Decimal SI (1,000 B)' },
  { id: 'MB', label: 'Megabyte (10⁶ B)', symbol: 'MB', categoryId: 'data', note: 'Decimal SI (1,000 KB)' },
  { id: 'GB', label: 'Gigabyte (10⁹ B)', symbol: 'GB', categoryId: 'data', note: 'Decimal SI (1,000 MB)' },
  { id: 'TB', label: 'Terabyte (10¹² B)', symbol: 'TB', categoryId: 'data', note: 'Decimal SI (1,000 GB)' },
  { id: 'PB', label: 'Petabyte (10¹⁵ B)', symbol: 'PB', categoryId: 'data', note: 'Decimal SI (1,000 TB)' },

  // 9. PRESSURE
  { id: 'pa', label: 'Pascal', symbol: 'Pa', categoryId: 'pressure' },
  { id: 'kpa', label: 'Kilopascal', symbol: 'kPa', categoryId: 'pressure' },
  { id: 'bar', label: 'Bar', symbol: 'bar', categoryId: 'pressure' },
  { id: 'atm', label: 'Atmosphere', symbol: 'atm', categoryId: 'pressure' },
  { id: 'psi', label: 'PSI (Pound per sq in)', symbol: 'psi', categoryId: 'pressure' },
  { id: 'torr', label: 'Torr', symbol: 'Torr', categoryId: 'pressure' },
  { id: 'mmhg', label: 'Millimeter of mercury', symbol: 'mmHg', categoryId: 'pressure' },

  // 10. ENERGY & POWER (Separated dimensions)
  { id: 'j', label: 'Joule', symbol: 'J', categoryId: 'energy', group: 'Energy', dimension: 'energy' },
  { id: 'kj', label: 'Kilojoule', symbol: 'kJ', categoryId: 'energy', group: 'Energy', dimension: 'energy' },
  { id: 'cal', label: 'Calorie', symbol: 'cal', categoryId: 'energy', group: 'Energy', dimension: 'energy' },
  { id: 'kcal', label: 'Kilocalorie', symbol: 'kcal', categoryId: 'energy', group: 'Energy', dimension: 'energy' },
  { id: 'wh', label: 'Watt-hour', symbol: 'Wh', categoryId: 'energy', group: 'Energy', dimension: 'energy' },
  { id: 'kwh', label: 'Kilowatt-hour', symbol: 'kWh', categoryId: 'energy', group: 'Energy', dimension: 'energy' },
  { id: 'w', label: 'Watt', symbol: 'W', categoryId: 'energy', group: 'Power', dimension: 'power' },
  { id: 'kw', label: 'Kilowatt', symbol: 'kW', categoryId: 'energy', group: 'Power', dimension: 'power' },
  { id: 'hp', label: 'Horsepower (Mechanical)', symbol: 'hp', categoryId: 'energy', group: 'Power', dimension: 'power' },

  // 11. CURRENCY
  { id: 'USD', label: 'US Dollar', symbol: '$', categoryId: 'currency' },
  { id: 'EUR', label: 'Euro', symbol: '€', categoryId: 'currency' },
  { id: 'INR', label: 'Indian Rupee', symbol: '₹', categoryId: 'currency' },
  { id: 'BDT', label: 'Bangladeshi Taka', symbol: '৳', categoryId: 'currency' },
  { id: 'GBP', label: 'British Pound', symbol: '£', categoryId: 'currency' },
  { id: 'JPY', label: 'Japanese Yen', symbol: '¥', categoryId: 'currency' },

  // 12. ANGLE
  { id: 'deg', label: 'Degree', symbol: '°', categoryId: 'angle' },
  { id: 'rad', label: 'Radian', symbol: 'rad', categoryId: 'angle' },
  { id: 'grad', label: 'Gradian', symbol: 'grad', categoryId: 'angle' },
];

const UNIT_MAP = new Map<UnitId, UnitDefinition>(ALL_UNITS.map((u) => [u.id, u]));

export function getUnit(id: UnitId): UnitDefinition | undefined {
  return UNIT_MAP.get(id);
}

export function getUnitsForCategory(categoryId: string): UnitDefinition[] {
  return ALL_UNITS.filter((u) => u.categoryId === categoryId);
}
