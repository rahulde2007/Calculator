import type { CalculatorState, CalculatorAction, CalculationHistoryItem, OperatorSymbol } from '../types/calculator';
import { ENGINE_CONSTANTS } from '../engine/constants';
import { calculate, normalizePrecision } from '../engine';
import { formatDisplayNumber } from '../utils/formatNumber';

/**
 * Initial calculator state definition.
 */
export const initialCalculatorState: CalculatorState = {
  expression: '',
  displayValue: ENGINE_CONSTANTS.DEFAULT_DISPLAY_VALUE,
  previousResult: null,
  memory: 0,
  history: [],
  isError: false,
  errorMessage: null,
  mode: 'standard',
  angleUnit: 'deg',
  themePreference: 'system',
  status: 'idle',
};

/**
 * Extracts the trailing numeric segment of an expression to check for decimals or length limits.
 */
function getLastNumericSegment(expression: string): string {
  const match = expression.match(/([0-9.]+)$/);
  return match ? match[1] ?? '' : '';
}

/**
 * Checks if expression ends with an operator (ignoring whitespace).
 */
function endsWithOperator(expression: string): boolean {
  return /[\+\-×÷\*\/\^%]\s*$/.test(expression);
}

/**
 * Safely extracts or calculates the current numeric value from the calculator state.
 * Used for M+ and M− operations.
 */
