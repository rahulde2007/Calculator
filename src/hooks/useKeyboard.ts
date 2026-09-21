import { useEffect } from 'react';
import type { CalculatorAction } from '../types/calculator';

export interface UseKeyboardOptions {
  readonly enabled?: boolean | undefined;
  readonly onAction?: ((action: CalculatorAction) => void) | undefined;
}

/**
 * Custom React hook for capturing keyboard and NumPad shortcuts.
 * Dispatches actions to calculatorStore while ignoring input fields and form elements.
 */
export function useKeyboard({ enabled = true, onAction }: UseKeyboardOptions = {}): void {
  useEffect(() => {
    if (!enabled || !onAction) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      // Prevent shortcut handling if user is typing in a text field or form input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        return;
      }

      const key = event.key;

      // 1. Number keys (0-9)
      if (key >= '0' && key <= '9') {
        event.preventDefault();
        onAction({ type: 'INPUT_DIGIT', payload: key });
        return;
      }

      // 2. Decimal point (. or ,)
      if (key === '.' || key === ',') {
        event.preventDefault();
        onAction({ type: 'INPUT_DECIMAL' });
        return;
      }

      // 3. Mathematical operators
      if (key === '+') {
        event.preventDefault();
        onAction({ type: 'INPUT_OPERATOR', payload: '+' });
        return;
      }

      if (key === '-') {
        event.preventDefault();
        onAction({ type: 'INPUT_OPERATOR', payload: '-' });
        return;
      }

      if (key === '*' || key === 'x' || key === 'X') {
        event.preventDefault();
        onAction({ type: 'INPUT_OPERATOR', payload: '×' });
        return;
      }

      if (key === '/') {
        event.preventDefault();
        onAction({ type: 'INPUT_OPERATOR', payload: '÷' });
        return;
      }

      if (key === '%') {
        event.preventDefault();
        onAction({ type: 'INPUT_OPERATOR', payload: '%' });
        return;
      }

      if (key === '^') {
        event.preventDefault();
        onAction({ type: 'INPUT_OPERATOR', payload: '^' });
        return;
      }

      if (key === '!') {
        event.preventDefault();
        onAction({ type: 'INPUT_POSTFIX', payload: '!' });
        return;
      }

      // 4. Parentheses
      if (key === '(') {
        event.preventDefault();
        onAction({ type: 'INPUT_PARENTHESIS', payload: '(' });
        return;
      }

      if (key === ')') {
        event.preventDefault();
        onAction({ type: 'INPUT_PARENTHESIS', payload: ')' });
        return;
      }

      // 5. Calculate / Equals
      if (key === 'Enter' || key === '=') {
        event.preventDefault();
        onAction({ type: 'CALCULATE' });
        return;
      }

      // 6. Clear (Escape)
      if (key === 'Escape') {
        event.preventDefault();
        onAction({ type: 'CLEAR_ALL' });
        return;
      }

      // 7. Delete / Backspace
      if (key === 'Backspace') {
        event.preventDefault();
        onAction({ type: 'DELETE_BACKSPACE' });
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onAction]);
}
