import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { initialCalculatorState, calculatorReducer } from '../../src/store/calculatorStore';
import {
  STORAGE_KEY,
  CURRENT_STORAGE_VERSION,
  MAX_PERSISTED_HISTORY,
  getHydratedInitialState,
  loadPersistedState,
  savePersistedState,
  clearPersistedState,
  serializePersistedState,
  deserializePersistedState,
  validateMode,
  validateAngleUnit,
  validateAndSanitizeHistory,
  safeStorageGet,
  safeStorageSet,
  safeStorageRemove,
  type SafeStorage,
} from '../../src/store/persistence';
import { calculate } from '../../src/engine';
import type { CalculationHistoryItem, CalculatorState } from '../../src/types/calculator';

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

function createThrowingStorage(
  failingMethod: 'getItem' | 'setItem' | 'removeItem',
  error: Error = new Error('Storage access denied')
): SafeStorage {
  return {
    getItem: (_key: string) => {
      if (failingMethod === 'getItem') throw error;
      return null;
    },
    setItem: (_key: string, _value: string) => {
      if (failingMethod === 'setItem') throw error;
    },
    removeItem: (_key: string) => {
      if (failingMethod === 'removeItem') throw error;
    },
  };
}

describe('Calcx-Pro Step 8: Persistence & Preferences', () => {
  describe('A. Fresh Install / Empty Storage', () => {
    it('should hydrate default initial state when storage is empty', () => {
      const storage = createMockStorage();
      const hydrated = getHydratedInitialState(initialCalculatorState, storage);

      assert.equal(hydrated.mode, 'standard');
      assert.equal(hydrated.angleUnit, 'deg');
      assert.equal(hydrated.memory, 0);
      assert.equal(hydrated.status, 'idle');
      assert.equal(hydrated.expression, '');
      assert.equal(hydrated.displayValue, '0');
      assert.equal(hydrated.isError, false);
      assert.deepEqual(hydrated.history, []);
    });

    it('should return null from loadPersistedState when storage is empty', () => {
      const storage = createMockStorage();
      const loaded = loadPersistedState(storage);
      assert.equal(loaded, null);
    });
  });

  describe('B. Valid Stored State Restoration', () => {
    it('should restore mode, angleUnit, and history from valid persisted storage', () => {
      const sampleHistory: CalculationHistoryItem[] = [
        {
          id: 'hist-1',
          expression: '25 × 4',
          result: '100',
          timestamp: 1716300000000,
        },
        {
          id: 'hist-2',
          expression: 'sin(30)',
          result: '0.5',
          timestamp: 1716300010000,
        },
      ];

      const serialized = serializePersistedState({
        history: sampleHistory,
        mode: 'scientific',
        angleUnit: 'rad',
      });

      const storage = createMockStorage({ [STORAGE_KEY]: serialized });
      const hydrated = getHydratedInitialState(initialCalculatorState, storage);

      assert.equal(hydrated.mode, 'scientific');
      assert.equal(hydrated.angleUnit, 'rad');
      assert.equal(hydrated.history.length, 2);
      assert.equal(hydrated.history[0]?.expression, '25 × 4');
      assert.equal(hydrated.history[0]?.result, '100');
      assert.equal(hydrated.history[1]?.expression, 'sin(30)');
      assert.equal(hydrated.history[1]?.result, '0.5');
    });

    it('should include version and preferences structure in serialized output', () => {
      const serialized = serializePersistedState({
        history: [],
        mode: 'scientific',
        angleUnit: 'grad',
      });

      const parsed = JSON.parse(serialized);
      assert.equal(parsed.version, CURRENT_STORAGE_VERSION);
      assert.equal(parsed.mode, 'scientific');
      assert.equal(parsed.angleUnit, 'grad');
      assert.equal(parsed.preferences.mode, 'scientific');
      assert.equal(parsed.preferences.angleUnit, 'grad');
    });
  });

  describe('C. Invalid Mode Fallback', () => {
    it('should validate and fall back to standard mode for invalid inputs', () => {
      assert.equal(validateMode('invalid_mode'), 'standard');
      assert.equal(validateMode(12345), 'standard');
      assert.equal(validateMode(null), 'standard');
      assert.equal(validateMode(undefined), 'standard');
      assert.equal(validateMode({}), 'standard');
      assert.equal(validateMode('scientific'), 'scientific');
      assert.equal(validateMode('standard'), 'standard');
    });

    it('should hydrate with standard mode when stored mode is corrupted', () => {
      const corruptedPayload = JSON.stringify({
        version: 1,
        mode: 'corrupted_mode_xyz',
        angleUnit: 'deg',
        history: [],
      });

      const storage = createMockStorage({ [STORAGE_KEY]: corruptedPayload });
      const hydrated = getHydratedInitialState(initialCalculatorState, storage);
      assert.equal(hydrated.mode, 'standard');
    });
  });

  describe('D. Invalid Angle Unit Fallback', () => {
    it('should validate and fall back to deg angle unit for invalid inputs', () => {
      assert.equal(validateAngleUnit('turns'), 'deg');
      assert.equal(validateAngleUnit(null), 'deg');
      assert.equal(validateAngleUnit(undefined), 'deg');
      assert.equal(validateAngleUnit(999), 'deg');
      assert.equal(validateAngleUnit('rad'), 'rad');
      assert.equal(validateAngleUnit('grad'), 'grad');
      assert.equal(validateAngleUnit('deg'), 'deg');
    });

    it('should hydrate with deg angle unit when stored unit is corrupted', () => {
      const corruptedPayload = JSON.stringify({
        version: 1,
        mode: 'scientific',
        angleUnit: 'revolution',
        history: [],
      });

      const storage = createMockStorage({ [STORAGE_KEY]: corruptedPayload });
      const hydrated = getHydratedInitialState(initialCalculatorState, storage);
      assert.equal(hydrated.angleUnit, 'deg');
      // Mode should still restore correctly
      assert.equal(hydrated.mode, 'scientific');
    });
  });

  describe('E. Corrupted JSON Resilience', () => {
    it('should safely return null without throwing when JSON is unparseable', () => {
      assert.equal(deserializePersistedState('{{invalid json'), null);
      assert.equal(deserializePersistedState(''), null);
      assert.equal(deserializePersistedState('12345'), null);
      assert.equal(deserializePersistedState('null'), null);
      assert.equal(deserializePersistedState('"just a string"'), null);
    });

    it('should reject schemas with missing or invalid version numbers', () => {
      const noVersion = JSON.stringify({ mode: 'scientific', angleUnit: 'rad' });
      assert.equal(deserializePersistedState(noVersion), null);

      const negativeVersion = JSON.stringify({ version: -1, mode: 'scientific' });
      assert.equal(deserializePersistedState(negativeVersion), null);

      const zeroVersion = JSON.stringify({ version: 0, mode: 'scientific' });
      assert.equal(deserializePersistedState(zeroVersion), null);
    });

    it('should fall back to clean initial state when storage contains corrupted JSON', () => {
      const storage = createMockStorage({ [STORAGE_KEY]: '<<<malformed json>>>' });
      const hydrated = getHydratedInitialState(initialCalculatorState, storage);

      assert.equal(hydrated.mode, 'standard');
      assert.equal(hydrated.angleUnit, 'deg');
      assert.deepEqual(hydrated.history, []);
      assert.equal(hydrated.isError, false);
    });
  });

  describe('F. Invalid History Sanitization', () => {
    it('should return empty array if raw history is not an array', () => {
      assert.deepEqual(validateAndSanitizeHistory(null), []);
      assert.deepEqual(validateAndSanitizeHistory('not an array'), []);
      assert.deepEqual(validateAndSanitizeHistory({ item: 1 }), []);
    });

    it('should filter out corrupted history items and keep valid ones', () => {
      const mixedHistory = [
        { id: 'valid-1', expression: '2 + 2', result: '4', timestamp: 1000 },
        { id: 'missing-result', expression: '2 + 2' }, // Missing result
        { id: 'missing-expr', result: '4' }, // Missing expression
        null,
        'string item',
        42,
        { id: 'valid-2', expression: '10 × 10', result: '100', timestamp: 2000 },
      ];

      const sanitized = validateAndSanitizeHistory(mixedHistory);
      assert.equal(sanitized.length, 2);
      assert.equal(sanitized[0]?.id, 'valid-1');
      assert.equal(sanitized[1]?.id, 'valid-2');
    });

    it('should clamp history to MAX_PERSISTED_HISTORY', () => {
      const largeList: CalculationHistoryItem[] = [];
      for (let i = 0; i < 100; i++) {
        largeList.push({
          id: `h-${i}`,
          expression: `${i} + 1`,
          result: `${i + 1}`,
          timestamp: 1000 + i,
        });
      }

      const sanitized = validateAndSanitizeHistory(largeList);
      assert.equal(sanitized.length, MAX_PERSISTED_HISTORY);
    });
  });

  describe('G. Storage Read Failure Resilience', () => {
    it('should handle safeStorageGet exceptions (SecurityError, cookies blocked) without throwing', () => {
      const throwingStorage = createThrowingStorage('getItem', new Error('SecurityError: Cookies blocked'));
      const result = safeStorageGet('any-key', throwingStorage);
      assert.equal(result, null);
    });

    it('should return default initial state if reading from storage throws', () => {
      const throwingStorage = createThrowingStorage('getItem', new Error('DOMException: Access denied'));
      const hydrated = getHydratedInitialState(initialCalculatorState, throwingStorage);
      assert.equal(hydrated.mode, 'standard');
      assert.equal(hydrated.angleUnit, 'deg');
      assert.deepEqual(hydrated.history, []);
    });
  });

  describe('H. Storage Write Failure Resilience', () => {
    it('should handle safeStorageSet exceptions (QuotaExceededError) and return false gracefully', () => {
      const throwingStorage = createThrowingStorage('setItem', new Error('QuotaExceededError: Storage quota exceeded'));
      const saved = safeStorageSet('any-key', 'data', throwingStorage);
      assert.equal(saved, false);
    });

    it('should not throw or crash when savePersistedState encounters a quota error', () => {
      const throwingStorage = createThrowingStorage('setItem', new Error('QuotaExceededError'));
      const result = savePersistedState(
        {
          history: [],
          mode: 'standard',
          angleUnit: 'deg',
        },
        throwingStorage
      );
      assert.equal(result, false);
    });
  });

  describe('I. History Persistence Updates via Reducer Flow', () => {
    it('should persist new calculations to history in storage', () => {
      const storage = createMockStorage();

      // Simulate first calculation: 10 + 5 = 15
      let state: CalculatorState = initialCalculatorState;
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '1' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '0' });
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '+' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '5' });
      state = calculatorReducer(state, { type: 'CALCULATE' });

      assert.equal(state.displayValue, '15');
      assert.equal(state.history.length, 1);

      // Save to persistence
      const saved = savePersistedState(
        {
          history: state.history,
          mode: state.mode,
          angleUnit: state.angleUnit,
        },
        storage
      );
      assert.equal(saved, true);

      // Reload and verify
      const loaded = loadPersistedState(storage);
      assert.ok(loaded);
      assert.equal(loaded.history?.length, 1);
      assert.equal(loaded.history?.[0]?.expression, '10 + 5');
      assert.equal(loaded.history?.[0]?.result, '15');
    });
  });

  describe('J. Clear History Persistence', () => {
    it('should update storage with empty history array when history is cleared', () => {
      const storage = createMockStorage();

      // Save initial history
      savePersistedState(
        {
          history: [{ id: '1', expression: '5 × 5', result: '25', timestamp: 12345 }],
          mode: 'standard',
          angleUnit: 'deg',
        },
        storage
      );

      let loaded = loadPersistedState(storage);
      assert.equal(loaded?.history?.length, 1);

      // Clear history in state
      let state: CalculatorState = {
        ...initialCalculatorState,
        history: loaded?.history ?? [],
      };
      state = calculatorReducer(state, { type: 'CLEAR_HISTORY' });
      assert.equal(state.history.length, 0);

      // Sync cleared state
      savePersistedState(
        {
          history: state.history,
          mode: state.mode,
          angleUnit: state.angleUnit,
        },
        storage
      );

      loaded = loadPersistedState(storage);
      assert.deepEqual(loaded?.history, []);
    });

    it('should support clearPersistedState to remove key completely', () => {
      const storage = createMockStorage({ [STORAGE_KEY]: 'some data' });
      const removed = clearPersistedState(storage);
      assert.equal(removed, true);
      assert.equal(storage.getItem(STORAGE_KEY), null);
    });

    it('should handle safeStorageRemove correctly', () => {
      const storage = createMockStorage({ key1: 'value1' });
      assert.equal(safeStorageRemove('key1', storage), true);
      assert.equal(storage.getItem('key1'), null);

      const throwingStorage = createThrowingStorage('removeItem', new Error('Blocked'));
      assert.equal(safeStorageRemove('key1', throwingStorage), false);
    });
  });

  describe('K. Reload-Style Hydration & Transient State Reset', () => {
    it('should reconstitute preferences and history while resetting transient states', () => {
      const storage = createMockStorage();

      // Save state that simulates what is stored
      savePersistedState(
        {
          history: [{ id: 'h1', expression: '100 / 4', result: '25', timestamp: 1000 }],
          mode: 'scientific',
          angleUnit: 'rad',
        },
        storage
      );

      // Hydrate into new runtime state
      const hydrated = getHydratedInitialState(initialCalculatorState, storage);

      // Persisted values are restored
      assert.equal(hydrated.mode, 'scientific');
      assert.equal(hydrated.angleUnit, 'rad');
      assert.equal(hydrated.history.length, 1);

      // Transient calculation fields MUST be clean idle defaults
      assert.equal(hydrated.expression, '');
      assert.equal(hydrated.displayValue, '0');
      assert.equal(hydrated.previousResult, null);
      assert.equal(hydrated.status, 'idle');
      assert.equal(hydrated.isError, false);
      assert.equal(hydrated.errorMessage, null);
    });
  });

  describe('L. Memory Persistence Invariance (Step 7 & 8 Boundary)', () => {
    it('must NEVER restore memory from persistent storage (memory is session-only)', () => {
      // Intentionally insert a foreign/corrupted "memory" property in the storage JSON
      const fakeStorageData = JSON.stringify({
        version: 1,
        mode: 'standard',
        angleUnit: 'deg',
        history: [],
        memory: 999999, // Unauthorized memory field
      });

      const storage = createMockStorage({ [STORAGE_KEY]: fakeStorageData });
      const hydrated = getHydratedInitialState(initialCalculatorState, storage);

      // Memory must remain 0 on reload!
      assert.equal(hydrated.memory, 0);
    });

    it('should verify CLEAR_ALL preserves session memory but reload resets memory to 0', () => {
      // 1. Session state with memory = 50
      let sessionState: CalculatorState = {
        ...initialCalculatorState,
        memory: 50,
        expression: '99 + 1',
        displayValue: '1',
      };

      // 2. CLEAR_ALL in active session: memory is kept intact
      sessionState = calculatorReducer(sessionState, { type: 'CLEAR_ALL' });
      assert.equal(sessionState.memory, 50);

      // 3. Page reload (fresh hydration from storage): memory starts at 0
      const storage = createMockStorage();
      const freshReloadState = getHydratedInitialState(initialCalculatorState, storage);
      assert.equal(freshReloadState.memory, 0);
    });
  });

  describe('M. Scientific Mode Calculation Continuity with Restored State', () => {
    it('should perform scientific calculations using restored mode and angleUnit', () => {
      const storage = createMockStorage();

      // Persist scientific mode with rad angle unit
      savePersistedState(
        {
          history: [],
          mode: 'scientific',
          angleUnit: 'rad',
        },
        storage
      );

      const hydrated = getHydratedInitialState(initialCalculatorState, storage);
      assert.equal(hydrated.mode, 'scientific');
      assert.equal(hydrated.angleUnit, 'rad');

      // Use the restored angleUnit in engine calculation: sin(pi / 2) in RAD = 1
      const calcResult = calculate('sin(pi / 2)', { angleUnit: hydrated.angleUnit });
      assert.equal(calcResult.success, true);
      if (calcResult.success) {
        assert.equal(calcResult.value, 1);
      }
    });

    it('should perform scientific calculation in GRAD mode after restoration', () => {
      const storage = createMockStorage();

      savePersistedState(
        {
          history: [],
          mode: 'scientific',
          angleUnit: 'grad',
        },
        storage
      );

      const hydrated = getHydratedInitialState(initialCalculatorState, storage);
      assert.equal(hydrated.angleUnit, 'grad');

      // sin(100) in GRAD = 1
      const calcResult = calculate('sin(100)', { angleUnit: hydrated.angleUnit });
      assert.equal(calcResult.success, true);
      if (calcResult.success) {
        assert.equal(calcResult.value, 1);
      }
    });
  });

  describe('N. Step 10 Theme Preference Persistence', () => {
    it('should default to system theme when hydrating from empty storage', () => {
      const storage = createMockStorage();
      const hydrated = getHydratedInitialState(initialCalculatorState, storage);
      assert.equal(hydrated.themePreference, 'system');
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
          angleUnit: 'deg',
          themePreference: 'dark',
        },
        storage
      );

      const hydrated = getHydratedInitialState(initialCalculatorState, storage);
      assert.equal(hydrated.themePreference, 'dark');
    });

    it('should fall back to system theme when themePreference in storage is invalid', () => {
      const storage = createMockStorage({
        [STORAGE_KEY]: JSON.stringify({
          version: CURRENT_STORAGE_VERSION,
          history: [],
          mode: 'standard',
          angleUnit: 'deg',
          themePreference: 'neon-glow',
        }),
      });

      const hydrated = getHydratedInitialState(initialCalculatorState, storage);
      assert.equal(hydrated.themePreference, 'system');
    });

    it('should preserve session-only memory contract when theme preference is saved', () => {
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

      const stateWithMemory = {
        ...initialCalculatorState,
        memory: 12345,
      };

      const hydrated = getHydratedInitialState(stateWithMemory, storage);
      assert.equal(hydrated.themePreference, 'light');
      assert.equal(hydrated.memory, 12345);
    });
  });
});
