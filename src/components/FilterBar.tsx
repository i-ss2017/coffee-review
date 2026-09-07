import React from 'react';
import { Star, Heart, Search, SlidersHorizontal, Download, Sparkles } from 'lucide-react';
import { FilterMode, SortOrder } from '../types';

interface FilterBarProps {
  filterMode: FilterMode;
  setFilterMode: (mode: FilterMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedBean: string;
  setSelectedBean: (bean: string) => void;
  availableBeans: string[];
  sortOrder: SortOrder;
  setSortOrder: (sort: SortOrder) => void;
  totalCount: number;
  star5Count: number;
  favCount: number;
  onExportCSV: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filterMode,
  setFilterMode,
  searchQuery,
  setSearchQuery,
  selectedBean,
  setSelectedBean,
  availableBeans,
  sortOrder,
  setSortOrder,
  totalCount,
  star5Count,
  favCount,
  onExportCSV,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200/80 mb-6 space-y-3.5">
      {/* Top row: Filter tabs & Export */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
          {/* All */}
          <button
            onClick={() => setFilterMode('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition ${
              filterMode === 'all'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>すべて</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-stone-200/70 text-stone-700">
              {totalCount}
            </span>
          </button>

          {/* Star 5 Only */}
          <button
            onClick={() => setFilterMode('rating5')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition ${
              filterMode === 'rating5'
                ? 'bg-amber-500 text-stone-950 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-amber-800'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current text-amber-950" />
            <span>★5 のみ</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                filterMode === 'rating5' ? 'bg-amber-400 text-stone-950' : 'bg-stone-200/70 text-stone-700'
              }`}
            >
              {star5Count}
            </span>
          </button>

          {/* Favorites */}
          <button
            onClick={() => setFilterMode('favorite')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition ${
              filterMode === 'favorite'
                ? 'bg-rose-500 text-white shadow-xs font-semibold'
                : 'text-stone-600 hover:text-rose-700'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current text-white" />
            <span>お気に入り</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                filterMode === 'favorite' ? 'bg-rose-600 text-white' : 'bg-stone-200/70 text-stone-700'
              }`}
            >
              {favCount}
            </span>
          </button>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={onExportCSV}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 rounded-lg border border-stone-200 transition"
          title="スプレッドシート互換のCSVファイルを出力"
        >
          <Download className="w-3.5 h-3.5 text-stone-500" />
          <span>CSV出力</span>
        </button>
      </div>

      {/* Second row: Search bar, Bean selector & Sort order */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        {/* Search Bar */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="豆名、購入店、器具、メモで検索..."
            className="w-full pl-9 pr-3 py-2 bg-stone-50 hover:bg-stone-100/80 focus:bg-white text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 px-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Bean filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedBean}
            onChange={(e) => setSelectedBean(e.target.value)}
            className="w-full py-2 px-3 bg-stone-50 text-xs sm:text-sm rounded-xl border border-stone-200 text-stone-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden transition"
          >
            <option value="">すべての豆 ({availableBeans.length})</option>
            {availableBeans.map((bean) => (
              <option key={bean} value={bean}>
                {bean}
              </option>
            ))}
          </select>
        </div>

        {/* Sort order */}
        <div className="sm:col-span-3">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="w-full py-2 px-3 bg-stone-50 text-xs sm:text-sm rounded-xl border border-stone-200 text-stone-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden transition"
          >
            <option value="brewDateDesc">抽出日: 新しい順</option>
            <option value="brewDateAsc">抽出日: 古い順</option>
            <option value="ratingDesc">評価: 高い順</option>
            <option value="agingDaysDesc">エイジング日数: 多い順</option>
          </select>
        </div>
      </div>
    </div>
  );
};
