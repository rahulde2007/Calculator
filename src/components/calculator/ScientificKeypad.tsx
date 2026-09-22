import React, { useMemo } from 'react';
import type { OperatorSymbol, ButtonVariant } from '../../types/calculator';
import { CalculatorButton } from './CalculatorButton';

export interface ScientificKeypadProps {
  readonly onDigitClick: (digit: string) => void;
  readonly onOperatorClick: (op: OperatorSymbol) => void;
  readonly onDecimalClick: () => void;
  readonly onParenthesisClick: (paren: '(' | ')') => void;
  readonly onFunctionClick: (fn: string) => void;
  readonly onConstantClick: (constant: 'π' | 'e') => void;
  readonly onPostfixClick: (postfix: '!' | '^2') => void;
  readonly onClearClick: () => void;
  readonly onEqualClick: () => void;
  readonly onBackspaceClick: () => void;
}

interface ScientificKeyConfig {
  readonly id: string;
  readonly label: string | React.ReactNode;
  readonly ariaLabel: string;
  readonly variant: ButtonVariant;
  readonly className?: string | undefined;
}

/**
 * 4-column x 9-row data-driven scientific keypad button configurations.
 */
const SCIENTIFIC_KEYPAD_ROWS: readonly ScientificKeyConfig[][] = [
  // Row 1: Parentheses, All Clear, Backspace
  [
    {
      id: 'sci-paren-open',
      label: '(',
      ariaLabel: 'Open parenthesis',
      variant: 'function',
    },
    {
      id: 'sci-paren-close',
      label: ')',
      ariaLabel: 'Close parenthesis',
      variant: 'function',
    },
    {
      id: 'sci-ac',
      label: 'AC',
      ariaLabel: 'All clear',
      variant: 'danger',
      className: 'font-bold',
    },
    {
      id: 'sci-backspace',
      label: '⌫',
      ariaLabel: 'Backspace delete',
      variant: 'action',
    },
  ],

  // Row 2: Basic Trigonometry & Pi
  [
    {
      id: 'sci-sin',
      label: 'sin',
      ariaLabel: 'Sine',
      variant: 'function',
      className: 'text-xs sm:text-sm font-mono',
    },
    {
      id: 'sci-cos',
      label: 'cos',
      ariaLabel: 'Cosine',
      variant: 'function',
      className: 'text-xs sm:text-sm font-mono',
    },
    {
      id: 'sci-tan',
      label: 'tan',
      ariaLabel: 'Tangent',
      variant: 'function',
      className: 'text-xs sm:text-sm font-mono',
    },
    {
      id: 'sci-pi',
      label: 'π',
      ariaLabel: 'Pi constant',
      variant: 'function',
      className: 'font-serif italic text-base sm:text-lg',
    },
  ],

  // Row 3: Inverse Trigonometry & Euler's number
  [
    {
      id: 'sci-asin',
      label: (
        <span>
          sin<sup className="text-[10px] sm:text-xs font-mono ml-0.5">−1</sup>
        </span>
      ),
      ariaLabel: 'Inverse sine',
      variant: 'function',
      className: 'text-xs sm:text-sm',
    },
    {
      id: 'sci-acos',
      label: (
        <span>
          cos<sup className="text-[10px] sm:text-xs font-mono ml-0.5">−1</sup>
        </span>
      ),
      ariaLabel: 'Inverse cosine',
      variant: 'function',
      className: 'text-xs sm:text-sm',
    },
    {
      id: 'sci-atan',
      label: (
        <span>
          tan<sup className="text-[10px] sm:text-xs font-mono ml-0.5">−1</sup>
        </span>
      ),
      ariaLabel: 'Inverse tangent',
      variant: 'function',
      className: 'text-xs sm:text-sm',
    },
    {
      id: 'sci-e',
      label: 'e',
      ariaLabel: 'Euler constant',
      variant: 'function',
      className: 'font-serif italic text-base sm:text-lg',
    },
  ],

  // Row 4: Logarithms, Square Root, Square
  [
    {
      id: 'sci-ln',
      label: 'ln',
      ariaLabel: 'Natural logarithm',
      variant: 'function',
      className: 'text-xs sm:text-sm font-mono',
    },
    {
      id: 'sci-log',
      label: 'log',
      ariaLabel: 'Base-10 logarithm',
      variant: 'function',
      className: 'text-xs sm:text-sm font-mono',
    },
    {
      id: 'sci-sqrt',
      label: '√',
      ariaLabel: 'Square root',
      variant: 'function',
      className: 'text-base sm:text-lg',
    },
    {
      id: 'sci-square',
      label: (
        <span>
          x<sup className="text-[10px] sm:text-xs font-mono ml-0.5">2</sup>
        </span>
      ),
      ariaLabel: 'Square',
      variant: 'function',
      className: 'text-xs sm:text-sm font-mono',
    },
  ],

  // Row 5: Power, Cube Root, Factorial, Modulo
  [
    {
      id: 'sci-power',
      label: (
        <span>
          x<sup className="text-[10px] sm:text-xs font-mono ml-0.5">y</sup>
        </span>
      ),
      ariaLabel: 'Power',
      variant: 'function',
      className: 'text-xs sm:text-sm font-mono',
    },
    {
      id: 'sci-cbrt',
      label: '∛x',
      ariaLabel: 'Cube root',
      variant: 'function',
      className: 'text-xs sm:text-sm font-mono',
    },
    {
      id: 'sci-factorial',
      label: '!',
      ariaLabel: 'Factorial',
      variant: 'function',
      className: 'text-base sm:text-lg font-mono font-bold',
    },
    {
      id: 'sci-modulo',
      label: '%',
      ariaLabel: 'Modulo remainder',
      variant: 'function',
      className: 'text-base sm:text-lg font-mono',
    },
  ],

  // Row 6: 7, 8, 9, ÷
  [
    {
      id: 'sci-7',
      label: '7',
      ariaLabel: 'Seven',
      variant: 'number',
    },
    {
      id: 'sci-8',
      label: '8',
      ariaLabel: 'Eight',
      variant: 'number',
    },
    {
      id: 'sci-9',
      label: '9',
      ariaLabel: 'Nine',
      variant: 'number',
    },
    {
      id: 'sci-divide',
      label: '÷',
      ariaLabel: 'Divide',
      variant: 'operator',
      className: 'font-bold text-xl',
    },
  ],

  // Row 7: 4, 5, 6, ×
  [
    {
      id: 'sci-4',
      label: '4',
      ariaLabel: 'Four',
      variant: 'number',
    },
    {
      id: 'sci-5',
      label: '5',
      ariaLabel: 'Five',
      variant: 'number',
    },
    {
      id: 'sci-6',
      label: '6',
      ariaLabel: 'Six',
      variant: 'number',
    },
    {
      id: 'sci-multiply',
      label: '×',
      ariaLabel: 'Multiply',
      variant: 'operator',
      className: 'font-bold text-xl',
    },
  ],

  // Row 8: 1, 2, 3, −
  [
    {
      id: 'sci-1',
      label: '1',
      ariaLabel: 'One',
      variant: 'number',
    },
    {
      id: 'sci-2',
      label: '2',
      ariaLabel: 'Two',
      variant: 'number',
    },
    {
      id: 'sci-3',
      label: '3',
      ariaLabel: 'Three',
      variant: 'number',
    },
    {
      id: 'sci-subtract',
      label: '−',
      ariaLabel: 'Subtract',
      variant: 'operator',
      className: 'font-bold text-xl',
    },
  ],

  // Row 9: 0, ., =, +
  [
    {
      id: 'sci-0',
      label: '0',
      ariaLabel: 'Zero',
      variant: 'number',
    },
    {
      id: 'sci-decimal',
      label: '.',
      ariaLabel: 'Decimal point',
      variant: 'number',
      className: 'font-bold text-xl',
    },
    {
      id: 'sci-equals',
      label: '=',
      ariaLabel: 'Calculate result',
      variant: 'equals',
      className: 'font-bold text-xl',
    },
    {
      id: 'sci-add',
      label: '+',
      ariaLabel: 'Add',
      variant: 'operator',
      className: 'font-bold text-xl',
    },
  ],
];

