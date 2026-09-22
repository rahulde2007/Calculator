import type { EngineToken, CalculationResult, CalculationOptions, AngleUnit } from '../types/calculator';
import { parseExpressionToRPN } from './parser';
import { normalizePrecision, isSafeCalculationNumber } from './precision';
import { executeScientificFunction, calculateFactorial, calculatePower } from './functions';
import { validateExpression } from './validator';

/**
 * Stack-based Evaluator for Reverse Polish Notation (RPN) queues.
 * Enforces zero-division guards, controlled precision normalization,
 * and strict domain error handling without arbitrary string execution.
 *
 * @param rpn Tokens in postfix order
 * @param options Calculation options specifying angleUnit ('deg', 'rad', 'grad')
 * @returns CalculationResult with computed number or typed CalculationError
 */
export function evaluateRPN(
  rpn: readonly EngineToken[],
  options?: CalculationOptions | AngleUnit
): CalculationResult {
  if (rpn.length === 0) {
    return {
      success: false,
      error: {
        code: 'InvalidExpression',
        message: 'No tokens to evaluate',
        position: 0,
      },
    };
  }

  const angleUnit: AngleUnit =
    typeof options === 'string'
      ? options
      : options?.angleUnit ?? 'deg';

  const stack: number[] = [];

  for (const token of rpn) {
    if (token.type === 'number') {
      const val = token.numericValue ?? parseFloat(token.value);
      if (!isSafeCalculationNumber(val)) {
        return {
          success: false,
          error: {
            code: 'SyntaxError',
            message: `Invalid numeric value '${token.value}' at position ${token.position}`,
            position: token.position,
          },
        };
      }
      stack.push(val);
      continue;
    }

    if (token.type === 'unary-operator') {
      if (stack.length < 1) {
        return {
          success: false,
          error: {
            code: 'StackError',
            message: 'Insufficient operands for unary operation',
            position: token.position,
          },
        };
      }

      const operand = stack.pop()!;
      const result = -operand;

      if (!isSafeCalculationNumber(result)) {
        return {
          success: false,
          error: {
            code: 'ArithmeticOverflow',
            message: 'Numeric overflow during unary negation',
            position: token.position,
          },
        };
      }

      stack.push(normalizePrecision(result));
      continue;
    }

    if (token.type === 'postfix-operator') {
      if (stack.length < 1) {
        return {
          success: false,
          error: {
            code: 'StackError',
            message: `Insufficient operands for postfix operator '${token.value}' at position ${token.position}`,
            position: token.position,
          },
        };
      }

      const operand = stack.pop()!;
      if (token.value === '!') {
        const factRes = calculateFactorial(operand, token.position);
        if (!factRes.success) {
          return { success: false, error: factRes.error };
        }
        stack.push(factRes.value);
        continue;
      }

      return {
        success: false,
        error: {
          code: 'SyntaxError',
          message: `Unsupported postfix operator '${token.value}' at position ${token.position}`,
          position: token.position,
        },
      };
    }

    if (token.type === 'function') {
      if (stack.length < 1) {
        return {
          success: false,
          error: {
            code: 'StackError',
            message: `Insufficient arguments for function '${token.value}' at position ${token.position}`,
            position: token.position,
          },
        };
      }

      const operand = stack.pop()!;
      const fnRes = executeScientificFunction(token.value, operand, angleUnit, token.position);
      if (!fnRes.success) {
        return { success: false, error: fnRes.error };
      }
      stack.push(fnRes.value);
      continue;
    }

    if (token.type === 'binary-operator') {
      if (stack.length < 2) {
        return {
          success: false,
          error: {
            code: 'StackError',
            message: `Insufficient operands for operator '${token.value}' at position ${token.position}`,
            position: token.position,
          },
        };
      }

      const right = stack.pop()!;
      const left = stack.pop()!;
      let computed: number;

      switch (token.value) {
        case '+':
          computed = left + right;
          break;

        case '-':
          computed = left - right;
          break;

        case '*':
          computed = left * right;
          break;

        case '/':
          if (right === 0) {
            return {
              success: false,
              error: {
                code: 'DivisionByZero',
                message: 'Cannot divide by zero',
                position: token.position,
              },
            };
          }
          computed = left / right;
          break;

        case '%':
          if (right === 0) {
            return {
              success: false,
              error: {
                code: 'DivisionByZero',
                message: 'Cannot modulo by zero',
                position: token.position,
              },
            };
          }
          computed = left % right;
          break;

        case '^': {
          const powRes = calculatePower(left, right, token.position);
          if (!powRes.success) {
            return { success: false, error: powRes.error };
          }
          stack.push(powRes.value);
          continue;
        }

        default:
          return {
            success: false,
            error: {
              code: 'SyntaxError',
              message: `Unsupported binary operator '${token.value}' at position ${token.position}`,
              position: token.position,
            },
          };
      }

      if (!isSafeCalculationNumber(computed)) {
        return {
          success: false,
          error: {
            code: 'ArithmeticOverflow',
            message: 'Calculation resulted in infinite or non-numeric value',
            position: token.position,
          },
        };
      }

      stack.push(normalizePrecision(computed));
      continue;
    }

    return {
      success: false,
      error: {
        code: 'SyntaxError',
        message: `Unexpected token type '${token.type}' during RPN evaluation`,
        position: token.position,
      },
    };
  }

  if (stack.length !== 1) {
    return {
      success: false,
      error: {
        code: 'StackError',
        message: `Calculation stack finished with ${stack.length} values instead of 1`,
      },
    };
  }

  const finalValue = normalizePrecision(stack[0]!);
  if (!isSafeCalculationNumber(finalValue)) {
    return {
      success: false,
      error: {
        code: 'ArithmeticOverflow',
        message: 'Final result is non-finite or overflowed',
      },
    };
  }

  return {
    success: true,
    value: finalValue,
  };
}

