import type { AngleUnit, CalculationError } from '../types/calculator';
import { toRadians, fromRadians, cleanTrigValue, isTangentUndefined } from './trigonometry';
import { normalizePrecision, isSafeCalculationNumber } from './precision';

export type FunctionResult =
  | { readonly success: true; readonly value: number; readonly error?: never }
  | { readonly success: false; readonly value?: never; readonly error: CalculationError };

/**
 * Executes a unary scientific function with strict domain checking and angle conversion.
 */
export function executeScientificFunction(
  name: string,
  arg: number,
  angleUnit: AngleUnit = 'deg',
  position?: number
): FunctionResult {
  switch (name) {
    case 'sin': {
      const rad = toRadians(arg, angleUnit);
      const val = cleanTrigValue(Math.sin(rad));
      return { success: true, value: normalizePrecision(val) };
    }

    case 'cos': {
      const rad = toRadians(arg, angleUnit);
      const val = cleanTrigValue(Math.cos(rad));
      return { success: true, value: normalizePrecision(val) };
    }

    case 'tan': {
      if (isTangentUndefined(arg, angleUnit)) {
        return {
          success: false,
          error: {
            code: 'ScientificDomainError',
            message: `Tangent is undefined at ${arg}°`,
            position,
          },
        };
      }
      const rad = toRadians(arg, angleUnit);
      const val = cleanTrigValue(Math.tan(rad));
      if (!isSafeCalculationNumber(val)) {
        return {
          success: false,
          error: {
            code: 'ScientificDomainError',
            message: 'Tangent calculation resulted in undefined or non-finite value',
            position,
          },
        };
      }
      return { success: true, value: normalizePrecision(val) };
    }

    case 'asin': {
      if (arg < -1 || arg > 1) {
        return {
          success: false,
          error: {
            code: 'ScientificDomainError',
            message: `arcsin argument '${arg}' is outside domain [-1, 1]`,
            position,
          },
        };
      }
      const rad = Math.asin(arg);
      const val = fromRadians(rad, angleUnit);
      return { success: true, value: normalizePrecision(val) };
    }

    case 'acos': {
      if (arg < -1 || arg > 1) {
        return {
          success: false,
          error: {
            code: 'ScientificDomainError',
            message: `arccos argument '${arg}' is outside domain [-1, 1]`,
            position,
          },
        };
      }
      const rad = Math.acos(arg);
      const val = fromRadians(rad, angleUnit);
      return { success: true, value: normalizePrecision(val) };
    }

    case 'atan': {
      const rad = Math.atan(arg);
      const val = fromRadians(rad, angleUnit);
      return { success: true, value: normalizePrecision(val) };
    }

    case 'ln': {
      if (arg <= 0) {
        return {
          success: false,
          error: {
            code: 'ScientificDomainError',
            message: `Natural log argument '${arg}' must be greater than 0`,
            position,
          },
        };
      }
      const val = Math.log(arg);
      return { success: true, value: normalizePrecision(val) };
    }

    case 'log': {
      if (arg <= 0) {
        return {
          success: false,
          error: {
            code: 'ScientificDomainError',
            message: `Base-10 log argument '${arg}' must be greater than 0`,
            position,
          },
        };
      }
      const val = Math.log10(arg);
      return { success: true, value: normalizePrecision(val) };
    }

    case 'exp': {
      const val = Math.exp(arg);
      if (!isSafeCalculationNumber(val)) {
        return {
          success: false,
          error: {
            code: 'ArithmeticOverflow',
            message: 'Exponential calculation overflowed numeric limits',
            position,
          },
        };
      }
      return { success: true, value: normalizePrecision(val) };
    }

    case 'sqrt': {
      if (arg < 0) {
        return {
          success: false,
          error: {
            code: 'ScientificDomainError',
            message: `Square root argument '${arg}' must be non-negative`,
            position,
          },
        };
      }
      const val = Math.sqrt(arg);
      return { success: true, value: normalizePrecision(val) };
    }

    case 'cbrt': {
      const val = Math.cbrt(arg);
      return { success: true, value: normalizePrecision(val) };
    }

    default:
      return {
        success: false,
        error: {
          code: 'SyntaxError',
          message: `Unknown function '${name}'`,
          position,
        },
      };
  }
}

/**
 * Calculates integer factorial (n!).
 * Safe bounds: 0 <= n <= 170.
 */
export function calculateFactorial(n: number, position?: number): FunctionResult {
  if (n < 0 || !Number.isInteger(n)) {
    return {
      success: false,
      error: {
        code: 'ScientificDomainError',
        message: `Factorial requires a non-negative integer, got '${n}'`,
        position,
      },
    };
  }

  if (n > 170) {
    return {
      success: false,
      error: {
        code: 'ArithmeticOverflow',
        message: `Factorial '${n}!' exceeds double-precision limits`,
        position,
      },
    };
  }

  if (n === 0 || n === 1) {
    return { success: true, value: 1 };
  }

  let acc = 1;
  for (let i = 2; i <= n; i++) {
    acc *= i;
  }

  return { success: true, value: normalizePrecision(acc) };
}

/**
 * Calculates exponentiation (base ^ exponent).
 */
export function calculatePower(base: number, exponent: number, position?: number): FunctionResult {
  // Negative base with fractional exponent results in complex numbers
  if (base < 0 && !Number.isInteger(exponent)) {
    return {
      success: false,
      error: {
        code: 'ScientificDomainError',
        message: `Negative base '${base}' with fractional exponent '${exponent}' is outside real numbers`,
        position,
      },
    };
  }

  // 0 ^ 0 is mathematically indeterminate in strict math or 1 in some conventions. In JS Math.pow(0,0) is 1.
  const val = Math.pow(base, exponent);

  if (!isSafeCalculationNumber(val)) {
    return {
      success: false,
      error: {
        code: 'ArithmeticOverflow',
        message: 'Power calculation resulted in non-finite value',
        position,
      },
    };
  }

  return { success: true, value: normalizePrecision(val) };
}
