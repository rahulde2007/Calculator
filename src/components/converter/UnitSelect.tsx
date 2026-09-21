import React from 'react';
import type { UnitDefinition, UnitId } from '../../converter/types';

export interface UnitSelectProps {
  readonly id: string;
  readonly label: string;
  readonly value: UnitId;
  readonly units: readonly UnitDefinition[];
  readonly onChange: (unitId: UnitId) => void;
}

export const UnitSelect: React.FC<UnitSelectProps> = ({
  id,
  label,
  value,
  units,
  onChange,
}) => {
  // Group units if any have a group attribute
  const hasGroups = units.some((u) => u.group !== undefined);

  let content: React.ReactNode;
  if (hasGroups) {
    // Collect distinct groups
    const groups: Record<string, UnitDefinition[]> = {};
    const ungrouped: UnitDefinition[] = [];

    for (const u of units) {
      if (u.group) {
        const list = groups[u.group] ?? [];
        list.push(u);
        groups[u.group] = list;
      } else {
        ungrouped.push(u);
      }
    }

    content = (
      <>
        {Object.entries(groups).map(([groupName, groupUnits]) => (
          <optgroup key={groupName} label={groupName} className="bg-calc-surface text-calc-text-primary font-semibold">
            {groupUnits.map((u) => (
              <option key={u.id} value={u.id} className="bg-calc-surface text-calc-text-primary font-normal">
                {u.label} ({u.symbol})
              </option>
            ))}
          </optgroup>
        ))}
        {ungrouped.map((u) => (
          <option key={u.id} value={u.id} className="bg-calc-surface text-calc-text-primary font-normal">
            {u.label} ({u.symbol})
          </option>
        ))}
      </>
    );
  } else {
    content = units.map((u) => (
      <option key={u.id} value={u.id} className="bg-calc-surface text-calc-text-primary font-normal">
        {u.label} ({u.symbol})
      </option>
    ));
  }

  return (
    <div className="flex flex-col gap-1 w-full min-w-0">
      <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-wider text-calc-text-secondary">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as UnitId)}
          className="
            w-full min-h-[40px] xs:min-h-[42px] sm:min-h-[44px] px-2.5 xs:px-3 py-1.5 pr-7 xs:pr-8 rounded-calc-md border border-calc-border-subtle
            bg-calc-surface-secondary hover:bg-calc-surface-elevated text-calc-text-primary
            text-xs xs:text-sm font-medium transition-colors appearance-none cursor-pointer truncate
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calc-accent
          "
        >
          {content}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-calc-text-muted">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};
