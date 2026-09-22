import React, { useMemo } from 'react';
import type { OperatorSymbol, ButtonVariant } from '../../types/calculator';
import { CalculatorButton } from './CalculatorButton';

export interface KeypadProps {
  readonly onDigitClick?: ((digit: string) => void) | undefined;
  readonly onOperatorClick?: ((op: OperatorSymbol) => void) | undefined;
  readonly onDecimalClick?: (() => void) | undefined;
  readonly onParenthesisClick?: ((paren: '(' | ')') => void) | undefined;
  readonly onClearClick?: (() => void) | undefined;
  readonly onEqualClick?: (() => void) | undefined;
  readonly onBackspaceClick?: (() => void) | undefined;
}

interface KeyConfig {
  readonly id: string;
  readonly label: string;
  readonly ariaLabel: string;
  readonly variant: ButtonVariant;
  readonly spanCols?: number | undefined;
  readonly subLabel?: string | undefined;
}

/**
 * Top utility row for expressions (parentheses, modulo, backspace).
 */
const UTILITY_BUTTONS: readonly KeyConfig[] = [
  {
    id: 'btn-paren-open',
    label: '(',
    ariaLabel: 'Open parenthesis',
    variant: 'function',
  },
  {
    id: 'btn-paren-close',
    label: ')',
    ariaLabel: 'Close parenthesis',
    variant: 'function',
  },
  {
    id: 'btn-modulo',
    label: '%',
    ariaLabel: 'Modulo remainder',
    variant: 'function',
  },
  {
    id: 'btn-backspace',
    label: '⌫',
    ariaLabel: 'Backspace delete',
    variant: 'action',
  },
];

/**
 * Main keypad 4-column layout definitions.
 */
const MAIN_KEYPAD_BUTTONS: readonly KeyConfig[] = [
  // Row 1
  {
    id: 'btn-ac',
    label: 'AC',
    ariaLabel: 'All clear',
    variant: 'danger',
  },
  {
    id: 'btn-divide',
    label: '÷',
    ariaLabel: 'Divide',
    variant: 'operator',
  },
  {
    id: 'btn-multiply',
    label: '×',
    ariaLabel: 'Multiply',
    variant: 'operator',
  },
  {
    id: 'btn-subtract',
    label: '−',
    ariaLabel: 'Subtract',
    variant: 'operator',
  },

  // Row 2
  {
    id: 'btn-7',
    label: '7',
    ariaLabel: 'Seven',
    variant: 'number',
  },
  {
    id: 'btn-8',
    label: '8',
    ariaLabel: 'Eight',
    variant: 'number',
  },
  {
    id: 'btn-9',
    label: '9',
    ariaLabel: 'Nine',
    variant: 'number',
  },
  {
    id: 'btn-add',
    label: '+',
    ariaLabel: 'Add',
    variant: 'operator',
  },

  // Row 3
  {
    id: 'btn-4',
    label: '4',
    ariaLabel: 'Four',
    variant: 'number',
  },
  {
    id: 'btn-5',
    label: '5',
    ariaLabel: 'Five',
    variant: 'number',
  },
  {
    id: 'btn-6',
    label: '6',
    ariaLabel: 'Six',
    variant: 'number',
  },
  {
    id: 'btn-equals',
    label: '=',
    ariaLabel: 'Calculate result',
    variant: 'equals',
  },

  // Row 4
  {
    id: 'btn-1',
    label: '1',
    ariaLabel: 'One',
    variant: 'number',
  },
  {
    id: 'btn-2',
    label: '2',
    ariaLabel: 'Two',
    variant: 'number',
  },
  {
    id: 'btn-3',
    label: '3',
    ariaLabel: 'Three',
    variant: 'number',
  },
  {
    id: 'btn-decimal',
    label: '.',
    ariaLabel: 'Decimal point',
    variant: 'number',
  },

  // Row 5: Large Zero key
  {
    id: 'btn-0',
    label: '0',
    ariaLabel: 'Zero',
    variant: 'number',
    spanCols: 4,
  },
];

/**
 * Data-driven, memoized Keypad component.
 * Integrates utility expression controls with standard arithmetic grid
 * with reference-stable callbacks to eliminate re-renders during typing.
 */
export const Keypad: React.FC<KeypadProps> = React.memo(({
  onDigitClick,
  onOperatorClick,
  onDecimalClick,
  onParenthesisClick,
  onClearClick,
  onEqualClick,
  onBackspaceClick,
}) => {
  const handlers = useMemo<Record<string, () => void>>(() => ({
    'btn-paren-open': () => onParenthesisClick?.('('),
    'btn-paren-close': () => onParenthesisClick?.(')'),
    'btn-modulo': () => onOperatorClick?.('%'),
    'btn-backspace': () => onBackspaceClick?.(),
    'btn-ac': () => onClearClick?.(),
    'btn-divide': () => onOperatorClick?.('÷'),
    'btn-multiply': () => onOperatorClick?.('×'),
    'btn-subtract': () => onOperatorClick?.('-'),
    'btn-7': () => onDigitClick?.('7'),
    'btn-8': () => onDigitClick?.('8'),
    'btn-9': () => onDigitClick?.('9'),
    'btn-add': () => onOperatorClick?.('+'),
    'btn-4': () => onDigitClick?.('4'),
    'btn-5': () => onDigitClick?.('5'),
    'btn-6': () => onDigitClick?.('6'),
    'btn-equals': () => onEqualClick?.(),
    'btn-1': () => onDigitClick?.('1'),
    'btn-2': () => onDigitClick?.('2'),
    'btn-3': () => onDigitClick?.('3'),
    'btn-decimal': () => onDecimalClick?.(),
    'btn-0': () => onDigitClick?.('0'),
  }), [
    onDigitClick,
    onOperatorClick,
    onDecimalClick,
    onParenthesisClick,
    onClearClick,
    onEqualClick,
    onBackspaceClick,
  ]);

  return (
    <div role="group" aria-label="Calculator Keypad" className="flex flex-col gap-1.5 sm:gap-2 w-full flex-1 min-h-0">
      {/* Expression Utilities Row */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full shrink-0">
        {UTILITY_BUTTONS.map((btn) => (
          <CalculatorButton
            key={btn.id}
            id={btn.id}
            label={btn.label}
            ariaLabel={btn.ariaLabel}
            variant={btn.variant}
            spanCols={btn.spanCols}
            className="h-9 sm:h-10 text-base font-mono"
            onClick={handlers[btn.id]}
          />
        ))}
      </div>

      {/* Main Arithmetic Grid — flex-1 so rows grow to fill */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full flex-1 min-h-0" style={{ gridAutoRows: '1fr' }}>
        {MAIN_KEYPAD_BUTTONS.map((btn) => (
          <CalculatorButton
            key={btn.id}
            id={btn.id}
            label={btn.label}
            ariaLabel={btn.ariaLabel}
            variant={btn.variant}
            spanCols={btn.spanCols}
            className="h-full min-h-0"
            onClick={handlers[btn.id]}
          />
        ))}
      </div>
    </div>
  );
});

Keypad.displayName = 'Keypad';
