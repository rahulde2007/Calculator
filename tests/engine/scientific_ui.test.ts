import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculatorReducer, initialCalculatorState } from '../../src/store/calculatorStore';
import type { CalculatorState } from '../../src/types/calculator';

describe('Scientific Mode UI & State Integration', () => {
  describe('Mode Switching (Standard <-> Scientific)', () => {
    it('should start in standard mode by default', () => {
      assert.equal(initialCalculatorState.mode, 'standard');
    });

    it('should switch from standard to scientific mode without clearing state', () => {
      const s1 = calculatorReducer(initialCalculatorState, { type: 'INPUT_DIGIT', payload: '4' });
      const s2 = calculatorReducer(s1, { type: 'INPUT_DIGIT', payload: '2' });
      assert.equal(s2.expression, '42');

      const s3 = calculatorReducer(s2, { type: 'SET_MODE', payload: 'scientific' });
      assert.equal(s3.mode, 'scientific');
      assert.equal(s3.expression, '42');
      assert.equal(s3.displayValue, '42');
    });

    it('should switch from scientific to standard mode preserving expression and result', () => {
      let state: CalculatorState = { ...initialCalculatorState, mode: 'scientific' };
      state = calculatorReducer(state, { type: 'INPUT_FUNCTION', payload: 'sin' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '3' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '0' });
      state = calculatorReducer(state, { type: 'INPUT_PARENTHESIS', payload: ')' });
      assert.equal(state.expression, 'sin(30)');

      state = calculatorReducer(state, { type: 'CALCULATE' });
      assert.equal(state.status, 'result');
      assert.equal(state.displayValue, '0.5');

      const switched = calculatorReducer(state, { type: 'SET_MODE', payload: 'standard' });
      assert.equal(switched.mode, 'standard');
      assert.equal(switched.displayValue, '0.5');
      assert.equal(switched.status, 'result');
    });
  });

  describe('Scientific Function Input (INPUT_FUNCTION)', () => {
    it('should insert sin( on fresh state', () => {
      const state = calculatorReducer(initialCalculatorState, { type: 'INPUT_FUNCTION', payload: 'sin' });
      assert.equal(state.expression, 'sin(');
      assert.equal(state.displayValue, 'sin(');
      assert.equal(state.status, 'entering');
    });

    it('should insert sqrt( on fresh state', () => {
      const state = calculatorReducer(initialCalculatorState, { type: 'INPUT_FUNCTION', payload: 'sqrt' });
      assert.equal(state.expression, 'sqrt(');
      assert.equal(state.displayValue, 'sqrt(');
    });

    it('should insert ln( and log(', () => {
      const sLn = calculatorReducer(initialCalculatorState, { type: 'INPUT_FUNCTION', payload: 'ln' });
      assert.equal(sLn.expression, 'ln(');

      const sLog = calculatorReducer(initialCalculatorState, { type: 'INPUT_FUNCTION', payload: 'log' });
      assert.equal(sLog.expression, 'log(');
    });

    it('should insert inverse trigonometric functions (asin, acos, atan)', () => {
      const sAsin = calculatorReducer(initialCalculatorState, { type: 'INPUT_FUNCTION', payload: 'asin' });
      assert.equal(sAsin.expression, 'asin(');

      const sAcos = calculatorReducer(initialCalculatorState, { type: 'INPUT_FUNCTION', payload: 'acos' });
      assert.equal(sAcos.expression, 'acos(');

      const sAtan = calculatorReducer(initialCalculatorState, { type: 'INPUT_FUNCTION', payload: 'atan' });
      assert.equal(sAtan.expression, 'atan(');
    });

    it('should insert implicit multiplication when function follows a number or closing paren', () => {
      let state = calculatorReducer(initialCalculatorState, { type: 'INPUT_DIGIT', payload: '2' });
      state = calculatorReducer(state, { type: 'INPUT_FUNCTION', payload: 'sin' });
      assert.equal(state.expression, '2 × sin(');

      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '3' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '0' });
      state = calculatorReducer(state, { type: 'INPUT_PARENTHESIS', payload: ')' });
      assert.equal(state.expression, '2 × sin(30)');

      state = calculatorReducer(state, { type: 'INPUT_FUNCTION', payload: 'cos' });
      assert.equal(state.expression, '2 × sin(30) × cos(');
    });

    it('should append function after binary operator without implicit multiplication', () => {
      let state = calculatorReducer(initialCalculatorState, { type: 'INPUT_DIGIT', payload: '5' });
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '+' });
      state = calculatorReducer(state, { type: 'INPUT_FUNCTION', payload: 'sqrt' });
      assert.equal(state.expression, '5 + sqrt(');
    });
  });

  describe('Constant Input (INPUT_CONSTANT)', () => {
    it('should insert π on idle state', () => {
      const state = calculatorReducer(initialCalculatorState, { type: 'INPUT_CONSTANT', payload: 'π' });
      assert.equal(state.expression, 'π');
      assert.equal(state.displayValue, 'π');
      assert.equal(state.status, 'entering');
    });

    it('should insert e on idle state', () => {
      const state = calculatorReducer(initialCalculatorState, { type: 'INPUT_CONSTANT', payload: 'e' });
      assert.equal(state.expression, 'e');
      assert.equal(state.displayValue, 'e');
    });

    it('should insert implicit multiplication when constant follows a number', () => {
      let state = calculatorReducer(initialCalculatorState, { type: 'INPUT_DIGIT', payload: '2' });
      state = calculatorReducer(state, { type: 'INPUT_CONSTANT', payload: 'π' });
      assert.equal(state.expression, '2 × π');
    });

    it('should append constant cleanly after an operator', () => {
      let state = calculatorReducer(initialCalculatorState, { type: 'INPUT_DIGIT', payload: '1' });
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '+' });
      state = calculatorReducer(state, { type: 'INPUT_CONSTANT', payload: 'e' });
      assert.equal(state.expression, '1 + e');
    });
  });

  describe('Postfix & Power Input (INPUT_POSTFIX & ^)', () => {
    it('should append factorial (!) to an existing number', () => {
      let state = calculatorReducer(initialCalculatorState, { type: 'INPUT_DIGIT', payload: '5' });
      state = calculatorReducer(state, { type: 'INPUT_POSTFIX', payload: '!' });
      assert.equal(state.expression, '5!');
    });

    it('should append square (^2) to an existing number', () => {
      let state = calculatorReducer(initialCalculatorState, { type: 'INPUT_DIGIT', payload: '4' });
      state = calculatorReducer(state, { type: 'INPUT_POSTFIX', payload: '^2' });
      assert.equal(state.expression, '4^2');
    });

    it('should support power operator (^) via INPUT_OPERATOR', () => {
      let state = calculatorReducer(initialCalculatorState, { type: 'INPUT_DIGIT', payload: '2' });
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '^' });
      assert.equal(state.expression, '2 ^ ');

      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '3' });
      state = calculatorReducer(state, { type: 'CALCULATE' });
      assert.equal(state.status, 'result');
      assert.equal(state.displayValue, '8');
    });

    it('should continue calculation from previous result with factorial: 5 -> = -> ! -> = 120', () => {
      let state = calculatorReducer(initialCalculatorState, { type: 'INPUT_DIGIT', payload: '5' });
      state = calculatorReducer(state, { type: 'CALCULATE' });
      assert.equal(state.status, 'result');
      assert.equal(state.displayValue, '5');

      state = calculatorReducer(state, { type: 'INPUT_POSTFIX', payload: '!' });
      assert.equal(state.expression, '5!');

      state = calculatorReducer(state, { type: 'CALCULATE' });
      assert.equal(state.status, 'result');
      assert.equal(state.displayValue, '120');
    });
  });

  describe('Angle Unit Selector & Angle Mode Integration', () => {
    it('should update angleUnit to rad and grad without resetting expression', () => {
      let state = calculatorReducer(initialCalculatorState, { type: 'INPUT_FUNCTION', payload: 'sin' });
      state = calculatorReducer(state, { type: 'INPUT_CONSTANT', payload: 'π' });
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '÷' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '2' });
      state = calculatorReducer(state, { type: 'INPUT_PARENTHESIS', payload: ')' });
      assert.equal(state.expression, 'sin(π ÷ 2)');

      state = calculatorReducer(state, { type: 'SET_ANGLE_UNIT', payload: 'rad' });
      assert.equal(state.angleUnit, 'rad');
      assert.equal(state.expression, 'sin(π ÷ 2)');

      state = calculatorReducer(state, { type: 'CALCULATE' });
      assert.equal(state.status, 'result');
      assert.equal(state.displayValue, '1');
    });

    it('should evaluate sin(100) = 1 in grad mode', () => {
      let state: CalculatorState = { ...initialCalculatorState, angleUnit: 'grad' };
      state = calculatorReducer(state, { type: 'INPUT_FUNCTION', payload: 'sin' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '1' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '0' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '0' });
      state = calculatorReducer(state, { type: 'INPUT_PARENTHESIS', payload: ')' });
      state = calculatorReducer(state, { type: 'CALCULATE' });

      assert.equal(state.status, 'result');
      assert.equal(state.displayValue, '1');
    });
  });

  describe('End-to-End Scientific Calculations & History', () => {
    it('should evaluate sin(30) in deg mode and record to history', () => {
      let state = calculatorReducer(initialCalculatorState, { type: 'INPUT_FUNCTION', payload: 'sin' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '3' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '0' });
      state = calculatorReducer(state, { type: 'INPUT_PARENTHESIS', payload: ')' });
      state = calculatorReducer(state, { type: 'CALCULATE' });

      assert.equal(state.status, 'result');
      assert.equal(state.displayValue, '0.5');
      assert.equal(state.history.length, 1);
      assert.equal(state.history[0]?.expression, 'sin(30)');
      assert.equal(state.history[0]?.result, '0.5');
    });

    it('should continue calculation with an operator from scientific result', () => {
      let state = calculatorReducer(initialCalculatorState, { type: 'INPUT_FUNCTION', payload: 'sin' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '3' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '0' });
      state = calculatorReducer(state, { type: 'INPUT_PARENTHESIS', payload: ')' });
      state = calculatorReducer(state, { type: 'CALCULATE' });
      assert.equal(state.displayValue, '0.5');

      // Operator continuation: 0.5 + 2 = 2.5
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '+' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '2' });
      state = calculatorReducer(state, { type: 'CALCULATE' });
      assert.equal(state.displayValue, '2.5');
    });

    it('should start fresh calculation if digit is pressed after scientific result', () => {
      let state = calculatorReducer(initialCalculatorState, { type: 'INPUT_FUNCTION', payload: 'sin' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '3' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '0' });
      state = calculatorReducer(state, { type: 'INPUT_PARENTHESIS', payload: ')' });
      state = calculatorReducer(state, { type: 'CALCULATE' });

      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '9' });
      assert.equal(state.status, 'entering');
      assert.equal(state.expression, '9');
      assert.equal(state.displayValue, '9');
    });
  });

  describe('Error Handling and Recovery in Scientific Mode', () => {
    it('should display friendly error for sqrt(-1) and not crash', () => {
      let state = calculatorReducer(initialCalculatorState, { type: 'INPUT_FUNCTION', payload: 'sqrt' });
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '-' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '1' });
      state = calculatorReducer(state, { type: 'INPUT_PARENTHESIS', payload: ')' });
      state = calculatorReducer(state, { type: 'CALCULATE' });

      assert.equal(state.status, 'error');
      assert.equal(state.isError, true);
      assert.equal(state.displayValue, "Square root argument '-1' must be non-negative");
    });

    it('should recover from error cleanly on next digit input', () => {
      let state = calculatorReducer(initialCalculatorState, { type: 'INPUT_FUNCTION', payload: 'sqrt' });
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '-' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '1' });
      state = calculatorReducer(state, { type: 'INPUT_PARENTHESIS', payload: ')' });
      state = calculatorReducer(state, { type: 'CALCULATE' });
      assert.equal(state.status, 'error');

      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '7' });
      assert.equal(state.status, 'entering');
      assert.equal(state.isError, false);
      assert.equal(state.errorMessage, null);
      assert.equal(state.displayValue, '7');
    });
  });

  describe('Smart Backspace for Multi-Character Functions', () => {
    it('should delete entire function call token like sin( in a single backspace', () => {
      let state = calculatorReducer(initialCalculatorState, { type: 'INPUT_FUNCTION', payload: 'sin' });
      assert.equal(state.expression, 'sin(');

      state = calculatorReducer(state, { type: 'DELETE_BACKSPACE' });
      assert.equal(state.expression, '');
      assert.equal(state.displayValue, '0');
      assert.equal(state.status, 'idle');
    });

    it('should delete function after an operator without deleting the operator', () => {
      let state = calculatorReducer(initialCalculatorState, { type: 'INPUT_DIGIT', payload: '5' });
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '+' });
      state = calculatorReducer(state, { type: 'INPUT_FUNCTION', payload: 'asin' });
      assert.equal(state.expression, '5 + asin(');

      state = calculatorReducer(state, { type: 'DELETE_BACKSPACE' });
      assert.equal(state.expression, '5 +');
    });
  });
});
