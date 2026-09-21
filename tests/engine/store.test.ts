import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculatorReducer, initialCalculatorState } from '../../src/store/calculatorStore';
import type { CalculatorState, CalculationHistoryItem } from '../../src/types/calculator';

describe('Calculator State Reducer & Engine Integration', () => {
  it('should start with initial idle state', () => {
    assert.equal(initialCalculatorState.displayValue, '0');
    assert.equal(initialCalculatorState.expression, '');
    assert.equal(initialCalculatorState.status, 'idle');
    assert.equal(initialCalculatorState.isError, false);
    assert.equal(initialCalculatorState.history.length, 0);
  });

  describe('Number Input (INPUT_DIGIT)', () => {
    it('should replace initial "0" with first entered digit', () => {
      const s1 = calculatorReducer(initialCalculatorState, { type: 'INPUT_DIGIT', payload: '7' });
      assert.equal(s1.expression, '7');
      assert.equal(s1.displayValue, '7');
      assert.equal(s1.status, 'entering');
    });

    it('should concatenate subsequent digits in entering state', () => {
      let state: CalculatorState = initialCalculatorState;
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '1' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '2' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '3' });

      assert.equal(state.expression, '123');
      assert.equal(state.displayValue, '123');
    });

    it('should prevent repeated leading zeros (e.g. 000)', () => {
      let state: CalculatorState = initialCalculatorState;
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '0' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '0' });

      assert.equal(state.expression, '0');
      assert.equal(state.displayValue, '0');
    });

    it('should start a fresh calculation if digit is pressed after showing a result', () => {
      let state: CalculatorState = {
        ...initialCalculatorState,
        expression: '10 + 5',
        displayValue: '15',
        previousResult: '15',
        status: 'result',
      };

      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '8' });
      assert.equal(state.expression, '8');
      assert.equal(state.displayValue, '8');
      assert.equal(state.status, 'entering');
      assert.equal(state.previousResult, null);
    });
  });

  describe('Decimal Input (INPUT_DECIMAL)', () => {
    it('should start with "0." if pressed on idle', () => {
      const state = calculatorReducer(initialCalculatorState, { type: 'INPUT_DECIMAL' });
      assert.equal(state.expression, '0.');
      assert.equal(state.displayValue, '0.');
      assert.equal(state.status, 'entering');
    });

    it('should append decimal to an existing integer', () => {
      let state: CalculatorState = initialCalculatorState;
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '5' });
      state = calculatorReducer(state, { type: 'INPUT_DECIMAL' });

      assert.equal(state.expression, '5.');
      assert.equal(state.displayValue, '5.');
    });

    it('should prevent multiple decimals in the same numeric segment (e.g. 2.5.7)', () => {
      let state: CalculatorState = initialCalculatorState;
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '2' });
      state = calculatorReducer(state, { type: 'INPUT_DECIMAL' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '5' });
      state = calculatorReducer(state, { type: 'INPUT_DECIMAL' }); // Must be ignored
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '7' });

      assert.equal(state.expression, '2.57');
      assert.equal(state.displayValue, '2.57');
    });

    it('should start fresh calculation with "0." if pressed on result state', () => {
      const resultState: CalculatorState = {
        ...initialCalculatorState,
        expression: '4 * 5',
        displayValue: '20',
        status: 'result',
      };
      const state = calculatorReducer(resultState, { type: 'INPUT_DECIMAL' });
      assert.equal(state.expression, '0.');
      assert.equal(state.displayValue, '0.');
      assert.equal(state.status, 'entering');
    });
  });

  describe('Operator Input (INPUT_OPERATOR)', () => {
    it('should append operator with formatting', () => {
      let state: CalculatorState = initialCalculatorState;
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '2' });
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '+' });

      assert.equal(state.expression, '2 + ');
      assert.equal(state.status, 'entering');
    });

    it('should replace trailing operator if another operator is pressed', () => {
      let state: CalculatorState = initialCalculatorState;
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '2' });
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '+' });
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '×' });

      assert.equal(state.expression, '2 × ');
    });

    it('should continue calculating from previous result when operator is pressed after equals', () => {
      const resultState: CalculatorState = {
        ...initialCalculatorState,
        expression: '25 × 4',
        displayValue: '100',
        previousResult: '100',
        status: 'result',
      };

      const state = calculatorReducer(resultState, { type: 'INPUT_OPERATOR', payload: '+' });
      assert.equal(state.expression, '100 + ');
      assert.equal(state.status, 'entering');
    });
  });

  describe('Parentheses Input (INPUT_PARENTHESIS)', () => {
    it('should append parentheses correctly', () => {
      let state: CalculatorState = initialCalculatorState;
      state = calculatorReducer(state, { type: 'INPUT_PARENTHESIS', payload: '(' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '2' });
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '+' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '3' });
      state = calculatorReducer(state, { type: 'INPUT_PARENTHESIS', payload: ')' });
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '×' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '4' });

      assert.equal(state.expression, '(2 + 3) × 4');

      // Now calculate
      state = calculatorReducer(state, { type: 'CALCULATE' });
      assert.equal(state.displayValue, '20');
      assert.equal(state.status, 'result');
      assert.equal(state.isError, false);
    });
  });

  describe('Evaluation (CALCULATE) & History', () => {
    it('should evaluate expression via calculate() and add to history (newest first)', () => {
      let state: CalculatorState = initialCalculatorState;
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '4' });
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '+' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '6' });

      state = calculatorReducer(state, { type: 'CALCULATE' });
      assert.equal(state.displayValue, '10');
      assert.equal(state.status, 'result');
      assert.equal(state.isError, false);
      assert.equal(state.history.length, 1);
      assert.equal(state.history[0]?.expression, '4 + 6');
      assert.equal(state.history[0]?.result, '10');
    });

    it('should preserve existing history when a new calculation succeeds', () => {
      let state: CalculatorState = initialCalculatorState;
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '2' });
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '×' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '3' });
      state = calculatorReducer(state, { type: 'CALCULATE' }); // result: 6

      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '5' });
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '+' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '5' });
      state = calculatorReducer(state, { type: 'CALCULATE' }); // result: 10

      assert.equal(state.history.length, 2);
      assert.equal(state.history[0]?.result, '10'); // Newest first
      assert.equal(state.history[1]?.result, '6');
    });

    it('should handle division by zero error without crashing or adding to history', () => {
      let state: CalculatorState = initialCalculatorState;
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '1' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '0' });
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '÷' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '0' });

      state = calculatorReducer(state, { type: 'CALCULATE' });
      assert.equal(state.isError, true);
      assert.equal(state.status, 'error');
      assert.equal(state.displayValue, 'Cannot divide by zero');
      assert.equal(state.history.length, 0); // No corrupted history
    });

    it('should recover from error cleanly when new digit is pressed', () => {
      let state: CalculatorState = {
        ...initialCalculatorState,
        isError: true,
        errorMessage: 'Cannot divide by zero',
        status: 'error',
      };

      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '9' });
      assert.equal(state.isError, false);
      assert.equal(state.errorMessage, null);
      assert.equal(state.status, 'entering');
      assert.equal(state.expression, '9');
      assert.equal(state.displayValue, '9');
    });
  });

  describe('Clear (CLEAR_ALL) & Backspace (DELETE_BACKSPACE)', () => {
    it('CLEAR_ALL should reset display and expression while preserving history', () => {
      const dummyHistory: CalculationHistoryItem = {
        id: '1',
        expression: '2+2',
        result: '4',
        timestamp: Date.now(),
      };

      let state: CalculatorState = {
        ...initialCalculatorState,
        expression: '123 + 456',
        displayValue: '456',
        history: [dummyHistory],
      };

      state = calculatorReducer(state, { type: 'CLEAR_ALL' });
      assert.equal(state.expression, '');
      assert.equal(state.displayValue, '0');
      assert.equal(state.status, 'idle');
      assert.equal(state.history.length, 1); // History preserved!
    });

    it('DELETE_BACKSPACE should remove characters cleanly', () => {
      let state: CalculatorState = initialCalculatorState;
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '1' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '2' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '3' });

      state = calculatorReducer(state, { type: 'DELETE_BACKSPACE' });
      assert.equal(state.expression, '12');

      state = calculatorReducer(state, { type: 'DELETE_BACKSPACE' });
      assert.equal(state.expression, '1');

      state = calculatorReducer(state, { type: 'DELETE_BACKSPACE' });
      assert.equal(state.expression, '');
      assert.equal(state.displayValue, '0');
      assert.equal(state.status, 'idle');
    });

    it('DELETE_BACKSPACE on error resets display to idle', () => {
      let state: CalculatorState = {
        ...initialCalculatorState,
        isError: true,
        errorMessage: 'Syntax Error',
        status: 'error',
      };

      state = calculatorReducer(state, { type: 'DELETE_BACKSPACE' });
      assert.equal(state.isError, false);
      assert.equal(state.expression, '');
      assert.equal(state.displayValue, '0');
      assert.equal(state.status, 'idle');
    });
  });

  describe('History Reuse & Clear', () => {
    it('LOAD_HISTORY_ITEM should load item for continuation', () => {
      const item: CalculationHistoryItem = {
        id: 'item-1',
        expression: '100 × 5',
        result: '500',
        timestamp: Date.now(),
      };

      let state = calculatorReducer(initialCalculatorState, {
        type: 'LOAD_HISTORY_ITEM',
        payload: item,
      });

      assert.equal(state.displayValue, '500');
      assert.equal(state.previousResult, '500');
      assert.equal(state.status, 'result');

      // Now continuation with operator
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '+' });
      assert.equal(state.expression, '500 + ');
    });

    it('CLEAR_HISTORY should empty history array', () => {
      const stateWithHistory: CalculatorState = {
        ...initialCalculatorState,
        history: [
          { id: '1', expression: '1+1', result: '2', timestamp: 1 },
          { id: '2', expression: '2+2', result: '4', timestamp: 2 },
        ],
      };

      const clearedState = calculatorReducer(stateWithHistory, { type: 'CLEAR_HISTORY' });
      assert.equal(clearedState.history.length, 0);
    });
  });
});
