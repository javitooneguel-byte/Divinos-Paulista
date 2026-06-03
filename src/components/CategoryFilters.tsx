/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CategoryConfig } from "../types";

interface CategoryFiltersProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories: CategoryConfig[];
}

export function CategoryFilters({ selectedCategory, onSelectCategory, categories }: CategoryFiltersProps) {
  // Filter active custom categories
  const activeCategories = categories.filter((c) => c.isActive !== false);

  return (
    <div className="w-full bg-white border-y border-stone-200/80 sticky top-0 z-30 shadow-sm shadow-stone-100">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center overflow-x-auto no-scrollbar py-3.5 gap-2.5">
          <button
            key="all-filter-btn"
            onClick={() => onSelectCategory("all")}
            className={`whitespace-nowrap px-4 py-2.5 rounded-full text-xs font-bold transition duration-150 uppercase tracking-wider cursor-pointer select-none border ${
              selectedCategory === "all"
                ? "bg-brand-red text-white border-brand-red shadow-md shadow-brand-red/10"
                : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200/60"
            }`}
          >
            Todos
          </button>

          {activeCategories.map((category) => {
            const isActive = selectedCategory === category.name;
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.name)}
                className={`whitespace-nowrap px-4 py-2.5 rounded-full text-xs font-bold transition duration-150 uppercase tracking-wider cursor-pointer select-none border ${
                  isActive
                    ? "bg-brand-red text-white border-brand-red shadow-md shadow-brand-red/10"
                    : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200/60"
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
