import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseExpressionToRPN } from '../../src/engine/parser';

describe('Parser (Shunting-Yard to RPN)', () => {
  it('should convert standard addition and multiplication with proper precedence', () => {
    // 2 + 3 * 4 -> RPN: 2 3 4 * +
    const res = parseExpressionToRPN('2 + 3 * 4');
    assert.equal(res.success, true);
    if (!res.success) return;
    const values = res.rpn.map((t) => t.value);
    assert.deepEqual(values, ['2', '3', '4', '*', '+']);
  });

  it('should respect parentheses overriding precedence', () => {
    // (2 + 3) * 4 -> RPN: 2 3 + 4 *
    const res = parseExpressionToRPN('(2 + 3) * 4');
    assert.equal(res.success, true);
    if (!res.success) return;
    const values = res.rpn.map((t) => t.value);
    assert.deepEqual(values, ['2', '3', '+', '4', '*']);
  });

  it('should handle left-associative subtraction and division', () => {
    // 10 - 4 - 2 -> RPN: 10 4 - 2 -
    const res = parseExpressionToRPN('10 - 4 - 2');
    assert.equal(res.success, true);
    if (!res.success) return;
    const values = res.rpn.map((t) => t.value);
    assert.deepEqual(values, ['10', '4', '-', '2', '-']);
  });

  it('should place unary minus with higher precedence than multiplication', () => {
    // -5 * 2 -> RPN: 5 u- 2 *
    const res = parseExpressionToRPN('-5 * 2');
    assert.equal(res.success, true);
    if (!res.success) return;
    const values = res.rpn.map((t) => t.value);
    assert.deepEqual(values, ['5', 'u-', '2', '*']);
  });

  it('should handle unary minus applied to parentheses: -(2 + 3)', () => {
    // -(2 + 3) -> RPN: 2 3 + u-
    const res = parseExpressionToRPN('-(2 + 3)');
    assert.equal(res.success, true);
    if (!res.success) return;
    const values = res.rpn.map((t) => t.value);
    assert.deepEqual(values, ['2', '3', '+', 'u-']);
  });

  it('should handle nested parentheses: ((2 + 3) * (4 - 1))', () => {
    // ((2 + 3) * (4 - 1)) -> RPN: 2 3 + 4 1 - *
    const res = parseExpressionToRPN('((2 + 3) * (4 - 1))');
    assert.equal(res.success, true);
    if (!res.success) return;
    const values = res.rpn.map((t) => t.value);
    assert.deepEqual(values, ['2', '3', '+', '4', '1', '-', '*']);
  });

  it('should detect unclosed opening parenthesis', () => {
    const res = parseExpressionToRPN('(2 + 3');
    assert.equal(res.success, false);
    assert.equal(res.error?.code, 'MismatchedParentheses');
  });

  it('should detect unexpected closing parenthesis', () => {
    const res = parseExpressionToRPN('2 + 3)');
    assert.equal(res.success, false);
    assert.equal(res.error?.code, 'MismatchedParentheses');
  });

  it('should detect empty parentheses: ()', () => {
    const res = parseExpressionToRPN('2 + ()');
    assert.equal(res.success, false);
    assert.equal(res.error?.code, 'SyntaxError');
  });

  it('should detect consecutive binary operators: 2 + * 3', () => {
    const res = parseExpressionToRPN('2 + * 3');
    assert.equal(res.success, false);
    assert.equal(res.error?.code, 'SyntaxError');
  });

  it('should detect trailing operator: 2 +', () => {
    const res = parseExpressionToRPN('2 +');
    assert.equal(res.success, false);
    assert.equal(res.error?.code, 'SyntaxError');
  });

  it('should detect missing operator between operands: 2 3', () => {
    const res = parseExpressionToRPN('2 3');
    assert.equal(res.success, false);
    assert.equal(res.error?.code, 'SyntaxError');
  });

  it('should detect operator preceding closing parenthesis: (2 + )', () => {
    const res = parseExpressionToRPN('(2 + )');
    assert.equal(res.success, false);
    assert.equal(res.error?.code, 'SyntaxError');
  });
});
