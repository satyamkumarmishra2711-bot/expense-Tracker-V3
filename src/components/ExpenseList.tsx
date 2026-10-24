import React, { useState } from 'react';
import { Transaction } from '../types/expense';
import { CATEGORY_COLORS, DEFAULT_CATEGORIES } from '../utils/categorizer';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  CreditCard,
  FileText,
  Edit2,
  ExternalLink,
  Receipt,
  Info
} from 'lucide-react';

interface ExpenseListProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onQuickChangeCategory: (tx: Transaction, newCategory: string) => void;
}

type SortField = 'date' | 'amount' | 'merchant' | 'category' | 'card';
type SortOrder = 'asc' | 'desc';

export const ExpenseList: React.FC<ExpenseListProps> = ({
  transactions,
  onSelectTransaction,
  onQuickChangeCategory
}) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState<number>(1);
  const pageSize = 25;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'date') {
      comparison = a.date.localeCompare(b.date);
    } else if (sortField === 'amount') {
      comparison = a.amount - b.amount;
    } else if (sortField === 'merchant') {
      comparison = a.merchant.localeCompare(b.merchant);
    } else if (sortField === 'category') {
      comparison = a.category.localeCompare(b.category);
    } else if (sortField === 'card') {
      comparison = a.card.localeCompare(b.card);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedTransactions.length / pageSize) || 1;
  const paginatedTransactions = sortedTransactions.slice((page - 1) * pageSize, page * pageSize);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amt);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Table Header / Action bar */}
      <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Receipt className="w-5 h-5 text-teal-600" />
          <div>
            <h3 className="font-semibold text-sm text-slate-900">Expense Transactions</h3>
            <p className="text-xs text-slate-500">
              Showing {paginatedTransactions.length} of {transactions.length} record(s) • Click any row to view &amp; edit details
            </p>
          </div>
        </div>

        {/* Page navigator */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2 self-end sm:self-center text-xs text-slate-600">
            <span>Page {page} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 transition cursor-pointer font-medium"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 transition cursor-pointer font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Component */}
      <div className="overflow-x-auto custom-scrollbar -webkit-overflow-scrolling-touch">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
              <th className="py-3.5 px-4 sm:px-6 cursor-pointer hover:text-slate-900" onClick={() => handleSort('date')}>
                <div className="flex items-center gap-1.5">
                  <span>Date</span>
                  {sortField === 'date' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-teal-600" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                  )}
                </div>
              </th>

              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('merchant')}>
                <div className="flex items-center gap-1.5">
                  <span>Merchant / Raw Description</span>
                  {sortField === 'merchant' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-teal-600" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                  )}
                </div>
              </th>

              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('category')}>
                <div className="flex items-center gap-1.5">
                  <span>Category</span>
                  {sortField === 'category' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-teal-600" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                  )}
                </div>
              </th>

              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('card')}>
                <div className="flex items-center gap-1.5">
                  <span>Card / Statement</span>
                  {sortField === 'card' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-teal-600" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                  )}
                </div>
              </th>

              <th className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('amount')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>Amount</span>
                  {sortField === 'amount' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-teal-600" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                  )}
                </div>
              </th>

              <th className="py-3.5 px-4 text-center">Ref ID / Info</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Receipt className="w-8 h-8 text-slate-400" />
                    <p className="font-medium text-slate-700">No transactions match your current filters.</p>
                    <p className="text-[11px] text-slate-500">Try switching months or clearing your search term.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTransactions.map(tx => {
                const colors = CATEGORY_COLORS[tx.category] || CATEGORY_COLORS['Other'];
                const isCredit = tx.type === 'credit';

                return (
                  <tr
                    key={tx.transaction_id}
                    onClick={() => onSelectTransaction(tx)}
                    className="hover:bg-slate-50/80 transition cursor-pointer group"
                  >
                    {/* Date */}
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700">{tx.date}</span>
                      </div>
                    </td>

                    {/* Merchant & Description */}
                    <td className="py-3.5 px-4">
                      <div className="max-w-[240px] sm:max-w-xs md:max-w-md">
                        <div className="font-semibold text-slate-900 group-hover:text-teal-700 transition truncate flex items-center gap-1.5">
                          <span>{tx.merchant}</span>
                          {tx.notes && (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-500" title={`Note: ${tx.notes}`} />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono truncate" title={tx.description}>
                          {tx.description}
                        </div>
                      </div>
                    </td>

                    {/* Category with inline selector */}
                    <td className="py-3.5 px-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <div className="relative inline-block">
                        <select
                          value={tx.category}
                          onChange={e => onQuickChangeCategory(tx, e.target.value)}
                          className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition cursor-pointer bg-white ${colors.text} ${colors.border} hover:border-teal-500 focus:outline-none`}
                        >
                          {DEFAULT_CATEGORIES.map(cat => (
                            <option key={cat} value={cat} className="bg-white text-slate-900">
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Card Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-[11px]">
                        <CreditCard className="w-3 h-3 text-teal-600" />
                        <span className="truncate max-w-[150px]" title={tx.card}>{tx.card}</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className={`font-bold text-sm ${isCredit ? 'text-emerald-700' : 'text-slate-900'}`}>
                        {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                      <div className="text-[10px] uppercase font-semibold text-slate-400">
                        {isCredit ? 'Credit / Refund' : 'Debit'}
                      </div>
                    </td>

                    {/* Reference ID / Action */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {tx.reference_id ? (
                          <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200" title={`Ref: ${tx.reference_id}`}>
                            {tx.reference_id.length > 8 ? `${tx.reference_id.substring(0, 8)}...` : tx.reference_id}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">-</span>
                        )}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onSelectTransaction(tx);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition cursor-pointer"
                          title="Inspect full details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
