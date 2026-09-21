import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculate } from '../../src/engine/evaluator';

describe('Public API: calculate()', () => {
  describe('Basic Arithmetic', () => {
    it('evaluates single integer: "42"', () => {
      const res = calculate('42');
      assert.deepEqual(res, { success: true, value: 42 });
    });

    it('evaluates single negative number: "-42"', () => {
      const res = calculate('-42');
      assert.deepEqual(res, { success: true, value: -42 });
    });

    it('evaluates leading decimal: ".5"', () => {
      const res = calculate('.5');
      assert.deepEqual(res, { success: true, value: 0.5 });
    });

    it('evaluates trailing decimal: "5."', () => {
      const res = calculate('5.');
      assert.deepEqual(res, { success: true, value: 5 });
    });

    it('evaluates addition: "2 + 3"', () => {
      assert.deepEqual(calculate('2 + 3'), { success: true, value: 5 });
    });

    it('evaluates subtraction: "10 - 4"', () => {
      assert.deepEqual(calculate('10 - 4'), { success: true, value: 6 });
    });

    it('evaluates multiplication: "6 * 7"', () => {
      assert.deepEqual(calculate('6 * 7'), { success: true, value: 42 });
    });

    it('evaluates division: "20 / 4"', () => {
      assert.deepEqual(calculate('20 / 4'), { success: true, value: 5 });
    });

    it('evaluates modulo: "17 % 5"', () => {
      assert.deepEqual(calculate('17 % 5'), { success: true, value: 2 });
    });
  });

  describe('Precedence and Parentheses', () => {
    it('evaluates precedence: "2 + 3 * 4" = 14', () => {
      assert.deepEqual(calculate('2 + 3 * 4'), { success: true, value: 14 });
    });

    it('evaluates parentheses: "(2 + 3) * 4" = 20', () => {
      assert.deepEqual(calculate('(2 + 3) * 4'), { success: true, value: 20 });
    });

    it('evaluates mixed subtraction and multiplication: "10 - 2 * 3" = 4', () => {
      assert.deepEqual(calculate('10 - 2 * 3'), { success: true, value: 4 });
    });

    it('evaluates left-to-right division: "100 / 10 / 2" = 5', () => {
      assert.deepEqual(calculate('100 / 10 / 2'), { success: true, value: 5 });
    });

    it('evaluates nested parentheses: "((2 + 3) * 4) / 2" = 10', () => {
      assert.deepEqual(calculate('((2 + 3) * 4) / 2'), { success: true, value: 10 });
    });

    it('evaluates complex chain: "10 + 20 * 3 - 40 / 4" = 60', () => {
      assert.deepEqual(calculate('10 + 20 * 3 - 40 / 4'), { success: true, value: 60 });
    });
  });

  describe('Unary Operators', () => {
    it('evaluates "-5 * -2" = 10', () => {
      assert.deepEqual(calculate('-5 * -2'), { success: true, value: 10 });
    });

    it('evaluates "2--3" = 5', () => {
      assert.deepEqual(calculate('2--3'), { success: true, value: 5 });
    });

    it('evaluates "-(2+3)" = -5', () => {
      assert.deepEqual(calculate('-(2+3)'), { success: true, value: -5 });
    });

    it('evaluates double unary minus: "--5" = 5', () => {
      assert.deepEqual(calculate('--5'), { success: true, value: 5 });
    });

    it('evaluates triple unary minus: "---5" = -5', () => {
      assert.deepEqual(calculate('---5'), { success: true, value: -5 });
    });

    it('evaluates unary minus inside parentheses: "(-3) * 4" = -12', () => {
      assert.deepEqual(calculate('(-3) * 4'), { success: true, value: -12 });
    });
  });

  describe('Floating-point Precision Normalization', () => {
    it('evaluates "0.1 + 0.2" cleanly as 0.3', () => {
      assert.deepEqual(calculate('0.1 + 0.2'), { success: true, value: 0.3 });
    });

    it('evaluates "0.7 + 0.1" cleanly as 0.8', () => {
      assert.deepEqual(calculate('0.7 + 0.1'), { success: true, value: 0.8 });
    });

    it('evaluates "1.4 - 0.4" cleanly as 1', () => {
      assert.deepEqual(calculate('1.4 - 0.4'), { success: true, value: 1 });
    });

    it('evaluates "12.5 * 4" = 50', () => {
      assert.deepEqual(calculate('12.5 * 4'), { success: true, value: 50 });
    });

    it('evaluates ".5 + 1" = 1.5', () => {
      assert.deepEqual(calculate('.5 + 1'), { success: true, value: 1.5 });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('rejects empty string: ""', () => {
      const res = calculate('');
      assert.equal(res.success, false);
      assert.equal(res.error?.code, 'InvalidExpression');
    });

    it('rejects whitespace string: "   "', () => {
      const res = calculate('   ');
      assert.equal(res.success, false);
      assert.equal(res.error?.code, 'InvalidExpression');
    });

    it('rejects division by zero: "10 / 0"', () => {
      const res = calculate('10 / 0');
      assert.equal(res.success, false);
      assert.equal(res.error?.code, 'DivisionByZero');
    });

    it('rejects modulo by zero: "10 % 0"', () => {
      const res = calculate('10 % 0');
      assert.equal(res.success, false);
      assert.equal(res.error?.code, 'DivisionByZero');
    });

    it('rejects trailing operator: "2 +"', () => {
      const res = calculate('2 +');
      assert.equal(res.success, false);
      assert.equal(res.error?.code, 'SyntaxError');
    });

    it('rejects unclosed opening parenthesis: "(2 + 3"', () => {
      const res = calculate('(2 + 3');
      assert.equal(res.success, false);
      assert.equal(res.error?.code, 'MismatchedParentheses');
    });

    it('rejects unexpected closing parenthesis: "2 + 3)"', () => {
      const res = calculate('2 + 3)');
      assert.equal(res.success, false);
      assert.equal(res.error?.code, 'MismatchedParentheses');
    });

    it('rejects consecutive binary operators: "2 * * 3"', () => {
      const res = calculate('2 * * 3');
      assert.equal(res.success, false);
      assert.equal(res.error?.code, 'SyntaxError');
    });

    it('rejects empty parentheses: "()"', () => {
      const res = calculate('()');
      assert.equal(res.success, false);
      assert.equal(res.error?.code, 'SyntaxError');
    });

    it('rejects isolated decimal point: "."', () => {
      const res = calculate('.');
      assert.equal(res.success, false);
      assert.equal(res.error?.code, 'SyntaxError');
    });
  });
});
