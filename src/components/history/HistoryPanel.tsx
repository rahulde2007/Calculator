import React, { useState } from 'react';
import type { CalculationHistoryItem } from '../../types/calculator';
import { HistoryItem } from './HistoryItem';
import { Modal } from '../common/Modal';
import { exportHistoryAsCSV } from '../../utils/exportHistory';

export interface HistoryPanelProps {
  readonly items: readonly CalculationHistoryItem[];
  readonly onSelectItem?: ((item: CalculationHistoryItem) => void) | undefined;
  readonly onClearHistory?: (() => void) | undefined;
  readonly onDeleteItem?: ((id: string) => void) | undefined;
  readonly onExportHistory?: (() => void) | undefined;
  readonly onClose?: (() => void) | undefined;
  readonly className?: string | undefined;
}

/**
 * History panel drawer component adhering to Calcx-Pro design tokens.
 * Supports individual item deletion, copy actions, RFC 4180 CSV export,
 * and a modal confirmation for clearing all history.
 */
export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  items,
  onSelectItem,
  onClearHistory,
  onDeleteItem,
  onExportHistory,
  onClose,
  className,
}) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  const handleExport = () => {
    if (items.length === 0) return;
    if (onExportHistory) {
      onExportHistory();
    } else {
      exportHistoryAsCSV(items);
    }
  };

  const handleConfirmClear = () => {
    onClearHistory?.();
    setIsConfirmModalOpen(false);
  };

  return (
    <>
      <aside
        aria-label="Calculation History"
        className={`
          w-full bg-calc-surface flex flex-col h-full
          ${className ?? 'rounded-calc-shell border border-calc-border-subtle p-4 sm:p-5 shadow-calc-shell'}
        `}
      >
        {/* Header with Title, Count Badge, Export, Clear, and Close Actions */}
        <div className="flex items-center justify-between pb-3 border-b border-calc-border-subtle mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-calc-text-secondary">
              History
            </h3>
            {items.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-calc-surface-secondary border border-calc-border-subtle text-calc-text-muted">
                {items.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExport}
              disabled={items.length === 0}
              aria-label="Export history as CSV"
              title={items.length === 0 ? 'No history to export' : 'Export history as CSV'}
              className="
                min-h-[36px] px-3 py-1.5 text-xs rounded-md font-medium transition-colors flex items-center justify-center
                bg-calc-surface-secondary text-calc-text-secondary border border-calc-border-subtle
                hover:bg-calc-surface-elevated hover:text-calc-text-primary
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calc-accent
                disabled:opacity-40 disabled:cursor-not-allowed
              "
            >
              Export
            </button>

            {/* Clear All Button */}
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(true)}
                aria-label="Clear all calculation history"
                className="
                  min-h-[36px] px-3 py-1.5 text-xs rounded-md font-medium transition-colors flex items-center justify-center
                  text-rose-400 hover:text-rose-300 hover:bg-rose-950/30
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500
                "
              >
                Clear
              </button>
            )}

            {/* Close Button */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close history panel"
                title="Close history panel"
                className="
                  min-h-[36px] min-w-[36px] p-1.5 text-xs rounded-md font-medium transition-colors flex items-center justify-center
                  text-calc-text-muted hover:text-calc-text-primary hover:bg-calc-surface-secondary
                  border border-calc-border-subtle hover:border-calc-border-strong
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calc-accent
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Calculation List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56 text-center p-4 select-none">
              <div className="w-10 h-10 rounded-full bg-calc-surface-secondary border border-calc-border-subtle flex items-center justify-center text-calc-text-muted mb-2 text-base">
                ⏱
              </div>
              <span className="text-xs font-medium text-calc-text-secondary">No calculations yet</span>
              <span className="text-[11px] text-calc-text-muted mt-1 max-w-[200px] leading-relaxed">
                Evaluations performed in standard or scientific mode will appear here.
              </span>
            </div>
          ) : (
            items.map((item) => (
              <HistoryItem
                key={item.id}
                item={item}
                onSelect={onSelectItem}
                onDelete={onDeleteItem}
              />
            ))
          )}
        </div>
      </aside>

      {/* Clear All Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Clear Calculation History"
      >
        <div className="space-y-4">
          <p className="text-xs text-calc-text-secondary leading-relaxed">
            Are you sure you want to clear all {items.length} calculation record{items.length === 1 ? '' : 's'}?
            This will permanently remove saved history. Your current calculator display, expression, and memory will not be affected.
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              autoFocus
              onClick={() => setIsConfirmModalOpen(false)}
              className="
                min-h-[44px] px-4 py-2.5 text-xs font-medium rounded-calc-md bg-calc-surface-secondary
                text-calc-text-primary border border-calc-border-subtle hover:bg-calc-surface-elevated
                transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calc-accent
              "
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmClear}
              className="
                min-h-[44px] px-4 py-2.5 text-xs font-medium rounded-calc-md bg-rose-600 text-white
                hover:bg-rose-500 transition-colors shadow-sm
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400
              "
            >
              Clear All History
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
