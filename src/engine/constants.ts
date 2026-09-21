/**
 * Mathematical and engine constants for Calcx-Pro.
 */

export const ENGINE_CONSTANTS = {
  MAX_PRECISION: 15,
  MAX_DISPLAY_DIGITS: 16,
  EPSILON: 1e-10,
  DEFAULT_DISPLAY_VALUE: '0',
} as const;

export const MATH_CONSTANTS = {
  PI: Math.PI,
  E: Math.E,
  LN2: Math.LN2,
  LN10: Math.LN10,
  LOG2E: Math.LOG2E,
  LOG10E: Math.LOG10E,
  SQRT2: Math.SQRT2,
} as const;

export const CALCULATION_ERROR_MESSAGES = {
  SYNTAX_ERROR: 'Syntax Error',
  DIVIDE_BY_ZERO: 'Cannot divide by zero',
  INVALID_INPUT: 'Invalid Input',
  PRECISION_OVERFLOW: 'Overflow',
  UNKNOWN: 'Calculation Error',
} as const;

export const TOKEN_PATTERNS = {
  NUMBER: /^[0-9]+(\.[0-9]+)?$/,
  OPERATOR: /^(\+|-|×|÷|\*|\/|\^|%|√)$/,
  PARENTHESIS: /^(\(|\))$/,
} as const;
