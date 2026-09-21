/**
 * Core domain types for Calcx-Pro calculator engine, state, and UI.
 * Strictly typed with zero `any` usage.
 */

export type TokenType =
  | 'number'
  | 'operator'
  | 'function'
  | 'parenthesis'
  | 'constant';

export type OperatorSymbol = '+' | '-' | '×' | '÷' | '*' | '/' | '%' | '^' | '√';

export type OperatorAssociativity = 'left' | 'right';

export interface OperatorDefinition {
  readonly symbol: OperatorSymbol;
  readonly precedence: number;
  readonly associativity: OperatorAssociativity;
  readonly isUnary?: boolean;
  readonly execute: (a: number, b?: number) => number;
}

export interface Token {
  readonly type: TokenType;
  readonly value: string;
  readonly position: number;
}

export type CalculationErrorCode =
  | 'SyntaxError'
  | 'InvalidExpression'
  | 'MismatchedParentheses'
  | 'DivisionByZero'
  | 'ArithmeticOverflow'
  | 'StackError'
  | 'ScientificDomainError'
  | 'SYNTAX_ERROR'
  | 'DIVIDE_BY_ZERO'
  | 'INVALID_INPUT'
  | 'PRECISION_OVERFLOW'
  | 'UNKNOWN';

export interface CalculationError {
  readonly code: CalculationErrorCode;
  readonly message: string;
  readonly position?: number | undefined;
}

export type CalculationResult =
  | { readonly success: true; readonly value: number; readonly error?: never }
  | { readonly success: false; readonly value?: never; readonly error: CalculationError };

export type EvaluationResult = CalculationResult;

export type EngineTokenType =
  | 'number'
  | 'binary-operator'
  | 'unary-operator'
  | 'postfix-operator'
  | 'function'
  | 'left-paren'
  | 'right-paren';

export interface EngineToken {
  readonly type: EngineTokenType;
  readonly value: string;
  readonly position: number;
  readonly numericValue?: number | undefined;
}

export type CalculatorMode = 'standard' | 'scientific' | 'programmer';

export type AngleUnit = 'deg' | 'rad' | 'grad';

export interface CalculationOptions {
  readonly angleUnit?: AngleUnit | undefined;
}

export interface CalculationHistoryItem {
  readonly id: string;
  readonly expression: string;
  readonly result: string;
  readonly timestamp: number;
}

export type ThemePreference = 'system' | 'light' | 'dark';

export interface CalculatorPreferences {
  readonly mode: CalculatorMode;
  readonly angleUnit: AngleUnit;
  readonly themePreference: ThemePreference;
}

export interface PersistedCalculatorState {
  readonly version: number;
  readonly history: readonly CalculationHistoryItem[];
  readonly mode: CalculatorMode;
  readonly angleUnit: AngleUnit;
  readonly themePreference: ThemePreference;
  readonly preferences: CalculatorPreferences;
}

export type CalculationStatus = 'idle' | 'entering' | 'result' | 'error';

export interface CalculatorState {
  readonly expression: string;
  readonly displayValue: string;
  readonly previousResult: string | null;
  readonly memory: number;
  readonly history: readonly CalculationHistoryItem[];
  readonly isError: boolean;
  readonly errorMessage: string | null;
  readonly mode: CalculatorMode;
  readonly angleUnit: AngleUnit;
  readonly themePreference: ThemePreference;
  readonly status: CalculationStatus;
}

export type CalculatorAction =
  | { readonly type: 'INPUT_DIGIT'; readonly payload: string }
  | { readonly type: 'INPUT_OPERATOR'; readonly payload: OperatorSymbol }
  | { readonly type: 'INPUT_DECIMAL' }
  | { readonly type: 'INPUT_PARENTHESIS'; readonly payload: '(' | ')' }
  | { readonly type: 'INPUT_FUNCTION'; readonly payload: string }
  | { readonly type: 'INPUT_CONSTANT'; readonly payload: 'π' | 'e' }
  | { readonly type: 'INPUT_POSTFIX'; readonly payload: '!' | '^2' }
  | { readonly type: 'CLEAR_ALL' }
  | { readonly type: 'CLEAR_ENTRY' }
  | { readonly type: 'DELETE_BACKSPACE' }
  | { readonly type: 'CALCULATE' }
  | { readonly type: 'TOGGLE_SIGN' }
  | { readonly type: 'PERCENTAGE' }
  | { readonly type: 'SET_MODE'; readonly payload: CalculatorMode }
  | { readonly type: 'SET_ANGLE_UNIT'; readonly payload: AngleUnit }
  | { readonly type: 'SET_THEME_PREFERENCE'; readonly payload: ThemePreference }
  | { readonly type: 'MEMORY_ADD'; readonly payload?: number | undefined }
  | { readonly type: 'MEMORY_SUBTRACT'; readonly payload?: number | undefined }
  | { readonly type: 'MEMORY_RECALL' }
  | { readonly type: 'MEMORY_CLEAR' }
  | { readonly type: 'LOAD_HISTORY_ITEM'; readonly payload: CalculationHistoryItem }
  | { readonly type: 'CLEAR_HISTORY' }
  | { readonly type: 'DELETE_HISTORY_ITEM'; readonly payload: string };

export type ButtonVariant =
  | 'number'
  | 'operator'
  | 'function'
  | 'action'
  | 'equals'
  | 'special'
  | 'digit'
  | 'danger'
  | 'secondary';

export interface KeypadButtonConfig {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly variant: ButtonVariant;
  readonly actionType: CalculatorAction['type'];
  readonly shortcut?: string;
  readonly spanCols?: number;
}
