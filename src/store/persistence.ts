import type {
  CalculatorMode,
  AngleUnit,
  ThemePreference,
  CalculationHistoryItem,
  CalculatorPreferences,
  PersistedCalculatorState,
  CalculatorState,
} from '../types/calculator';

/**
 * Storage key for Calcx-Pro persistence.
 */
export const STORAGE_KEY = 'calcx-pro-state';

/**
 * Current schema version for Calcx-Pro stored data.
 */
export const CURRENT_STORAGE_VERSION = 1;

/**
 * Maximum number of calculation history items persisted to prevent localStorage quota exhaustion.
 */
export const MAX_PERSISTED_HISTORY = 50;

/**
 * Storage abstraction allowing safe browser access and dependency injection for unit tests.
 */
export type SafeStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/**
 * Helper to safely retrieve the window.localStorage reference if available.
 */
function getDefaultStorage(): SafeStorage | null {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    return window.localStorage;
  }
  return null;
}

/**
 * Safely reads a value from storage, guarding against SecurityError or blocked cookies.
 */
export function safeStorageGet(key: string, storage?: SafeStorage | null): string | null {
  const target = storage !== undefined ? storage : getDefaultStorage();
  if (!target) return null;
  try {
    return target.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Safely writes a value to storage, guarding against QuotaExceededError or disabled storage.
 */
export function safeStorageSet(key: string, value: string, storage?: SafeStorage | null): boolean {
  const target = storage !== undefined ? storage : getDefaultStorage();
  if (!target) return false;
  try {
    target.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely removes a key from storage.
 */
export function safeStorageRemove(key: string, storage?: SafeStorage | null): boolean {
  const target = storage !== undefined ? storage : getDefaultStorage();
  if (!target) return false;
  try {
    target.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates and sanitizes a calculator mode value, falling back to 'standard'.
 */
export function validateMode(raw: unknown): CalculatorMode {
  if (raw === 'standard' || raw === 'scientific' || raw === 'programmer') {
    return raw;
  }
  return 'standard';
}

/**
 * Validates and sanitizes an angle unit value, falling back to 'deg'.
 */
export function validateAngleUnit(raw: unknown): AngleUnit {
  if (raw === 'deg' || raw === 'rad' || raw === 'grad') {
    return raw;
  }
  return 'deg';
}

/**
 * Validates and sanitizes a theme preference value, falling back to 'system'.
 */
export function validateThemePreference(raw: unknown): ThemePreference {
  if (raw === 'system' || raw === 'light' || raw === 'dark') {
    return raw;
  }
  return 'system';
}

/**
 * Validates and sanitizes calculation history entries:
 * - Ensures raw input is an array
 * - Discards malformed or empty items
 * - Enforces string IDs, expressions, and results
 * - Enforces valid positive numeric timestamps
 * - Clamps history length to MAX_PERSISTED_HISTORY
 */
export function validateAndSanitizeHistory(raw: unknown): CalculationHistoryItem[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const sanitized: CalculationHistoryItem[] = [];

  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (!item || typeof item !== 'object') continue;

    const obj = item as Record<string, unknown>;
    const expression = typeof obj.expression === 'string' ? obj.expression.trim() : '';
    const result = typeof obj.result === 'string' ? obj.result.trim() : '';

    if (!expression || !result) {
      continue;
    }

    const id =
      typeof obj.id === 'string' && obj.id.trim()
        ? obj.id.trim()
        : `hist-${Date.now()}-${i}`;

    const timestamp =
      typeof obj.timestamp === 'number' && Number.isFinite(obj.timestamp) && obj.timestamp > 0
        ? obj.timestamp
        : Date.now();

    sanitized.push({
      id,
      expression,
      result,
      timestamp,
    });

    if (sanitized.length >= MAX_PERSISTED_HISTORY) {
      break;
    }
  }

  return sanitized;
}

/**
 * Serializes state to a versioned JSON string.
 */
export function serializePersistedState(data: {
  history: readonly CalculationHistoryItem[];
  mode: CalculatorMode;
  angleUnit: AngleUnit;
  themePreference?: ThemePreference | undefined;
}): string {
  const themePreference = validateThemePreference(data.themePreference);
  const preferences: CalculatorPreferences = {
    mode: data.mode,
    angleUnit: data.angleUnit,
    themePreference,
  };

  const payload: PersistedCalculatorState = {
    version: CURRENT_STORAGE_VERSION,
    history: data.history.slice(0, MAX_PERSISTED_HISTORY),
    mode: data.mode,
    angleUnit: data.angleUnit,
    themePreference,
    preferences,
  };

  return JSON.stringify(payload);
}

/**
 * Deserializes and strictly validates a persisted JSON string.
 * Returns null on JSON syntax error, missing/invalid version, or unrecoverable structure.
 */
export function deserializePersistedState(jsonString: string): Partial<PersistedCalculatorState> | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const obj = parsed as Record<string, unknown>;

    // Schema version validation: must be a positive integer
    if (typeof obj.version !== 'number' || obj.version <= 0) {
      return null;
    }

    // Extract mode either directly or from nested preferences
    const rawMode =
      obj.mode ??
      (obj.preferences && typeof obj.preferences === 'object'
        ? (obj.preferences as Record<string, unknown>).mode
        : undefined);
    const mode = validateMode(rawMode);

    // Extract angle unit either directly or from nested preferences
    const rawAngle =
      obj.angleUnit ??
      (obj.preferences && typeof obj.preferences === 'object'
        ? (obj.preferences as Record<string, unknown>).angleUnit
        : undefined);
    const angleUnit = validateAngleUnit(rawAngle);

    // Extract theme preference either directly or from nested preferences
    const rawTheme =
      obj.themePreference ??
      (obj.preferences && typeof obj.preferences === 'object'
        ? (obj.preferences as Record<string, unknown>).themePreference
        : undefined);
    const themePreference = validateThemePreference(rawTheme);

    // Extract and sanitize history
    const history = validateAndSanitizeHistory(obj.history);

    return {
      version: obj.version,
      mode,
      angleUnit,
      themePreference,
      history,
      preferences: {
        mode,
        angleUnit,
        themePreference,
      },
    };
  } catch {
    return null;
  }
}

/**
 * Loads and deserializes persisted state from storage.
 */
export function loadPersistedState(storage?: SafeStorage | null): Partial<PersistedCalculatorState> | null {
  const raw = safeStorageGet(STORAGE_KEY, storage);
  if (!raw) return null;
  return deserializePersistedState(raw);
}

/**
 * Serializes and saves state to storage.
 * Optionally accepts pre-serialized JSON to avoid duplicate JSON.stringify runs.
 */
export function savePersistedState(
  data: {
    history: readonly CalculationHistoryItem[];
    mode: CalculatorMode;
    angleUnit: AngleUnit;
    themePreference?: ThemePreference | undefined;
  },
  storage?: SafeStorage | null,
  preSerialized?: string
): boolean {
  const serialized = preSerialized ?? serializePersistedState(data);
  return safeStorageSet(STORAGE_KEY, serialized, storage);
}

/**
 * Clears persisted state from storage.
 */
export function clearPersistedState(storage?: SafeStorage | null): boolean {
  return safeStorageRemove(STORAGE_KEY, storage);
}

/**
 * Hydrates the calculator initial state from persistent storage upon startup.
 *
 * EXPLICIT PRODUCT DECISION & BOUNDARIES:
 * 1. Memory (`state.memory`): Strictly session-only. NEVER restored from localStorage; starts at 0.
 * 2. Transient UI states (`expression`, `displayValue`, `previousResult`, `status`, `isError`):
 *    Always initialized to idle defaults without any transient residual text.
 * 3. Restores only validated `history`, `mode`, `angleUnit`, and `themePreference`.
 */
export function getHydratedInitialState(
  fallbackState: CalculatorState,
  storage?: SafeStorage | null
): CalculatorState {
  const persisted = loadPersistedState(storage);
  if (!persisted) {
    return fallbackState;
  }

  return {
    ...fallbackState,
    history: persisted.history ?? fallbackState.history,
    mode: persisted.mode ?? fallbackState.mode,
    angleUnit: persisted.angleUnit ?? fallbackState.angleUnit,
    themePreference: persisted.themePreference ?? fallbackState.themePreference,
    // Explicit session-only memory invariance
    memory: fallbackState.memory,
    expression: fallbackState.expression,
    displayValue: fallbackState.displayValue,
    previousResult: fallbackState.previousResult,
    status: fallbackState.status,
    isError: false,
    errorMessage: null,
  };
}
