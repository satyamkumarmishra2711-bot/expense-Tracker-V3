import React, { useState } from 'react';
import { Transaction } from '../types/expense';
import { EmailTransactionAlert } from '../services/gmailSync';
import { CATEGORY_COLORS } from '../utils/categorizer';
import {
  Mail,
  X,
  CheckCircle2,
  Calendar,
  CreditCard,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Receipt,
  Sparkles
} from 'lucide-react';

export interface SyncedEmailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncedEmails: EmailTransactionAlert[];
  syncedTransactions: Transaction[];
  durationLabel: string;
  onViewInTransactions?: () => void;
}

export const SyncedEmailsModal: React.FC<SyncedEmailsModalProps> = ({
  isOpen,
  onClose,
  syncedEmails,
  syncedTransactions,
  durationLabel,
  onViewInTransactions
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amt);
  };

  const totalAmount = syncedTransactions.reduce((acc, t) => acc + (t.type === 'debit' ? t.amount : 0), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-4 sm:px-6 sm:py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">
                  Synced Emails List
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  {durationLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {syncedTransactions.length} transaction alert(s) synchronized from Gmail with zero duplicates
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metrics Banner */}
        <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200 bg-white text-center py-3 px-4">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Emails Found</span>
            <span className="text-sm sm:text-base font-bold text-slate-900">{syncedEmails.length}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Parsed Expenses</span>
            <span className="text-sm sm:text-base font-bold text-teal-700">{syncedTransactions.length}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Total Debit</span>
            <span className="text-sm sm:text-base font-bold font-mono text-slate-900">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {/* Status Callout */}
        <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-800 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Updated existing records • Deduplication verified via reference numbers &amp; timestamps.</span>
        </div>

        {/* List View of Synced Emails / Transactions */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {syncedTransactions.length === 0 ? (
            <div className="py-12 text-center space-y-3 border border-dashed border-slate-200 rounded-2xl p-6">
              <Mail className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-bold text-sm text-slate-800">No New Transaction Alerts Found</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All bank transaction emails in the {durationLabel} period have already been synced, or no new financial alert emails were received.
              </p>
            </div>
          ) : (
            syncedTransactions.map((tx) => {
              const isExpanded = expandedId === tx.transaction_id;
              const colors = CATEGORY_COLORS[tx.category] || CATEGORY_COLORS['Other'];

              return (
                <div
                  key={tx.transaction_id}
                  className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 hover:border-slate-300 transition shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 truncate">
                          {tx.merchant}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {tx.card}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
                          {tx.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 flex-wrap font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {tx.date}
                        </span>
                        <span>•</span>
                        <span>Month: {tx.statement_month}</span>
                        {tx.reference_id && (
                          <>
                            <span>•</span>
                            <span className="text-teal-700 font-semibold">Ref: {tx.reference_id}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`font-mono font-bold text-sm sm:text-base ${
                        tx.type === 'credit' ? 'text-emerald-700' : 'text-slate-900'
                      }`}>
                        {tx.type === 'credit' ? '+' : ''}{formatCurrency(tx.amount)}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md mt-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        Saved
                      </span>
                    </div>
                  </div>

                  {/* Email Subject / Preview Toggle */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <p className="text-slate-600 truncate text-[11px] pr-2">
                      <span className="font-medium text-slate-700">Subject: </span>
                      {tx.description}
                    </p>
                    {tx.email_body && (
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : tx.transaction_id)}
                        className="text-teal-700 hover:text-teal-900 text-[11px] font-semibold shrink-0 flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide' : 'Details'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>

                  {/* Collapsible raw email body text */}
                  {isExpanded && tx.email_body && (
                    <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
                      {tx.email_body}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/80">
          <span className="text-xs text-slate-500 font-medium">
            {syncedTransactions.length} record(s) in local storage &amp; Google Sheet
          </span>
          <div className="flex items-center gap-2">
            {onViewInTransactions && syncedTransactions.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewInTransactions();
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Receipt className="w-3.5 h-3.5 text-slate-600" />
                <span>View All Expenses</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs transition shadow-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
