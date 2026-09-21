import type { CalculationError } from '../types/calculator';
import { tokenize } from './tokenizer';

export interface ValidationResult {
  readonly valid: boolean;
  readonly error?: CalculationError | undefined;
}

/**
 * Validates mathematical expression strings for Calcx-Pro before evaluation.
 * Enforces valid character sets (0-9, operators, decimals, parens, functions, constants)
 * and verifies syntax completeness.
 */
export function validateExpression(expression: string): ValidationResult {
  const trimmed = expression.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: {
        code: 'InvalidExpression',
        message: 'Expression cannot be empty',
        position: 0,
      },
    };
  }

  // Tokenize upfront to validate all characters and number formats
  const tokenized = tokenize(expression);
  if (!tokenized.success) {
    return {
      valid: false,
      error: tokenized.error,
    };
  }

  return { valid: true };
}
