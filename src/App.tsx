import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { Transaction, SheetMetadata } from './types/expense';
import { initAuth, googleSignIn, logout, getAccessToken } from './services/auth';
import {
  fetchSheetTransactions,
  syncNewTransactionsToSheet,
  overwriteAllTransactionsInSheet,
  updateTransactionInSheet,
  batchUpdateCategoriesInSheet,
  deleteTransactionFromSheet,
  createStatementSpreadsheet,
  fetchSheetRules,
  syncRulesToSheet
} from './services/googleSheets';
import { SAMPLE_STATEMENTS, buildTransactionsFromPreset } from './data/sampleStatements';
import { saveUserRule, loadUserRules, applyRulesToTransactions } from './utils/categorizer';
import { Navbar } from './components/Navbar';
import { CardBillingDashboard } from './components/CardBillingDashboard';
import { FilterBar } from './components/FilterBar';
import { ChartsPanel } from './components/ChartsPanel';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseDetailModal } from './components/ExpenseDetailModal';
import { UploadModal } from './components/UploadModal';
import { SheetManagerModal } from './components/SheetManagerModal';
import { RuleManagerModal } from './components/RuleManagerModal';
import { EmailSyncModal } from './components/EmailSyncModal';
import { UnauthorizedDomainModal } from './components/UnauthorizedDomainModal';
import { EmailSyncButton } from './components/EmailSyncButton';
import { SyncedEmailsModal } from './components/SyncedEmailsModal';
import {
  searchRecentTransactionEmails,
  parseEmailsToTransactions,
  deduplicateTransactions,
  EmailTransactionAlert,
  TimeRangeOption
} from './services/gmailSync';
import {
  getLocalDateString,
  getStartOfWeek,
  getEndOfWeek,
  getCurrentMonthString
} from './utils/dateUtils';
import {
  CreditCard,
  FileSpreadsheet,
  Upload,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  HelpCircle,
  Plus,
  Mail,
  LogOut,
  Settings,
  ExternalLink
} from 'lucide-react';

const LOCAL_STORAGE_SHEET_KEY = 'statementflow_connected_sheet';
const LOCAL_STORAGE_TX_BACKUP_KEY = 'statementflow_txs_backup';

// Wipe any legacy unauthenticated cache immediately to protect private data
try {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_TX_BACKUP_KEY);
  }
} catch {}

