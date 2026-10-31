import React from 'react';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export type QuickFilterType = 'all' | 'popular' | 'under20' | 'with_calories';

interface MenuSearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  quickFilter: QuickFilterType;
  onQuickFilterChange: (filter: QuickFilterType) => void;
  totalResults: number;
}

export const MenuSearchAndFilter: React.FC<MenuSearchAndFilterProps> = ({
  searchQuery: _searchQuery,
  onSearchChange: _onSearchChange,
  quickFilter,
  onQuickFilterChange,
  totalResults,
}) => {
  const { isAr, currency } = useLanguage();

  return (
    <div className="space-y-4">
      {/* Quick Filter Buttons & Results Count */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-neutral-900/90 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-xs overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => onQuickFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              quickFilter === 'all'
                ? 'bg-white dark:bg-neutral-800 text-amber-600 dark:text-amber-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isAr ? 'جميع الأصناف' : 'All Items'}
          </button>
          <button
            onClick={() => onQuickFilterChange('under20')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              quickFilter === 'under20'
                ? 'bg-white dark:bg-neutral-800 text-amber-600 dark:text-amber-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
            <span>{isAr ? `أقل من 20 ${currency}` : `Under 20 ${currency}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
