import React from 'react';
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
  readonly action: (handlers: ScientificKeypadProps) => void;
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
      action: (h) => h.onParenthesisClick('('),
    },
    {
      id: 'sci-paren-close',
      label: ')',
      ariaLabel: 'Close parenthesis',
      variant: 'function',
      action: (h) => h.onParenthesisClick(')'),
    },
    {
      id: 'sci-ac',
      label: 'AC',
      ariaLabel: 'All clear',
      variant: 'danger',
      className: 'font-bold',
      action: (h) => h.onClearClick(),
    },
    {
      id: 'sci-backspace',
      label: '⌫',
      ariaLabel: 'Backspace delete',
      variant: 'action',
      action: (h) => h.onBackspaceClick(),
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
      action: (h) => h.onFunctionClick('sin'),
    },
    {
      id: 'sci-cos',
      label: 'cos',
      ariaLabel: 'Cosine',
      variant: 'function',
      className: 'text-xs sm:text-sm font-mono',
      action: (h) => h.onFunctionClick('cos'),
    },
    {
      id: 'sci-tan',
      label: 'tan',
      ariaLabel: 'Tangent',
      variant: 'function',
      className: 'text-xs sm:text-sm font-mono',
      action: (h) => h.onFunctionClick('tan'),
    },
    {
      id: 'sci-pi',
      label: 'π',
      ariaLabel: 'Pi constant',
      variant: 'function',
      className: 'font-serif italic text-base sm:text-lg',
      action: (h) => h.onConstantClick('π'),
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
      action: (h) => h.onFunctionClick('asin'),
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
      action: (h) => h.onFunctionClick('acos'),
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
      action: (h) => h.onFunctionClick('atan'),
    },
    {
      id: 'sci-e',
      label: 'e',
      ariaLabel: 'Euler constant',
      variant: 'function',
      className: 'font-serif italic text-base sm:text-lg',
      action: (h) => h.onConstantClick('e'),
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
      action: (h) => h.onFunctionClick('ln'),
    },
    {
      id: 'sci-log',
      label: 'log',
      ariaLabel: 'Base-10 logarithm',
      variant: 'function',
      className: 'text-xs sm:text-sm font-mono',
      action: (h) => h.onFunctionClick('log'),
    },
    {
      id: 'sci-sqrt',
      label: '√',
      ariaLabel: 'Square root',
      variant: 'function',
      className: 'text-base sm:text-lg',
      action: (h) => h.onFunctionClick('sqrt'),
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
      action: (h) => h.onPostfixClick('^2'),
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
      action: (h) => h.onOperatorClick('^'),
    },
    {
      id: 'sci-cbrt',
      label: '∛x',
      ariaLabel: 'Cube root',
      variant: 'function',
      className: 'text-xs sm:text-sm font-mono',
      action: (h) => h.onFunctionClick('cbrt'),
    },
    {
      id: 'sci-factorial',
      label: '!',
      ariaLabel: 'Factorial',
      variant: 'function',
      className: 'text-base sm:text-lg font-mono font-bold',
      action: (h) => h.onPostfixClick('!'),
    },
    {
      id: 'sci-modulo',
      label: '%',
      ariaLabel: 'Modulo remainder',
      variant: 'function',
      className: 'text-base sm:text-lg font-mono',
      action: (h) => h.onOperatorClick('%'),
    },
  ],

  // Row 6: 7, 8, 9, ÷
  [
    {
      id: 'sci-7',
      label: '7',
      ariaLabel: 'Seven',
      variant: 'number',
      action: (h) => h.onDigitClick('7'),
    },
    {
      id: 'sci-8',
      label: '8',
      ariaLabel: 'Eight',
      variant: 'number',
      action: (h) => h.onDigitClick('8'),
    },
    {
      id: 'sci-9',
      label: '9',
      ariaLabel: 'Nine',
      variant: 'number',
      action: (h) => h.onDigitClick('9'),
    },
    {
      id: 'sci-divide',
      label: '÷',
      ariaLabel: 'Divide',
      variant: 'operator',
      className: 'font-bold text-xl',
      action: (h) => h.onOperatorClick('÷'),
    },
  ],

  // Row 7: 4, 5, 6, ×
  [
    {
      id: 'sci-4',
      label: '4',
      ariaLabel: 'Four',
      variant: 'number',
      action: (h) => h.onDigitClick('4'),
    },
    {
      id: 'sci-5',
      label: '5',
      ariaLabel: 'Five',
      variant: 'number',
      action: (h) => h.onDigitClick('5'),
    },
    {
      id: 'sci-6',
      label: '6',
      ariaLabel: 'Six',
      variant: 'number',
      action: (h) => h.onDigitClick('6'),
    },
    {
      id: 'sci-multiply',
      label: '×',
      ariaLabel: 'Multiply',
      variant: 'operator',
      className: 'font-bold text-xl',
      action: (h) => h.onOperatorClick('×'),
    },
  ],

  // Row 8: 1, 2, 3, −
  [
    {
      id: 'sci-1',
      label: '1',
      ariaLabel: 'One',
      variant: 'number',
      action: (h) => h.onDigitClick('1'),
    },
    {
      id: 'sci-2',
      label: '2',
      ariaLabel: 'Two',
      variant: 'number',
      action: (h) => h.onDigitClick('2'),
    },
    {
      id: 'sci-3',
      label: '3',
      ariaLabel: 'Three',
      variant: 'number',
      action: (h) => h.onDigitClick('3'),
    },
    {
      id: 'sci-subtract',
      label: '−',
      ariaLabel: 'Subtract',
      variant: 'operator',
      className: 'font-bold text-xl',
      action: (h) => h.onOperatorClick('-'),
    },
  ],

  // Row 9: 0, ., =, +
  [
    {
      id: 'sci-0',
      label: '0',
      ariaLabel: 'Zero',
      variant: 'number',
      action: (h) => h.onDigitClick('0'),
    },
    {
      id: 'sci-decimal',
      label: '.',
      ariaLabel: 'Decimal point',
      variant: 'number',
      className: 'font-bold text-xl',
      action: (h) => h.onDecimalClick(),
    },
    {
      id: 'sci-equals',
      label: '=',
      ariaLabel: 'Calculate result',
      variant: 'equals',
      className: 'font-bold text-xl',
      action: (h) => h.onEqualClick(),
    },
    {
      id: 'sci-add',
      label: '+',
      ariaLabel: 'Add',
      variant: 'operator',
      className: 'font-bold text-xl',
      action: (h) => h.onOperatorClick('+'),
    },
  ],
];

