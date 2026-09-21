import { isOperator } from '../engine/operators';

/**
 * Input validation utilities for expression safety and calculator keypad actions.
 */

/**
 * Checks whether adding a decimal point is permitted in current input chunk.
 */
export function canAppendDecimal(currentValue: string): boolean {
  if (!currentValue) return true;
  const segments = currentValue.split(/[\+\-×÷\*\/\^%]/);
  const lastSegment = segments[segments.length - 1];
  return lastSegment !== undefined && !lastSegment.includes('.');
}

/**
 * Checks whether an operator can be appended to the current expression.
 */
export function canAppendOperator(currentExpression: string, nextOperator: string): boolean {
  if (!isOperator(nextOperator)) return false;
  if (!currentExpression.trim()) {
    // Unary minus is allowed at the start
    return nextOperator === '-';
  }

  const lastChar = currentExpression.trim().slice(-1);
  // Prevent duplicate operators (except unary minus after certain operators)
  if (isOperator(lastChar)) {
    return nextOperator === '-' && lastChar !== '-';
  }

  return true;
}

/**
 * Validates if the character is an acceptable calculator input.
 */
export function isValidInputChar(char: string): boolean {
  return /^[0-9+\-×÷*/%^().]$/.test(char);
}
