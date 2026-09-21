import type { EngineToken, CalculationError } from '../types/calculator';
import { tokenize, type TokenizeResult } from './tokenizer';

export type ParseResult =
  | { readonly success: true; readonly rpn: readonly EngineToken[] }
  | { readonly success: false; readonly error: CalculationError };

interface OperatorInfo {
  readonly precedence: number;
  readonly associativity: 'left' | 'right';
}

const OPERATOR_PRECEDENCE: Record<string, OperatorInfo> = {
  '+': { precedence: 2, associativity: 'left' },
  '-': { precedence: 2, associativity: 'left' },
  '*': { precedence: 3, associativity: 'left' },
  '/': { precedence: 3, associativity: 'left' },
  '%': { precedence: 3, associativity: 'left' },
  'u-': { precedence: 4, associativity: 'right' }, // Unary negation
  '^': { precedence: 4, associativity: 'right' }, // Exponentiation (right-associative)
};

/**
 * Validates token sequence rules prior to Shunting-Yard conversion.
 */
function validateTokenSequence(tokens: readonly EngineToken[]): CalculationError | null {
  if (tokens.length === 0) {
    return {
      code: 'InvalidExpression',
      message: 'Expression cannot be empty',
      position: 0,
    };
  }

  // 1. Check the last token
  const lastToken = tokens[tokens.length - 1]!;
  if (lastToken.type === 'binary-operator' || lastToken.type === 'unary-operator') {
    return {
      code: 'SyntaxError',
      message: `Unexpected end of expression after operator '${lastToken.value}' at position ${lastToken.position}`,
      position: lastToken.position,
    };
  }
  if (lastToken.type === 'function') {
    return {
      code: 'SyntaxError',
      message: `Expected '(' after function '${lastToken.value}' at position ${lastToken.position}`,
      position: lastToken.position,
    };
  }
  if (lastToken.type === 'left-paren') {
    return {
      code: 'MismatchedParentheses',
      message: `Unclosed opening parenthesis at position ${lastToken.position}`,
      position: lastToken.position,
    };
  }

  // 2. Check adjacent tokens
  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i]!;
    const next = tokens[i + 1];

    if (!next) break;

    // Check function must be followed by left-paren
    if (current.type === 'function' && next.type !== 'left-paren') {
      return {
        code: 'SyntaxError',
        message: `Function '${current.value}' must be followed by '(' at position ${next.position}`,
        position: next.position,
      };
    }

    // Check empty parentheses: ()
    if (current.type === 'left-paren' && next.type === 'right-paren') {
      return {
        code: 'SyntaxError',
        message: `Empty parentheses found at position ${current.position}`,
        position: current.position,
      };
    }

    // Two consecutive numbers or operands without an operator: e.g. "2 3", ") 2", "5! 2"
    const isOperandOrEnding =
      current.type === 'number' ||
      current.type === 'right-paren' ||
      current.type === 'postfix-operator';

    const isOperandOrStarting =
      next.type === 'number' ||
      next.type === 'left-paren' ||
      next.type === 'function';

    if (isOperandOrEnding && isOperandOrStarting) {
      return {
        code: 'SyntaxError',
        message: `Missing operator between tokens at position ${next.position}`,
        position: next.position,
      };
    }

    // Binary operator immediately followed by right paren: e.g. "(2 + )"
    if (current.type === 'binary-operator' && next.type === 'right-paren') {
      return {
        code: 'SyntaxError',
        message: `Unexpected closing parenthesis after operator '${current.value}' at position ${next.position}`,
        position: next.position,
      };
    }

    // Unary operator immediately followed by right paren: e.g. "(-)"
    if (current.type === 'unary-operator' && next.type === 'right-paren') {
      return {
        code: 'SyntaxError',
        message: `Unexpected closing parenthesis after unary operator at position ${next.position}`,
        position: next.position,
      };
    }

    // Binary operator followed by another binary operator: e.g. "2 + * 3"
    if (current.type === 'binary-operator' && next.type === 'binary-operator') {
      return {
        code: 'SyntaxError',
        message: `Consecutive binary operators '${current.value}' and '${next.value}' at position ${next.position}`,
        position: next.position,
      };
    }

    // Binary operator followed by postfix operator: e.g. "2 + !"
    if (current.type === 'binary-operator' && next.type === 'postfix-operator') {
      return {
        code: 'SyntaxError',
        message: `Unexpected postfix operator after operator '${current.value}' at position ${next.position}`,
        position: next.position,
      };
    }
  }

  return null;
}

