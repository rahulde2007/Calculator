import type { OperatorDefinition, OperatorSymbol } from '../types/calculator';

/**
 * Registry of mathematical operators with precedence, associativity, and stub handlers.
 * Real evaluation logic will be populated in Step 2.
 */
export const OPERATORS: ReadonlyMap<OperatorSymbol, OperatorDefinition> = new Map<OperatorSymbol, OperatorDefinition>([
  [
    '+',
    {
      symbol: '+',
      precedence: 1,
      associativity: 'left',
      execute: (a: number, b?: number): number => a + (b ?? 0),
    },
  ],
  [
    '-',
    {
      symbol: '-',
      precedence: 1,
      associativity: 'left',
      execute: (a: number, b?: number): number => a - (b ?? 0),
    },
  ],
  [
    '×',
    {
      symbol: '×',
      precedence: 2,
      associativity: 'left',
      execute: (a: number, b?: number): number => a * (b ?? 1),
    },
  ],
  [
    '*',
    {
      symbol: '*',
      precedence: 2,
      associativity: 'left',
      execute: (a: number, b?: number): number => a * (b ?? 1),
    },
  ],
  [
    '÷',
    {
      symbol: '÷',
      precedence: 2,
      associativity: 'left',
      execute: (a: number, b?: number): number => (b === 0 ? NaN : a / (b ?? 1)),
    },
  ],
  [
    '/',
    {
      symbol: '/',
      precedence: 2,
      associativity: 'left',
      execute: (a: number, b?: number): number => (b === 0 ? NaN : a / (b ?? 1)),
    },
  ],
  [
    '^',
    {
      symbol: '^',
      precedence: 3,
      associativity: 'right',
      execute: (a: number, b?: number): number => Math.pow(a, b ?? 1),
    },
  ],
  [
    '%',
    {
      symbol: '%',
      precedence: 2,
      associativity: 'left',
      execute: (a: number, b?: number): number => (b !== undefined ? a % b : a / 100),
    },
  ],
  [
    '√',
    {
      symbol: '√',
      precedence: 3,
      associativity: 'right',
      isUnary: true,
      execute: (a: number): number => Math.sqrt(a),
    },
  ],
]);

/**
 * Checks if a given string corresponds to a registered operator symbol.
 */
export function isOperator(symbol: string): symbol is OperatorSymbol {
  return OPERATORS.has(symbol as OperatorSymbol);
}

/**
 * Retrieves the operator definition for a given symbol.
 */
export function getOperator(symbol: OperatorSymbol): OperatorDefinition | undefined {
  return OPERATORS.get(symbol);
}
