import { useReducer, useCallback, useEffect, useRef } from 'react';
import type {
  CalculatorState,
  CalculatorAction,
  OperatorSymbol,
  CalculatorMode,
  AngleUnit,
  ThemePreference,
  CalculationHistoryItem,
} from '../types/calculator';
import { calculatorReducer, initialCalculatorState } from '../store/calculatorStore';
import {
  getHydratedInitialState,
  savePersistedState,
  serializePersistedState,
} from '../store/persistence';

export interface UseCalculatorReturn {
  readonly state: CalculatorState;
  readonly dispatch: React.Dispatch<CalculatorAction>;
  readonly inputDigit: (digit: string) => void;
  readonly inputOperator: (operator: OperatorSymbol) => void;
  readonly inputDecimal: () => void;
  readonly inputParenthesis: (paren: '(' | ')') => void;
  readonly inputFunction: (fn: string) => void;
  readonly inputConstant: (constant: 'π' | 'e') => void;
  readonly inputPostfix: (postfix: '!' | '^2') => void;
  readonly clearAll: () => void;
  readonly clearEntry: () => void;
  readonly deleteBackspace: () => void;
  readonly calculate: () => void;
  readonly loadHistoryItem: (item: CalculationHistoryItem) => void;
  readonly clearHistory: () => void;
  readonly deleteHistoryItem: (id: string) => void;
  readonly setMode: (mode: CalculatorMode) => void;
  readonly setAngleUnit: (unit: AngleUnit) => void;
  readonly setThemePreference: (theme: ThemePreference) => void;
  readonly memoryClear: () => void;
  readonly memoryRecall: () => void;
  readonly memoryAdd: (val?: number) => void;
  readonly memorySubtract: (val?: number) => void;
}

/**
 * Custom React hook that encapsulates calculator state, actions, and engine integration.
 * Purely decouples UI components from the state machine and calculation engine.
 * Hydrates state synchronously on startup and keeps localStorage synchronized.
 */
export function useCalculator(): UseCalculatorReturn {
  const [state, dispatch] = useReducer(
    calculatorReducer,
    initialCalculatorState,
    (initial) => getHydratedInitialState(initial)
  );

  const lastSerializedRef = useRef<string>(
    serializePersistedState({
      history: state.history,
      mode: state.mode,
      angleUnit: state.angleUnit,
      themePreference: state.themePreference,
    })
  );

  useEffect(() => {
    const payload = {
      history: state.history,
      mode: state.mode,
      angleUnit: state.angleUnit,
      themePreference: state.themePreference,
    };
    const serialized = serializePersistedState(payload);
    if (serialized !== lastSerializedRef.current) {
      lastSerializedRef.current = serialized;
      savePersistedState(payload);
    }
  }, [state.history, state.mode, state.angleUnit, state.themePreference]);

  const inputDigit = useCallback((digit: string) => {
    dispatch({ type: 'INPUT_DIGIT', payload: digit });
  }, []);

  const inputOperator = useCallback((operator: OperatorSymbol) => {
    dispatch({ type: 'INPUT_OPERATOR', payload: operator });
  }, []);

  const inputDecimal = useCallback(() => {
    dispatch({ type: 'INPUT_DECIMAL' });
  }, []);

  const inputParenthesis = useCallback((paren: '(' | ')') => {
    dispatch({ type: 'INPUT_PARENTHESIS', payload: paren });
  }, []);

  const inputFunction = useCallback((fn: string) => {
    dispatch({ type: 'INPUT_FUNCTION', payload: fn });
  }, []);

  const inputConstant = useCallback((constant: 'π' | 'e') => {
    dispatch({ type: 'INPUT_CONSTANT', payload: constant });
  }, []);

  const inputPostfix = useCallback((postfix: '!' | '^2') => {
    dispatch({ type: 'INPUT_POSTFIX', payload: postfix });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const clearEntry = useCallback(() => {
    dispatch({ type: 'CLEAR_ENTRY' });
  }, []);

  const deleteBackspace = useCallback(() => {
    dispatch({ type: 'DELETE_BACKSPACE' });
  }, []);

  const calculateAction = useCallback(() => {
    dispatch({ type: 'CALCULATE' });
  }, []);

  const loadHistoryItem = useCallback((item: CalculationHistoryItem) => {
    dispatch({ type: 'LOAD_HISTORY_ITEM', payload: item });
  }, []);

  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
  }, []);

  const deleteHistoryItem = useCallback((id: string) => {
    dispatch({ type: 'DELETE_HISTORY_ITEM', payload: id });
  }, []);

  const setMode = useCallback((mode: CalculatorMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);

  const setAngleUnit = useCallback((unit: AngleUnit) => {
    dispatch({ type: 'SET_ANGLE_UNIT', payload: unit });
  }, []);

  const setThemePreference = useCallback((theme: ThemePreference) => {
    dispatch({ type: 'SET_THEME_PREFERENCE', payload: theme });
  }, []);

  const memoryClear = useCallback(() => {
    dispatch({ type: 'MEMORY_CLEAR' });
  }, []);

  const memoryRecall = useCallback(() => {
    dispatch({ type: 'MEMORY_RECALL' });
  }, []);

  const memoryAdd = useCallback((val?: number) => {
    if (val !== undefined) {
      dispatch({ type: 'MEMORY_ADD', payload: val });
    } else {
      dispatch({ type: 'MEMORY_ADD' });
    }
  }, []);

  const memorySubtract = useCallback((val?: number) => {
    if (val !== undefined) {
      dispatch({ type: 'MEMORY_SUBTRACT', payload: val });
    } else {
      dispatch({ type: 'MEMORY_SUBTRACT' });
    }
  }, []);

  return {
    state,
    dispatch,
    inputDigit,
    inputOperator,
    inputDecimal,
    inputParenthesis,
    inputFunction,
    inputConstant,
    inputPostfix,
    clearAll,
    clearEntry,
    deleteBackspace,
    calculate: calculateAction,
    loadHistoryItem,
    clearHistory,
    deleteHistoryItem,
    setMode,
    setAngleUnit,
    setThemePreference,
    memoryClear,
    memoryRecall,
    memoryAdd,
    memorySubtract,
  };
}
