import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  convert,
  CATEGORIES,
  ALL_UNITS,
  MockCurrencyProvider,
} from '../../src/converter/index';

describe('Unit Converter Engine', () => {
  describe('1. Length Conversions', () => {
    it('converts mm ↔ cm', () => {
      const res1 = convert(10, 'mm', 'cm', 'length');
      assert.equal(res1.success, true);
      if (res1.success) assert.equal(res1.value, 1);

      const res2 = convert(2.5, 'cm', 'mm', 'length');
      assert.equal(res2.success, true);
      if (res2.success) assert.equal(res2.value, 25);
    });

    it('converts m ↔ km', () => {
      const res1 = convert(1000, 'm', 'km', 'length');
      assert.equal(res1.success, true);
      if (res1.success) assert.equal(res1.value, 1);

      const res2 = convert(5, 'km', 'm', 'length');
      assert.equal(res2.success, true);
      if (res2.success) assert.equal(res2.value, 5000);
    });

    it('converts inch ↔ cm', () => {
      const res1 = convert(1, 'in', 'cm', 'length');
      assert.equal(res1.success, true);
      if (res1.success) assert.equal(res1.value, 2.54);

      const res2 = convert(2.54, 'cm', 'in', 'length');
      assert.equal(res2.success, true);
      if (res2.success) assert.equal(res2.value, 1);
    });

    it('converts mile ↔ km', () => {
      const res = convert(1, 'mi', 'km', 'length');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 1.609344);
    });

    it('converts nautical mile to km and m', () => {
      const resMeters = convert(1, 'nmi', 'm', 'length');
      assert.equal(resMeters.success, true);
      if (resMeters.success) assert.equal(resMeters.value, 1852);

      const resKm = convert(1, 'nmi', 'km', 'length');
      assert.equal(resKm.success, true);
      if (resKm.success) assert.equal(resKm.value, 1.852);
    });
  });

  describe('2. Mass & Weight Conversions', () => {
    it('converts mg ↔ g', () => {
      const res1 = convert(1000, 'mg', 'g', 'mass');
      assert.equal(res1.success, true);
      if (res1.success) assert.equal(res1.value, 1);

      const res2 = convert(0.5, 'g', 'mg', 'mass');
      assert.equal(res2.success, true);
      if (res2.success) assert.equal(res2.value, 500);
    });

    it('converts kg ↔ lb', () => {
      const res = convert(1, 'kg', 'lb', 'mass');
      assert.equal(res.success, true);
      if (res.success) {
        assert.ok(Math.abs(res.value - 2.2046226) < 1e-4);
      }
    });

    it('converts stone ↔ kg', () => {
      // 1 stone = 14 lb = 6.35029318 kg
      const res = convert(1, 'st', 'kg', 'mass');
      assert.equal(res.success, true);
      if (res.success) {
        assert.ok(Math.abs(res.value - 6.35029318) < 1e-4);
      }
    });
  });

  describe('3. Temperature Conversions', () => {
    it('converts Celsius ↔ Fahrenheit', () => {
      const res1 = convert(0, 'celsius', 'fahrenheit', 'temperature');
      assert.equal(res1.success, true);
      if (res1.success) assert.equal(res1.value, 32);

      const res2 = convert(100, 'celsius', 'fahrenheit', 'temperature');
      assert.equal(res2.success, true);
      if (res2.success) assert.equal(res2.value, 212);

      const res3 = convert(98.6, 'fahrenheit', 'celsius', 'temperature');
      assert.equal(res3.success, true);
      if (res3.success) assert.equal(res3.value, 37);
    });

    it('converts Celsius ↔ Kelvin', () => {
      const res1 = convert(0, 'celsius', 'kelvin', 'temperature');
      assert.equal(res1.success, true);
      if (res1.success) assert.equal(res1.value, 273.15);

      const res2 = convert(298.15, 'kelvin', 'celsius', 'temperature');
      assert.equal(res2.success, true);
      if (res2.success) assert.equal(res2.value, 25);
    });

    it('converts Fahrenheit ↔ Kelvin', () => {
      const res1 = convert(32, 'fahrenheit', 'kelvin', 'temperature');
      assert.equal(res1.success, true);
      if (res1.success) assert.equal(res1.value, 273.15);

      const res2 = convert(212, 'fahrenheit', 'kelvin', 'temperature');
      assert.equal(res2.success, true);
      if (res2.success) assert.equal(res2.value, 373.15);
    });

    it('converts negative temperatures correctly (-40°C = -40°F)', () => {
      const res1 = convert(-40, 'celsius', 'fahrenheit', 'temperature');
      assert.equal(res1.success, true);
      if (res1.success) assert.equal(res1.value, -40);

      const res2 = convert(-40, 'fahrenheit', 'celsius', 'temperature');
      assert.equal(res2.success, true);
      if (res2.success) assert.equal(res2.value, -40);

      const res3 = convert(-273.15, 'celsius', 'kelvin', 'temperature');
      assert.equal(res3.success, true);
      if (res3.success) assert.equal(res3.value, 0);
    });

    it('rejects temperature below absolute zero (0 K)', () => {
      const res1 = convert(-1, 'kelvin', 'celsius', 'temperature');
      assert.equal(res1.success, false);
      if (!res1.success) assert.equal(res1.code, 'NEGATIVE_NOT_ALLOWED');

      const res2 = convert(-300, 'celsius', 'kelvin', 'temperature');
      assert.equal(res2.success, false);
      if (!res2.success) assert.equal(res2.code, 'NEGATIVE_NOT_ALLOWED');
    });
  });

  describe('4. Area Conversions & Regional Standards', () => {
    it('converts mm² ↔ m²', () => {
      const res = convert(1000000, 'mm2', 'm2', 'area');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 1);
    });

    it('converts hectare ↔ m²', () => {
      const res = convert(1, 'ha', 'm2', 'area');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 10000);
    });

    it('converts acre ↔ m²', () => {
      const res = convert(1, 'acre', 'm2', 'area');
      assert.equal(res.success, true);
      if (res.success) {
        assert.ok(Math.abs(res.value - 4046.8564) < 0.01);
      }
    });

    it('converts regional units according to explicit West Bengal / Bangladesh standard', () => {
      // 1 Bigha = 20 Katha = 14,400 sq ft = 1,337.803776 m²
      const resBigha = convert(1, 'bigha', 'm2', 'area');
      assert.equal(resBigha.success, true);
      if (resBigha.success) {
        assert.ok(Math.abs(resBigha.value - 1337.8038) < 0.01);
      }

      // 20 Katha = 1 Bigha
      const resKathaToBigha = convert(20, 'katha', 'bigha', 'area');
      assert.equal(resKathaToBigha.success, true);
      if (resKathaToBigha.success) {
        assert.equal(resKathaToBigha.value, 1);
      }

      // 1 Satak = 1/100 Acre = 435.6 sq ft ≈ 40.4686 m²
      const resSatakToAcre = convert(100, 'satak', 'acre', 'area');
      assert.equal(resSatakToAcre.success, true);
      if (resSatakToAcre.success) {
        assert.equal(resSatakToAcre.value, 1);
      }
    });
  });

  describe('5. Volume Conversions', () => {
    it('converts mL ↔ L', () => {
      const res1 = convert(1000, 'ml', 'l', 'volume');
      assert.equal(res1.success, true);
      if (res1.success) assert.equal(res1.value, 1);

      const res2 = convert(2.5, 'l', 'ml', 'volume');
      assert.equal(res2.success, true);
      if (res2.success) assert.equal(res2.value, 2500);
    });

    it('converts L ↔ m³', () => {
      const res1 = convert(1000, 'l', 'm3', 'volume');
      assert.equal(res1.success, true);
      if (res1.success) assert.equal(res1.value, 1);

      const res2 = convert(1, 'm3', 'l', 'volume');
      assert.equal(res2.success, true);
      if (res2.success) assert.equal(res2.value, 1000);
    });

    it('converts gallon ↔ L', () => {
      // 1 US gallon ≈ 3.78541 L
      const res = convert(1, 'gal', 'l', 'volume');
      assert.equal(res.success, true);
      if (res.success) {
        assert.ok(Math.abs(res.value - 3.78541) < 0.001);
      }
    });
  });

  describe('6. Speed Conversions', () => {
    it('converts m/s ↔ km/h', () => {
      const res1 = convert(10, 'mps', 'kmh', 'speed');
      assert.equal(res1.success, true);
      if (res1.success) assert.equal(res1.value, 36);

      const res2 = convert(72, 'kmh', 'mps', 'speed');
      assert.equal(res2.success, true);
      if (res2.success) assert.equal(res2.value, 20);
    });

    it('converts mph ↔ km/h', () => {
      const res = convert(60, 'mph', 'kmh', 'speed');
      assert.equal(res.success, true);
      if (res.success) {
        assert.ok(Math.abs(res.value - 96.56064) < 0.001);
      }
    });

    it('converts knot ↔ km/h', () => {
      // 1 knot = 1.852 km/h
      const res = convert(1, 'knot', 'kmh', 'speed');
      assert.equal(res.success, true);
      if (res.success) {
        assert.equal(res.value, 1.852);
      }
    });
  });

  describe('7. Time Conversions & Julian Calendar Standard', () => {
    it('converts ms ↔ s', () => {
      const res = convert(1000, 'ms', 's', 'time');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 1);
    });

    it('converts minute ↔ hour', () => {
      const res = convert(60, 'min', 'h', 'time');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 1);
    });

    it('converts day ↔ week', () => {
      const res = convert(7, 'day', 'week', 'time');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 1);
    });

    it('converts month/year using documented Julian standard', () => {
      // 1 Julian Year = 365.25 days
      const resYearToDays = convert(1, 'year', 'day', 'time');
      assert.equal(resYearToDays.success, true);
      if (resYearToDays.success) assert.equal(resYearToDays.value, 365.25);

      // 1 Julian Year = 12 Julian Months
      const resYearToMonths = convert(1, 'year', 'month', 'time');
      assert.equal(resYearToMonths.success, true);
      if (resYearToMonths.success) assert.equal(resYearToMonths.value, 12);
    });
  });

  describe('8. Digital Data Storage & Decimal SI Convention', () => {
    it('converts bit ↔ byte', () => {
      const res1 = convert(8, 'b', 'B', 'data');
      assert.equal(res1.success, true);
      if (res1.success) assert.equal(res1.value, 1);

      const res2 = convert(1, 'B', 'b', 'data');
      assert.equal(res2.success, true);
      if (res2.success) assert.equal(res2.value, 8);
    });

    it('verifies decimal SI convention: 1 KB = 1000 Bytes (not 1024)', () => {
      const resKBToB = convert(1, 'KB', 'B', 'data');
      assert.equal(resKBToB.success, true);
      if (resKBToB.success) {
        assert.equal(resKBToB.value, 1000);
        assert.notEqual(resKBToB.value, 1024);
      }
    });

    it('converts KB ↔ MB and GB ↔ TB using decimal standard', () => {
      const res1 = convert(1000, 'KB', 'MB', 'data');
      assert.equal(res1.success, true);
      if (res1.success) assert.equal(res1.value, 1);

      const res2 = convert(1, 'TB', 'GB', 'data');
      assert.equal(res2.success, true);
      if (res2.success) assert.equal(res2.value, 1000);
    });
  });

  describe('9. Pressure Conversions', () => {
    it('converts Pa ↔ kPa', () => {
      const res = convert(1000, 'pa', 'kpa', 'pressure');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 1);
    });

    it('converts bar ↔ Pa', () => {
      const res = convert(1, 'bar', 'pa', 'pressure');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 100000);
    });

    it('converts atm ↔ Pa', () => {
      const res = convert(1, 'atm', 'pa', 'pressure');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 101325);
    });

    it('converts PSI ↔ Pa', () => {
      const res = convert(1, 'psi', 'pa', 'pressure');
      assert.equal(res.success, true);
      if (res.success) {
        assert.ok(Math.abs(res.value - 6894.757) < 0.01);
      }
    });
  });

  describe('10. Energy & Power Conversions (Dimension Segregation)', () => {
    it('converts J ↔ kJ', () => {
      const res = convert(1000, 'j', 'kj', 'energy');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 1);
    });

    it('converts kcal ↔ J', () => {
      const res = convert(1, 'kcal', 'j', 'energy');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 4184);
    });

    it('converts Wh ↔ J and kWh ↔ J', () => {
      const resWh = convert(1, 'wh', 'j', 'energy');
      assert.equal(resWh.success, true);
      if (resWh.success) assert.equal(resWh.value, 3600);

      const resKwh = convert(1, 'kwh', 'j', 'energy');
      assert.equal(resKwh.success, true);
      if (resKwh.success) assert.equal(resKwh.value, 3600000);
    });

    it('converts W ↔ kW', () => {
      const res = convert(1000, 'w', 'kw', 'energy');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 1);
    });

    it('converts hp ↔ W', () => {
      const res = convert(1, 'hp', 'w', 'energy');
      assert.equal(res.success, true);
      if (res.success) {
        assert.ok(Math.abs(res.value - 745.7) < 0.1);
      }
    });

    it('rejects conversion across distinct dimensions (Energy ↔ Power)', () => {
      const res = convert(100, 'j', 'w', 'energy');
      assert.equal(res.success, false);
      if (!res.success) {
        assert.equal(res.code, 'INCOMPATIBLE_UNITS');
      }
    });
  });

  describe('11. Angle Conversions (Trigonometry Integration)', () => {
    it('converts degree ↔ radian', () => {
      const res1 = convert(180, 'deg', 'rad', 'angle');
      assert.equal(res1.success, true);
      if (res1.success) {
        assert.ok(Math.abs(res1.value - Math.PI) < 1e-9);
      }

      const res2 = convert(Math.PI, 'rad', 'deg', 'angle');
      assert.equal(res2.success, true);
      if (res2.success) {
        assert.equal(res2.value, 180);
      }
    });

    it('converts degree ↔ gradian', () => {
      const res1 = convert(90, 'deg', 'grad', 'angle');
      assert.equal(res1.success, true);
      if (res1.success) assert.equal(res1.value, 100);

      const res2 = convert(200, 'grad', 'deg', 'angle');
      assert.equal(res2.success, true);
      if (res2.success) assert.equal(res2.value, 180);
    });
  });

  describe('12. Currency Provider & Conversion Architecture', () => {
    const mockProvider = new MockCurrencyProvider({
      USD: 1,
      EUR: 0.92,
      INR: 83.5,
      BDT: 117.2,
      GBP: 0.79,
      JPY: 155.0,
    });

    it('fetches rates successfully via MockCurrencyProvider without network calls', async () => {
      const rates = await mockProvider.fetchRates('USD');
      assert.ok(rates !== null);
      assert.equal(rates?.base, 'USD');
      assert.equal(rates?.rates['EUR'], 0.92);
      assert.equal(rates?.rates['INR'], 83.5);
      assert.equal(rates?.rates['BDT'], 117.2);
    });

    it('converts currencies correctly using rates', async () => {
      const rates = await mockProvider.fetchRates('USD');
      assert.ok(rates !== null);

      // Convert 100 USD to EUR: 100 * 0.92 = 92 EUR
      const resUSDToEUR = convert(100, 'USD', 'EUR', 'currency', rates);
      assert.equal(resUSDToEUR.success, true);
      if (resUSDToEUR.success) {
        assert.equal(resUSDToEUR.value, 92);
      }

      // Cross currency: 92 EUR to USD: 92 * (1 / 0.92) = 100 USD
      const resEURToUSD = convert(92, 'EUR', 'USD', 'currency', rates);
      assert.equal(resEURToUSD.success, true);
      if (resEURToUSD.success) {
        assert.equal(resEURToUSD.value, 100);
      }
    });

    it('returns error when rates are unavailable / offline', () => {
      const res = convert(100, 'USD', 'EUR', 'currency', null);
      assert.equal(res.success, false);
      if (!res.success) {
        assert.equal(res.code, 'RATE_UNAVAILABLE');
        assert.equal(res.error, 'Live exchange rate unavailable');
      }
    });

    it('handles mock network failure gracefully', async () => {
      const failingProvider = new MockCurrencyProvider(null, true);
      const rates = await failingProvider.fetchRates('USD');
      assert.equal(rates, null);

      const res = convert(100, 'USD', 'EUR', 'currency', rates);
      assert.equal(res.success, false);
      if (!res.success) {
        assert.equal(res.code, 'RATE_UNAVAILABLE');
      }
    });
  });

  describe('13. Robustness, Validation & Edge Cases', () => {
    it('handles same-unit conversion immediately', () => {
      const res = convert(42, 'm', 'm', 'length');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 42);
    });

    it('handles negative linear values mathematically', () => {
      const res = convert(-5, 'm', 'cm', 'length');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, -500);
    });

    it('rejects invalid numeric input (NaN, Infinity)', () => {
      const resNaN = convert(NaN, 'm', 'cm', 'length');
      assert.equal(resNaN.success, false);
      if (!resNaN.success) assert.equal(resNaN.code, 'INVALID_INPUT');

      const resInf = convert(Infinity, 'm', 'cm', 'length');
      assert.equal(resInf.success, false);
      if (!resInf.success) assert.equal(resInf.code, 'INVALID_INPUT');
    });

    it('rejects unknown or mismatched units', () => {
      // Testing runtime invalid unit
      const resUnknown = convert(10, 'foobar' as unknown as import('../../src/converter/types').UnitId, 'cm', 'length');
      assert.equal(resUnknown.success, false);
      if (!resUnknown.success) assert.equal(resUnknown.code, 'INCOMPATIBLE_UNITS');

      // Units from different categories (e.g. meter to gram)
      const resCross = convert(10, 'm', 'g', 'length');
      assert.equal(resCross.success, false);
      if (!resCross.success) assert.equal(resCross.code, 'INCOMPATIBLE_UNITS');
    });

    it('verifies all 12 categories are registered and have units', () => {
      assert.equal(CATEGORIES.length, 12);
      for (const cat of CATEGORIES) {
        assert.ok(cat.unitIds.length >= 2, `Category ${cat.name} should have at least 2 units`);
        assert.ok(cat.unitIds.includes(cat.defaultFrom), `Category ${cat.name} defaultFrom is valid`);
        assert.ok(cat.unitIds.includes(cat.defaultTo), `Category ${cat.name} defaultTo is valid`);
      }
    });

    it('verifies all units in ALL_UNITS are validly categorized', () => {
      assert.ok(ALL_UNITS.length > 50);
      for (const unit of ALL_UNITS) {
        assert.ok(unit.id.length > 0);
        assert.ok(unit.label.length > 0);
        assert.ok(unit.symbol.length > 0);
      }
    });
  });
});
