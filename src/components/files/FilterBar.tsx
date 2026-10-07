import React from 'react';
import {
  LayoutGrid,
  List,
} from 'lucide-react';
import { FilterOptions, SortOption } from '../../types';

interface FilterBarProps {
  filters: FilterOptions;
  onChangeFilters: (updates: Partial<FilterOptions>) => void;
  viewMode: 'grid' | 'list';
  onChangeViewMode: (mode: 'grid' | 'list') => void;
  totalCount: number;
  totalBytesFormatted: string;
  categoryTitle: string;
  availableExtensions: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChangeFilters,
  viewMode,
  onChangeViewMode,
  totalCount,
  totalBytesFormatted,
  categoryTitle,
  availableExtensions,
}) => {
  const sortOptions: { id: SortOption; label: string }[] = [
    { id: 'date_desc', label: 'Newest First' },
    { id: 'date_asc', label: 'Oldest First' },
    { id: 'name_asc', label: 'Name (A to Z)' },
    { id: 'name_desc', label: 'Name (Z to A)' },
    { id: 'size_desc', label: 'Largest Size' },
    { id: 'size_asc', label: 'Smallest Size' },
  ];

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-white/6 select-none">
      <div>
        <h1 className="text-xl font-display font-semibold tracking-tight text-white capitalize">
          {categoryTitle}
        </h1>
        <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono-tabular mt-0.5">
          <span>{totalCount} {totalCount === 1 ? 'file' : 'files'}</span>
          <span aria-hidden="true" className="text-neutral-600">·</span>
          <span>{totalBytesFormatted} total</span>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2">
        {availableExtensions.length > 1 && (
          <select
            value={filters.extension || 'all'}
            onChange={e => onChangeFilters({ extension: e.target.value === 'all' ? undefined : e.target.value })}
            className="glass-input rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 bg-neutral-900/80 cursor-pointer focus:outline-none"
          >
            <option value="all">All Extensions</option>
            {availableExtensions.map(ext => (
              <option key={ext} value={ext}>
                .{ext}
              </option>
            ))}
          </select>
        )}

        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={e => onChangeFilters({ sortBy: e.target.value as SortOption })}
            className="glass-input rounded-lg pl-3 pr-7 py-1.5 text-xs text-neutral-300 bg-neutral-900/80 cursor-pointer focus:outline-none"
          >
            {sortOptions.map(opt => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center p-0.5 rounded-lg glass-panel-subtle border border-white/8">
          <button
            onClick={() => onChangeViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangeViewMode('list')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="List View"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
