import React from 'react';
import type { CategoryDefinition, CategoryId } from '../../converter/types';

export interface CategorySelectorProps {
  readonly categories: readonly CategoryDefinition[];
  readonly selectedCategoryId: CategoryId;
  readonly onSelectCategory: (id: CategoryId) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <nav
      aria-label="Unit Categories"
      className="w-full overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-calc-border-subtle"
    >
      <div className="flex items-center gap-1.5 min-w-max">
        {categories.map((cat) => {
          const isSelected = cat.id === selectedCategoryId;
          return (
            <button
              key={cat.id}
              id={`cat-tab-${cat.id}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={`converter-panel-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`
                min-h-[36px] xs:min-h-[38px] px-2.5 py-1 rounded-calc-md text-[11px] font-medium transition-all duration-150 flex items-center gap-1 select-none whitespace-nowrap
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calc-accent
                ${
                  isSelected
                    ? 'bg-calc-accent text-white shadow-calc-button font-semibold'
                    : 'bg-calc-surface-secondary text-calc-text-secondary hover:text-calc-text-primary hover:bg-calc-surface-elevated border border-calc-border-subtle'
                }
              `}
            >
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
