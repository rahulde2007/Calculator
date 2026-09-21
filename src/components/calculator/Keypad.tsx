import React from 'react';
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
  readonly action: (handlers: KeypadProps) => void;
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
    action: (h) => h.onParenthesisClick?.('('),
  },
  {
    id: 'btn-paren-close',
    label: ')',
    ariaLabel: 'Close parenthesis',
    variant: 'function',
    action: (h) => h.onParenthesisClick?.(')'),
  },
  {
    id: 'btn-modulo',
    label: '%',
    ariaLabel: 'Modulo remainder',
    variant: 'function',
    action: (h) => h.onOperatorClick?.('%'),
  },
  {
    id: 'btn-backspace',
    label: '⌫',
    ariaLabel: 'Backspace delete',
    variant: 'action',
    action: (h) => h.onBackspaceClick?.(),
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
    action: (h) => h.onClearClick?.(),
  },
  {
    id: 'btn-divide',
    label: '÷',
    ariaLabel: 'Divide',
    variant: 'operator',
    action: (h) => h.onOperatorClick?.('÷'),
  },
  {
    id: 'btn-multiply',
    label: '×',
    ariaLabel: 'Multiply',
    variant: 'operator',
    action: (h) => h.onOperatorClick?.('×'),
  },
  {
    id: 'btn-subtract',
    label: '−',
    ariaLabel: 'Subtract',
    variant: 'operator',
    action: (h) => h.onOperatorClick?.('-'),
  },

  // Row 2
  {
    id: 'btn-7',
    label: '7',
    ariaLabel: 'Seven',
    variant: 'number',
    action: (h) => h.onDigitClick?.('7'),
  },
  {
    id: 'btn-8',
    label: '8',
    ariaLabel: 'Eight',
    variant: 'number',
    action: (h) => h.onDigitClick?.('8'),
  },
  {
    id: 'btn-9',
    label: '9',
    ariaLabel: 'Nine',
    variant: 'number',
    action: (h) => h.onDigitClick?.('9'),
  },
  {
    id: 'btn-add',
    label: '+',
    ariaLabel: 'Add',
    variant: 'operator',
    action: (h) => h.onOperatorClick?.('+'),
  },

  // Row 3
  {
    id: 'btn-4',
    label: '4',
    ariaLabel: 'Four',
    variant: 'number',
    action: (h) => h.onDigitClick?.('4'),
  },
  {
    id: 'btn-5',
    label: '5',
    ariaLabel: 'Five',
    variant: 'number',
    action: (h) => h.onDigitClick?.('5'),
  },
  {
    id: 'btn-6',
    label: '6',
    ariaLabel: 'Six',
    variant: 'number',
    action: (h) => h.onDigitClick?.('6'),
  },
  {
    id: 'btn-equals',
    label: '=',
    ariaLabel: 'Calculate result',
    variant: 'equals',
    action: (h) => h.onEqualClick?.(),
  },

  // Row 4
  {
    id: 'btn-1',
    label: '1',
    ariaLabel: 'One',
    variant: 'number',
    action: (h) => h.onDigitClick?.('1'),
  },
  {
    id: 'btn-2',
    label: '2',
    ariaLabel: 'Two',
    variant: 'number',
    action: (h) => h.onDigitClick?.('2'),
  },
  {
    id: 'btn-3',
    label: '3',
    ariaLabel: 'Three',
    variant: 'number',
    action: (h) => h.onDigitClick?.('3'),
  },
  {
    id: 'btn-decimal',
    label: '.',
    ariaLabel: 'Decimal point',
    variant: 'number',
    action: (h) => h.onDecimalClick?.(),
  },

  // Row 5: Large Zero key
  {
    id: 'btn-0',
    label: '0',
    ariaLabel: 'Zero',
    variant: 'number',
    spanCols: 4,
    action: (h) => h.onDigitClick?.('0'),
  },
];

/**
 * Data-driven, accessible Keypad component.
 * Integrates utility expression controls (parentheses, modulo, backspace)
 * with the standard 4-column arithmetic grid.
 */
export const Keypad: React.FC<KeypadProps> = (props) => {
  return (
    <div role="group" aria-label="Calculator Keypad" className="flex flex-col gap-2.5 sm:gap-3 w-full">
      {/* Expression Utilities Row */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full">
        {UTILITY_BUTTONS.map((btn) => (
          <CalculatorButton
            key={btn.id}
            id={btn.id}
            label={btn.label}
            ariaLabel={btn.ariaLabel}
            variant={btn.variant}
            spanCols={btn.spanCols}
            className="h-11 sm:h-12 text-base font-mono"
            onClick={() => btn.action(props)}
          />
        ))}
      </div>

      {/* Main Arithmetic Grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full">
        {MAIN_KEYPAD_BUTTONS.map((btn) => (
          <CalculatorButton
            key={btn.id}
            id={btn.id}
            label={btn.label}
            ariaLabel={btn.ariaLabel}
            variant={btn.variant}
            spanCols={btn.spanCols}
            onClick={() => btn.action(props)}
          />
        ))}
      </div>
    </div>
  );
};
