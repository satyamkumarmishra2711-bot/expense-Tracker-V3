import React, { useState, useRef } from 'react';
import { Transaction, StatementExtractionResult } from '../types/expense';
import { SAMPLE_STATEMENTS, buildTransactionsFromPreset } from '../data/sampleStatements';
import { DEFAULT_CATEGORIES, CATEGORY_COLORS } from '../utils/categorizer';
import {
  Upload,
  X,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Calendar,
  Layers,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';

interface UploadModalProps {
  onClose: () => void;
  existingTransactions: Transaction[];
  onSyncTransactions: (newTxs: Transaction[]) => Promise<void>;
  isSyncing: boolean;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  onClose,
  existingTransactions,
  onSyncTransactions,
  isSyncing
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStage, setProgressStage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<{
    cardName: string;
    statementMonth: string;
    statementPeriod: string;
    fileName: string;
    allTransactions: Transaction[];
    newTransactions: Transaction[];
    duplicateTransactions: Transaction[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process a selected File (PDF, Image, etc.)
  const handleFileProcess = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    setError(null);
    setProgressStage('Reading document...');

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(selectedFile);
      const base64Data = await base64Promise;

      setProgressStage('Extracting transactions with Gemini 3.8 Flash AI...');

      const res = await fetch('/api/extract-statement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileBase64: base64Data,
          mimeType: selectedFile.type || (selectedFile.name.endsWith('.pdf') ? 'application/pdf' : 'image/png'),
          fileName: selectedFile.name
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ error: 'Extraction service unavailable' }));
        throw new Error(errJson.error || `Server responded with status ${res.status}`);
      }

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || 'Failed to extract transactions from document');
      }

      const data: StatementExtractionResult = json.data;
      const transactions = (data.transactions || []) as Transaction[];

      // Compute deduplication against existing dataset
      const existingIdSet = new Set(existingTransactions.map(t => t.transaction_id));
      const newTxs = transactions.filter(t => !existingIdSet.has(t.transaction_id));
      const dupTxs = transactions.filter(t => existingIdSet.has(t.transaction_id));

      setExtractedData({
        cardName: data.card_name,
        statementMonth: data.statement_month,
        statementPeriod: data.statement_period,
        fileName: selectedFile.name,
        allTransactions: transactions,
        newTransactions: newTxs,
        duplicateTransactions: dupTxs
      });
    } catch (err: any) {
      console.error('Extraction error:', err);
      setError(err.message || 'An error occurred during statement processing');
    } finally {
      setIsProcessing(false);
      setProgressStage('');
    }
  };

  // Load a preset sample statement
  const handleLoadSample = (sampleId: string) => {
    const preset = SAMPLE_STATEMENTS.find(s => s.id === sampleId);
    if (!preset) return;

    setIsProcessing(true);
    setError(null);
    setProgressStage('Simulating bank statement ingestion...');

    setTimeout(() => {
      const txs = buildTransactionsFromPreset(preset);
      const existingIdSet = new Set(existingTransactions.map(t => t.transaction_id));
      const newTxs = txs.filter(t => !existingIdSet.has(t.transaction_id));
      const dupTxs = txs.filter(t => existingIdSet.has(t.transaction_id));

      setExtractedData({
        cardName: `${preset.cardName} - ${preset.cardLast4}`,
        statementMonth: preset.statementMonth,
        statementPeriod: preset.statementPeriod,
        fileName: preset.fileName,
        allTransactions: txs,
        newTransactions: newTxs,
        duplicateTransactions: dupTxs
      });
      setIsProcessing(false);
      setProgressStage('');
    }, 600);
  };

  const handleUpdateCategoryInPreview = (index: number, newCat: string) => {
    if (!extractedData) return;
    const updated = [...extractedData.allTransactions];
    updated[index] = { ...updated[index], category: newCat };

    const existingIdSet = new Set(existingTransactions.map(t => t.transaction_id));
    const newTxs = updated.filter(t => !existingIdSet.has(t.transaction_id));
    const dupTxs = updated.filter(t => existingIdSet.has(t.transaction_id));

    setExtractedData({
      ...extractedData,
      allTransactions: updated,
      newTransactions: newTxs,
      duplicateTransactions: dupTxs
    });
  };

  const handleConfirmSync = async () => {
    if (!extractedData || extractedData.newTransactions.length === 0) return;
    await onSyncTransactions(extractedData.newTransactions);
    onClose();
  };

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-sm">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Upload Credit Card Statement</h2>
              <p className="text-xs text-slate-500">
                PDF statement extraction, smart deduplication &amp; Google Sheets sync
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
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-semibold text-rose-900">Extraction Error</p>
                <p className="mt-0.5 text-slate-700">{error}</p>
              </div>
            </div>
          )}

          {/* STEP 1: UPLOAD OR PICK SAMPLE (Shown if no extraction active) */}
          {!extractedData && !isProcessing && (
            <div className="space-y-4">
              {/* Drag & Drop File Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileProcess(e.dataTransfer.files[0]);
                  }
                }}
                className="border-2 border-dashed border-slate-300 hover:border-teal-500 bg-slate-50/60 hover:bg-slate-50 rounded-2xl p-8 text-center cursor-pointer transition group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/*,.csv"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileProcess(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-14 h-14 rounded-2xl bg-white group-hover:bg-teal-50 border border-slate-300 group-hover:border-teal-300 flex items-center justify-center text-slate-500 group-hover:text-teal-600 mx-auto transition shadow-xs">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="mt-4 font-bold text-sm text-slate-900 group-hover:text-teal-700 transition">
                  Select or Drag &amp; Drop Statement PDF
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  Supports all bank statement formats (HDFC, ICICI, SBI, Axis, Amex, Chase, Citi, Barclays, etc.).
                </p>
                <span className="inline-block mt-3 px-3 py-1 rounded-full bg-slate-100 text-[10px] text-slate-600 font-mono border border-slate-200">
                  .PDF, .PNG, .JPG, .CSV up to 50MB
                </span>
              </div>

              {/* Sample Statement Testing Presets */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2 text-slate-600">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    Or Test Drive with Instant Sample Statements:
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {SAMPLE_STATEMENTS.map(sample => (
                    <button
                      key={sample.id}
                      onClick={() => handleLoadSample(sample.id)}
                      className="p-3 text-left rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-teal-400 transition cursor-pointer group"
                    >
                      <div className="font-semibold text-xs text-slate-900 group-hover:text-teal-700">
                        {sample.cardName}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {sample.statementPeriod}
                      </div>
                      <div className="text-[10px] text-teal-700 font-medium mt-1">
                        {sample.items.length} sample items
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PROCESSING ANIMATION */}
          {isProcessing && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 animate-pulse">
                  <Sparkles className="w-8 h-8" />
                </div>
                <RefreshCw className="w-5 h-5 text-teal-600 animate-spin absolute -top-1 -right-1" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{progressStage}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Parsing transaction line items, identifying merchants, and running duplicate checks...
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & DEDUPLICATION REPORT */}
          {extractedData && !isProcessing && (
            <div className="space-y-4">
              {/* Extraction summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Card</span>
                  <div className="font-bold text-slate-900 truncate flex items-center gap-1.5 mt-0.5">
                    <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                    <span>{extractedData.cardName}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Billing Period</span>
                  <div className="font-bold text-slate-900 truncate flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>{extractedData.statementPeriod}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Extracted</span>
                  <div className="font-bold text-teal-700 mt-0.5">
                    {extractedData.allTransactions.length} items
                  </div>
                </div>
              </div>

              {/* Deduplication Status Banners */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-800 text-xs">
                      {extractedData.newTransactions.length} New Transactions
                    </span>
                    <p className="text-[10px] text-emerald-700">Ready to append to Google Sheet</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold text-amber-800 text-xs">
                      {extractedData.duplicateTransactions.length} Duplicates Skipped
                    </span>
                    <p className="text-[10px] text-amber-700">Already in Google Sheet (No duplicates)</p>
                  </div>
                </div>
              </div>

              {/* Transaction Preview Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="p-2.5 bg-slate-50 font-semibold text-slate-700 text-[11px] border-b border-slate-200 flex items-center justify-between">
                  <span>Extracted Line Items ({extractedData.allTransactions.length})</span>
                  <span className="text-[10px] text-slate-500">You can adjust categories before sync</span>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {extractedData.allTransactions.map((tx, idx) => {
                    const isDuplicate = extractedData.duplicateTransactions.some(
                      dt => dt.transaction_id === tx.transaction_id
                    );
                    const colors = CATEGORY_COLORS[tx.category] || CATEGORY_COLORS['Other'];

                    return (
                      <div
                        key={tx.transaction_id}
                        className={`p-2.5 flex items-center justify-between gap-3 text-xs ${
                          isDuplicate ? 'bg-amber-50/60 opacity-60' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">{tx.date}</span>
                          <div className="truncate">
                            <span className="font-medium text-slate-900">{tx.merchant}</span>
                            <span className="text-[10px] text-slate-500 block truncate">{tx.description}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          {isDuplicate ? (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              Duplicate
                            </span>
                          ) : (
                            <select
                              value={tx.category}
                              onChange={e => handleUpdateCategoryInPreview(idx, e.target.value)}
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border bg-white ${colors.text} ${colors.border}`}
                            >
                              {DEFAULT_CATEGORIES.map(c => (
                                <option key={c} value={c} className="bg-white text-slate-900">
                                  {c}
                                </option>
                              ))}
                            </select>
                          )}

                          <span className={`font-bold font-mono text-xs ${tx.type === 'credit' ? 'text-emerald-700' : 'text-slate-900'}`}>
                            {formatCurrency(tx.amount)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/80">
          {extractedData ? (
            <>
              <button
                type="button"
                onClick={() => setExtractedData(null)}
                className="px-3 py-2 text-slate-600 hover:text-slate-900 text-xs font-medium cursor-pointer"
              >
                ← Upload Another
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleConfirmSync}
                  disabled={isSyncing || extractedData.newTransactions.length === 0}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-xs shadow-sm transition disabled:opacity-40 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>
                    {isSyncing
                      ? 'Syncing to Sheet...'
                      : extractedData.newTransactions.length === 0
                      ? 'No New Transactions (All Duplicates)'
                      : `Sync ${extractedData.newTransactions.length} New Transaction(s) to Sheet`}
                  </span>
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
