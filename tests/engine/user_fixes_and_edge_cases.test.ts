import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculate, validateExpression } from '../../src/engine';
import { formatDisplayNumber } from '../../src/utils/formatNumber';
import { calculatorReducer, initialCalculatorState } from '../../src/store/calculatorStore';
import type { CalculatorState } from '../../src/types/calculator';

describe('User Fixes & Edge Cases Verification Suite', () => {
  describe('1. Basic Operations & Precedence', () => {
    it('evaluates addition correctly', () => {
      const res = calculate('12 + 8');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 20);
    });

    it('evaluates subtraction correctly', () => {
      const res = calculate('50 - 18');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 32);
    });

    it('evaluates multiplication correctly', () => {
      const res = calculate('6 * 7');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 42);
    });

    it('evaluates division correctly', () => {
      const res = calculate('100 / 4');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 25);
    });

    it('enforces standard operator precedence: 2 + 3 * 4 = 14 (not 20)', () => {
      const res = calculate('2 + 3 * 4');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 14);
    });

    it('enforces precedence with mixed division and subtraction: 20 - 10 / 2 = 15', () => {
      const res = calculate('20 - 10 / 2');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 15);
    });
  });

  describe('2. Edge Cases Handling', () => {
    it('handles division by zero gracefully without crashing: 5 / 0', () => {
      const res = calculate('5 / 0');
      assert.equal(res.success, false);
      if (!res.success) {
        assert.equal(res.error.code, 'DivisionByZero');
        assert.equal(res.error.message, 'Cannot divide by zero');
      }
    });

    it('handles modulo by zero gracefully: 5 % 0', () => {
      const res = calculate('5 % 0');
      assert.equal(res.success, false);
      if (!res.success) {
        assert.equal(res.error.code, 'DivisionByZero');
        assert.equal(res.error.message, 'Cannot modulo by zero');
      }
    });

    it('handles empty input and whitespace safely', () => {
      const res1 = calculate('');
      assert.equal(res1.success, false);
      if (!res1.success) {
        assert.equal(res1.error.code, 'InvalidExpression');
        assert.equal(res1.error.message, 'Expression cannot be empty');
      }

      const res2 = calculate('   ');
      assert.equal(res2.success, false);
      if (!res2.success) {
        assert.equal(res2.error.code, 'InvalidExpression');
      }
    });

    it('catches multiple operators as errors: 2++3', () => {
      const res = calculate('2++3');
      assert.equal(res.success, false);
      if (!res.success) {
        assert.equal(res.error.code, 'SyntaxError');
      }
    });

    it('catches multiple operators as errors: 2*/3', () => {
      const res = calculate('2*/3');
      assert.equal(res.success, false);
      if (!res.success) {
        assert.equal(res.error.code, 'SyntaxError');
      }
    });

    it('catches invalid consecutive operators: 2*+3, 2/+3, ++5', () => {
      assert.equal(calculate('2*+3').success, false);
      assert.equal(calculate('2/+3').success, false);
      assert.equal(calculate('++5').success, false);
    });

    it('handles leading zeros properly: 007 -> 7, 007 + 3 -> 10', () => {
      const res1 = calculate('007');
      assert.equal(res1.success, true);
      if (res1.success) assert.equal(res1.value, 7);

      const res2 = calculate('007 + 3');
      assert.equal(res2.success, true);
      if (res2.success) assert.equal(res2.value, 10);
    });

    it('eliminates IEEE 754 floating point errors: 0.1 + 0.2 = 0.3', () => {
      const res = calculate('0.1 + 0.2');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 0.3);
    });

    it('eliminates floating point artifacts in subtraction: 0.3 - 0.2 = 0.1', () => {
      const res = calculate('0.3 - 0.2');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 0.1);
    });

    it('eliminates floating point artifacts in multiplication: 0.1 * 0.2 = 0.02', () => {
      const res = calculate('0.1 * 0.2');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 0.02);
    });

    it('handles negative numbers properly: -5 + 3 = -2', () => {
      const res = calculate('-5 + 3');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, -2);
    });

    it('handles negative numbers inside parentheses: (-2)*4 = -8', () => {
      const res = calculate('(-2)*4');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, -8);
    });

    it('handles binary minus followed by unary minus: 2 - -3 = 5, 2--3 = 5', () => {
      const res1 = calculate('2 - -3');
      assert.equal(res1.success, true);
      if (res1.success) assert.equal(res1.value, 5);

      const res2 = calculate('2--3');
      assert.equal(res2.success, true);
      if (res2.success) assert.equal(res2.value, 5);
    });

    it('handles product of two negative numbers: -2 * -4 = 8', () => {
      const res = calculate('-2 * -4');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 8);
    });

    it('handles negation of parenthesized expression: -(2+3) = -5', () => {
      const res = calculate('-(2+3)');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, -5);
    });
  });

  describe('3. Input Validation', () => {
    it('rejects invalid characters like $, @, #', () => {
      const res1 = calculate('2 + $');
      assert.equal(res1.success, false);
      if (!res1.success) assert.equal(res1.error.code, 'InvalidExpression');

      const res2 = calculate('5 @ 2');
      assert.equal(res2.success, false);
    });

    it('rejects numbers with multiple decimal points: 1.2.3', () => {
      const res = calculate('1.2.3');
      assert.equal(res.success, false);
      if (!res.success) assert.equal(res.error.code, 'SyntaxError');
    });

    it('rejects isolated decimal point: .', () => {
      const res = calculate('.');
      assert.equal(res.success, false);
      if (!res.success) assert.equal(res.error.code, 'SyntaxError');
    });

    it('validateExpression utility accurately validates syntax before evaluation', () => {
      assert.equal(validateExpression('2 + 3').valid, true);
      assert.equal(validateExpression('').valid, false);
      assert.equal(validateExpression('2++3').valid, false);
      assert.equal(validateExpression('2 + $').valid, false);
    });
  });

  describe('4. Expression Evaluation & Parentheses', () => {
    it('evaluates parentheses correctly: (2+3)*4 = 20', () => {
      const res = calculate('(2+3)*4');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 20);
    });

    it('evaluates nested parentheses: ((2 + 3) * (4 - 1)) / 5 = 3', () => {
      const res = calculate('((2 + 3) * (4 - 1)) / 5');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 3);
    });

    it('evaluates power with parentheses: (2+1)^3 = 27', () => {
      const res = calculate('(2+1)^3');
      assert.equal(res.success, true);
      if (res.success) assert.equal(res.value, 27);
    });
  });

  describe('5. UI/UX & Output Display Formatting', () => {
    it('formats numbers without trailing zeros: formatDisplayNumber(0.3) -> "0.3"', () => {
      assert.equal(formatDisplayNumber(0.3), '0.3');
      assert.equal(formatDisplayNumber(5), '5');
      assert.equal(formatDisplayNumber(5.0), '5');
    });

    it('formats thousands with comma separators: formatDisplayNumber(1000000) -> "1,000,000"', () => {
      assert.equal(formatDisplayNumber(1000), '1,000');
      assert.equal(formatDisplayNumber(1000000), '1,000,000');
      assert.equal(formatDisplayNumber(-1000), '-1,000');
    });

    it('normalizes negative zero to "0"', () => {
      assert.equal(formatDisplayNumber(-0), '0');
    });

    it('formats scientific notation without redundant trailing zeros', () => {
      assert.equal(formatDisplayNumber(1e-8), '1e-8');
      assert.equal(formatDisplayNumber(1.25e-8), '1.25e-8');
    });

    it('handles lone leading zeros in store reducer: 007 typing', () => {
      let state: CalculatorState = initialCalculatorState;
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '0' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '0' });
      assert.equal(state.expression, '0');
      assert.equal(state.displayValue, '0');

      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '7' });
      assert.equal(state.expression, '7');
      assert.equal(state.displayValue, '7');
    });

    it('handles lone leading zero in parenthesized expression: (007', () => {
      let state: CalculatorState = initialCalculatorState;
      state = calculatorReducer(state, { type: 'INPUT_PARENTHESIS', payload: '(' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '0' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '0' });
      assert.equal(state.expression, '(0');

      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '7' });
      assert.equal(state.expression, '(7');
    });

    it('handles lone leading zero after unary minus: -007', () => {
      let state: CalculatorState = initialCalculatorState;
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '-' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '0' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '0' });
      assert.equal(state.expression, '-0');

      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '7' });
      assert.equal(state.expression, '-7');
    });

    it('automatically inserts implicit multiplication when entering digit after closing paren', () => {
      let state: CalculatorState = initialCalculatorState;
      state = calculatorReducer(state, { type: 'INPUT_PARENTHESIS', payload: '(' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '2' });
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '+' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '3' });
      state = calculatorReducer(state, { type: 'INPUT_PARENTHESIS', payload: ')' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '4' });

      assert.equal(state.expression, '(2 + 3) × 4');

      state = calculatorReducer(state, { type: 'CALCULATE' });
      assert.equal(state.displayValue, '20');
      assert.equal(state.status, 'result');
    });
  });
});
