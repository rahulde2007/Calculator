import React, { useState, useEffect } from 'react';
import { Calculator } from './components/calculator/Calculator';
import { HistoryPanel } from './components/history/HistoryPanel';
import { UnitConverter } from './components/converter/UnitConverter';
import { Modal } from './components/common/Modal';
import { IconButton } from './components/common/IconButton';
import { SettingsModal } from './components/settings/SettingsModal';
import { useCalculator } from './hooks/useCalculator';
import { useTheme } from './hooks/useTheme';

/**
 * Calcx-Pro Root Shell.
 * Integrates the fully interactive calculation engine with the UI shell,
 * real-time calculation history, physical keyboard support, and theme/settings management.
 */
export const App: React.FC = () => {
  const calculator = useCalculator();
  useTheme(calculator.state.themePreference);

  const [isKeyboardHelpOpen, setIsKeyboardHelpOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isConverterOpen, setIsConverterOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isHistoryOpen) setIsHistoryOpen(false);
        if (isConverterOpen) setIsConverterOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHistoryOpen, isConverterOpen]);

  return (
    <div className="min-h-screen bg-calc-bg text-calc-text-primary flex flex-col justify-between selection:bg-calc-accent/30 selection:text-white transition-colors duration-200">
      {/* Top Application Bar */}
      <header className="border-b border-calc-border-subtle bg-calc-surface/40 backdrop-blur-xl sticky top-0 z-30 px-3 xs:px-4 sm:px-8 py-2.5 sm:py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-calc-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-calc-button text-white shrink-0"
              role="img"
              aria-label="Calcx-Pro Calculator logo"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <rect width="16" height="20" x="4" y="2" rx="2" />
                <line x1="8" x2="16" y1="6" y2="6" />
                <line x1="16" x2="16" y1="14" y2="18" />
                <path d="M16 10h.01" />
                <path d="M12 10h.01" />
                <path d="M8 10h.01" />
                <path d="M12 14h.01" />
                <path d="M8 14h.01" />
                <path d="M12 18h.01" />
                <path d="M8 18h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-calc-text-primary">
                Calcx<span className="text-calc-accent">Pro</span>
              </h1>
              <p className="text-[11px] text-calc-text-secondary">Precision Engineering Calculator</p>
            </div>
          </div>

          {/* Right Action Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            <IconButton
              ariaLabel={
                calculator.state.history.length > 0
                  ? `Calculation History (${calculator.state.history.length} item${calculator.state.history.length === 1 ? '' : 's'})`
                  : 'Calculation History'
              }
              title="Calculation History"
              variant={isHistoryOpen ? 'active' : 'default'}
              size="sm"
              onClick={() => setIsHistoryOpen((prev) => !prev)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-xs font-medium px-1 hidden sm:inline">History</span>
              {calculator.state.history.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-calc-accent/20 text-calc-accent font-bold ml-0.5">
                  {calculator.state.history.length}
                </span>
              )}
            </IconButton>

            <IconButton
              ariaLabel="Keyboard Shortcuts Information"
              title="Keyboard Shortcuts"
              variant="default"
              size="sm"
              onClick={() => setIsKeyboardHelpOpen(true)}
            >
              <span className="text-xs font-medium px-1 hidden sm:inline">Shortcuts</span>
              <span className="text-xs font-medium px-1 sm:hidden">⌨</span>
            </IconButton>

            <IconButton
              ariaLabel="Calculator Settings"
              title="Calculator Settings"
              variant="default"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-xs font-medium px-1 hidden sm:inline">Settings</span>
            </IconButton>
          </div>
        </div>
      </header>

      {/* Main Interactive Stage */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 xs:px-4 sm:px-6 py-2.5 xs:py-3.5 sm:py-6 md:py-8 flex flex-col items-center justify-center">
        <div className="w-full flex items-center justify-center">
          {/* Main Stage: Connected Calculator Shell */}
          <section aria-label="Interactive Calculator" className="w-full flex justify-center">
            <Calculator
              calculator={calculator}
              onOpenConverter={() => setIsConverterOpen((prev) => !prev)}
              isConverterOpen={isConverterOpen}
            />
          </section>
        </div>
      </main>

      {/* Calculation History Slide-Over Drawer / Modal Overlay */}
      {isHistoryOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Calculation History"
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsHistoryOpen(false);
          }}
        >
          <div
            className="
              relative w-full max-w-full sm:max-w-md h-full bg-calc-surface border-l border-calc-border-subtle
              shadow-2xl flex flex-col p-4 sm:p-5 overflow-hidden transition-transform duration-200
            "
          >
            <HistoryPanel
              items={calculator.state.history}
              onSelectItem={(item) => {
                calculator.loadHistoryItem(item);
              }}
              onClearHistory={calculator.clearHistory}
              onDeleteItem={calculator.deleteHistoryItem}
              onClose={() => setIsHistoryOpen(false)}
              className="h-full border-0 rounded-none shadow-none p-0 bg-transparent"
            />
          </div>
        </div>
      )}

      {/* Unit Converter Overlay (Centered, matching Calculator card footprint and proportions) */}
      {isConverterOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Unit Converter"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-opacity duration-200 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsConverterOpen(false);
          }}
        >
          <div
            className="
              relative w-full max-w-[360px] xs:max-w-[390px] sm:max-w-[440px]
              rounded-calc-shell bg-calc-surface/95 border border-calc-border-subtle
              shadow-calc-shell backdrop-blur-2xl p-3.5 xs:p-4 sm:p-5 flex flex-col my-auto
              transition-all duration-200
            "
          >
            <UnitConverter
              onClose={() => setIsConverterOpen(false)}
              className="border-0 rounded-none shadow-none p-0 bg-transparent"
            />
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      <Modal
        isOpen={isKeyboardHelpOpen}
        onClose={() => setIsKeyboardHelpOpen(false)}
        title="Physical Keyboard Shortcuts"
      >
        <div className="space-y-3 text-xs text-calc-text-secondary">
          <div className="grid grid-cols-2 gap-2 text-calc-text-primary">
            <div className="p-2 rounded bg-calc-surface-secondary border border-calc-border-subtle">
              <span className="font-mono text-calc-accent font-semibold">0 – 9</span>
              <p className="text-[11px] text-calc-text-muted mt-0.5">Numeric Input / NumPad</p>
            </div>
            <div className="p-2 rounded bg-calc-surface-secondary border border-calc-border-subtle">
              <span className="font-mono text-calc-accent font-semibold">+ − * / %</span>
              <p className="text-[11px] text-calc-text-muted mt-0.5">Operators</p>
            </div>
            <div className="p-2 rounded bg-calc-surface-secondary border border-calc-border-subtle">
              <span className="font-mono text-calc-accent font-semibold">^  !</span>
              <p className="text-[11px] text-calc-text-muted mt-0.5">Power & Factorial</p>
            </div>
            <div className="p-2 rounded bg-calc-surface-secondary border border-calc-border-subtle">
              <span className="font-mono text-calc-accent font-semibold">( )</span>
              <p className="text-[11px] text-calc-text-muted mt-0.5">Parentheses Grouping</p>
            </div>
            <div className="p-2 rounded bg-calc-surface-secondary border border-calc-border-subtle">
              <span className="font-mono text-calc-accent font-semibold">Enter / =</span>
              <p className="text-[11px] text-calc-text-muted mt-0.5">Calculate Result</p>
            </div>
            <div className="p-2 rounded bg-calc-surface-secondary border border-calc-border-subtle">
              <span className="font-mono text-calc-accent font-semibold">Backspace</span>
              <p className="text-[11px] text-calc-text-muted mt-0.5">Delete Character</p>
            </div>
            <div className="p-2 rounded bg-calc-surface-secondary border border-calc-border-subtle">
              <span className="font-mono text-calc-accent font-semibold">Escape</span>
              <p className="text-[11px] text-calc-text-muted mt-0.5">All Clear (AC)</p>
            </div>
          </div>
          <p className="text-[11px] text-calc-text-muted pt-2 border-t border-calc-border-subtle">
            NumPad keys on desktop keyboards are fully supported.
          </p>
        </div>
      </Modal>

      {/* Calculator Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        themePreference={calculator.state.themePreference}
        onThemeChange={calculator.setThemePreference}
        mode={calculator.state.mode}
        onModeChange={calculator.setMode}
        angleUnit={calculator.state.angleUnit}
        onAngleUnitChange={calculator.setAngleUnit}
      />

      {/* Application Footer */}
      <footer className="border-t border-calc-border-subtle bg-calc-surface/30 py-3.5 px-4 sm:px-8 text-center text-xs text-calc-text-muted select-none">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Interactive Shunting-Yard Engine &bull; Zero `eval()` &bull; Strict TypeScript</span>
          </div>
          <span className="text-[11px] font-mono">Calcx-Pro &copy; 2026</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
