import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { calculate } from '../../src/engine';
import { calculatorReducer, initialCalculatorState } from '../../src/store/calculatorStore';
import { serializePersistedState, deserializePersistedState } from '../../src/store/persistence';
import type { CalculationHistoryItem } from '../../src/types/calculator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

describe('Calcx-Pro Step 11: PWA + Production Readiness', () => {
  describe('1. PWA Icons & Static Assets Verification', () => {
    it('should verify public/favicon.svg exists and has valid vector content', () => {
      const faviconPath = path.join(projectRoot, 'public/favicon.svg');
      assert.ok(fs.existsSync(faviconPath), 'public/favicon.svg must exist');
      const content = fs.readFileSync(faviconPath, 'utf8');
      assert.ok(content.includes('<svg'), 'favicon.svg must be an SVG file');
    });

    it('should verify public/icons/icon-192.png exists and is a valid non-empty file', () => {
      const iconPath = path.join(projectRoot, 'public/icons/icon-192.png');
      assert.ok(fs.existsSync(iconPath), 'public/icons/icon-192.png must exist');
      const stats = fs.statSync(iconPath);
      assert.ok(stats.size > 500, 'icon-192.png should have valid PNG image data');

      // Verify PNG magic signature: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
      const buf = fs.readFileSync(iconPath);
      assert.equal(buf[0], 0x89);
      assert.equal(buf[1], 0x50);
      assert.equal(buf[2], 0x4e);
      assert.equal(buf[3], 0x47);
    });

    it('should verify public/icons/icon-512.png exists and is a valid non-empty file', () => {
      const iconPath = path.join(projectRoot, 'public/icons/icon-512.png');
      assert.ok(fs.existsSync(iconPath), 'public/icons/icon-512.png must exist');
      const stats = fs.statSync(iconPath);
      assert.ok(stats.size > 1000, 'icon-512.png should have valid PNG image data');

      const buf = fs.readFileSync(iconPath);
      assert.equal(buf[0], 0x89);
      assert.equal(buf[1], 0x50);
      assert.equal(buf[2], 0x4e);
      assert.equal(buf[3], 0x47);
    });

    it('should verify public/icons/icon-maskable-512.png exists and is valid', () => {
      const iconPath = path.join(projectRoot, 'public/icons/icon-maskable-512.png');
      assert.ok(fs.existsSync(iconPath), 'public/icons/icon-maskable-512.png must exist');
      const stats = fs.statSync(iconPath);
      assert.ok(stats.size > 1000, 'icon-maskable-512.png should have valid PNG image data');

      const buf = fs.readFileSync(iconPath);
      assert.equal(buf[0], 0x89);
      assert.equal(buf[1], 0x50);
      assert.equal(buf[2], 0x4e);
      assert.equal(buf[3], 0x47);
    });

    it('should verify public/icons/icon.svg exists as scalable vector fallback', () => {
      const iconSvgPath = path.join(projectRoot, 'public/icons/icon.svg');
      assert.ok(fs.existsSync(iconSvgPath), 'public/icons/icon.svg must exist');
      const content = fs.readFileSync(iconSvgPath, 'utf8');
      assert.ok(content.includes('<svg'), 'icon.svg must contain valid SVG markup');
    });
  });

  describe('2. Web App Manifest Verification', () => {
    it('should verify manifest.webmanifest exists in dist after production build', () => {
      const distManifestPath = path.join(projectRoot, 'dist/manifest.webmanifest');
      assert.ok(fs.existsSync(distManifestPath), 'dist/manifest.webmanifest must be generated');

      const manifestContent = fs.readFileSync(distManifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);

      assert.equal(manifest.name, 'Calcx-Pro');
      assert.equal(manifest.short_name, 'Calcx-Pro');
      assert.equal(manifest.display, 'standalone');
      assert.equal(manifest.theme_color, '#090D16');
      assert.equal(manifest.background_color, '#090D16');
      assert.equal(manifest.start_url, '/');
      assert.equal(manifest.scope, '/');

      assert.ok(Array.isArray(manifest.icons), 'manifest must declare icons array');
      assert.ok(manifest.icons.length >= 3, 'manifest must declare at least 3 icon variants');

      const icon192 = manifest.icons.find((i: { sizes: string }) => i.sizes === '192x192');
      const icon512 = manifest.icons.find(
        (i: { sizes: string; purpose?: string }) => i.sizes === '512x512' && i.purpose !== 'maskable'
      );
      const iconMaskable = manifest.icons.find((i: { purpose?: string }) => i.purpose === 'maskable');

      assert.ok(icon192, 'manifest must contain 192x192 icon');
      assert.ok(icon512, 'manifest must contain 512x512 icon');
      assert.ok(iconMaskable, 'manifest must contain maskable icon');
    });

    it('should verify sw.js and workbox exist in dist after production build', () => {
      const swPath = path.join(projectRoot, 'dist/sw.js');
      assert.ok(fs.existsSync(swPath), 'dist/sw.js must be generated for offline capabilities');
      const swContent = fs.readFileSync(swPath, 'utf8');
      assert.ok(swContent.includes('precacheAndRoute'), 'sw.js must configure Workbox precaching');
    });
  });

  describe('3. Offline Calculation Resilience', () => {
    it('should evaluate complex scientific calculations offline without network dependencies', () => {
      const res1 = calculate('sin(30) + 2^3', { angleUnit: 'deg' });
      assert.equal(res1.success, true);
      if (res1.success) {
        assert.equal(res1.value, 8.5);
      }

      const res2 = calculate('5! + sqrt(144) + ln(e)', { angleUnit: 'rad' });
      assert.equal(res2.success, true);
      if (res2.success) {
        assert.equal(res2.value, 133);
      }
    });

    it('should maintain calculator reducer transitions in pure offline memory', () => {
      let state = initialCalculatorState;

      // 7 * 8 = 56
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '7' });
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '×' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '8' });
      state = calculatorReducer(state, { type: 'CALCULATE' });

      assert.equal(state.displayValue, '56');
      assert.equal(state.history.length, 1);

      // Memory Add: 56 to memory
      state = calculatorReducer(state, { type: 'MEMORY_ADD' });
      assert.equal(state.memory, 56);

      // Clear all preserves memory
      state = calculatorReducer(state, { type: 'CLEAR_ALL' });
      assert.equal(state.displayValue, '0');
      assert.equal(state.memory, 56);

      // Memory Recall
      state = calculatorReducer(state, { type: 'MEMORY_RECALL' });
      assert.equal(state.displayValue, '56');
    });

    it('should serialize and deserialize calculation history offline', () => {
      const items: CalculationHistoryItem[] = [
        { id: '1', expression: '25 × 4', result: '100', timestamp: 12345 },
      ];
      const serialized = serializePersistedState({
        history: items,
        mode: 'scientific',
        angleUnit: 'rad',
        themePreference: 'dark',
      });
      const parsed = deserializePersistedState(serialized);
      assert.ok(parsed);
      assert.equal(parsed.mode, 'scientific');
      assert.equal(parsed.angleUnit, 'rad');
      assert.equal(parsed.themePreference, 'dark');
      assert.equal(parsed.history?.length, 1);
    });
  });

  describe('4. Security & Zero-Injection Invariants', () => {
    it('should safely reject JavaScript execution payloads without running code', () => {
      const maliciousPayloads = [
        'alert(1)',
        'window.location="http://evil.com"',
        'document.cookie',
        '<script>alert("xss")</script>',
        'process.exit(1)',
        'require("fs")',
      ];

      for (const payload of maliciousPayloads) {
        const result = calculate(payload);
        assert.equal(result.success, false, `Payload "${payload}" must not evaluate successfully`);
        assert.ok(result.error, 'Should produce a structured calculation error');
      }
    });

    it('should verify .env.example contains no secret API keys or credentials', () => {
      const envExamplePath = path.join(projectRoot, '.env.example');
      assert.ok(fs.existsSync(envExamplePath), '.env.example must exist');
      const content = fs.readFileSync(envExamplePath, 'utf8');
      assert.ok(!content.includes('API_KEY='), 'No API keys should be defined');
      assert.ok(!content.includes('SECRET='), 'No secrets should be defined');
    });
  });
});