function getCurrentNumericValue(state: CalculatorState): number | null {
  if (state.status === 'error' || state.isError) {
    return null;
  }

  // 1. If currently displaying a calculated result
  if (state.status === 'result') {
    if (state.previousResult !== null) {
      const parsed = parseFloat(state.previousResult);
      if (Number.isFinite(parsed)) return parsed;
    }
    const cleanDisplay = state.displayValue.replace(/,/g, '');
    const parsed = parseFloat(cleanDisplay);
    return Number.isFinite(parsed) ? parsed : null;
  }

  // 2. If in idle state with empty expression, value is displayValue (typically 0)
  if (state.status === 'idle' && !state.expression.trim()) {
    const parsed = parseFloat(state.displayValue.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  // 3. If in entering state: evaluate current expression through calculate()
  const trimmed = state.expression.trim();
  if (!trimmed) {
    const parsed = parseFloat(state.displayValue.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }

  const calcResult = calculate(trimmed, { angleUnit: state.angleUnit });
  if (calcResult.success && Number.isFinite(calcResult.value)) {
    return calcResult.value;
  }

  return null;
}

/**
 * Pure state reducer for Calcx-Pro.
 * Coordinates input events, state transitions, and evaluation via calculate().
 */
export function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction
): CalculatorState {
  switch (action.type) {
    case 'INPUT_DIGIT': {
      const digit = action.payload;

      // 1. If currently showing a result, pressing a digit begins a fresh calculation
      if (state.status === 'result') {
        return {
          ...state,
          expression: digit,
          displayValue: digit,
          status: 'entering',
          previousResult: null,
          isError: false,
          errorMessage: null,
        };
      }

      // 2. If in error or idle, replace initial '0'
      if (state.status === 'error' || state.status === 'idle') {
        return {
          ...state,
          expression: digit,
          displayValue: digit,
          status: 'entering',
          isError: false,
          errorMessage: null,
        };
      }

      // 3. If in entering state: handle lone leading zeros e.g. '0', '5 + 0', '(0', '-0'
      const lastSegment = getLastNumericSegment(state.expression);
      if (lastSegment === '0') {
        if (digit === '0') {
          // Prevent duplicate leading zeros like '00', '(00', '-00'
          return state;
        }
        // Replace lone leading zero with non-zero digit: e.g. '0' -> '7', '5 + 0' -> '5 + 7', '(0' -> '(7', '-0' -> '-7'
        const updatedExpr = state.expression.slice(0, -1) + digit;
        return {
          ...state,
          expression: updatedExpr,
          displayValue: digit,
        };
      }

      // 4. If entered after closing parenthesis, postfix operator, or constant, insert implicit multiplication ' × <digit>'
      if (/[)πe!]$/.test(state.expression.trimEnd())) {
        const nextExpr = `${state.expression.trimEnd()} × ${digit}`;
        return {
          ...state,
          expression: nextExpr,
          displayValue: digit,
          status: 'entering',
        };
      }

      const nextExpression = state.expression + digit;
      const currentSegment = getLastNumericSegment(nextExpression);

      return {
        ...state,
        expression: nextExpression,
        displayValue: currentSegment || digit,
      };
    }

    case 'INPUT_DECIMAL': {
      // 1. If in result state, start new calculation with '0.'
      if (state.status === 'result') {
        return {
          ...state,
          expression: '0.',
          displayValue: '0.',
          status: 'entering',
          previousResult: null,
          isError: false,
          errorMessage: null,
        };
      }

      // 2. If in error or idle state, start with '0.'
      if (state.status === 'error' || state.status === 'idle') {
        return {
          ...state,
          expression: '0.',
          displayValue: '0.',
          status: 'entering',
          isError: false,
          errorMessage: null,
        };
      }

      // 3. If in entering state: check if current numeric segment already has a decimal
      const lastSegment = getLastNumericSegment(state.expression);
      if (lastSegment.includes('.')) {
        return state; // Prevent 2.5.7
      }

      // If expression ends in an operator or open paren, prepend '0.'
      if (endsWithOperator(state.expression) || state.expression.endsWith('(') || state.expression.endsWith(' ')) {
        const nextExpr = state.expression + '0.';
        return {
          ...state,
          expression: nextExpr,
          displayValue: '0.',
        };
      }

      // If expression ends in closing paren or constant, insert implicit multiplication ' × 0.'
      if (/[)πe!]$/.test(state.expression.trimEnd())) {
        const nextExpr = `${state.expression.trimEnd()} × 0.`;
        return {
          ...state,
          expression: nextExpr,
          displayValue: '0.',
          status: 'entering',
        };
      }

      const nextExpr = state.expression + '.';
      return {
        ...state,
        expression: nextExpr,
        displayValue: state.displayValue + '.',
      };
    }

    case 'INPUT_OPERATOR': {
      const op: OperatorSymbol = action.payload;

      // 1. If currently in result state, seamlessly continue calculation from previous result
      if (state.status === 'result') {
        const base = state.previousResult ?? state.displayValue.replace(/,/g, '');
        return {
          ...state,
          expression: `${base} ${op} `,
          status: 'entering',
          isError: false,
          errorMessage: null,
        };
      }

      // 2. If in error state, do not append operator
      if (state.status === 'error') {
        return state;
      }

      // 3. If in idle state: unary minus is allowed, otherwise use '0 <op> '
      if (state.status === 'idle' || state.expression.trim() === '') {
        if (op === '-') {
          return {
            ...state,
            expression: '-',
            displayValue: '-',
            status: 'entering',
          };
        }
        return {
          ...state,
          expression: `0 ${op} `,
          displayValue: '0',
          status: 'entering',
        };
      }

      // 4. If expression ends in an operator, replace it (unless negative number after * or /)
      if (endsWithOperator(state.expression)) {
        // If user enters '-' after '*' or '/', treat as unary minus
        if (op === '-' && /[\*\/×÷]\s*$/.test(state.expression)) {
          return {
            ...state,
            expression: `${state.expression.trimEnd()} -`,
            displayValue: '-',
          };
        }

        // Replace the trailing operator
        const replacedExpr = state.expression.replace(/[\+\-×÷\*\/\^%]\s*$/, `${op} `);
        return {
          ...state,
          expression: replacedExpr,
        };
      }

      // Standard append operator with clean spacing
      return {
        ...state,
        expression: `${state.expression} ${op} `,
        status: 'entering',
      };
    }

    case 'INPUT_PARENTHESIS': {
      const paren = action.payload;

      if (state.status === 'result' || state.status === 'idle' || state.status === 'error') {
        return {
          ...state,
          expression: paren,
          displayValue: paren,
          status: 'entering',
          isError: false,
          errorMessage: null,
        };
      }

      if (paren === ')') {
        const trimmed = state.expression.trimEnd();
        return {
          ...state,
          expression: `${trimmed})`,
          displayValue: paren,
          status: 'entering',
        };
      }

      // If user enters '(' after a number, ')', or constant, insert implicit multiplication ' × ('
      if (paren === '(' && /[0-9.)πe]$/.test(state.expression.trimEnd())) {
        return {
          ...state,
          expression: `${state.expression.trimEnd()} × (`,
          displayValue: '(',
          status: 'entering',
        };
      }

      const nextExpr = state.expression.endsWith(' ') ? `${state.expression}${paren}` : `${state.expression} ${paren}`;
      return {
        ...state,
        expression: nextExpr.trim(),
        displayValue: paren,
        status: 'entering',
      };
    }

    case 'INPUT_FUNCTION': {
      const fn = action.payload;
      const fnCall = `${fn}(`;

      // 1. If currently showing a result, error, or idle, start fresh with the function
      if (state.status === 'result' || state.status === 'error' || state.status === 'idle') {
        return {
          ...state,
          expression: fnCall,
          displayValue: fnCall,
          status: 'entering',
          previousResult: null,
          isError: false,
          errorMessage: null,
        };
      }

      // 2. If entered after a number, closing parenthesis, or constant, insert implicit multiplication ' × fn('
      if (/[0-9.)πe]$/.test(state.expression.trimEnd())) {
        return {
          ...state,
          expression: `${state.expression.trimEnd()} × ${fnCall}`,
          displayValue: fnCall,
          status: 'entering',
        };
      }

      // 3. Otherwise append with clean spacing if needed
      const trimmed = state.expression.trimEnd();
      const nextExpr = trimmed.endsWith(' ') || trimmed.endsWith('(')
        ? `${trimmed}${fnCall}`
        : `${trimmed} ${fnCall}`;

      return {
        ...state,
        expression: nextExpr.trim(),
        displayValue: fnCall,
        status: 'entering',
      };
    }

    case 'INPUT_CONSTANT': {
      const constant = action.payload;

      // 1. If in result, error, or idle state, start fresh with the constant
      if (state.status === 'result' || state.status === 'error' || state.status === 'idle') {
        return {
          ...state,
          expression: constant,
          displayValue: constant,
          status: 'entering',
          previousResult: null,
          isError: false,
          errorMessage: null,
        };
      }

      // 2. If entered after a number, closing parenthesis, or constant, insert implicit multiplication
      if (/[0-9.)πe]$/.test(state.expression.trimEnd())) {
        return {
          ...state,
          expression: `${state.expression.trimEnd()} × ${constant}`,
          displayValue: constant,
          status: 'entering',
        };
      }

      // 3. Otherwise append constant
      const trimmed = state.expression.trimEnd();
      const nextExpr = trimmed.endsWith(' ') || trimmed.endsWith('(')
        ? `${trimmed}${constant}`
        : `${trimmed} ${constant}`;

      return {
        ...state,
        expression: nextExpr.trim(),
        displayValue: constant,
        status: 'entering',
      };
    }

    case 'INPUT_POSTFIX': {
      const postfix = action.payload; // '!' or '^2'

      // 1. If currently showing a result, continue from previous result!
      if (state.status === 'result') {
        const base = state.previousResult ?? state.displayValue.replace(/,/g, '');
        const nextExpr = `${base}${postfix}`;
        return {
          ...state,
          expression: nextExpr,
          displayValue: nextExpr,
          status: 'entering',
          isError: false,
          errorMessage: null,
        };
      }

      // 2. If in error or idle state with no expression, do nothing
      if (state.status === 'error' || (state.status === 'idle' && !state.expression.trim())) {
        return state;
      }

      // 3. If expression ends in an operator or open paren, postfix is invalid
      const trimmed = state.expression.trimEnd();
      if (endsWithOperator(trimmed) || trimmed.endsWith('(')) {
        return state;
      }

      const nextExpr = `${trimmed}${postfix}`;
      return {
        ...state,
        expression: nextExpr,
        displayValue: `${state.displayValue}${postfix}`,
        status: 'entering',
      };
    }

    case 'CALCULATE': {
      if (state.status === 'error' || !state.expression.trim()) {
        return state;
      }

      const result = calculate(state.expression, { angleUnit: state.angleUnit });

      if (result.success) {
        const formatted = formatDisplayNumber(result.value);
        const historyItem: CalculationHistoryItem = {
          id: `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          expression: state.expression,
          result: formatted,
          timestamp: Date.now(),
        };

        return {
          ...state,
          displayValue: formatted,
          previousResult: result.value.toString(),
          history: [historyItem, ...state.history].slice(0, 50),
          status: 'result',
          isError: false,
          errorMessage: null,
        };
      }

      // On calculation error: show user-friendly error message, do not add to history
      return {
        ...state,
        displayValue: result.error.message,
        isError: true,
        errorMessage: result.error.message,
        status: 'error',
      };
    }

    case 'CLEAR_ALL': {
      return {
        ...initialCalculatorState,
        history: state.history,
        memory: state.memory,
        mode: state.mode,
        angleUnit: state.angleUnit,
        themePreference: state.themePreference,
      };
    }

    case 'CLEAR_ENTRY': {
      return {
        ...state,
        displayValue: ENGINE_CONSTANTS.DEFAULT_DISPLAY_VALUE,
        status: 'idle',
        isError: false,
        errorMessage: null,
      };
    }

    case 'DELETE_BACKSPACE': {
      // 1. If currently showing an error or result, backspace resets display to '0'
      if (state.status === 'error' || state.status === 'result') {
        return {
          ...state,
          expression: '',
          displayValue: ENGINE_CONSTANTS.DEFAULT_DISPLAY_VALUE,
          status: 'idle',
          isError: false,
          errorMessage: null,
        };
      }

      // 2. Check if expression ends in a known function token e.g. sin(, asin(, sqrt(
      const trimmed = state.expression.trimEnd();
      const fnMatch = trimmed.match(/(sin|cos|tan|asin|acos|atan|ln|log|exp|sqrt|cbrt)\($/);
      let updated: string;
      if (fnMatch && fnMatch[0]) {
        updated = trimmed.slice(0, -fnMatch[0].length).trimEnd();
      } else {
        updated = trimmed.slice(0, -1).trimEnd();
      }

      if (!updated) {
        return {
          ...state,
          expression: '',
          displayValue: ENGINE_CONSTANTS.DEFAULT_DISPLAY_VALUE,
          status: 'idle',
        };
      }

      const lastSeg = getLastNumericSegment(updated);
      return {
        ...state,
        expression: updated,
        displayValue: lastSeg || (updated.slice(-1) || ENGINE_CONSTANTS.DEFAULT_DISPLAY_VALUE),
      };
    }

    case 'LOAD_HISTORY_ITEM': {
      return {
        ...state,
        expression: action.payload.expression,
        displayValue: action.payload.result,
        previousResult: action.payload.result.replace(/,/g, ''),
        status: 'result',
        isError: false,
        errorMessage: null,
      };
    }

    case 'CLEAR_HISTORY': {
      return {
        ...state,
        history: [],
      };
    }

    case 'DELETE_HISTORY_ITEM': {
      return {
        ...state,
        history: state.history.filter((item) => item.id !== action.payload),
      };
    }

    case 'SET_MODE': {
      return {
        ...state,
        mode: action.payload,
      };
    }

    case 'SET_ANGLE_UNIT': {
      return {
        ...state,
        angleUnit: action.payload,
      };
    }

    case 'SET_THEME_PREFERENCE': {
      return {
        ...state,
        themePreference: action.payload,
      };
    }

    case 'MEMORY_CLEAR': {
      return {
        ...state,
        memory: 0,
      };
    }

    case 'MEMORY_ADD': {
      if (state.status === 'error' || state.isError) {
        return state;
      }

      const val = action.payload ?? getCurrentNumericValue(state);
      if (val === null || !Number.isFinite(val)) {
        return state;
      }

      const newMemory = normalizePrecision(state.memory + val);
      if (!Number.isFinite(newMemory)) {
        return state;
      }

      return {
        ...state,
        memory: newMemory,
      };
    }

    case 'MEMORY_SUBTRACT': {
      if (state.status === 'error' || state.isError) {
        return state;
      }

      const val = action.payload ?? getCurrentNumericValue(state);
      if (val === null || !Number.isFinite(val)) {
        return state;
      }

      const newMemory = normalizePrecision(state.memory - val);
      if (!Number.isFinite(newMemory)) {
        return state;
      }

      return {
        ...state,
        memory: newMemory,
      };
    }

    case 'MEMORY_RECALL': {
      const memVal = state.memory;
      const memStr = formatDisplayNumber(memVal).replace(/,/g, '');

      // 1. If in error state, recover from error cleanly
      if (state.status === 'error' || state.isError) {
        return {
          ...state,
          expression: memStr,
          displayValue: formatDisplayNumber(memVal),
          previousResult: memStr,
          status: 'result',
          isError: false,
          errorMessage: null,
        };
      }

      // 2. If in result state or idle state, load memory as result so user can continue calculation with an operator
      if (state.status === 'result' || state.status === 'idle') {
        return {
          ...state,
          expression: memStr,
          displayValue: formatDisplayNumber(memVal),
          previousResult: memStr,
          status: 'result',
          isError: false,
          errorMessage: null,
        };
      }

      // 3. If in entering state:
      const trimmed = state.expression.trimEnd();

      // If expression ends in an operator or open parenthesis, append memory value
      if (endsWithOperator(trimmed) || trimmed.endsWith('(') || trimmed.endsWith(' ')) {
        const nextExpr = trimmed.endsWith(' ') || trimmed.endsWith('(')
          ? `${trimmed}${memStr}`
          : `${trimmed} ${memStr}`;

        return {
          ...state,
          expression: nextExpr.trim(),
          displayValue: formatDisplayNumber(memVal),
          status: 'entering',
        };
      }

      // If user is currently typing a numeric segment, replace it with recalled memory value
      const lastSeg = getLastNumericSegment(trimmed);
      const prefix = trimmed.slice(0, -lastSeg.length);
      const nextExpr = `${prefix}${memStr}`;

      return {
        ...state,
        expression: nextExpr,
        displayValue: formatDisplayNumber(memVal),
        status: 'entering',
      };
    }

    default:
      return state;
  }
}
