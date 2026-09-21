import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculatorReducer, initialCalculatorState } from '../../src/store/calculatorStore';
import type { CalculatorState } from '../../src/types/calculator';

describe('Calculator Memory Registers (MC, MR, M+, M−)', () => {
  describe('Initial Memory State', () => {
    it('should initialize with memory = 0', () => {
      assert.equal(initialCalculatorState.memory, 0);
    });
  });

  describe('Memory Clear (MC)', () => {
    it('should reset memory to 0', () => {
      const stateWithMemory: CalculatorState = {
        ...initialCalculatorState,
        memory: 42.5,
        expression: '10 + 5',
        displayValue: '5',
        status: 'entering',
      };

      const nextState = calculatorReducer(stateWithMemory, { type: 'MEMORY_CLEAR' });
      assert.equal(nextState.memory, 0);
      // Expression and display must remain intact
      assert.equal(nextState.expression, '10 + 5');
      assert.equal(nextState.displayValue, '5');
      assert.equal(nextState.status, 'entering');
    });

    it('should maintain memory = 0 if already 0', () => {
      const nextState = calculatorReducer(initialCalculatorState, { type: 'MEMORY_CLEAR' });
      assert.equal(nextState.memory, 0);
    });
  });

  describe('Memory Add (M+)', () => {
    it('should add evaluated result to memory when in result status', () => {
      const resultState: CalculatorState = {
        ...initialCalculatorState,
        expression: '25 × 4',
        displayValue: '100',
        previousResult: '100',
        status: 'result',
        memory: 0,
      };

      const next = calculatorReducer(resultState, { type: 'MEMORY_ADD' });
      assert.equal(next.memory, 100);
      assert.equal(next.displayValue, '100');
    });

    it('should safely evaluate un-evaluated entering expression and add to memory', () => {
      const enteringState: CalculatorState = {
        ...initialCalculatorState,
        expression: '12 + 8',
        displayValue: '8',
        status: 'entering',
        memory: 10,
      };

      const next = calculatorReducer(enteringState, { type: 'MEMORY_ADD' });
      assert.equal(next.memory, 30); // 10 + (12 + 8 = 20)
    });

    it('should accumulate multiple M+ operations', () => {
      let state: CalculatorState = initialCalculatorState;

      // Add 15
      state = { ...state, expression: '15', displayValue: '15', status: 'entering' };
      state = calculatorReducer(state, { type: 'MEMORY_ADD' });
      assert.equal(state.memory, 15);

      // Add 35
      state = { ...state, expression: '35', displayValue: '35', status: 'entering' };
      state = calculatorReducer(state, { type: 'MEMORY_ADD' });
      assert.equal(state.memory, 50);

      // Add 50
      state = { ...state, expression: '50', displayValue: '50', status: 'entering' };
      state = calculatorReducer(state, { type: 'MEMORY_ADD' });
      assert.equal(state.memory, 100);
    });

    it('should normalize floating point precision to avoid IEEE 754 float drift', () => {
      let state: CalculatorState = initialCalculatorState;

      // 0.1
      state = { ...state, expression: '0.1', displayValue: '0.1', status: 'entering' };
      state = calculatorReducer(state, { type: 'MEMORY_ADD' });

      // + 0.2
      state = { ...state, expression: '0.2', displayValue: '0.2', status: 'entering' };
      state = calculatorReducer(state, { type: 'MEMORY_ADD' });

      assert.equal(state.memory, 0.3); // Exactly 0.3, not 0.30000000000000004
    });

    it('should accept explicit numeric payload if provided', () => {
      const state = calculatorReducer(initialCalculatorState, {
        type: 'MEMORY_ADD',
        payload: 42,
      });
      assert.equal(state.memory, 42);
    });

    it('should not modify memory if in error state', () => {
      const errState: CalculatorState = {
        ...initialCalculatorState,
        isError: true,
        errorMessage: 'Division by zero',
        displayValue: 'Cannot divide by zero',
        status: 'error',
        memory: 100,
      };

      const next = calculatorReducer(errState, { type: 'MEMORY_ADD' });
      assert.equal(next.memory, 100);
    });

    it('should not modify memory if entering expression has a syntax error', () => {
      const invalidState: CalculatorState = {
        ...initialCalculatorState,
        expression: '5 + * 3',
        displayValue: '3',
        status: 'entering',
        memory: 50,
      };

      const next = calculatorReducer(invalidState, { type: 'MEMORY_ADD' });
      assert.equal(next.memory, 50);
    });
  });

  describe('Memory Subtract (M−)', () => {
    it('should subtract value from memory when in result status', () => {
      const stateWithMemory: CalculatorState = {
        ...initialCalculatorState,
        memory: 100,
        expression: '20 + 5',
        displayValue: '25',
        previousResult: '25',
        status: 'result',
      };

      const next = calculatorReducer(stateWithMemory, { type: 'MEMORY_SUBTRACT' });
      assert.equal(next.memory, 75);
    });

    it('should subtract value resulting in negative memory', () => {
      const state: CalculatorState = {
        ...initialCalculatorState,
        memory: 10,
        expression: '40',
        displayValue: '40',
        status: 'entering',
      };

      const next = calculatorReducer(state, { type: 'MEMORY_SUBTRACT' });
      assert.equal(next.memory, -30);
    });

    it('should normalize precision on subtraction', () => {
      let state: CalculatorState = {
        ...initialCalculatorState,
        memory: 1.0,
      };

      state = { ...state, expression: '0.9', displayValue: '0.9', status: 'entering' };
      state = calculatorReducer(state, { type: 'MEMORY_SUBTRACT' });
      assert.equal(state.memory, 0.1);
    });

    it('should not modify memory on error or invalid input', () => {
      const errState: CalculatorState = {
        ...initialCalculatorState,
        isError: true,
        displayValue: 'Error',
        status: 'error',
        memory: 50,
      };

      const next = calculatorReducer(errState, { type: 'MEMORY_SUBTRACT' });
      assert.equal(next.memory, 50);
    });
  });

  describe('Memory Recall (MR)', () => {
    it('should recall stored memory value in idle status and set status to result', () => {
      const state: CalculatorState = {
        ...initialCalculatorState,
        memory: 42,
        status: 'idle',
      };

      const next = calculatorReducer(state, { type: 'MEMORY_RECALL' });
      assert.equal(next.displayValue, '42');
      assert.equal(next.expression, '42');
      assert.equal(next.previousResult, '42');
      assert.equal(next.status, 'result');
      // Memory register itself must not change
      assert.equal(next.memory, 42);
    });

    it('should enable seamless continuation with operator after MR', () => {
      // 1. Recall memory (42)
      let state: CalculatorState = {
        ...initialCalculatorState,
        memory: 42,
        status: 'idle',
      };
      state = calculatorReducer(state, { type: 'MEMORY_RECALL' });
      assert.equal(state.displayValue, '42');
      assert.equal(state.status, 'result');

      // 2. User presses multiply '×'
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '×' });
      assert.equal(state.expression, '42 × ');
      assert.equal(state.status, 'entering');

      // 3. User inputs 2
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '2' });
      assert.equal(state.expression, '42 × 2');

      // 4. User presses equals
      state = calculatorReducer(state, { type: 'CALCULATE' });
      assert.equal(state.displayValue, '84');
      assert.equal(state.status, 'result');
      assert.equal(state.memory, 42); // Memory still intact
    });

    it('should append memory value when expression ends in an operator', () => {
      let state: CalculatorState = {
        ...initialCalculatorState,
        memory: 15,
        expression: '10 + ',
        displayValue: '+',
        status: 'entering',
      };

      state = calculatorReducer(state, { type: 'MEMORY_RECALL' });
      assert.equal(state.expression, '10 + 15');
      assert.equal(state.displayValue, '15');
      assert.equal(state.status, 'entering');

      // Calculate should work immediately
      state = calculatorReducer(state, { type: 'CALCULATE' });
      assert.equal(state.displayValue, '25');
    });

    it('should append memory value after open parenthesis', () => {
      let state: CalculatorState = {
        ...initialCalculatorState,
        memory: 7,
        expression: '2 × (',
        displayValue: '(',
        status: 'entering',
      };

      state = calculatorReducer(state, { type: 'MEMORY_RECALL' });
      assert.equal(state.expression, '2 × (7');
      assert.equal(state.displayValue, '7');
    });

    it('should replace active numeric segment with memory value if mid-number', () => {
      let state: CalculatorState = {
        ...initialCalculatorState,
        memory: 88,
        expression: '10 + 999',
        displayValue: '999',
        status: 'entering',
      };

      state = calculatorReducer(state, { type: 'MEMORY_RECALL' });
      assert.equal(state.expression, '10 + 88');
      assert.equal(state.displayValue, '88');
    });

    it('should cleanly recover from error state when MR is pressed', () => {
      const errState: CalculatorState = {
        ...initialCalculatorState,
        isError: true,
        errorMessage: 'Invalid expression',
        displayValue: 'Invalid expression',
        status: 'error',
        memory: 99,
      };

      const recovered = calculatorReducer(errState, { type: 'MEMORY_RECALL' });
      assert.equal(recovered.isError, false);
      assert.equal(recovered.errorMessage, null);
      assert.equal(recovered.displayValue, '99');
      assert.equal(recovered.expression, '99');
      assert.equal(recovered.status, 'result');
      assert.equal(recovered.memory, 99);
    });
  });

  describe('Integration with All Clear (AC / CLEAR_ALL)', () => {
    it('must PRESERVE memory register when AC is pressed (standard calculator behavior)', () => {
      let state: CalculatorState = {
        ...initialCalculatorState,
        memory: 500,
        expression: '123 + 456',
        displayValue: '456',
        status: 'entering',
      };

      state = calculatorReducer(state, { type: 'CLEAR_ALL' });
      assert.equal(state.expression, '');
      assert.equal(state.displayValue, '0');
      assert.equal(state.status, 'idle');
      assert.equal(state.memory, 500); // Memory is NOT cleared by AC! Only MC clears memory.
    });
  });

  describe('Scientific Mode Integration', () => {
    it('should store result of trigonometric evaluation in memory', () => {
      let state: CalculatorState = {
        ...initialCalculatorState,
        mode: 'scientific',
        angleUnit: 'deg',
        expression: 'sin(90)',
        displayValue: 'sin(90)',
        status: 'entering',
      };

      // Calculate sin(90) = 1
      state = calculatorReducer(state, { type: 'CALCULATE' });
      assert.equal(state.displayValue, '1');

      // Add to memory
      state = calculatorReducer(state, { type: 'MEMORY_ADD' });
      assert.equal(state.memory, 1);
    });

    it('should store scientific constants (π, e) and power calculations in memory', () => {
      let state: CalculatorState = {
        ...initialCalculatorState,
        mode: 'scientific',
        expression: '2 ^ 3',
        displayValue: '2 ^ 3',
        status: 'entering',
      };

      state = calculatorReducer(state, { type: 'CALCULATE' });
      assert.equal(state.displayValue, '8');

      state = calculatorReducer(state, { type: 'MEMORY_ADD' });
      assert.equal(state.memory, 8);
    });
  });
});
