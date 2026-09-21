import React from 'react';
import { Modal } from '../common/Modal';
import type {
  ThemePreference,
  CalculatorMode,
  AngleUnit,
} from '../../types/calculator';

export interface SettingsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly themePreference: ThemePreference;
  readonly onThemeChange: (theme: ThemePreference) => void;
  readonly mode: CalculatorMode;
  readonly onModeChange: (mode: CalculatorMode) => void;
  readonly angleUnit: AngleUnit;
  readonly onAngleUnitChange: (unit: AngleUnit) => void;
}

const THEME_OPTIONS: readonly { readonly value: ThemePreference; readonly label: string; readonly desc: string }[] = [
  { value: 'system', label: 'System', desc: 'Auto' },
  { value: 'light', label: 'Light', desc: 'Clean' },
  { value: 'dark', label: 'Dark', desc: 'Cosmic' },
];

const MODE_OPTIONS: readonly { readonly value: CalculatorMode; readonly label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'scientific', label: 'Scientific' },
];

const ANGLE_OPTIONS: readonly { readonly value: AngleUnit; readonly label: string; readonly symbol: string }[] = [
  { value: 'deg', label: 'Degrees', symbol: 'DEG' },
  { value: 'rad', label: 'Radians', symbol: 'RAD' },
  { value: 'grad', label: 'Gradians', symbol: 'GRAD' },
];

/**
 * Accessible, compact Settings dialog controlling appearance and calculation parameters.
 * Directly mutates canonical calculator preferences with zero parallel state.
 */
export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  themePreference,
  onThemeChange,
  mode,
  onModeChange,
  angleUnit,
  onAngleUnitChange,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Calculator Settings">
      <div className="space-y-6 pt-1">
        {/* Appearance / Theme */}
        <section aria-labelledby="settings-theme-heading">
          <div className="flex items-center justify-between mb-2">
            <h3
              id="settings-theme-heading"
              className="text-xs font-semibold uppercase tracking-wider text-calc-text-secondary"
            >
              Appearance
            </h3>
            <span className="text-[11px] text-calc-text-muted">
              Active: <strong className="text-calc-text-primary capitalize">{themePreference}</strong>
            </span>
          </div>
          <div
            role="radiogroup"
            aria-labelledby="settings-theme-heading"
            className="grid grid-cols-3 gap-2"
          >
            {THEME_OPTIONS.map((opt) => {
              const isSelected = themePreference === opt.value;
              return (
                <button
                  key={opt.value}
                  id={`theme-option-${opt.value}`}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onThemeChange(opt.value)}
                  className={`min-h-[44px] flex flex-col items-center justify-center px-3 py-2 rounded-calc-md border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calc-accent ${
                    isSelected
                      ? 'bg-calc-accent text-white border-calc-accent shadow-calc-button'
                      : 'bg-calc-surface-secondary text-calc-text-secondary border-calc-border-subtle hover:bg-calc-surface-elevated hover:text-calc-text-primary'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-calc-text-muted'}`}>
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Calculator Mode */}
        <section aria-labelledby="settings-mode-heading">
          <div className="flex items-center justify-between mb-2">
            <h3
              id="settings-mode-heading"
              className="text-xs font-semibold uppercase tracking-wider text-calc-text-secondary"
            >
              Keypad Mode
            </h3>
            <span className="text-[11px] text-calc-text-muted">
              Active: <strong className="text-calc-text-primary capitalize">{mode}</strong>
            </span>
          </div>
          <div
            role="radiogroup"
            aria-labelledby="settings-mode-heading"
            className="grid grid-cols-2 gap-2"
          >
            {MODE_OPTIONS.map((opt) => {
              const isSelected = mode === opt.value;
              return (
                <button
                  key={opt.value}
                  id={`mode-option-${opt.value}`}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onModeChange(opt.value)}
                  className={`min-h-[44px] flex items-center justify-center px-4 py-2 rounded-calc-md border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calc-accent ${
                    isSelected
                      ? 'bg-calc-accent text-white border-calc-accent shadow-calc-button'
                      : 'bg-calc-surface-secondary text-calc-text-secondary border-calc-border-subtle hover:bg-calc-surface-elevated hover:text-calc-text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Angle Unit */}
        <section aria-labelledby="settings-angle-heading">
          <div className="flex items-center justify-between mb-2">
            <h3
              id="settings-angle-heading"
              className="text-xs font-semibold uppercase tracking-wider text-calc-text-secondary"
            >
              Angle Unit (Trigonometry)
            </h3>
            <span className="text-[11px] text-calc-text-muted">
              Active: <strong className="text-calc-text-primary uppercase">{angleUnit}</strong>
            </span>
          </div>
          <div
            role="radiogroup"
            aria-labelledby="settings-angle-heading"
            className="grid grid-cols-3 gap-2"
          >
            {ANGLE_OPTIONS.map((opt) => {
              const isSelected = angleUnit === opt.value;
              return (
                <button
                  key={opt.value}
                  id={`angle-option-${opt.value}`}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onAngleUnitChange(opt.value)}
                  className={`min-h-[44px] flex flex-col items-center justify-center px-2 py-2 rounded-calc-md border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calc-accent ${
                    isSelected
                      ? 'bg-calc-accent text-white border-calc-accent shadow-calc-button'
                      : 'bg-calc-surface-secondary text-calc-text-secondary border-calc-border-subtle hover:bg-calc-surface-elevated hover:text-calc-text-primary'
                  }`}
                >
                  <span>{opt.symbol}</span>
                  <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-calc-text-muted'}`}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Persistence Contract Informational Badge */}
        <div className="rounded-calc-sm border border-calc-border-subtle bg-calc-surface-secondary/60 p-3 text-[11px] text-calc-text-muted leading-relaxed">
          Preferences (theme, mode, angle unit) and calculation history automatically persist in your browser. Memory registers (MC/MR/M+/M−) are strictly session-only.
        </div>

        {/* Done / Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2.5 rounded-calc-md bg-calc-accent hover:bg-calc-accent-hover text-white text-xs font-semibold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calc-accent"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