/**
 * Parses an array of tokens into Reverse Polish Notation (RPN) using Dijkstra's Shunting-Yard algorithm.
 *
 * Precedence:
 * 1. Postfix operator (!) [Precedence 5]
 * 2. Unary minus (u-), Power (^) [Precedence 4, right-associative]
 * 3. Multiplicative (*, /, %) [Precedence 3, left-associative]
 * 4. Additive (+, -) [Precedence 2, left-associative]
 *
 * @param tokens Tokens from tokenizer
 * @returns ParseResult with RPN token queue or CalculationError
 */
export function parseTokensToRPN(tokens: readonly EngineToken[]): ParseResult {
  const sequenceError = validateTokenSequence(tokens);
  if (sequenceError) {
    return { success: false, error: sequenceError };
  }

  const outputQueue: EngineToken[] = [];
  const operatorStack: EngineToken[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case 'number':
      case 'postfix-operator':
        outputQueue.push(token);
        break;

      case 'function':
        operatorStack.push(token);
        break;

      case 'unary-operator':
      case 'binary-operator': {
        const op1Info = OPERATOR_PRECEDENCE[token.value];
        if (!op1Info) {
          return {
            success: false,
            error: {
              code: 'SyntaxError',
              message: `Unknown operator '${token.value}' at position ${token.position}`,
              position: token.position,
            },
          };
        }

        while (operatorStack.length > 0) {
          const topOp = operatorStack[operatorStack.length - 1]!;
          if (topOp.type === 'left-paren' || topOp.type === 'function') {
            break;
          }

          const topOpInfo = OPERATOR_PRECEDENCE[topOp.value];
          if (!topOpInfo) break;

          const shouldPop =
            (op1Info.associativity === 'left' && op1Info.precedence <= topOpInfo.precedence) ||
            (op1Info.associativity === 'right' && op1Info.precedence < topOpInfo.precedence);

          if (shouldPop) {
            outputQueue.push(operatorStack.pop()!);
          } else {
            break;
          }
        }

        operatorStack.push(token);
        break;
      }

      case 'left-paren':
        operatorStack.push(token);
        break;

      case 'right-paren': {
        let foundLeftParen = false;
        while (operatorStack.length > 0) {
          const top = operatorStack.pop()!;
          if (top.type === 'left-paren') {
            foundLeftParen = true;
            break;
          }
          outputQueue.push(top);
        }

        if (!foundLeftParen) {
          return {
            success: false,
            error: {
              code: 'MismatchedParentheses',
              message: `Mismatched closing parenthesis ')' at position ${token.position}`,
              position: token.position,
            },
          };
        }

        // If a function was stacked before this parentheses group, pop it to outputQueue
        if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1]!.type === 'function') {
          outputQueue.push(operatorStack.pop()!);
        }
        break;
      }
    }
  }

  // Drain remaining operators from stack
  while (operatorStack.length > 0) {
    const op = operatorStack.pop()!;
    if (op.type === 'left-paren' || op.type === 'function') {
      return {
        success: false,
        error: {
          code: 'MismatchedParentheses',
          message: `Unclosed opening parenthesis '(' at position ${op.position}`,
          position: op.position,
        },
      };
    }
    outputQueue.push(op);
  }

  return {
    success: true,
    rpn: outputQueue,
  };
}

/**
 * High-level parser that tokenizes and converts an expression string directly to RPN.
 */
export function parseExpressionToRPN(expression: string): ParseResult {
  const tokenized: TokenizeResult = tokenize(expression);
  if (!tokenized.success) {
    return { success: false, error: tokenized.error };
  }
  return parseTokensToRPN(tokenized.tokens);
}

// Backward-compatible exports for Step 1 stubs
export { tokenize };
