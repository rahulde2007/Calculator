import React from 'react';
import { Display } from './Display';
import { Keypad } from './Keypad';
import { ScientificKeypad } from './ScientificKeypad';
import { AngleUnitSelector } from './AngleUnitSelector';
import { MemoryControls } from './MemoryControls';
import { useCalculator, type UseCalculatorReturn } from '../../hooks/useCalculator';
import { useKeyboard } from '../../hooks/useKeyboard';

export interface CalculatorProps {
  readonly calculator?: UseCalculatorReturn | undefined;
}

/**
 * Interactive Calculator Container Component.
 * Binds the reactive state machine and keyboard inputs to Display, Keypad, and ScientificKeypad.
 */
export const Calculator: React.FC<CalculatorProps> = ({ calculator: externalCalculator }) => {
  const defaultCalculator = useCalculator();
  const calc = externalCalculator ?? defaultCalculator;
  const {
    state,
    dispatch,
    inputDigit,
    inputOperator,
    inputDecimal,
    inputParenthesis,
    inputFunction,
    inputConstant,
    inputPostfix,
    clearAll,
    deleteBackspace,
    calculate,
    setMode,
    setAngleUnit,
    memoryClear,
    memoryRecall,
    memoryAdd,
    memorySubtract,
  } = calc;

  // Listen to physical keyboard events
  useKeyboard({ onAction: dispatch });

  const isScientific = state.mode === 'scientific';

  return (
    <div
      className={`
        relative w-full max-w-[360px] xs:max-w-[390px] sm:max-w-[440px]
        mx-auto rounded-calc-shell bg-calc-surface/95
        border border-calc-border-subtle
        shadow-calc-shell backdrop-blur-2xl
        flex flex-col transition-all duration-200 ease-out
        ${isScientific
          ? 'p-2.5 xs:p-3 sm:p-4.5 gap-2 xs:gap-2.5 sm:gap-3'
          : 'p-4 sm:p-5 gap-3.5 sm:gap-4'}
      `}
    >
      {/* Decorative top ambient rim highlight */}
      <div className="absolute -top-px left-12 right-12 h-px bg-gradient-to-r from-transparent via-calc-accent/40 to-transparent pointer-events-none" />

      {/* Header / Utility Bar */}
      <header className="flex items-center justify-between px-1 select-none">
        {/* Brand Beacon */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold tracking-wider text-calc-text-primary uppercase">
            Calcx<span className="text-calc-accent ml-0.5">Pro</span>
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div
          role="tablist"
          aria-label="Calculator Modes"
          className="flex items-center p-0.5 rounded-lg bg-calc-surface-secondary border border-calc-border-subtle"
        >
          <button
            type="button"
            role="tab"
            aria-selected={state.mode === 'standard'}
            onClick={() => setMode('standard')}
            className={`
              min-h-[36px] px-3 py-1 text-[11px] font-medium rounded-md transition-all duration-150 flex items-center justify-center
              ${state.mode === 'standard'
                ? 'bg-calc-accent text-white shadow-sm font-semibold'
                : 'text-calc-text-secondary hover:text-calc-text-primary'}
            `}
          >
            Standard
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={state.mode === 'scientific'}
            onClick={() => setMode('scientific')}
            className={`
              min-h-[36px] px-3 py-1 text-[11px] font-medium rounded-md transition-all duration-150 flex items-center justify-center
              ${state.mode === 'scientific'
                ? 'bg-calc-accent text-white shadow-sm font-semibold'
                : 'text-calc-text-secondary hover:text-calc-text-primary'}
            `}
          >
            Scientific
          </button>
        </div>
      </header>

      {/* Display Area */}
      <section aria-label="Display Area" className="w-full">
        <Display
          expression={state.expression}
          value={state.displayValue}
          isError={state.isError}
          errorMessage={state.errorMessage}
          modeBadge={state.angleUnit.toUpperCase()}
          hasMemory={state.memory !== 0}
          memoryValue={state.memory}
          isCompact={isScientific}
        />
      </section>

      {/* Memory Controls (Universal in Standard & Scientific Modes) */}
      <section aria-label="Memory Controls" className="w-full">
        <MemoryControls
          hasMemory={state.memory !== 0}
          onMemoryClear={memoryClear}
          onMemoryRecall={memoryRecall}
          onMemoryAdd={() => memoryAdd()}
          onMemorySubtract={() => memorySubtract()}
          isCompact={isScientific}
        />
      </section>

      {/* Angle Unit Selector (Scientific Mode Only) */}
      {state.mode === 'scientific' && (
        <section aria-label="Angle Unit Selector" className="w-full animate-fadeIn">
          <AngleUnitSelector
            currentUnit={state.angleUnit}
            onSelectUnit={setAngleUnit}
          />
        </section>
      )}

      {/* Keypad Area */}
      <section aria-label="Keypad Area" className="w-full">
        {state.mode === 'scientific' ? (
          <ScientificKeypad
            onDigitClick={inputDigit}
            onOperatorClick={inputOperator}
            onDecimalClick={inputDecimal}
            onParenthesisClick={inputParenthesis}
            onFunctionClick={inputFunction}
            onConstantClick={inputConstant}
            onPostfixClick={inputPostfix}
            onClearClick={clearAll}
            onEqualClick={calculate}
            onBackspaceClick={deleteBackspace}
          />
        ) : (
          <Keypad
            onDigitClick={inputDigit}
            onOperatorClick={inputOperator}
            onDecimalClick={inputDecimal}
            onParenthesisClick={inputParenthesis}
            onClearClick={clearAll}
            onEqualClick={calculate}
            onBackspaceClick={deleteBackspace}
          />
        )}
      </section>

      {/* Footer status readout */}
      <div className="flex items-center justify-between px-2 pt-1 border-t border-calc-border-subtle/50 text-[10px] font-mono text-calc-text-muted">
        <span className="uppercase">
          MODE: {state.mode} &bull; STATUS: {state.status}
        </span>
        <span>ENGINE: SHUNTING-YARD</span>
      </div>
    </div>
  );
};
