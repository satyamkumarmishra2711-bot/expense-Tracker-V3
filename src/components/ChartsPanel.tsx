import React, { useState } from 'react';
import { Transaction } from '../types/expense';
import { CATEGORY_COLORS } from '../utils/categorizer';
import {
  PieChart as PieIcon,
  TrendingUp,
  CreditCard,
  Store,
  Layers,
  Check,
  Percent
} from 'lucide-react';

interface ChartsPanelProps {
  filteredTransactions: Transaction[];
  selectedMonth: string;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  selectedCard?: string;
  onSelectCard?: (card: string) => void;
  searchQuery?: string;
  onSetSearchQuery?: (query: string) => void;
}

const CATEGORY_HEX_COLORS: Record<string, string> = {
  'Office': '#3b82f6',
  'Zomato': '#ef4444',
  'Swiggy/Instamart': '#f97316',
  'Blinkit': '#eab308',
  'IITK': '#10b981',
  'Gulmohar': '#14b8a6',
  'Amazon': '#f59e0b',
  'Flipkart': '#0284c7',
  'Uber': '#71717a',
  'School': '#a855f7',
  'Rent': '#6366f1',
  'Wifi': '#06b6d4',
  'Insurance': '#2563eb',
  'Investments': '#059669',
  'Kids & Family': '#ec4899',
  'Pet Care': '#d97706',
  'Home & Maintenance': '#78716c',
  'Banking & Transfers': '#64748b',
  'Donations & Charity': '#e11d48',
  'Government & Taxes': '#ca8a04',
  'Books & Education': '#8b5cf6',
  'Food & Dining': '#f97316',
  'Grocery & Essentials': '#10b981',
  'Shopping': '#6366f1',
  'Travel & Commute': '#3b82f6',
  'Bills & Utilities': '#f59e0b',
  'Entertainment & Subscriptions': '#9333ea',
  'Health & Wellness': '#f43f5e',
  'Fuel & Auto': '#0891b2',
  'EMI & Financial': '#0d9488',
  'Fees & Charges': '#dc2626',
  'Refund & Cashback': '#16a34a',
  'Personal Care': '#db2777',
  'Other': '#94a3b8'
};

const PALETTE = [
  '#10b981', '#3b82f6', '#f97316', '#a855f7', '#06b6d4',
  '#f59e0b', '#ec4899', '#14b8a6', '#6366f1', '#ef4444',
  '#8b5cf6', '#d97706', '#059669', '#0284c7', '#db2777'
];

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number, innerRadius = 0) {
  const sweep = endAngle - startAngle;
  const safeEndAngle = sweep >= 360 ? startAngle + 359.99 : endAngle;
  const start = polarToCartesian(x, y, radius, safeEndAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = sweep <= 180 ? '0' : '1';

  if (innerRadius > 0) {
    const innerStart = polarToCartesian(x, y, innerRadius, safeEndAngle);
    const innerEnd = polarToCartesian(x, y, innerRadius, startAngle);
    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      'L', innerEnd.x, innerEnd.y,
      'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      'Z'
    ].join(' ');
  }

  return [
    'M', x, y,
    'L', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'Z'
  ].join(' ');
}