/**
 * Data-driven, accessible Scientific Keypad component.
 * 4-column x 9-row layout integrating functions, constants, roots, powers,
 * factorials, and standard arithmetic keys with responsive touch targets.
 */
export const ScientificKeypad: React.FC<ScientificKeypadProps> = (props) => {
  return (
    <div
      role="group"
      aria-label="Scientific Calculator Keypad"
      className="flex flex-col gap-1 xs:gap-1.5 sm:gap-1.5 w-full"
    >
      {SCIENTIFIC_KEYPAD_ROWS.map((row, rowIndex) => (
        <div key={`sci-row-${rowIndex}`} className="grid grid-cols-4 gap-1 xs:gap-1.5 sm:gap-1.5 w-full">
          {row.map((btn) => {
            const hasCustomText = Boolean(btn.className && /\btext-/.test(btn.className));
            const defaultTextClass = hasCustomText ? '' : 'text-base sm:text-lg';
            return (
              <CalculatorButton
                key={btn.id}
                id={btn.id}
                label={btn.label}
                ariaLabel={btn.ariaLabel}
                variant={btn.variant}
                className={`h-9 xs:h-[38px] sm:h-10 md:h-11 ${defaultTextClass} ${btn.className ?? ''}`}
                onClick={() => btn.action(props)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};
