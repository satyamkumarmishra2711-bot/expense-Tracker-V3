import React from 'react';
import { Transaction } from '../types/expense';
import { DEFAULT_CATEGORIES } from '../utils/categorizer';
import {
  Calendar,
  CreditCard,
  Tag,
  Search,
  Filter,
  X,
  SlidersHorizontal,
  Clock,
  CalendarDays,
  CalendarRange,
  CalendarCheck
} from 'lucide-react';

import { getBillingCycle } from '../utils/idGenerator';

interface FilterBarProps {
  transactions: Transaction[];
  selectedMonth: string; // 'all' or 'YYYY-MM'
  onSelectMonth: (m: string) => void;
  selectedCard: string;
  onSelectCard: (c: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedType: string; // 'all' | 'debit' | 'credit'
  onSelectType: (t: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onResetFilters: () => void;
  timeFilter?: 'all' | 'today' | 'this_week' | 'this_month';
  onSelectTimeFilter?: (tf: 'all' | 'today' | 'this_week' | 'this_month') => void;
  billingCycleDay?: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  transactions,
  selectedMonth,
  onSelectMonth,
  selectedCard,
  onSelectCard,
  selectedCategory,
  onSelectCategory,
  selectedType,
  onSelectType,
  searchQuery,
  onSearchChange,
  onResetFilters,
  timeFilter = 'all',
  onSelectTimeFilter,
  billingCycleDay = 18
}) => {
  // Extract distinct available months from dataset with sums and dynamic cycle
  const monthMap = new Map<string, { label: string; rangeText: string; count: number; totalExpense: number }>();
  
  transactions.forEach(t => {
    const cycle = getBillingCycle(t.date, billingCycleDay);
    const monthKey = t.statement_month || cycle.key;
    if (!monthMap.has(monthKey)) {
      const d = new Date(`${monthKey}-01`);
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const label = !isNaN(d.getTime())
        ? `${monthNames[d.getMonth()]} ${d.getFullYear()}`
        : monthKey;
      monthMap.set(monthKey, { label, rangeText: cycle.rangeText, count: 0, totalExpense: 0 });
    }
    const entry = monthMap.get(monthKey)!;
    entry.count += 1;
    if (t.type === 'debit') {
      entry.totalExpense += t.amount;
    }
  });

  const sortedMonths = Array.from(monthMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  // Distinct cards
  const distinctCards = Array.from(new Set(transactions.map(t => t.card))).filter(Boolean);

  // Distinct categories present
  const availableCategories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...transactions.map(t => t.category)])
  ).filter(Boolean);

  const hasActiveFilters =
    timeFilter !== 'all' ||
    selectedMonth !== 'all' ||
    selectedCard !== 'all' ||
    selectedCategory !== 'all' ||
    selectedType !== 'all' ||
    searchQuery.trim().length > 0;

  const formatShortINR = (num: number) => {
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
    return `₹${Math.round(num)}`;
  };

  return (
    <div className="space-y-4">
      {/* Month & Quick Time Range Carousel */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-sm">
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>Select Statement Month &amp; Timeframe</span>
          </div>
          {(selectedMonth !== 'all' || timeFilter !== 'all') && (
            <button
              onClick={() => {
                onSelectMonth('all');
                if (onSelectTimeFilter) onSelectTimeFilter('all');
              }}
              className="text-[11px] text-teal-600 hover:text-teal-800 font-semibold cursor-pointer"
            >
              Reset to All Time
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => {
              onSelectMonth('all');
              if (onSelectTimeFilter) onSelectTimeFilter('all');
            }}
            className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer flex flex-col items-start ${
              selectedMonth === 'all' && timeFilter === 'all'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <span className="font-semibold">All History</span>
            <span className={`text-[10px] ${selectedMonth === 'all' && timeFilter === 'all' ? 'text-teal-100' : 'text-slate-500'}`}>
              {transactions.length} total txs
            </span>
          </button>

          {/* Quick Time Pills */}
          {onSelectTimeFilter && (
            <>
              <button
                onClick={() => onSelectTimeFilter(timeFilter === 'today' ? 'all' : 'today')}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border ${
                  timeFilter === 'today'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm font-bold'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Today</span>
              </button>

              <button
                onClick={() => onSelectTimeFilter(timeFilter === 'this_week' ? 'all' : 'this_week')}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border ${
                  timeFilter === 'this_week'
                    ? 'bg-sky-600 text-white border-sky-500 shadow-sm font-bold'
                    : 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100/80'
                }`}
              >
                <CalendarRange className="w-3.5 h-3.5" />
                <span>This Week</span>
              </button>

              <button
                onClick={() => onSelectTimeFilter(timeFilter === 'this_month' ? 'all' : 'this_month')}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border ${
                  timeFilter === 'this_month'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm font-bold'
                    : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100/80'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>This Month</span>
              </button>
            </>
          )}

          {/* Individual Statement Months / Billing Cycles */}
          {sortedMonths.map(([monthKey, data]) => {
            const isSelected = selectedMonth === monthKey;
            return (
              <button
                key={monthKey}
                onClick={() => {
                  onSelectMonth(monthKey);
                  if (onSelectTimeFilter) onSelectTimeFilter('all');
                }}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs transition cursor-pointer flex flex-col items-start border ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-teal-500 shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 w-full justify-between">
                  <span className="font-semibold">{data.label}</span>
                  {data.rangeText && (
                    <span className={`text-[9px] px-1 py-0.2 rounded ${isSelected ? 'bg-teal-900/40 text-teal-100' : 'bg-white border border-slate-200 text-slate-500'}`}>
                      {data.rangeText}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                  {formatShortINR(data.totalExpense)} ({data.count} txs)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dimensional Filter Controls */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Query Input */}
          <div className="lg:col-span-4">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                placeholder="Search merchant, card, description, ref..."
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="p-1 text-slate-400 hover:text-slate-700 absolute right-2.5 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Card Selector */}
          <div className="lg:col-span-3">
            <div className="relative">
              <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedCard}
                onChange={e => onSelectCard(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
              >
                <option value="all">All Cards ({distinctCards.length})</option>
                {distinctCards.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Selector */}
          <div className="lg:col-span-3">
            <div className="relative">
              <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedCategory}
                onChange={e => onSelectCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
              >
                <option value="all">All Categories</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Type Selector (All / Spends / Credits) */}
          <div className="lg:col-span-2 flex items-center gap-2">
            <select
              value={selectedType}
              onChange={e => onSelectType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
            >
              <option value="all">All Types</option>
              <option value="debit">Spends / Debits</option>
              <option value="credit">Credits / Refunds</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition shrink-0 cursor-pointer"
                title="Reset all filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