export const ChartsPanel: React.FC<ChartsPanelProps> = ({
  filteredTransactions,
  selectedMonth,
  selectedCategory = 'all',
  onSelectCategory,
  selectedCard = 'all',
  onSelectCard,
  searchQuery = '',
  onSetSearchQuery
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'merchants' | 'cards' | 'daily'>('categories');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const debits = filteredTransactions.filter(t => t.type === 'debit');
  const totalDebitAmount = debits.reduce((sum, t) => sum + t.amount, 0);

  // Category breakdown
  const categoryTotals: Record<string, { amount: number; count: number }> = {};
  debits.forEach(t => {
    const cat = t.category || 'Other';
    if (!categoryTotals[cat]) {
      categoryTotals[cat] = { amount: 0, count: 0 };
    }
    categoryTotals[cat].amount += t.amount;
    categoryTotals[cat].count += 1;
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1].amount - a[1].amount);

  // Merchant breakdown
  const merchantTotals: Record<string, { amount: number; count: number; category: string }> = {};
  debits.forEach(t => {
    if (!merchantTotals[t.merchant]) {
      merchantTotals[t.merchant] = { amount: 0, count: 0, category: t.category };
    }
    merchantTotals[t.merchant].amount += t.amount;
    merchantTotals[t.merchant].count += 1;
  });

  const sortedMerchants = Object.entries(merchantTotals)
    .sort((a, b) => b[1].amount - a[1].amount)
    .slice(0, 8);

  // Card breakdown
  const cardTotals: Record<string, { amount: number; count: number }> = {};
  debits.forEach(t => {
    if (!cardTotals[t.card]) {
      cardTotals[t.card] = { amount: 0, count: 0 };
    }
    cardTotals[t.card].amount += t.amount;
    cardTotals[t.card].count += 1;
  });

  const sortedCards = Object.entries(cardTotals).sort((a, b) => b[1].amount - a[1].amount);

  // Daily spend cadence
  const dailyTotals: Record<string, number> = {};
  debits.forEach(t => {
    const day = t.date || 'Unknown';
    dailyTotals[day] = (dailyTotals[day] || 0) + t.amount;
  });

  const sortedDays = Object.entries(dailyTotals).sort((a, b) => a[0].localeCompare(b[0]));
  const maxDaySpend = Math.max(...Object.values(dailyTotals), 1);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  // Compute Pie slices
  let cumulativeAngle = 0;
  const pieSlices = sortedCategories.map(([category, data], idx) => {
    const percentage = totalDebitAmount > 0 ? (data.amount / totalDebitAmount) * 100 : 0;
    const sliceAngle = (percentage / 100) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sliceAngle;
    cumulativeAngle = endAngle;

    const color = CATEGORY_HEX_COLORS[category] || PALETTE[idx % PALETTE.length];
    const path = describeArc(100, 100, 88, startAngle, endAngle, 54);

    return {
      category,
      amount: data.amount,
      count: data.count,
      percentage,
      color,
      path,
      startAngle,
      endAngle
    };
  });

  const activeCategoryData = hoveredCategory
    ? sortedCategories.find(([cat]) => cat === hoveredCategory)
    : selectedCategory !== 'all'
    ? sortedCategories.find(([cat]) => cat === selectedCategory)
    : null;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-teal-600" />
          <h3 className="font-semibold text-sm text-slate-900">Category &amp; Expense Intelligence</h3>
          <span className="text-[11px] text-slate-500 hidden sm:inline">(Click any slice or item to filter)</span>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'categories'
                ? 'bg-teal-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Pie Chart</span>
          </button>
          <button
            onClick={() => setActiveTab('merchants')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'merchants'
                ? 'bg-teal-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Top Merchants</span>
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'cards'
                ? 'bg-teal-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'daily'
                ? 'bg-teal-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>
        </div>
      </div>

      {/* Content depending on active tab */}
      {totalDebitAmount === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs font-medium">
          No debit expenses found for the selected filter criteria.
        </div>
      ) : (
        <div>
          {/* TAB 1: PIE CHART (Category Breakdown) */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Side: Interactive SVG Pie Chart */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-2">
                <div className="relative w-56 h-56 flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                    {pieSlices.map((slice) => {
                      const isHovered = hoveredCategory === slice.category;
                      const isSelected = selectedCategory === slice.category;

                      return (
                        <path
                          key={slice.category}
                          d={slice.path}
                          fill={slice.color}
                          stroke="#ffffff"
                          strokeWidth={isSelected ? 3.5 : 1.5}
                          className="transition-all duration-200 cursor-pointer origin-center hover:opacity-95"
                          style={{
                            transform: isHovered || isSelected ? 'scale(1.04)' : 'scale(1)',
                            filter: isHovered || isSelected ? 'drop-shadow(0px 2px 8px rgba(13, 148, 136, 0.45))' : 'none'
                          }}
                          onMouseEnter={() => setHoveredCategory(slice.category)}
                          onMouseLeave={() => setHoveredCategory(null)}
                          onClick={() => {
                            if (onSelectCategory) {
                              onSelectCategory(selectedCategory === slice.category ? 'all' : slice.category);
                            }
                          }}
                        >
                          <title>{`${slice.category}: ${formatCurrency(slice.amount)} (${slice.percentage.toFixed(1)}%)`}</title>
                        </path>
                      );
                    })}
                  </svg>

                  {/* Center Text inside Donut Pie */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-4">
                    {activeCategoryData ? (
                      <>
                        <span className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">
                          {activeCategoryData[0]}
                        </span>
                        <span className="text-sm font-bold text-slate-900 tracking-tight">
                          {formatCurrency(activeCategoryData[1].amount)}
                        </span>
                        <span className="text-[10px] font-semibold text-teal-600">
                          {((activeCategoryData[1].amount / totalDebitAmount) * 100).toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                          Total Spends
                        </span>
                        <span className="text-base font-bold text-slate-900 tracking-tight">
                          {formatCurrency(totalDebitAmount)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {sortedCategories.length} categories
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => onSelectCategory && onSelectCategory('all')}
                    className="mt-3 text-[11px] font-medium text-teal-600 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Clear Category Filter ({selectedCategory})</span>
                  </button>
                )}
              </div>

              {/* Right Side: Category Legend & Detail Cards */}
              <div className="lg:col-span-7 space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                {sortedCategories.map(([category, data], idx) => {
                  const percentage = totalDebitAmount > 0 ? (data.amount / totalDebitAmount) * 100 : 0;
                  const isSelected = selectedCategory === category;
                  const isHovered = hoveredCategory === category;
                  const color = CATEGORY_HEX_COLORS[category] || PALETTE[idx % PALETTE.length];

                  return (
                    <div
                      key={category}
                      onMouseEnter={() => setHoveredCategory(category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      onClick={() => {
                        if (onSelectCategory) {
                          onSelectCategory(isSelected ? 'all' : category);
                        }
                      }}
                      className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs ${
                        isSelected
                          ? 'bg-teal-50 border-teal-500 shadow-sm ring-1 ring-teal-500/30'
                          : isHovered
                          ? 'bg-slate-100/90 border-slate-300'
                          : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200/90 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-semibold text-slate-800 truncate">
                          {category}
                        </span>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          ({data.count} txs)
                        </span>
                        {isSelected && (
                          <span className="text-[9px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5 shrink-0">
                            <Check className="w-2.5 h-2.5" /> Filtered
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <span className="font-bold text-slate-900">
                          {formatCurrency(data.amount)}
                        </span>
                        <span className="text-[10px] font-semibold text-teal-600 w-10 text-right">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: TOP MERCHANTS */}
          {activeTab === 'merchants' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {sortedMerchants.map(([merchant, data], index) => {
                const colors = CATEGORY_COLORS[data.category] || CATEGORY_COLORS['Other'];
                const percentage = totalDebitAmount > 0 ? (data.amount / totalDebitAmount) * 100 : 0;
                const isSelected = searchQuery.toLowerCase() === merchant.toLowerCase();

                return (
                  <div
                    key={merchant}
                    onClick={() => {
                      if (onSetSearchQuery) {
                        onSetSearchQuery(isSelected ? '' : merchant);
                      }
                    }}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition ${
                      isSelected
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20'
                        : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400">#{index + 1}</span>
                        <h4 className="font-bold text-xs text-slate-900 truncate max-w-[140px]" title={merchant}>
                          {merchant}
                        </h4>
                        <span className={`inline-block mt-1 text-[9px] font-medium px-2 py-0.5 rounded-full ${colors.badge}`}>
                          {data.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xs text-teal-700">
                          {formatCurrency(data.amount)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {percentage.toFixed(1)}% ({data.count} txs)
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: CARDS */}
          {activeTab === 'cards' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedCards.map(([cardName, data]) => {
                const percentage = totalDebitAmount > 0 ? (data.amount / totalDebitAmount) * 100 : 0;
                const isSelected = selectedCard === cardName;

                return (
                  <div
                    key={cardName}
                    onClick={() => {
                      if (onSelectCard) {
                        onSelectCard(isSelected ? 'all' : cardName);
                      }
                    }}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition ${
                      isSelected
                        ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500/20'
                        : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 hover:border-sky-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-sky-600 shrink-0" />
                        <span className="font-bold text-xs text-slate-900 truncate max-w-[160px]" title={cardName}>
                          {cardName}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xs text-slate-900">
                          {formatCurrency(data.amount)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {percentage.toFixed(1)}% ({data.count} txs)
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: DAILY SPEND CADENCE */}
          {activeTab === 'daily' && (
            <div className="space-y-3">
              <div className="flex items-end gap-1.5 h-36 pt-4 px-2 overflow-x-auto pb-2 custom-scrollbar">
                {sortedDays.map(([day, amt]) => {
                  const heightPercent = Math.max((amt / maxDaySpend) * 100, 8);
                  const dayNum = day.substring(8, 10);
                  const monthNum = day.substring(5, 7);

                  return (
                    <div
                      key={day}
                      className="flex-1 min-w-[28px] max-w-[40px] flex flex-col items-center gap-1 group relative cursor-pointer"
                    >
                      <div
                        className="w-full bg-gradient-to-t from-teal-500 to-emerald-400 rounded-t group-hover:from-teal-600 group-hover:to-emerald-500 transition-all shadow-xs"
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="text-[9px] text-slate-500 group-hover:text-slate-900 font-medium">
                        {dayNum}/{monthNum}
                      </span>

                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition pointer-events-none absolute -top-8 bg-slate-900 border border-slate-800 text-[10px] text-white px-2 py-0.5 rounded shadow whitespace-nowrap z-10">
                        {day}: {formatCurrency(amt)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
