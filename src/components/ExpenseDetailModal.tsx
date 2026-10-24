import React, { useState } from 'react';
import { Transaction } from '../types/expense';
import { DEFAULT_CATEGORIES, CATEGORY_COLORS } from '../utils/categorizer';
import {
  X,
  CreditCard,
  Calendar,
  FileText,
  Save,
  Trash2,
  Tag,
  Store,
  DollarSign,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Mail,
  Copy
} from 'lucide-react';

interface ExpenseDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onSave: (updated: Transaction, rememberRule: boolean) => Promise<void>;
  onDelete: (txId: string) => Promise<void>;
  isSaving: boolean;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  transaction,
  onClose,
  onSave,
  onDelete,
  isSaving
}) => {
  if (!transaction) return null;

  const [category, setCategory] = useState(transaction.category);
  const [merchant, setMerchant] = useState(transaction.merchant);
  const [amount, setAmount] = useState<string>(transaction.amount.toString());
  const [type, setType] = useState<'debit' | 'credit'>(transaction.type);
  const [notes, setNotes] = useState(transaction.notes || '');
  const [rememberRule, setRememberRule] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Math.abs(parseFloat(amount) || transaction.amount);
    const updated: Transaction = {
      ...transaction,
      category,
      merchant,
      amount: parsedAmount,
      type,
      notes,
      user_overridden_category: category !== transaction.category,
      updated_date: new Date().toISOString()
    };
    await onSave(updated, rememberRule);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(transaction.transaction_id);
      setShowDeleteConfirm(false);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Expense Details &amp; Editor</h2>
              <p className="text-xs text-slate-500 font-mono">
                ID: {transaction.transaction_id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Metadata banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3 text-slate-700">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Credit Card</span>
              <div className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                <span className="truncate">{transaction.card}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Statement Month</span>
              <div className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>{transaction.statement_month}</span>
              </div>
            </div>

            <div className="col-span-2">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Source PDF / File</span>
              <div className="font-mono text-[11px] text-slate-700 flex items-center gap-1.5 mt-0.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{transaction.source_file || 'Direct Statement'}</span>
              </div>
            </div>

            {transaction.reference_id && (
              <div className="col-span-2">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Bank Reference ID</span>
                <div className="font-mono text-[11px] text-slate-700 mt-0.5">
                  {transaction.reference_id}
                </div>
              </div>
            )}
          </div>

          {/* Raw Description (Readonly reference) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Raw Statement Description
            </label>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800 select-all">
              {transaction.description}
            </div>
          </div>

          {/* Email Body / Alert Content Viewer */}
          {(transaction.email_body || transaction.notes) && (
            <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-teal-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <Mail className="w-3.5 h-3.5 text-teal-600" />
                  Synced Email Alert Body / Trail Content
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(transaction.email_body || transaction.notes || '');
                  }}
                  className="px-2 py-0.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[10px] flex items-center gap-1 border border-slate-300 transition cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-teal-200 font-mono text-[11px] text-slate-800 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto select-all">
                {transaction.email_body || transaction.notes}
              </div>
            </div>
          )}

          {/* Editable Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Merchant */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Merchant / Payee Name
              </label>
              <input
                type="text"
                value={merchant}
                onChange={e => setMerchant(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              >
                {DEFAULT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Transaction Type
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as 'debit' | 'credit')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              >
                <option value="debit">Debit (Spend / Charge)</option>
                <option value="credit">Credit (Refund / Cashback / Payment)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Personal Notes / Tags (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Work dinner reimbursement, Flight to Bangalore"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            />
          </div>

          {/* Remember rule checkbox */}
          {category !== transaction.category && (
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="rememberRule"
                checked={rememberRule}
                onChange={e => setRememberRule(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="rememberRule" className="text-slate-800 leading-snug cursor-pointer">
                <span className="font-semibold text-teal-800">Remember this rule:</span> Automatically categorize future transactions matching <span className="font-mono bg-white border border-slate-200 px-1 py-0.5 rounded text-slate-900">{merchant || transaction.description}</span> as <span className="font-semibold text-slate-900">{category}</span>.
              </label>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 text-xs font-medium transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving to Sheet...' : 'Save & Sync to Sheet'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Delete Confirmation Modal (Workspace Safety Dialog) */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-20">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-sm w-full space-y-4 text-center shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delete Transaction from Sheet?</h3>
                <p className="mt-1 text-xs text-slate-600">
                  This will permanently remove the record <span className="font-semibold text-slate-900">"{transaction.merchant}"</span> (₹{transaction.amount}) from your connected Google Sheet.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
