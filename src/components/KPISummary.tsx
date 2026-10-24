import React from 'react';
import { Transaction } from '../types/expense';
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  PieChart,
  Store,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Calendar,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  getLocalDateString,
  getStartOfWeek,
  getEndOfWeek,
  getCurrentMonthString,
  getMonthFriendlyLabel
} from '../utils/dateUtils';

interface KPISummaryProps {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  selectedMonth: string;
  onSelectMonth?: (m: string) => void;
  selectedType?: string;
  onSelectType?: (type: string) => void;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  searchQuery?: string;
  onSetSearchQuery?: (query: string) => void;
  timeFilter?: 'all' | 'today' | 'this_week' | 'this_month';
  onSelectTimeFilter?: (filter: 'all' | 'today' | 'this_week' | 'this_month') => void;
}

export const KPISummary: React.FC<KPISummaryProps> = ({
  transactions,
  filteredTransactions,
  selectedMonth,
  onSelectMonth,
  selectedType = 'all',
  onSelectType,
  selectedCategory = 'all',
  onSelectCategory,
  searchQuery = '',
  onSetSearchQuery,
  timeFilter = 'all',
  onSelectTimeFilter
}) => {
  const todayStr = getLocalDateString();
  const startOfWeekStr = getStartOfWeek();
  const endOfWeekStr = getEndOfWeek();
  const currentMonthStr = getCurrentMonthString();

  // 1. Time-Based Expense Metrics (Calculated across all valid debit expenses <= 25k)
  const validDebits = transactions.filter(t => t.type === 'debit' && t.amount <= 25000);

  // Today's expenses
  const todayDebits = validDebits.filter(t => t.date === todayStr);
  const expenseToday = todayDebits.reduce((sum, t) => sum + t.amount, 0);

  // This Week's expenses (Monday to Sunday)
  const thisWeekDebits = validDebits.filter(t => t.date >= startOfWeekStr && t.date <= endOfWeekStr);
  const expenseThisWeek = thisWeekDebits.reduce((sum, t) => sum + t.amount, 0);

  // This Month's expenses
  const thisMonthDebits = validDebits.filter(
    t => (t.statement_month === currentMonthStr || t.date.startsWith(currentMonthStr))
  );
  const expenseThisMonth = thisMonthDebits.reduce((sum, t) => sum + t.amount, 0);

  // 2. Filtered Subset Metrics
  const debits = filteredTransactions.filter(t => t.type === 'debit');
  const credits = filteredTransactions.filter(t => t.type === 'credit');

  const totalExpense = debits.reduce((acc, t) => acc + t.amount, 0);
  const totalCredits = credits.reduce((acc, t) => acc + t.amount, 0);
  const netSpend = totalExpense - totalCredits;

  // Distinct cards
  const cards = Array.from(new Set(filteredTransactions.map(t => t.card))).filter(Boolean);

  // Category breakdown for filtered debits
  const categoryMap: Record<string, number> = {};
  debits.forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });
  const topCategoryEntry = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];

  // Merchant breakdown for filtered debits
  const merchantMap: Record<string, number> = {};
  debits.forEach(t => {
    merchantMap[t.merchant] = (merchantMap[t.merchant] || 0) + t.amount;
  });
  const topMerchantEntry = Object.entries(merchantMap).sort((a, b) => b[1] - a[1])[0];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const isTodayActive = timeFilter === 'today';
  const isWeekActive = timeFilter === 'this_week';
  const isMonthActive = timeFilter === 'this_month';
  const isDebitsActive = selectedType === 'debit';
  const isCreditsActive = selectedType === 'credit';
  const isTopCategoryActive = topCategoryEntry && selectedCategory === topCategoryEntry[0];
  const isTopMerchantActive = topMerchantEntry && searchQuery.toLowerCase() === topMerchantEntry[0].toLowerCase();

  const handleTimeClick = (type: 'today' | 'this_week' | 'this_month') => {
    if (!onSelectTimeFilter) return;
    if (timeFilter === type) {
      onSelectTimeFilter('all');
    } else {
      onSelectTimeFilter(type);
    }
  };

  // Format week range for friendly subtitle
  const startParts = startOfWeekStr.split('-');
  const endParts = endOfWeekStr.split('-');
  const weekLabel = `${startParts[2]}/${startParts[1]} – ${endParts[2]}/${endParts[1]}`;
  const monthName = getMonthFriendlyLabel(currentMonthStr);

  return (
    <div className="space-y-4">
      {/* 1. Primary Time-Based Metrics: Expense Today, This Week, This Month */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Expense Today */}
        <div
          onClick={() => handleTimeClick('today')}
          className={`bg-gradient-to-br ${
            isTodayActive
              ? 'from-emerald-950/80 via-slate-900 to-teal-950/80 border-emerald-500 ring-2 ring-emerald-500/30'
              : 'from-slate-900/90 to-slate-900/60 border-slate-800 hover:border-emerald-500/50'
          } border rounded-2xl p-5 shadow-sm transition relative overflow-hidden group cursor-pointer`}
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
                Expense Today
              </span>
              {isTodayActive && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-0.5 border border-emerald-500/40">
                  <Filter className="w-2.5 h-2.5" /> Active
                </span>
              )}
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
              <span>{formatCurrency(expenseToday)}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="font-semibold text-emerald-400">{todayDebits.length}</span> {todayDebits.length === 1 ? 'expense' : 'expenses'} today
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {todayStr}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Expense This Week */}
        <div
          onClick={() => handleTimeClick('this_week')}
          className={`bg-gradient-to-br ${
            isWeekActive
              ? 'from-cyan-950/80 via-slate-900 to-blue-950/80 border-cyan-500 ring-2 ring-cyan-500/30'
              : 'from-slate-900/90 to-slate-900/60 border-slate-800 hover:border-cyan-500/50'
          } border rounded-2xl p-5 shadow-sm transition relative overflow-hidden group cursor-pointer`}
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarRange className="w-3.5 h-3.5 text-cyan-400" />
                Expense This Week
              </span>
              {isWeekActive && (
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-0.5 border border-cyan-500/40">
                  <Filter className="w-2.5 h-2.5" /> Active
                </span>
              )}
            </div>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
              <span>{formatCurrency(expenseThisWeek)}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="font-semibold text-cyan-400">{thisWeekDebits.length}</span> {thisWeekDebits.length === 1 ? 'expense' : 'expenses'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {weekLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Expense This Month */}
        <div
          onClick={() => handleTimeClick('this_month')}
          className={`bg-gradient-to-br ${
            isMonthActive
              ? 'from-indigo-950/80 via-slate-900 to-violet-950/80 border-indigo-500 ring-2 ring-indigo-500/30'
              : 'from-slate-900/90 to-slate-900/60 border-slate-800 hover:border-indigo-500/50'
          } border rounded-2xl p-5 shadow-sm transition relative overflow-hidden group cursor-pointer`}
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-indigo-400" />
                Expense This Month
              </span>
              {isMonthActive && (
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-0.5 border border-indigo-500/40">
                  <Filter className="w-2.5 h-2.5" /> Active
                </span>
              )}
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
              <span>{formatCurrency(expenseThisMonth)}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="font-semibold text-indigo-400">{thisMonthDebits.length}</span> {thisMonthDebits.length === 1 ? 'expense' : 'expenses'}
              </span>
              <span className="text-[10px] text-slate-500">
                {monthName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Secondary Breakdown Grid: Total Filtered Spends, Credits & Refunds, Top Category, Top Merchant */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expense (Debits in Current Filter View) */}
        <div
          onClick={() => {
            if (onSelectType) {
              onSelectType(isDebitsActive ? 'all' : 'debit');
            }
          }}
          className={`bg-slate-900/80 border ${
            isDebitsActive ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-950/20' : 'border-slate-800 hover:border-rose-500/50'
          } rounded-2xl p-4 shadow-sm transition relative overflow-hidden group cursor-pointer`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Total Spends
              </span>
              {isDebitsActive && (
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                  <Filter className="w-2.5 h-2.5" /> Filtered
                </span>
              )}
            </div>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl lg:text-2xl font-bold text-white tracking-tight">
              {formatCurrency(totalExpense)}
            </div>
            <p className="mt-1 text-xs text-slate-400 flex items-center gap-1.5">
              <span className="text-rose-400 font-medium">{debits.length}</span> debits in view
            </p>
          </div>
        </div>

        {/* Credits, Payments & Cashback */}
        <div
          onClick={() => {
            if (onSelectType) {
              onSelectType(isCreditsActive ? 'all' : 'credit');
            }
          }}
          className={`bg-slate-900/80 border ${
            isCreditsActive ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-950/20' : 'border-slate-800 hover:border-emerald-500/50'
          } rounded-2xl p-4 shadow-sm transition relative overflow-hidden group cursor-pointer`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Credits &amp; Refunds
              </span>
              {isCreditsActive && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                  <Filter className="w-2.5 h-2.5" /> Filtered
                </span>
              )}
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl lg:text-2xl font-bold text-emerald-400 tracking-tight">
              {formatCurrency(totalCredits)}
            </div>
            <p className="mt-1 text-xs text-slate-400 flex items-center justify-between">
              <span>
                Net:{' '}
                <span className="font-semibold text-slate-200">
                  {formatCurrency(netSpend)}
                </span>
              </span>
            </p>
          </div>
        </div>

        {/* Top Category */}
        <div
          onClick={() => {
            if (topCategoryEntry && onSelectCategory) {
              onSelectCategory(isTopCategoryActive ? 'all' : topCategoryEntry[0]);
            }
          }}
          className={`bg-slate-900/80 border ${
            isTopCategoryActive ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-950/20' : 'border-slate-800 hover:border-indigo-500/50'
          } rounded-2xl p-4 shadow-sm transition relative overflow-hidden group cursor-pointer`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Top Category
              </span>
              {isTopCategoryActive && (
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                  <Filter className="w-2.5 h-2.5" /> Filtered
                </span>
              )}
            </div>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-base lg:text-lg font-bold text-white truncate tracking-tight">
              {topCategoryEntry ? topCategoryEntry[0] : 'None'}
            </div>
            <p className="mt-1 text-xs text-slate-400 flex items-center justify-between">
              {topCategoryEntry ? (
                <span className="text-indigo-300 font-semibold">{formatCurrency(topCategoryEntry[1])}</span>
              ) : (
                'No debits'
              )}
            </p>
          </div>
        </div>

        {/* Top Merchant & Card Count */}
        <div
          onClick={() => {
            if (topMerchantEntry && onSetSearchQuery) {
              onSetSearchQuery(isTopMerchantActive ? '' : topMerchantEntry[0]);
            }
          }}
          className={`bg-slate-900/80 border ${
            isTopMerchantActive ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-950/20' : 'border-slate-800 hover:border-amber-500/50'
          } rounded-2xl p-4 shadow-sm transition relative overflow-hidden group cursor-pointer`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Top Merchant
              </span>
              {isTopMerchantActive && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                  <Filter className="w-2.5 h-2.5" /> Filtered
                </span>
              )}
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-base lg:text-lg font-bold text-white truncate tracking-tight">
              {topMerchantEntry ? topMerchantEntry[0] : 'None'}
            </div>
            <p className="mt-1 text-xs text-slate-400 flex items-center justify-between">
              <span>
                {topMerchantEntry ? (
                  <span className="text-amber-300 font-semibold">{formatCurrency(topMerchantEntry[1])}</span>
                ) : (
                  'No records'
                )}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                <CreditCard className="w-2.5 h-2.5 text-teal-400" /> {cards.length} {cards.length === 1 ? 'card' : 'cards'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