/**
 * Public, framework-independent Calculation Engine API.
 * Evaluates mathematical string expressions end-to-end.
 *
 * Example:
 * ```ts
 * calculate("2 + 3 * 4") // { success: true, value: 14 }
 * calculate("sin(90)", { angleUnit: 'deg' }) // { success: true, value: 1 }
 * calculate("10 / 0") // { success: false, error: { code: 'DivisionByZero', message: '...' } }
 * ```
 *
 * @param expression The mathematical expression string to evaluate
 * @param options Calculation options specifying angleUnit ('deg' | 'rad' | 'grad')
 * @returns CalculationResult
 */
const CALCULATION_CACHE_MAX_SIZE = 128;
const calculationCache = new Map<string, CalculationResult>();

/**
 * Public, framework-independent Calculation Engine API.
 * Evaluates mathematical string expressions end-to-end with bounded LRU memoization.
 *
 * Example:
 * ```ts
 * calculate("2 + 3 * 4") // { success: true, value: 14 }
 * calculate("sin(90)", { angleUnit: 'deg' }) // { success: true, value: 1 }
 * calculate("10 / 0") // { success: false, error: { code: 'DivisionByZero', message: '...' } }
 * ```
 *
 * @param expression The mathematical expression string to evaluate
 * @param options Calculation options specifying angleUnit ('deg' | 'rad' | 'grad')
 * @returns CalculationResult
 */
export function calculate(
  expression: string,
  options?: CalculationOptions | AngleUnit
): CalculationResult {
  const angleUnit: AngleUnit =
    typeof options === 'string'
      ? options
      : options?.angleUnit ?? 'deg';

  const cacheKey = `${expression}__${angleUnit}`;
  const cached = calculationCache.get(cacheKey);
  if (cached) {
    // LRU refresh
    calculationCache.delete(cacheKey);
    calculationCache.set(cacheKey, cached);
    return cached;
  }

  const validation = validateExpression(expression);
  if (!validation.valid && validation.error) {
    const errorResult: CalculationResult = {
      success: false,
      error: validation.error,
    };
    if (calculationCache.size >= CALCULATION_CACHE_MAX_SIZE) {
      const oldestKey = calculationCache.keys().next().value;
      if (oldestKey !== undefined) calculationCache.delete(oldestKey);
    }
    calculationCache.set(cacheKey, errorResult);
    return errorResult;
  }

  const parsed = parseExpressionToRPN(expression);
  if (!parsed.success) {
    const errorResult: CalculationResult = {
      success: false,
      error: parsed.error,
    };
    if (calculationCache.size >= CALCULATION_CACHE_MAX_SIZE) {
      const oldestKey = calculationCache.keys().next().value;
      if (oldestKey !== undefined) calculationCache.delete(oldestKey);
    }
    calculationCache.set(cacheKey, errorResult);
    return errorResult;
  }

  const result = evaluateRPN(parsed.rpn, options);

  if (calculationCache.size >= CALCULATION_CACHE_MAX_SIZE) {
    const oldestKey = calculationCache.keys().next().value;
    if (oldestKey !== undefined) calculationCache.delete(oldestKey);
  }
  calculationCache.set(cacheKey, result);

  return result;
}

// Backward-compatible alias for Step 1
export const evaluateExpression = calculate;
