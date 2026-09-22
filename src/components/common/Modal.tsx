import React, { useEffect } from 'react';

export interface ModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: React.ReactNode;
}

/**
 * Accessible Modal dialog component adhering to Calcx-Pro design tokens.
 */
export const Modal: React.FC<ModalProps> = React.memo(({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-calc-lg bg-calc-surface border border-calc-border-strong p-6 shadow-calc-shell text-calc-text-primary">
        <div className="flex items-center justify-between pb-4 border-b border-calc-border-subtle">
          <h2 id="modal-title" className="text-base font-semibold text-calc-text-primary tracking-wide">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-calc-sm min-w-[44px] min-h-[44px] flex items-center justify-center p-1.5 text-calc-text-muted hover:bg-calc-surface-secondary hover:text-calc-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calc-accent"
          >
            ✕
          </button>
        </div>
        <div className="pt-4 text-calc-text-secondary text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';
