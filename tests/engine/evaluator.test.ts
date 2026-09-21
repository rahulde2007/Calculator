import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateRPN } from '../../src/engine/evaluator';
import { parseExpressionToRPN } from '../../src/engine/parser';
import { normalizePrecision } from '../../src/engine/precision';

describe('Evaluator (RPN execution & precision)', () => {
  it('should evaluate simple additions and multiplications', () => {
    const parsed = parseExpressionToRPN('2 + 3 * 4');
    assert.equal(parsed.success, true);
    if (!parsed.success) return;
    const res = evaluateRPN(parsed.rpn);
    assert.equal(res.success, true);
    if (!res.success) return;
    assert.equal(res.value, 14);
  });

  it('should evaluate expressions with parentheses: (2 + 3) * 4', () => {
    const parsed = parseExpressionToRPN('(2 + 3) * 4');
    assert.equal(parsed.success, true);
    if (!parsed.success) return;
    const res = evaluateRPN(parsed.rpn);
    assert.equal(res.success, true);
    if (!res.success) return;
    assert.equal(res.value, 20);
  });

  it('should evaluate left-associative division and subtraction: 10 - 2 * 3', () => {
    const parsed = parseExpressionToRPN('10 - 2 * 3');
    assert.equal(parsed.success, true);
    if (!parsed.success) return;
    const res = evaluateRPN(parsed.rpn);
    assert.equal(res.success, true);
    if (!res.success) return;
    assert.equal(res.value, 4);
  });

  it('should handle unary minus and chained unary minus', () => {
    const parsed1 = parseExpressionToRPN('-5 * -2');
    assert.equal(parsed1.success, true);
    if (!parsed1.success) return;
    const res1 = evaluateRPN(parsed1.rpn);
    assert.equal(res1.success, true);
    if (!res1.success) return;
    assert.equal(res1.value, 10);

    const parsed2 = parseExpressionToRPN('2--3');
    assert.equal(parsed2.success, true);
    if (!parsed2.success) return;
    const res2 = evaluateRPN(parsed2.rpn);
    assert.equal(res2.success, true);
    if (!res2.success) return;
    assert.equal(res2.value, 5);

    const parsed3 = parseExpressionToRPN('-(2 + 3)');
    assert.equal(parsed3.success, true);
    if (!parsed3.success) return;
    const res3 = evaluateRPN(parsed3.rpn);
    assert.equal(res3.success, true);
    if (!res3.success) return;
    assert.equal(res3.value, -5);
  });

  it('should evaluate modulo operation: 10 % 3', () => {
    const parsed = parseExpressionToRPN('10 % 3');
    assert.equal(parsed.success, true);
    if (!parsed.success) return;
    const res = evaluateRPN(parsed.rpn);
    assert.equal(res.success, true);
    if (!res.success) return;
    assert.equal(res.value, 1);
  });

  it('should return typed DivisionByZero error on division by 0', () => {
    const parsed = parseExpressionToRPN('10 / 0');
    assert.equal(parsed.success, true);
    if (!parsed.success) return;
    const res = evaluateRPN(parsed.rpn);
    assert.equal(res.success, false);
    if (res.success) return;
    assert.equal(res.error.code, 'DivisionByZero');
    assert.match(res.error.message, /Cannot divide by zero/i);
  });

  it('should return typed DivisionByZero error on modulo by 0', () => {
    const parsed = parseExpressionToRPN('10 % 0');
    assert.equal(parsed.success, true);
    if (!parsed.success) return;
    const res = evaluateRPN(parsed.rpn);
    assert.equal(res.success, false);
    if (res.success) return;
    assert.equal(res.error.code, 'DivisionByZero');
    assert.match(res.error.message, /Cannot modulo by zero/i);
  });

  it('should correctly handle 0.1 + 0.2 without binary floating-point noise', () => {
    const parsed = parseExpressionToRPN('0.1 + 0.2');
    assert.equal(parsed.success, true);
    if (!parsed.success) return;
    const res = evaluateRPN(parsed.rpn);
    assert.equal(res.success, true);
    if (!res.success) return;
    assert.equal(res.value, 0.3);
  });

  it('should normalize negative zero to 0', () => {
    const normalized = normalizePrecision(-0);
    assert.equal(Object.is(normalized, 0), true);
    assert.equal(Object.is(normalized, -0), false);
  });

  it('should reject empty token queues', () => {
    const res = evaluateRPN([]);
    assert.equal(res.success, false);
    assert.equal(res.error?.code, 'InvalidExpression');
  });
});
