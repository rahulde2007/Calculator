import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { initialCalculatorState, calculatorReducer } from '../../src/store/calculatorStore';
import {
  STORAGE_KEY,
  CURRENT_STORAGE_VERSION,
  getHydratedInitialState,
  savePersistedState,
  serializePersistedState,
  deserializePersistedState,
  validateThemePreference,
  type SafeStorage,
} from '../../src/store/persistence';
import {
  resolveTheme,
  watchSystemTheme,
} from '../../src/utils/theme';
import type {
  CalculationHistoryItem,
  CalculatorState,
} from '../../src/types/calculator';

function createMockStorage(initialData: Record<string, string> = {}): SafeStorage {
  const store: Record<string, string> = { ...initialData };
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
}

describe('Calcx-Pro Step 10: Themes, Settings & UX Polish', () => {
  describe('1. Theme Resolution Logic', () => {
    it('should resolve forced light preference to light regardless of OS media match', () => {
      assert.equal(resolveTheme('light', false), 'light');
      assert.equal(resolveTheme('light', true), 'light');
    });

    it('should resolve forced dark preference to dark regardless of OS media match', () => {
      assert.equal(resolveTheme('dark', false), 'dark');
      assert.equal(resolveTheme('dark', true), 'dark');
    });

    it('should resolve system preference dynamically based on OS media match', () => {
      assert.equal(resolveTheme('system', false), 'light');
      assert.equal(resolveTheme('system', true), 'dark');
    });

    it('should fallback to dark when in system mode without explicit media match or window', () => {
      assert.equal(resolveTheme('system'), 'dark');
    });
  });

  describe('2. System Media Query Watching & Cleanup', () => {
    it('should safely return a no-op cleanup function when window is undefined or matchMedia unavailable', () => {
      const cleanup = watchSystemTheme(() => {});
      assert.equal(typeof cleanup, 'function');
      // Invoking cleanup should not throw
      assert.doesNotThrow(() => cleanup());
    });

    it('should attach change listener and clean up via unbind function', () => {
      let listenerCount = 0;
      let registeredHandler: ((e: { matches: boolean }) => void) | null = null;

      const mockMediaQuery = {
        matches: true,
        addEventListener: (event: string, handler: (e: { matches: boolean }) => void) => {
          if (event === 'change') {
            listenerCount++;
            registeredHandler = handler;
          }
        },
        removeEventListener: (event: string, _handler: unknown) => {
          if (event === 'change') {
            listenerCount--;
            registeredHandler = null;
          }
        },
      };

      // Mock window.matchMedia on globalThis
      const originalWindow = (globalThis as unknown as { window?: unknown }).window;
      (globalThis as unknown as { window: unknown }).window = {
        matchMedia: (query: string) => {
          if (query === '(prefers-color-scheme: dark)') {
            return mockMediaQuery;
          }
          return mockMediaQuery;
        },
      };

      let notifiedDark: boolean | null = null;
      const unwatch = watchSystemTheme((isDark) => {
        notifiedDark = isDark;
      });

      assert.equal(listenerCount, 1);
      assert.equal(typeof registeredHandler, 'function');

      // Simulate OS switching to light
      if (registeredHandler) {
        (registeredHandler as (e: { matches: boolean }) => void)({ matches: false });
      }
      assert.equal(notifiedDark, false);

      // Simulate OS switching to dark
      if (registeredHandler) {
        (registeredHandler as (e: { matches: boolean }) => void)({ matches: true });
      }
      assert.equal(notifiedDark, true);

      // Cleanup
      unwatch();
      assert.equal(listenerCount, 0);

      // Restore original window
      if (originalWindow !== undefined) {
        (globalThis as unknown as { window: unknown }).window = originalWindow;
      } else {
        delete (globalThis as unknown as { window?: unknown }).window;
      }
    });
  });

  describe('3. Theme Preference Validation', () => {
    it('should accept valid theme preferences: system, light, dark', () => {
      assert.equal(validateThemePreference('system'), 'system');
      assert.equal(validateThemePreference('light'), 'light');
      assert.equal(validateThemePreference('dark'), 'dark');
    });

    it('should fall back to system for null, undefined, numbers, or invalid strings', () => {
      assert.equal(validateThemePreference(null), 'system');
      assert.equal(validateThemePreference(undefined), 'system');
      assert.equal(validateThemePreference(42), 'system');
      assert.equal(validateThemePreference('blue'), 'system');
      assert.equal(validateThemePreference('DARK'), 'system');
      assert.equal(validateThemePreference(''), 'system');
      assert.equal(validateThemePreference({}), 'system');
    });
  });

  describe('4. Theme Persistence & Migration', () => {
    it('should serialize and deserialize themePreference correctly', () => {
      const sampleHistory: CalculationHistoryItem[] = [
        { id: '1', expression: '2+2', result: '4', timestamp: 1000 },
      ];

      const serialized = serializePersistedState({
        history: sampleHistory,
        mode: 'scientific',
        angleUnit: 'rad',
        themePreference: 'light',
      });

      const parsed = deserializePersistedState(serialized);
      assert.ok(parsed);
      assert.equal(parsed.themePreference, 'light');
      assert.equal(parsed.preferences?.themePreference, 'light');
      assert.equal(parsed.mode, 'scientific');
      assert.equal(parsed.angleUnit, 'rad');
      assert.equal(parsed.history?.length, 1);
    });

    it('should migrate legacy persisted states (missing themePreference) cleanly to system', () => {
      // Legacy Step 8 / 9 schema without themePreference
      const legacyPayload = JSON.stringify({
        version: CURRENT_STORAGE_VERSION,
        history: [
          { id: 'hist-1', expression: '10 × 10', result: '100', timestamp: 12345 },
        ],
        mode: 'standard',
        angleUnit: 'deg',
        preferences: {
          mode: 'standard',
          angleUnit: 'deg',
        },
      });

      const storage = createMockStorage({ [STORAGE_KEY]: legacyPayload });
      const hydrated = getHydratedInitialState(initialCalculatorState, storage);

      assert.equal(hydrated.themePreference, 'system');
      assert.equal(hydrated.mode, 'standard');
      assert.equal(hydrated.angleUnit, 'deg');
      assert.equal(hydrated.history.length, 1);
      assert.equal(hydrated.history[0]?.result, '100');
      // Memory remains session-only
      assert.equal(hydrated.memory, 0);
    });

    it('should persist and hydrate light theme preference', () => {
      const storage = createMockStorage();
      savePersistedState(
        {
          history: [],
          mode: 'standard',
          angleUnit: 'deg',
          themePreference: 'light',
        },
        storage
      );

      const hydrated = getHydratedInitialState(initialCalculatorState, storage);
      assert.equal(hydrated.themePreference, 'light');
    });

    it('should persist and hydrate dark theme preference', () => {
      const storage = createMockStorage();
      savePersistedState(
        {
          history: [],
          mode: 'scientific',
          angleUnit: 'grad',
          themePreference: 'dark',
        },
        storage
      );

      const hydrated = getHydratedInitialState(initialCalculatorState, storage);
      assert.equal(hydrated.themePreference, 'dark');
      assert.equal(hydrated.mode, 'scientific');
      assert.equal(hydrated.angleUnit, 'grad');
    });

    it('should fall back safely when persisted theme preference is corrupted', () => {
      const corruptedPayload = JSON.stringify({
        version: CURRENT_STORAGE_VERSION,
        history: [],
        mode: 'standard',
        angleUnit: 'deg',
        themePreference: 'invalid-rainbow-theme',
      });

      const storage = createMockStorage({ [STORAGE_KEY]: corruptedPayload });
      const hydrated = getHydratedInitialState(initialCalculatorState, storage);
      assert.equal(hydrated.themePreference, 'system');
    });
  });

  describe('5. Calculator State & Settings Actions', () => {
    it('should handle SET_THEME_PREFERENCE without disrupting calculations or display', () => {
      let state: CalculatorState = initialCalculatorState;

      // Enter digits
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '4' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '2' });
      assert.equal(state.displayValue, '42');

      // Change theme
      state = calculatorReducer(state, { type: 'SET_THEME_PREFERENCE', payload: 'light' });
      assert.equal(state.themePreference, 'light');
      assert.equal(state.displayValue, '42');
      assert.equal(state.expression, '42');

      // Change theme to dark
      state = calculatorReducer(state, { type: 'SET_THEME_PREFERENCE', payload: 'dark' });
      assert.equal(state.themePreference, 'dark');
      assert.equal(state.displayValue, '42');

      // Change theme to system
      state = calculatorReducer(state, { type: 'SET_THEME_PREFERENCE', payload: 'system' });
      assert.equal(state.themePreference, 'system');
    });

    it('CLEAR_ALL should preserve active themePreference', () => {
      let state: CalculatorState = {
        ...initialCalculatorState,
        themePreference: 'light',
        expression: '123 + 456',
        displayValue: '579',
      };

      state = calculatorReducer(state, { type: 'CLEAR_ALL' });
      assert.equal(state.themePreference, 'light');
      assert.equal(state.expression, '');
      assert.equal(state.displayValue, '0');
    });

    it('should update mode and angleUnit through canonical actions used by settings', () => {
      let state: CalculatorState = initialCalculatorState;

      // Mode toggle
      state = calculatorReducer(state, { type: 'SET_MODE', payload: 'scientific' });
      assert.equal(state.mode, 'scientific');

      // Angle unit toggle
      state = calculatorReducer(state, { type: 'SET_ANGLE_UNIT', payload: 'rad' });
      assert.equal(state.angleUnit, 'rad');

      // Theme toggle
      state = calculatorReducer(state, { type: 'SET_THEME_PREFERENCE', payload: 'dark' });
      assert.equal(state.themePreference, 'dark');

      // Verify all settings co-exist in state cleanly
      assert.equal(state.mode, 'scientific');
      assert.equal(state.angleUnit, 'rad');
      assert.equal(state.themePreference, 'dark');
    });

    it('should guarantee memory remains strictly session-only upon hydration', () => {
      const stateWithMemory: CalculatorState = {
        ...initialCalculatorState,
        memory: 999.5,
      };

      // Even if someone somehow attempts to load, getHydratedInitialState never persists or restores memory
      const storage = createMockStorage();
      savePersistedState(
        {
          history: [],
          mode: 'standard',
          angleUnit: 'deg',
          themePreference: 'light',
        },
        storage
      );

      const hydrated = getHydratedInitialState(stateWithMemory, storage);
      assert.equal(hydrated.memory, 999.5); // Remains fallback memory from current session
    });
  });
});
