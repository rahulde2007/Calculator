import type { EngineToken, CalculationError } from '../types/calculator';

export type TokenizeResult =
  | { readonly success: true; readonly tokens: readonly EngineToken[] }
  | { readonly success: false; readonly error: CalculationError };

/**
 * Normalizes operator characters to standard mathematical forms.
 */
function normalizeOperatorChar(char: string): string {
  if (char === '×') return '*';
  if (char === '÷') return '/';
  if (char === '−') return '-'; // unicode minus
  return char;
}

/**
 * Checks if a character is a decimal digit (0-9).
 */
function isDigit(char: string): boolean {
  return char >= '0' && char <= '9';
}

/**
 * Checks if a character is an operator (+, -, *, /, %, ^).
 */
function isOperatorChar(char: string): boolean {
  return char === '+' || char === '-' || char === '*' || char === '/' || char === '%' || char === '^';
}

const SCIENTIFIC_FUNCTIONS = new Set([
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'ln',
  'log',
  'exp',
  'sqrt',
  'cbrt',
]);

/**
 * Pure, deterministic Tokenizer for mathematical expressions.
 * Accurately disambiguates unary minus from subtraction without string replacement hacks.
 *
 * @param expression Raw mathematical expression string
 * @returns TokenizeResult with structured tokens or a typed CalculationError
 */
export function tokenize(expression: string): TokenizeResult {
  const trimmed = expression.trim();
  if (!trimmed) {
    return {
      success: false,
      error: {
        code: 'InvalidExpression',
        message: 'Expression cannot be empty',
        position: 0,
      },
    };
  }

  const tokens: EngineToken[] = [];
  let index = 0;
  const length = expression.length;

  while (index < length) {
    const char = expression[index]!;

    // 1. Skip whitespace
    if (/\s/.test(char)) {
      index++;
      continue;
    }

    const startPos = index;
    const normalized = normalizeOperatorChar(char);

    // 2. Scan Numbers: [0-9]+(\.[0-9]*)? OR \.[0-9]+
    if (isDigit(char) || (char === '.' && index + 1 < length && isDigit(expression[index + 1]!))) {
      let numStr = '';
      let hasDot = false;

      while (index < length) {
        const c = expression[index]!;
        if (isDigit(c)) {
          numStr += c;
          index++;
        } else if (c === '.') {
          if (hasDot) {
            return {
              success: false,
              error: {
                code: 'SyntaxError',
                message: `Unexpected multiple decimal points in number at position ${index}`,
                position: index,
              },
            };
          }
          hasDot = true;
          numStr += c;
          index++;
        } else {
          break;
        }
      }

      const parsedNum = parseFloat(numStr);
      if (Number.isNaN(parsedNum)) {
        return {
          success: false,
          error: {
            code: 'SyntaxError',
            message: `Invalid numeric literal '${numStr}' at position ${startPos}`,
            position: startPos,
          },
        };
      }

      tokens.push({
        type: 'number',
        value: numStr,
        position: startPos,
        numericValue: parsedNum,
      });
      continue;
    }

    // 3. Parentheses
    if (char === '(') {
      tokens.push({
        type: 'left-paren',
        value: '(',
        position: startPos,
      });
      index++;
      continue;
    }

    if (char === ')') {
      tokens.push({
        type: 'right-paren',
        value: ')',
        position: startPos,
      });
      index++;
      continue;
    }

    // 4. Operators (+, -, *, /, %)
    if (isOperatorChar(normalized)) {
      const prevToken = tokens[tokens.length - 1];

      // Check if this is a unary operator:
      // A minus sign is unary if it is the first token, or immediately follows an operator or left paren.
      const isUnaryContext =
        !prevToken ||
        prevToken.type === 'binary-operator' ||
        prevToken.type === 'unary-operator' ||
        prevToken.type === 'left-paren';

      if (normalized === '-') {
        if (isUnaryContext) {
          tokens.push({
            type: 'unary-operator',
            value: 'u-',
            position: startPos,
          });
          index++;
          continue;
        } else {
          tokens.push({
            type: 'binary-operator',
            value: '-',
            position: startPos,
          });
          index++;
          continue;
        }
      }

      if (normalized === '+') {
        if (isUnaryContext) {
          // Unary plus (+5) is a no-op in mathematics, but we can safely ignore it
          index++;
          continue;
        } else {
          tokens.push({
            type: 'binary-operator',
            value: '+',
            position: startPos,
          });
          index++;
          continue;
        }
      }

      // If *, /, % appears in a unary context (e.g. "* 5" or "5 + * 2"), that is a syntax error
      if (isUnaryContext) {
        return {
          success: false,
          error: {
            code: 'SyntaxError',
            message: `Unexpected operator '${normalized}' at position ${startPos}`,
            position: startPos,
          },
        };
      }

      tokens.push({
        type: 'binary-operator',
        value: normalized,
        position: startPos,
      });
      index++;
      continue;
    }

    // 5. Postfix Factorial (!)
    if (char === '!') {
      const prevToken = tokens[tokens.length - 1];
      if (
        !prevToken ||
        (prevToken.type !== 'number' &&
          prevToken.type !== 'right-paren' &&
          prevToken.type !== 'postfix-operator')
      ) {
        return {
          success: false,
          error: {
            code: 'SyntaxError',
            message: `Unexpected postfix operator '!' at position ${startPos}`,
            position: startPos,
          },
        };
      }

      tokens.push({
        type: 'postfix-operator',
        value: '!',
        position: startPos,
      });
      index++;
      continue;
    }

    // 6. Square root symbol (√)
    if (char === '√') {
      tokens.push({
        type: 'function',
        value: 'sqrt',
        position: startPos,
      });
      index++;
      continue;
    }

    // 7. Alphabetic identifiers, mathematical constants (pi, e), and functions
    if (/[a-zA-Zπ]/.test(char)) {
      let word = '';
      while (index < length && /[a-zA-Zπ]/.test(expression[index]!)) {
        word += expression[index]!;
        index++;
      }
      const lower = word.toLowerCase();

      // Mathematical constants
      if (lower === 'pi' || word === 'π') {
        tokens.push({
          type: 'number',
          value: word,
          position: startPos,
          numericValue: Math.PI,
        });
        continue;
      }

      if (lower === 'e') {
        tokens.push({
          type: 'number',
          value: word,
          position: startPos,
          numericValue: Math.E,
        });
        continue;
      }

      // Scientific functions
      if (SCIENTIFIC_FUNCTIONS.has(lower)) {
        tokens.push({
          type: 'function',
          value: lower,
          position: startPos,
        });
        continue;
      }

      return {
        success: false,
        error: {
          code: 'SyntaxError',
          message: `Unknown function or identifier '${word}' at position ${startPos}`,
          position: startPos,
        },
      };
    }

    // 8. Stray decimal point
    if (char === '.') {
      return {
        success: false,
        error: {
          code: 'SyntaxError',
          message: `Unexpected isolated decimal point at position ${startPos}`,
          position: startPos,
        },
      };
    }

    // 6. Unknown / Invalid character
    return {
      success: false,
      error: {
        code: 'InvalidExpression',
        message: `Unexpected character '${char}' at position ${startPos}`,
        position: startPos,
      },
    };
  }

  return {
    success: true,
    tokens,
  };
}