// Synthetic dummy transactions generated from generic demo preset (no personal data)
const DUMMY_TRANSACTIONS: Transaction[] = deduplicateTransactions(
  buildTransactionsFromPreset(SAMPLE_STATEMENTS[0])
);

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Google Sheet state
  const [connectedSheet, setConnectedSheet] = useState<SheetMetadata | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SHEET_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Main Transactions Dataset: without login with Google, only dummy data is visible
  const [transactions, setTransactions] = useState<Transaction[]>(DUMMY_TRANSACTIONS);

  // Filter states
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'this_week' | 'this_month'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // Show all months or latest statement
  const [selectedCard, setSelectedCard] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // User-configurable Credit Card Billing Cycle Day (e.g. 18th to 18th, 1st to 1st, 15th, etc.)
  const [billingCycleDay, setBillingCycleDay] = useState<number>(() => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('statementflow_billing_cycle_day');
        return saved ? parseInt(saved, 10) : 18;
      }
    } catch {}
    return 18;
  });

  const handleSetBillingCycleDay = (day: number) => {
    setBillingCycleDay(day);
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('statementflow_billing_cycle_day', day.toString());
      }
    } catch {}
  };

  // Modals & Drawers
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Status & Sync Loaders
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isSyncingUpload, setIsSyncingUpload] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Show temporary toast
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync to local backup ONLY when user is authenticated (user-scoped storage key)
  useEffect(() => {
    if (user && user.uid) {
      try {
        localStorage.setItem(`statementflow_user_txs_${user.uid}`, JSON.stringify(transactions));
      } catch (e) {
        console.warn('Failed to backup user transactions locally', e);
      }
    }
  }, [transactions, user]);

  // Auth state listener: loads user data on sign-in, reverts to dummy data when not signed in
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setNeedsAuth(false);
        // Load user-specific private data if present
        try {
          const userKey = `statementflow_user_txs_${currentUser.uid}`;
          const saved = localStorage.getItem(userKey);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setTransactions(parsed);
              return;
            }
          }
        } catch {}
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
        // When not logged in with Google, only dummy data is visible
        setTransactions(DUMMY_TRANSACTIONS);
      }
    );
    return () => unsubscribe();
  }, []);

  const [isUnauthorizedDomainOpen, setIsUnauthorizedDomainOpen] = useState(false);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string>('');
  const [isAutoSyncingEmail, setIsAutoSyncingEmail] = useState(false);
  const [isSyncedEmailsModalOpen, setIsSyncedEmailsModalOpen] = useState(false);
  const [syncedEmailsData, setSyncedEmailsData] = useState<{
    emails: EmailTransactionAlert[];
    transactions: Transaction[];
    durationLabel: string;
  }>({ emails: [], transactions: [], durationLabel: 'Last 30 Days' });

  // 1. Automatic email synchronization routine triggered after sign-in: Last 30 Days
  const autoSyncEmailAlerts = async (targetSheet?: SheetMetadata | null, duration: TimeRangeOption = '30_days') => {
    setIsAutoSyncingEmail(true);
    showToast('Checking Gmail for recent card transaction alerts (Last 30 Days)...', 'info');
    try {
      const emailAlerts = await searchRecentTransactionEmails('all', duration, billingCycleDay);
      if (emailAlerts && emailAlerts.length > 0) {
        const parsedTxs = await parseEmailsToTransactions(emailAlerts);
        if (parsedTxs.length > 0) {
          await handleSyncExtractedTransactions(parsedTxs);
          const activeSheet = targetSheet || connectedSheet;
          if (activeSheet) {
            try {
              await syncNewTransactionsToSheet(activeSheet.spreadsheetId, parsedTxs, transactions);
            } catch (sheetErr) {
              console.warn('Auto-sync push to sheet notice:', sheetErr);
            }
          }
          showToast(`Synced ${parsedTxs.length} transaction alert(s) from the last 30 days!`, 'success');
        } else {
          showToast('No new unrecorded transaction alerts found in Gmail for the last 30 days.', 'info');
        }
      } else {
        showToast('Gmail checked: No new transaction alerts found in the last 30 days.', 'info');
      }
    } catch (err: any) {
      console.warn('Auto email sync warning:', err);
      // Non-fatal, do not disturb user session
    } finally {
      setIsAutoSyncingEmail(false);
    }
  };

  // 2, 3, 4, 5. Manual Sync Routine triggered by Sync Email Button
  const handleManualEmailSync = async (duration: '30_days' | '45_days' | '60_days') => {
    const durationLabels: Record<string, string> = {
      '30_days': 'Last 30 Days',
      '45_days': 'Last 45 Days',
      '60_days': 'Last 60 Days'
    };
    const durationLabel = durationLabels[duration] || 'Selected Duration';

    setIsAutoSyncingEmail(true);
    showToast(`Scanning Gmail for bank transaction alerts (${durationLabel})...`, 'info');

    try {
      const emailAlerts = await searchRecentTransactionEmails('all', duration, billingCycleDay);

      let parsedTxs: Transaction[] = [];
      if (emailAlerts && emailAlerts.length > 0) {
        parsedTxs = await parseEmailsToTransactions(emailAlerts);
        if (parsedTxs.length > 0) {
          // 4. Update existing email data without creating duplicates
          await handleSyncExtractedTransactions(parsedTxs);

          const activeSheet = connectedSheet;
          if (activeSheet) {
            try {
              await syncNewTransactionsToSheet(activeSheet.spreadsheetId, parsedTxs, transactions);
            } catch (sheetErr) {
              console.warn('Sync push to sheet notice:', sheetErr);
            }
          }
          showToast(`Synced ${parsedTxs.length} transaction alert(s) for ${durationLabel}!`, 'success');
        } else {
          showToast(`Found ${emailAlerts.length} alert email(s), but all transactions are already recorded.`, 'info');
        }
      } else {
        showToast(`No transaction alert emails found for ${durationLabel}.`, 'info');
      }

      // 5. Display the synced emails in a clean, readable list view using existing UI structure
      setSyncedEmailsData({
        emails: emailAlerts || [],
        transactions: parsedTxs,
        durationLabel
      });
      setIsSyncedEmailsModalOpen(true);
    } catch (err: any) {
      console.error('Manual email sync error:', err);
      showToast(err.message || 'Failed to sync emails from Gmail', 'error');
    } finally {
      setIsAutoSyncingEmail(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setNeedsAuth(false);
        showToast(`Connected as ${result.user.displayName || result.user.email}`);

        let activeSheet = connectedSheet;

        // If no sheet connected yet, auto-create or connect
        if (!activeSheet) {
          try {
            const sheet = await createStatementSpreadsheet(`StatementFlow Expenses ${new Date().getFullYear()}`);
            setConnectedSheet(sheet);
            activeSheet = sheet;
            localStorage.setItem(LOCAL_STORAGE_SHEET_KEY, JSON.stringify(sheet));
            showToast('Connected Google Sheet: ' + sheet.title);
            if (transactions.length > 0) {
              await syncNewTransactionsToSheet(sheet.spreadsheetId, transactions, []);
            }
          } catch (createErr) {
            console.warn('Auto-create sheet skipped or failed, opening picker', createErr);
          }
        } else {
          refreshFromSheet(activeSheet);
        }

        // 1. Automatic Email Synchronization after successful Google Sign-in from last 30 days
        setTimeout(() => {
          autoSyncEmailAlerts(activeSheet, '30_days');
        }, 800);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      const isUnauthorizedDomain =
        err?.code === 'auth/unauthorized-domain' ||
        err?.message?.includes('unauthorized-domain') ||
        err?.message?.includes('auth/unauthorized-domain');

      if (isUnauthorizedDomain) {
        const domain = typeof window !== 'undefined' ? window.location.hostname : '';
        setUnauthorizedDomain(domain);
        setIsUnauthorizedDomainOpen(true);
        showToast('Domain not authorized in Firebase: ' + (domain || 'current domain'), 'error');
      } else {
        showToast(err.message || 'Google Sign-In failed', 'error');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setNeedsAuth(true);
    setTransactions(DUMMY_TRANSACTIONS);
    try {
      localStorage.removeItem(LOCAL_STORAGE_TX_BACKUP_KEY);
    } catch {}
    showToast('Signed out successfully. Showing sample demo data.', 'info');
  };

  // Refresh from connected Google Sheet
  const refreshFromSheet = async (sheet = connectedSheet) => {
    if (!sheet) {
      showToast('Please connect a Google Sheet first', 'info');
      setIsSheetModalOpen(true);
      return;
    }

    const currentToken = await getAccessToken();
    if (!currentToken) {
      showToast('Google session expired. Please sign in with Google.', 'info');
      handleLogin();
      return;
    }

    setIsRefreshing(true);
    try {
      // 1. Fetch transactions from Google Sheet
      const remoteTxs = await fetchSheetTransactions(sheet.spreadsheetId, sheet.sheetName);
      
      // If remote sheet is completely empty (user cleared it), handle gracefully
      if (remoteTxs.length === 0) {
        if (transactions.length > 0) {
          showToast(`Google Sheet is empty. You can click "Push to Sheet" to push ${transactions.length} records, or click "Sync Email Alerts" for a fresh scan.`, 'info');
        } else {
          setTransactions([]);
          if (user?.uid) {
            try {
              localStorage.setItem(`statementflow_user_txs_${user.uid}`, JSON.stringify([]));
            } catch {}
          }
          setLastSyncedAt(new Date().toISOString());
          showToast('Google Sheet is empty. Ready to sync all emails freshly!', 'info');
        }
        return;
      }

      let currentBaseTxs = remoteTxs;

      // 2. Fetch custom rules/tags from 'Rules' sheet tab
      let rulesUpdatedCount = 0;
      try {
        const sheetRules = await fetchSheetRules(sheet.spreadsheetId);
        if (sheetRules.length > 0) {
          try {
            localStorage.setItem('statementflow_custom_rules', JSON.stringify(sheetRules));
          } catch {}
          currentBaseTxs = applyRulesToTransactions(currentBaseTxs, sheetRules);
          rulesUpdatedCount = sheetRules.length;
        } else {
          // If no rules in sheet yet, initialize sheet Rules tab with current app rules
          const currentAppRules = loadUserRules();
          await syncRulesToSheet(sheet.spreadsheetId, currentAppRules);
          currentBaseTxs = applyRulesToTransactions(currentBaseTxs, currentAppRules);
        }
      } catch (rulesErr) {
        console.warn('Sheet rules fetch skipped:', rulesErr);
      }

      // Deduplicate transactions
      const finalTxs = deduplicateTransactions(currentBaseTxs);
      setTransactions(finalTxs);
      try {
        localStorage.setItem(LOCAL_STORAGE_TX_BACKUP_KEY, JSON.stringify(finalTxs));
      } catch {}
      setLastSyncedAt(new Date().toISOString());

      if (rulesUpdatedCount > 0) {
        showToast(`Synced ${finalTxs.length} records & applied ${rulesUpdatedCount} rules from sheet "Rules" tab`);
      } else {
        showToast(`Synced ${finalTxs.length} records from Google Sheet`);
      }
    } catch (err: any) {
      console.error('Refresh error:', err);
      showToast(err.message || 'Failed to sync with Google Sheet', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Re-sync and re-evaluate categories from sheet 'Rules' tab and update Transactions sheet
  const handleSyncCategoriesFromSheet = async () => {
    if (!connectedSheet) {
      showToast('Please connect a Google Sheet first', 'info');
      setIsSheetModalOpen(true);
      return;
    }

    const currentToken = await getAccessToken();
    if (!currentToken) {
      showToast('Google session expired. Please sign in with Google.', 'info');
      handleLogin();
      return;
    }

    setIsRefreshing(true);
    try {
      const sheetRules = await fetchSheetRules(connectedSheet.spreadsheetId);
      const effectiveRules = sheetRules.length > 0 ? sheetRules : loadUserRules();

      if (sheetRules.length > 0) {
        try {
          localStorage.setItem('statementflow_custom_rules', JSON.stringify(sheetRules));
        } catch {}
      }

      const updatedTxs = applyRulesToTransactions(transactions, effectiveRules);
      setTransactions(updatedTxs);
      try {
        localStorage.setItem(LOCAL_STORAGE_TX_BACKUP_KEY, JSON.stringify(updatedTxs));
      } catch {}

      // Bulk update the Google Sheet Transactions tab
      try {
        await batchUpdateCategoriesInSheet(connectedSheet.spreadsheetId, updatedTxs, connectedSheet.sheetName);
        showToast(`Synced rules and updated categories across Google Sheet!`);
      } catch (sheetErr) {
        console.warn('Google Sheet batch update warning:', sheetErr);
        showToast(`Synced rules and updated categories locally!`);
      }
    } catch (err: any) {
      console.error('Rules sync error:', err);
      if (err.message && err.message.includes('Not authenticated')) {
        showToast('Google session expired. Please sign in with Google.', 'info');
        handleLogin();
      } else {
        showToast(err.message || 'Failed to sync rules from sheet', 'error');
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Push / overwrite all current dataset transactions into connected Google Sheet
  const handlePushAllToSheet = async () => {
    if (!connectedSheet) {
      showToast('Please connect a Google Sheet first', 'info');
      setIsSheetModalOpen(true);
      return;
    }

    const currentToken = await getAccessToken();
    if (!currentToken) {
      showToast('Google session expired. Please sign in with Google.', 'info');
      handleLogin();
      return;
    }

    if (transactions.length === 0) {
      showToast('No transactions in memory. Opening Email Sync to fetch alerts fresh...', 'info');
      setIsEmailModalOpen(true);
      return;
    }

    setIsRefreshing(true);
    try {
      const count = await overwriteAllTransactionsInSheet(
        connectedSheet.spreadsheetId,
        transactions,
        connectedSheet.sheetName
      );
      setLastSyncedAt(new Date().toISOString());
      showToast(`Successfully pushed & updated ${count} transaction(s) directly to Google Sheet!`, 'success');
    } catch (err: any) {
      console.error('Push error:', err);
      showToast(err.message || 'Failed to push transactions to Google Sheet', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle Sheet selection from Modal
  const handleSelectSheet = async (sheet: SheetMetadata) => {
    setConnectedSheet(sheet);
    try {
      localStorage.setItem(LOCAL_STORAGE_SHEET_KEY, JSON.stringify(sheet));
    } catch {}
    showToast(`Connected to "${sheet.title}"`);
    refreshFromSheet(sheet);
  };

  // Sync newly extracted statement transactions
  const handleSyncExtractedTransactions = async (newTxs: Transaction[], isFreshSync = false) => {
    // Filter out expenses > 25k
    const filteredUnder25k = newTxs.filter(t => t.amount <= 25000);
    if (filteredUnder25k.length === 0) return;

    setIsSyncingUpload(true);
    try {
      let finalTransactionsList: Transaction[];

      if (isFreshSync || transactions.length === 0) {
        finalTransactionsList = deduplicateTransactions(filteredUnder25k);
      } else {
        const existingIdSet = new Set(transactions.map(t => t.transaction_id));
        const dedupedNewTxs = filteredUnder25k.filter(t => !existingIdSet.has(t.transaction_id));
        finalTransactionsList = deduplicateTransactions([...dedupedNewTxs, ...transactions]);
      }

      // Optimistic state update
      setTransactions(finalTransactionsList);
      try {
        localStorage.setItem(LOCAL_STORAGE_TX_BACKUP_KEY, JSON.stringify(finalTransactionsList));
      } catch {}

      // If connected to Google Sheet and authenticated, update the sheet directly
      const accessToken = await getAccessToken();
      if (connectedSheet && accessToken) {
        if (isFreshSync || transactions.length === 0) {
          await overwriteAllTransactionsInSheet(
            connectedSheet.spreadsheetId,
            finalTransactionsList,
            connectedSheet.sheetName
          );
          setLastSyncedAt(new Date().toISOString());
          showToast(`Successfully updated ${finalTransactionsList.length} transaction(s) to Google Sheet (Fresh Sync)`);
        } else {
          const { addedCount, duplicateCount } = await syncNewTransactionsToSheet(
            connectedSheet.spreadsheetId,
            filteredUnder25k,
            transactions,
            connectedSheet.sheetName
          );
          setLastSyncedAt(new Date().toISOString());
          showToast(`Successfully added ${addedCount} new transaction(s) to Google Sheet (${duplicateCount} duplicate(s) skipped)`);
        }
      } else {
        showToast(`Saved ${finalTransactionsList.length} transaction(s) locally`);
      }

      // Automatically switch to the uploaded statement month if available
      if (filteredUnder25k[0]?.statement_month) {
        setSelectedMonth(filteredUnder25k[0].statement_month);
      }
    } catch (err: any) {
      console.error('Sync upload error:', err);
      showToast(err.message || 'Failed to sync transactions to Google Sheet', 'error');
    } finally {
      setIsSyncingUpload(false);
    }
  };

  // Quick category changer from row dropdown
  const handleQuickChangeCategory = async (tx: Transaction, newCategory: string) => {
    const updated: Transaction = {
      ...tx,
      category: newCategory,
      user_overridden_category: true,
      updated_date: new Date().toISOString()
    };

    if (tx.merchant && !/^(?:upi\s*transaction|unknown\s*merchant)$/i.test(tx.merchant.trim())) {
      saveUserRule({
        pattern: tx.merchant.trim().toLowerCase(),
        category: newCategory,
        merchant_name: tx.merchant.trim()
      });
    }

    const latestRules = loadUserRules();
    const updatedList = applyRulesToTransactions(
      transactions.map(t => (t.transaction_id === tx.transaction_id ? updated : t)),
      latestRules
    );
    setTransactions(updatedList);
    if (user?.uid) {
      try {
        localStorage.setItem(`statementflow_user_txs_${user.uid}`, JSON.stringify(updatedList));
      } catch {}
    }

    // Sync to sheet in background
    const accessToken = await getAccessToken();
    if (connectedSheet && accessToken) {
      try {
        await updateTransactionInSheet(connectedSheet.spreadsheetId, updated, connectedSheet.sheetName);
        await syncRulesToSheet(connectedSheet.spreadsheetId, latestRules);
        showToast(`Category updated to "${newCategory}" & saved rule for "${tx.merchant}"`);
      } catch (err: any) {
        console.error('Quick update sheet error:', err);
      }
    } else {
      showToast(`Category updated to "${newCategory}" & saved rule for "${tx.merchant}"`);
    }
  };

  // Rule update handler: auto updates all transactions in dataset & syncs to Google Sheets Rules & Transactions tabs
  const handleRulesUpdated = async () => {
    const latestRules = loadUserRules();
    const updated = applyRulesToTransactions(transactions, latestRules);
    setTransactions(updated);
    if (user?.uid) {
      try {
        localStorage.setItem(`statementflow_user_txs_${user.uid}`, JSON.stringify(updated));
      } catch {}
    }

    if (connectedSheet) {
      try {
        await syncRulesToSheet(connectedSheet.spreadsheetId, latestRules);
        await batchUpdateCategoriesInSheet(connectedSheet.spreadsheetId, updated, connectedSheet.sheetName);
      } catch (err) {
        console.warn('Failed to sync rules/categories to Google Sheet:', err);
      }
    }
    showToast('Auto-updated all matching transactions and synced with Google Sheet', 'success');
  };

  // Save Transaction Edits from Panel 3 Modal
  const handleSaveTransactionEdit = async (updated: Transaction, rememberRule: boolean) => {
    setIsSavingEdit(true);
    try {
      // 1. If remember rule is requested, register custom rule & re-tag all matching expenses
      if (rememberRule && updated.merchant) {
        saveUserRule({
          pattern: updated.merchant.toLowerCase(),
          category: updated.category,
          merchant_name: updated.merchant
        });

        const latestRules = loadUserRules();
        setTransactions(prev => {
          const applied = applyRulesToTransactions(
            prev.map(t => (t.transaction_id === updated.transaction_id ? updated : t)),
            latestRules
          );
          if (user?.uid) {
            try {
              localStorage.setItem(`statementflow_user_txs_${user.uid}`, JSON.stringify(applied));
            } catch {}
          }
          return applied;
        });

        // Sync rules to Sheet
        if (connectedSheet) {
          try {
            await syncRulesToSheet(connectedSheet.spreadsheetId, latestRules);
          } catch (err) {
            console.warn('Rules sheet sync error:', err);
          }
        }
        showToast(`Saved rule: All expenses matching "${updated.merchant}" auto-categorized to ${updated.category}`);
      } else {
        // 2. Update local state
        setTransactions(prev => prev.map(t => (t.transaction_id === updated.transaction_id ? updated : t)));
      }

      // 3. Sync update to Google Sheet
      const accessToken = await getAccessToken();
      if (connectedSheet && accessToken) {
        await updateTransactionInSheet(connectedSheet.spreadsheetId, updated, connectedSheet.sheetName);
        setLastSyncedAt(new Date().toISOString());
        showToast(`Saved changes for "${updated.merchant}" to Google Sheet`);
      } else {
        showToast(`Saved changes for "${updated.merchant}"`);
      }

      setSelectedTransaction(null);
    } catch (err: any) {
      console.error('Save edit error:', err);
      showToast(err.message || 'Failed to update transaction in Google Sheet', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Transaction with Confirmation
  const handleDeleteTransaction = async (txId: string) => {
    try {
      setTransactions(prev => prev.filter(t => t.transaction_id !== txId));

      const accessToken = await getAccessToken();
      if (connectedSheet && accessToken) {
        await deleteTransactionFromSheet(connectedSheet.spreadsheetId, txId, connectedSheet.sheetName);
        setLastSyncedAt(new Date().toISOString());
        showToast('Deleted transaction row from Google Sheet');
      } else {
        showToast('Deleted transaction');
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      showToast(err.message || 'Failed to delete row from Google Sheet', 'error');
    }
  };

  // Filtered dataset computation
  const filteredTransactions = useMemo(() => {
    const todayStr = getLocalDateString();
    const startOfWeekStr = getStartOfWeek();
    const endOfWeekStr = getEndOfWeek();
    const currentMonthStr = getCurrentMonthString();

    return transactions.filter(t => {
      // Exclude expenses > 25k
      if (t.amount > 25000) return false;

      // Time filter (Today / This Week / This Month)
      if (timeFilter === 'today') {
        if (t.date !== todayStr) return false;
      } else if (timeFilter === 'this_week') {
        if (t.date < startOfWeekStr || t.date > endOfWeekStr) return false;
      } else if (timeFilter === 'this_month') {
        const txMonth = t.statement_month || t.date.substring(0, 7);
        if (txMonth !== currentMonthStr) return false;
      }

      // Month filter
      if (selectedMonth !== 'all') {
        const txMonth = t.statement_month || t.date.substring(0, 7);
        if (txMonth !== selectedMonth) return false;
      }

      // Card filter
      if (selectedCard !== 'all' && t.card !== selectedCard) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && t.category !== selectedCategory) {
        return false;
      }

      // Type filter
      if (selectedType !== 'all' && t.type !== selectedType) {
        return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = t.description?.toLowerCase().includes(q);
        const matchMerchant = t.merchant?.toLowerCase().includes(q);
        const matchCard = t.card?.toLowerCase().includes(q);
        const matchCat = t.category?.toLowerCase().includes(q);
        const matchRef = t.reference_id?.toLowerCase().includes(q);
        const matchNotes = t.notes?.toLowerCase().includes(q);
        if (!matchDesc && !matchMerchant && !matchCard && !matchCat && !matchRef && !matchNotes) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, timeFilter, selectedMonth, selectedCard, selectedCategory, selectedType, searchQuery]);

  const handleResetFilters = () => {
    setTimeFilter('all');
    setSelectedMonth('all');
    setSelectedCard('all');
    setSelectedCategory('all');
    setSelectedType('all');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-lg border flex items-center gap-2.5 text-xs font-semibold ${
              toastMessage.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800 shadow-rose-500/10'
                : toastMessage.type === 'info'
                ? 'bg-sky-50 border-sky-200 text-sky-800 shadow-sky-500/10'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-500/10'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        user={user}
        needsAuth={needsAuth}
        isLoggingIn={isLoggingIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
        connectedSheet={connectedSheet}
        onOpenSheetModal={() => setIsSheetModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenEmailModal={() => setIsEmailModalOpen(true)}
        onOpenRulesModal={() => setIsRulesModalOpen(true)}
        onRefreshData={() => refreshFromSheet()}
        onSyncCategories={handleSyncCategoriesFromSheet}
        onPushToSheet={handlePushAllToSheet}
        isRefreshing={isRefreshing}
        lastSyncedAt={lastSyncedAt}
        isAutoSyncingEmail={isAutoSyncingEmail}
        onSyncEmailDuration={handleManualEmailSync}
        isSyncingEmail={isAutoSyncingEmail}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Demo Mode Banner when not logged in */}
        {!user && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0 font-bold text-xs tracking-wider">
                DEMO
              </div>
              <div>
                <h4 className="font-bold text-sm text-amber-950 flex items-center gap-2">
                  Viewing Sample Dummy Data
                </h4>
                <p className="text-xs text-amber-800 mt-0.5 max-w-2xl font-normal">
                  Personal financial data is hidden until you sign in with Google. Connect your Google account to securely view, sync, and track your own credit card statements and Gmail alerts.
                </p>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="self-start sm:self-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-sm cursor-pointer shrink-0"
            >
              {isLoggingIn ? 'Connecting...' : 'Connect Google Account'}
            </button>
          </div>
        )}

        {/* Banner if Google Sheet is not yet connected (Visible on tablet/desktop) */}
        {!connectedSheet && user && (
          <div className="hidden sm:flex p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-50 via-white to-sky-50 border border-teal-200/80 flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 shadow-xs">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  Connect Google Sheets for Automated 2-Way Sync
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 max-w-2xl font-normal">
                  Your Google Spreadsheet acts as the single source of truth. Every uploaded statement will automatically append verified records with deterministic zero-duplicate guarantee.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {user ? (
                <button
                  onClick={() => setIsSheetModalOpen(true)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs transition shadow-sm cursor-pointer"
                >
                  Create or Select Sheet
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold rounded-xl text-xs transition shadow-xs cursor-pointer"
                >
                  {isLoggingIn ? 'Connecting...' : 'Connect Google Account'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Mobile Only: Sign in, Sync and Quick Action Hub (Replaces card level summary on mobile) */}
          <div className="lg:hidden col-span-1 space-y-3">
            {!user ? (
              <div className="bg-white border-2 border-teal-500/30 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Google Account &amp; Expense Sync</h3>
                    <p className="text-xs text-slate-500">Sign in once to sync Google Sheet &amp; bank email alerts</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 border-2 border-slate-300 hover:border-slate-400 text-slate-900 font-bold rounded-xl text-sm transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <div className="w-5 h-5 shrink-0">
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                  <span>{isLoggingIn ? 'Connecting...' : 'Connect Google Account'}</span>
                </button>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm space-y-3">
                {/* Account & Sheet status row */}
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2 min-w-0">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full ring-1 ring-slate-200" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold shrink-0">
                        {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.displayName || user.email}</p>
                      <p className="text-[11px] text-teal-700 font-medium truncate flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                        <span>{connectedSheet ? connectedSheet.title : 'Google Sheet Ready'}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Primary Actions: Clearly Visible Sync Email (with Dropdown) + Upload */}
                <div className="grid grid-cols-2 gap-2">
                  <EmailSyncButton
                    onSync={handleManualEmailSync}
                    isSyncing={isAutoSyncingEmail}
                    variant="mobile"
                  />

                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs border border-slate-200 transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-teal-600" />
                    <span>Upload Statement</span>
                  </button>
                </div>

                {/* Secondary tools */}
                <div className="flex items-center gap-2 pt-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsSheetModalOpen(true)}
                    className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium truncate flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{connectedSheet ? 'Manage Sheet' : 'Connect Sheet'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRulesModalOpen(true)}
                    className="py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-500" />
                    <span>Rules</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop/Tablet 1st Column: Dashboards (Card Level Expense & Billing Dashboard - hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3.5 space-y-4">
            <CardBillingDashboard
              transactions={transactions}
              selectedCard={selectedCard}
              onSelectCard={setSelectedCard}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
              billingCycleDay={billingCycleDay}
              onSetBillingCycleDay={handleSetBillingCycleDay}
              onRefreshData={() => refreshFromSheet()}
              isRefreshing={isRefreshing}
            />
          </div>

          {/* 2nd Column: Upper side Category Analysis, Downside List of Expenses & Select Options */}
          <div className="lg:col-span-8 xl:col-span-8.5 space-y-6 min-w-0">
            {/* Upper side: Category analysis charts */}
            <ChartsPanel
              filteredTransactions={filteredTransactions}
              selectedMonth={selectedMonth}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedCard={selectedCard}
              onSelectCard={setSelectedCard}
              searchQuery={searchQuery}
              onSetSearchQuery={setSearchQuery}
            />

            {/* Downside: Multi-dimension Select Options & Filter Controls */}
            <FilterBar
              transactions={transactions}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
              selectedCard={selectedCard}
              onSelectCard={setSelectedCard}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedType={selectedType}
              onSelectType={setSelectedType}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onResetFilters={handleResetFilters}
              timeFilter={timeFilter}
              onSelectTimeFilter={setTimeFilter}
              billingCycleDay={billingCycleDay}
            />

            {/* Downside: Expense List Table */}
            <div id="expense-table-container">
              <ExpenseList
                transactions={filteredTransactions}
                onSelectTransaction={setSelectedTransaction}
                onQuickChangeCategory={handleQuickChangeCategory}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/90 py-6 text-center text-xs text-slate-500 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium text-slate-600">StatementFlow • Automated Credit Card Statement Intelligence &amp; Google Sheets Reference</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Deterministic Deduplication</span>
            <span>•</span>
            <span>Gemini 3.8 Flash OCR</span>
            <span>•</span>
            <span>2-Way Google Sheets Sync</span>
          </div>
        </div>
      </footer>

      {/* Synced Emails List View Modal (Requirement 5) */}
      <SyncedEmailsModal
        isOpen={isSyncedEmailsModalOpen}
        onClose={() => setIsSyncedEmailsModalOpen(false)}
        syncedEmails={syncedEmailsData.emails}
        syncedTransactions={syncedEmailsData.transactions}
        durationLabel={syncedEmailsData.durationLabel}
        onViewInTransactions={() => {
          setIsSyncedEmailsModalOpen(false);
          const el = document.getElementById('expense-table-container');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Upload Statement Modal */}
      {isUploadModalOpen && (
        <UploadModal
          onClose={() => setIsUploadModalOpen(false)}
          existingTransactions={transactions}
          onSyncTransactions={handleSyncExtractedTransactions}
          isSyncing={isSyncingUpload}
        />
      )}

      {/* Email Sync Modal */}
      {isEmailModalOpen && (
        <EmailSyncModal
          onClose={() => setIsEmailModalOpen(false)}
          existingTransactions={transactions}
          onSyncTransactions={handleSyncExtractedTransactions}
          isSyncing={isSyncingUpload}
          billingCycleDay={billingCycleDay}
        />
      )}

      {/* Sheet Manager Modal */}
      {isSheetModalOpen && (
        <SheetManagerModal
          connectedSheet={connectedSheet}
          onSelectSheet={handleSelectSheet}
          onClose={() => setIsSheetModalOpen(false)}
          user={user}
          onLogin={handleLogin}
          isLoggingIn={isLoggingIn}
          onAuthSuccess={(u, t) => {
            setUser(u);
            setToken(t);
            setNeedsAuth(false);
          }}
        />
      )}

      {/* Rules Manager Modal */}
      {isRulesModalOpen && (
        <RuleManagerModal
          onClose={() => setIsRulesModalOpen(false)}
          onRulesUpdated={handleRulesUpdated}
          onSyncFromSheet={handleSyncCategoriesFromSheet}
        />
      )}

      {/* Panel 3: Detailed Expense Inspector & Edit Modal */}
      {selectedTransaction && (
        <ExpenseDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onSave={handleSaveTransactionEdit}
          onDelete={handleDeleteTransaction}
          isSaving={isSavingEdit}
        />
      )}

      {/* Unauthorized Domain Modal */}
      {isUnauthorizedDomainOpen && (
        <UnauthorizedDomainModal
          currentDomain={unauthorizedDomain}
          onClose={() => setIsUnauthorizedDomainOpen(false)}
        />
      )}
    </div>
  );
}
