import React, { useState } from 'react';
import { CategoryRule } from '../types/expense';
import {
  DEFAULT_CATEGORIES,
  loadUserRules,
  saveUserRule,
  categorizeTransaction,
  CATEGORY_COLORS
} from '../utils/categorizer';
import {
  Settings,
  Plus,
  Trash2,
  X,
  Sparkles,
  Search,
  CheckCircle2,
  Tag,
  FileSpreadsheet
} from 'lucide-react';

interface RuleManagerModalProps {
  onClose: () => void;
  onRulesUpdated?: () => void;
  onSyncFromSheet?: () => Promise<void> | void;
}

export const RuleManagerModal: React.FC<RuleManagerModalProps> = ({
  onClose,
  onRulesUpdated,
  onSyncFromSheet
}) => {
  const [rules, setRules] = useState<CategoryRule[]>(() => loadUserRules());
  const [isSyncing, setIsSyncing] = useState(false);
  const [pattern, setPattern] = useState('');
  const [category, setCategory] = useState<string>('IITK');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [merchantName, setMerchantName] = useState('');
  const [testQuery, setTestQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pattern.trim()) return;

    const finalTag = isCustomCategory ? (customCategoryInput.trim() || 'Other') : category;

    const updated = saveUserRule({
      pattern: pattern.trim(),
      category: finalTag,
      merchant_name: merchantName.trim() || undefined
    });
    setRules(updated);
    setPattern('');
    setMerchantName('');
    setCustomCategoryInput('');
    setIsCustomCategory(false);
    if (onRulesUpdated) onRulesUpdated();
  };

  const handleDeleteRule = (ruleId: string) => {
    const updated = rules.filter(r => r.id !== ruleId);
    setRules(updated);
    try {
      localStorage.setItem(
        'statementflow_custom_rules',
        JSON.stringify(updated.filter(r => r.id.startsWith('custom_') || r.id.startsWith('sheet_rule_')))
      );
    } catch (e) {
      console.error(e);
    }
    if (onRulesUpdated) onRulesUpdated();
  };

  const testResult = testQuery.trim() ? categorizeTransaction(testQuery, rules) : null;
  const filteredRules = rules.filter(r =>
    r.pattern.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (r.merchant_name && r.merchant_name.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Auto-Categorization Rules &amp; Tags</h2>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <FileSpreadsheet className="w-3 h-3 text-emerald-600" /> "Rules" Tab Synced
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pattern matching rules synced with your Google Sheet to auto-tag statement expenses
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Add New Rule Form */}
          <form onSubmit={handleAddRule} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between font-semibold text-slate-900">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-600" />
                <span>Create New Categorization Rule / Tag</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomCategory(!isCustomCategory)}
                className="text-[11px] text-teal-600 hover:text-teal-800 underline cursor-pointer font-medium"
              >
                {isCustomCategory ? 'Choose from list' : '+ Type custom tag'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-600 mb-1">
                  Pattern / Keyword in Text
                </label>
                <input
                  type="text"
                  value={pattern}
                  onChange={e => setPattern(e.target.value)}
                  placeholder="e.g. tadkaiit, iitk, blinkit, uber"
                  required
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-600 mb-1">
                  Target Tag / Category
                </label>
                {isCustomCategory ? (
                  <input
                    type="text"
                    value={customCategoryInput}
                    onChange={e => setCustomCategoryInput(e.target.value)}
                    placeholder="e.g. IITK, Gulmohar, School"
                    required
                    className="w-full bg-white border border-teal-500 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                ) : (
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {DEFAULT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-600 mb-1">
                  Merchant Display Name (Optional)
                </label>
                <input
                  type="text"
                  value={merchantName}
                  onChange={e => setMerchantName(e.target.value)}
                  placeholder="e.g. IIT Kanpur TADKA"
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add &amp; Apply Rule</span>
              </button>
            </div>
          </form>

          {/* Test Sandbox */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-teal-900">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Live Rule Tester</span>
            </div>
            <input
              type="text"
              value={testQuery}
              onChange={e => setTestQuery(e.target.value)}
              placeholder="Paste raw bank description to test (e.g. Rs.1,143.00 spent at TADKAIIT on 30-09-26)..."
              className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {testResult && (
              <div className="mt-2 p-2.5 rounded-xl bg-white border border-teal-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Inferred Merchant:</span>{' '}
                  <span className="font-bold text-slate-900 ml-1">{testResult.merchant}</span>
                </div>
                <div>
                  <span className="text-slate-500">Applied Tag:</span>{' '}
                  <span className="font-bold text-teal-700 ml-1">{testResult.category}</span>
                </div>
              </div>
            )}
          </div>

          {/* Rules List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Active Rules &amp; Tags ({filteredRules.length})</span>
              <div className="w-48 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  placeholder="Filter rules..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-7 pr-2 py-1 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
              {filteredRules.map(rule => {
                const isCustom = rule.id.startsWith('custom_') || rule.id.startsWith('sheet_rule_');
                const colors = CATEGORY_COLORS[rule.category] || CATEGORY_COLORS['Other'];

                return (
                  <div
                    key={rule.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono font-semibold text-slate-800 truncate">
                        "{rule.pattern}"
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors?.badge || 'bg-slate-200 text-slate-800'}`}>
                        {rule.category}
                      </span>
                      {rule.merchant_name && (
                        <span className="text-[10px] text-slate-500 truncate">
                          ({rule.merchant_name})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isCustom && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-semibold">
                          Custom / Sheet
                        </span>
                      )}
                      {isCustom && (
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-200 transition cursor-pointer"
                          title="Delete rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/80">
          {onSyncFromSheet ? (
            <button
              onClick={async () => {
                setIsSyncing(true);
                try {
                  await onSyncFromSheet();
                  setRules(loadUserRules());
                } finally {
                  setIsSyncing(false);
                }
              }}
              disabled={isSyncing}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <FileSpreadsheet className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing Rules...' : 'Sync & Apply Rules from Sheet'}</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