/**
 * Data-driven, memoized Scientific Keypad component.
 * 4-column x 9-row layout integrating functions, constants, roots, powers,
 * factorials, and standard arithmetic keys with reference-stable callbacks.
 */
export const ScientificKeypad: React.FC<ScientificKeypadProps> = React.memo(({
  onDigitClick,
  onOperatorClick,
  onDecimalClick,
  onParenthesisClick,
  onFunctionClick,
  onConstantClick,
  onPostfixClick,
  onClearClick,
  onEqualClick,
  onBackspaceClick,
}) => {
  const handlers = useMemo<Record<string, () => void>>(() => ({
    'sci-paren-open': () => onParenthesisClick('('),
    'sci-paren-close': () => onParenthesisClick(')'),
    'sci-ac': () => onClearClick(),
    'sci-backspace': () => onBackspaceClick(),
    'sci-sin': () => onFunctionClick('sin'),
    'sci-cos': () => onFunctionClick('cos'),
    'sci-tan': () => onFunctionClick('tan'),
    'sci-pi': () => onConstantClick('π'),
    'sci-asin': () => onFunctionClick('asin'),
    'sci-acos': () => onFunctionClick('acos'),
    'sci-atan': () => onFunctionClick('atan'),
    'sci-e': () => onConstantClick('e'),
    'sci-ln': () => onFunctionClick('ln'),
    'sci-log': () => onFunctionClick('log'),
    'sci-sqrt': () => onFunctionClick('sqrt'),
    'sci-square': () => onPostfixClick('^2'),
    'sci-power': () => onOperatorClick('^'),
    'sci-cbrt': () => onFunctionClick('cbrt'),
    'sci-factorial': () => onPostfixClick('!'),
    'sci-modulo': () => onOperatorClick('%'),
    'sci-7': () => onDigitClick('7'),
    'sci-8': () => onDigitClick('8'),
    'sci-9': () => onDigitClick('9'),
    'sci-divide': () => onOperatorClick('÷'),
    'sci-4': () => onDigitClick('4'),
    'sci-5': () => onDigitClick('5'),
    'sci-6': () => onDigitClick('6'),
    'sci-multiply': () => onOperatorClick('×'),
    'sci-1': () => onDigitClick('1'),
    'sci-2': () => onDigitClick('2'),
    'sci-3': () => onDigitClick('3'),
    'sci-subtract': () => onOperatorClick('-'),
    'sci-0': () => onDigitClick('0'),
    'sci-decimal': () => onDecimalClick(),
    'sci-equals': () => onEqualClick(),
    'sci-add': () => onOperatorClick('+'),
  }), [
    onDigitClick,
    onOperatorClick,
    onDecimalClick,
    onParenthesisClick,
    onFunctionClick,
    onConstantClick,
    onPostfixClick,
    onClearClick,
    onEqualClick,
    onBackspaceClick,
  ]);

  return (
    <div
      role="group"
      aria-label="Scientific Calculator Keypad"
      className="flex flex-col gap-1 xs:gap-1.5 w-full flex-1 min-h-0"
    >
      {SCIENTIFIC_KEYPAD_ROWS.map((row, rowIndex) => (
        <div
          key={`sci-row-${rowIndex}`}
          className="grid grid-cols-4 gap-1 xs:gap-1.5 w-full flex-1 min-h-0"
          style={{ gridAutoRows: '1fr' }}
        >
          {row.map((btn) => (
            <CalculatorButton
              key={btn.id}
              id={btn.id}
              label={btn.label}
              ariaLabel={btn.ariaLabel}
              variant={btn.variant}
              className={`h-full min-h-0 text-sm ${btn.className ?? ''}`}
              onClick={handlers[btn.id]}
            />
          ))}
        </div>
      ))}
    </div>
  );
});

ScientificKeypad.displayName = 'ScientificKeypad';
