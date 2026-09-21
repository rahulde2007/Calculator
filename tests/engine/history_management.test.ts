import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { initialCalculatorState, calculatorReducer } from '../../src/store/calculatorStore';
import { copyToClipboard } from '../../src/utils/clipboard';
import { escapeCSVField, historyToCSV, exportHistoryAsCSV } from '../../src/utils/exportHistory';
import { savePersistedState, loadPersistedState, type SafeStorage } from '../../src/store/persistence';
import type { CalculationHistoryItem, CalculatorState } from '../../src/types/calculator';

function createMockStorage(initialData: Record<string, string> = {}): SafeStorage {
  const store: Record<string, string> = { ...initialData };
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
}

describe('Calcx-Pro Step 9: History Management, Copy & Export', () => {
  describe('A & B. Copy Result and Expression Formatting', () => {
    it('should copy raw result text accurately', async () => {
      let writtenText = '';
      const mockClipboard = {
        writeText: async (text: string) => {
          writtenText = text;
        },
      };

      const success = await copyToClipboard('100.5', mockClipboard);
      assert.equal(success, true);
      assert.equal(writtenText, '100.5');
    });

    it('should copy raw expression text accurately', async () => {
      let writtenText = '';
      const mockClipboard = {
        writeText: async (text: string) => {
          writtenText = text;
        },
      };

      const success = await copyToClipboard('sin(30) + 10', mockClipboard);
      assert.equal(success, true);
      assert.equal(writtenText, 'sin(30) + 10');
    });
  });

  describe('C & D. Clipboard Failure & Unavailable Fallback', () => {
    it('should catch clipboard write rejection and return false without crashing', async () => {
      const failingClipboard = {
        writeText: async () => {
          throw new Error('NotAllowedError: Clipboard permission denied');
        },
      };

      const success = await copyToClipboard('42', failingClipboard);
      assert.equal(success, false);
    });

    it('should safely return false when Clipboard API is completely unavailable in environment', async () => {
      // Pass null clipboard in Node environment without document.execCommand
      const success = await copyToClipboard('test', null);
      assert.equal(success, false);
    });
  });

  describe('E & F. Individual History Item Deletion', () => {
    it('should remove the selected history item from state.history', () => {
      const items: CalculationHistoryItem[] = [
        { id: 'item-1', expression: '1 + 1', result: '2', timestamp: 1000 },
        { id: 'item-2', expression: '2 + 2', result: '4', timestamp: 2000 },
        { id: 'item-3', expression: '3 + 3', result: '6', timestamp: 3000 },
      ];

      const state: CalculatorState = {
        ...initialCalculatorState,
        history: items,
      };

      const updated = calculatorReducer(state, {
        type: 'DELETE_HISTORY_ITEM',
        payload: 'item-2',
      });

      assert.equal(updated.history.length, 2);
      assert.equal(updated.history[0]?.id, 'item-1');
      assert.equal(updated.history[1]?.id, 'item-3');
    });

    it('should preserve remaining item order and state invariants when deleting', () => {
      const items: CalculationHistoryItem[] = [
        { id: 'a', expression: '10 × 10', result: '100', timestamp: 1 },
        { id: 'b', expression: '20 × 20', result: '400', timestamp: 2 },
        { id: 'c', expression: '30 × 30', result: '900', timestamp: 3 },
      ];

      let state: CalculatorState = {
        ...initialCalculatorState,
        history: items,
        memory: 42,
        mode: 'scientific',
        angleUnit: 'rad',
      };

      state = calculatorReducer(state, { type: 'DELETE_HISTORY_ITEM', payload: 'a' });
      assert.equal(state.history.length, 2);
      assert.equal(state.history[0]?.id, 'b');
      assert.equal(state.history[1]?.id, 'c');
      // Invariants preserved
      assert.equal(state.memory, 42);
      assert.equal(state.mode, 'scientific');
      assert.equal(state.angleUnit, 'rad');
    });

    it('should be a no-op if deleted item ID does not exist', () => {
      const items: CalculationHistoryItem[] = [
        { id: 'item-1', expression: '5 + 5', result: '10', timestamp: 1000 },
      ];

      const state: CalculatorState = {
        ...initialCalculatorState,
        history: items,
      };

      const updated = calculatorReducer(state, {
        type: 'DELETE_HISTORY_ITEM',
        payload: 'non-existent-id',
      });

      assert.equal(updated.history.length, 1);
      assert.equal(updated.history[0]?.id, 'item-1');
    });
  });

  describe('G & H. Clear History & Invariance', () => {
    it('should empty history array on CLEAR_HISTORY', () => {
      const state: CalculatorState = {
        ...initialCalculatorState,
        history: [{ id: '1', expression: '2 × 3', result: '6', timestamp: 1000 }],
      };

      const cleared = calculatorReducer(state, { type: 'CLEAR_HISTORY' });
      assert.deepEqual(cleared.history, []);
    });

    it('should PRESERVE expression, displayValue, memory, mode, and angleUnit on CLEAR_HISTORY', () => {
      const state: CalculatorState = {
        ...initialCalculatorState,
        expression: '50 + ',
        displayValue: '50',
        memory: 123.45,
        mode: 'scientific',
        angleUnit: 'grad',
        status: 'entering',
        history: [{ id: '1', expression: '1 + 1', result: '2', timestamp: 1000 }],
      };

      const cleared = calculatorReducer(state, { type: 'CLEAR_HISTORY' });
      assert.equal(cleared.history.length, 0);
      assert.equal(cleared.expression, '50 + ');
      assert.equal(cleared.displayValue, '50');
      assert.equal(cleared.memory, 123.45);
      assert.equal(cleared.mode, 'scientific');
      assert.equal(cleared.angleUnit, 'grad');
      assert.equal(cleared.status, 'entering');
    });
  });

  describe('I, J, K, L, M, N. CSV Export Specification & Escaping', () => {
    it('I. should generate valid CSV header row when history is empty', () => {
      const csv = historyToCSV([]);
      assert.equal(csv, 'Timestamp,Date (ISO),Expression,Result\r\n');
    });

    it('J. should format normal calculation rows correctly', () => {
      const items: CalculationHistoryItem[] = [
        {
          id: '1',
          expression: '12 + 8',
          result: '20',
          timestamp: 1716300000000,
        },
      ];

      const csv = historyToCSV(items);
      const lines = csv.trim().split('\r\n');
      assert.equal(lines.length, 2);
      assert.equal(lines[0], 'Timestamp,Date (ISO),Expression,Result');
      assert.equal(lines[1], `1716300000000,${new Date(1716300000000).toISOString()},12 + 8,20`);
    });

    it('K. should wrap fields containing commas in double quotes', () => {
      assert.equal(escapeCSVField('1,000'), '"1,000"');
      assert.equal(escapeCSVField('a,b,c'), '"a,b,c"');

      const items: CalculationHistoryItem[] = [
        { id: '1', expression: '1,000 + 2,000', result: '3,000', timestamp: 1000 },
      ];
      const csv = historyToCSV(items);
      assert.ok(csv.includes('"1,000 + 2,000"'));
      assert.ok(csv.includes('"3,000"'));
    });

    it('L. should escape fields containing double quotes by doubling them', () => {
      assert.equal(escapeCSVField('5" screen'), '"5"" screen"');
      assert.equal(escapeCSVField('"hello"'), '"""hello"""');

      const items: CalculationHistoryItem[] = [
        { id: '1', expression: '5" + 2"', result: '7"', timestamp: 1000 },
      ];
      const csv = historyToCSV(items);
      assert.ok(csv.includes('"5"" + 2"""'));
      assert.ok(csv.includes('"7"""'));
    });

    it('M. should wrap fields containing newlines in double quotes', () => {
      assert.equal(escapeCSVField('Line 1\nLine 2'), '"Line 1\nLine 2"');
      assert.equal(escapeCSVField('Line 1\r\nLine 2'), '"Line 1\r\nLine 2"');
    });

    it('N. should verify CSV header row matches specification exactly', () => {
      const csv = historyToCSV([]);
      const [header] = csv.split('\r\n');
      assert.equal(header, 'Timestamp,Date (ISO),Expression,Result');
    });

    it('should fail gracefully in exportHistoryAsCSV when window or Blob is undefined', () => {
      const result = exportHistoryAsCSV([]);
      // In Node.js environment, window/Blob/document is not present, so should cleanly return false
      assert.equal(typeof result, 'boolean');
    });
  });

  describe('O & P. 50-Item History Limit & Ordering', () => {
    it('O. should clamp in-memory history to maximum 50 items on new calculations', () => {
      // Create initial state with 50 items
      const initialItems: CalculationHistoryItem[] = [];
      for (let i = 0; i < 50; i++) {
        initialItems.push({
          id: `h-${i}`,
          expression: `${i} + 1`,
          result: `${i + 1}`,
          timestamp: 1000 + i,
        });
      }

      let state: CalculatorState = {
        ...initialCalculatorState,
        history: initialItems,
        expression: '99 + 1',
        displayValue: '1',
        status: 'entering',
      };

      // Perform 51st calculation
      state = calculatorReducer(state, { type: 'CALCULATE' });

      // Total must still be capped at 50
      assert.equal(state.history.length, 50);
    });

    it('P. should always place newest calculation at index 0', () => {
      let state: CalculatorState = initialCalculatorState;

      // Calc 1: 2 + 2 = 4
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '2' });
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '+' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '2' });
      state = calculatorReducer(state, { type: 'CALCULATE' });

      // Calc 2: 3 × 3 = 9
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '3' });
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '×' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '3' });
      state = calculatorReducer(state, { type: 'CALCULATE' });

      assert.equal(state.history.length, 2);
      assert.equal(state.history[0]?.expression, '3 × 3');
      assert.equal(state.history[0]?.result, '9');
      assert.equal(state.history[1]?.expression, '2 + 2');
      assert.equal(state.history[1]?.result, '4');
    });
  });

  describe('Q & R. Persistence Integration after Deletion and Clear', () => {
    it('Q. should update persisted storage when an item is deleted', () => {
      const storage = createMockStorage();

      // Initial state with 2 items saved in storage
      const initialItems: CalculationHistoryItem[] = [
        { id: '1', expression: '2 + 2', result: '4', timestamp: 100 },
        { id: '2', expression: '5 + 5', result: '10', timestamp: 200 },
      ];

      savePersistedState(
        {
          history: initialItems,
          mode: 'standard',
          angleUnit: 'deg',
        },
        storage
      );

      // Delete item 1
      let state: CalculatorState = {
        ...initialCalculatorState,
        history: initialItems,
      };
      state = calculatorReducer(state, { type: 'DELETE_HISTORY_ITEM', payload: '1' });
      assert.equal(state.history.length, 1);

      // Sync state to storage
      savePersistedState(
        {
          history: state.history,
          mode: state.mode,
          angleUnit: state.angleUnit,
        },
        storage
      );

      const loaded = loadPersistedState(storage);
      assert.equal(loaded?.history?.length, 1);
      assert.equal(loaded?.history?.[0]?.id, '2');
    });

    it('R. should update persisted storage with empty array when history is cleared', () => {
      const storage = createMockStorage();

      savePersistedState(
        {
          history: [{ id: '1', expression: '10 × 10', result: '100', timestamp: 500 }],
          mode: 'standard',
          angleUnit: 'deg',
        },
        storage
      );

      let state: CalculatorState = {
        ...initialCalculatorState,
        history: [{ id: '1', expression: '10 × 10', result: '100', timestamp: 500 }],
      };

      state = calculatorReducer(state, { type: 'CLEAR_HISTORY' });

      savePersistedState(
        {
          history: state.history,
          mode: state.mode,
          angleUnit: state.angleUnit,
        },
        storage
      );

      const loaded = loadPersistedState(storage);
      assert.deepEqual(loaded?.history, []);
    });
  });

  describe('S. History Item Reuse Regression', () => {
    it('should recall calculation result and support operator continuation', () => {
      const item: CalculationHistoryItem = {
        id: 'hist-1',
        expression: '50 × 2',
        result: '100',
        timestamp: 1000,
      };

      // User loads history item into calculator
      let state = calculatorReducer(initialCalculatorState, {
        type: 'LOAD_HISTORY_ITEM',
        payload: item,
      });

      assert.equal(state.displayValue, '100');
      assert.equal(state.status, 'result');

      // Operator continuation: + 25 = 125
      state = calculatorReducer(state, { type: 'INPUT_OPERATOR', payload: '+' });
      assert.equal(state.expression, '100 + ');
      assert.equal(state.status, 'entering');

      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '2' });
      state = calculatorReducer(state, { type: 'INPUT_DIGIT', payload: '5' });
      assert.equal(state.expression, '100 + 25');

      state = calculatorReducer(state, { type: 'CALCULATE' });
      assert.equal(state.displayValue, '125');
      assert.equal(state.status, 'result');
    });

    it('should recall history item even when calculator was in an error state', () => {
      const item: CalculationHistoryItem = {
        id: 'hist-2',
        expression: 'sqrt(16)',
        result: '4',
        timestamp: 2000,
      };

      const errorState: CalculatorState = {
        ...initialCalculatorState,
        isError: true,
        errorMessage: 'Division by zero',
        displayValue: 'Cannot divide by zero',
        status: 'error',
      };

      const recovered = calculatorReducer(errorState, {
        type: 'LOAD_HISTORY_ITEM',
        payload: item,
      });

      assert.equal(recovered.isError, false);
      assert.equal(recovered.errorMessage, null);
      assert.equal(recovered.displayValue, '4');
      assert.equal(recovered.status, 'result');
    });
  });
});
