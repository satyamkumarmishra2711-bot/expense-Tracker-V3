import React from 'react';
import { User } from 'firebase/auth';
import { SheetMetadata } from '../types/expense';
import {
  CreditCard,
  RefreshCw,
  ExternalLink,
  Plus,
  FileSpreadsheet,
  LogOut,
  Upload,
  Settings,
  Sparkles,
  Mail,
  Tag
} from 'lucide-react';
import { EmailSyncButton } from './EmailSyncButton';

interface NavbarProps {
  user: User | null;
  needsAuth: boolean;
  isLoggingIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  connectedSheet: SheetMetadata | null;
  onOpenSheetModal: () => void;
  onOpenUploadModal: () => void;
  onOpenEmailModal: () => void;
  onOpenRulesModal: () => void;
  onRefreshData: () => void;
  onSyncCategories?: () => void;
  onPushToSheet?: () => void;
  isRefreshing: boolean;
  lastSyncedAt: string | null;
  isAutoSyncingEmail?: boolean;
  onSyncEmailDuration?: (duration: '30_days' | '45_days' | '60_days') => Promise<void>;
  isSyncingEmail?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  needsAuth,
  isLoggingIn,
  onLogin,
  onLogout,
  connectedSheet,
  onOpenSheetModal,
  onOpenUploadModal,
  onOpenEmailModal,
  onOpenRulesModal,
  onRefreshData,
  onSyncCategories,
  onPushToSheet,
  isRefreshing,
  lastSyncedAt,
  isAutoSyncingEmail = false,
  onSyncEmailDuration,
  isSyncingEmail = false
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 text-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Main Header Bar */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center shadow-md shadow-teal-500/20 text-white shrink-0">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900">
                  StatementFlow
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  v2.5
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden lg:block font-normal">
                Credit Card Statement Intelligence &amp; Google Sheets Sync
              </p>
            </div>
          </div>

          {/* Sync Status Pill when syncing email or sheet */}
          {(isAutoSyncingEmail || isRefreshing) && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-medium animate-pulse shrink-0">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
              <span>{isAutoSyncingEmail ? 'Auto-syncing Gmail alerts...' : 'Syncing Google Sheet...'}</span>
            </div>
          )}

          {/* Actions: Responsive layout */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Connected Sheet Status & Switcher (Visible on desktop/tablet) */}
            {connectedSheet && (
              <div className="hidden md:flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 sm:px-3 py-1.5 transition shrink-0">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                <button
                  onClick={onOpenSheetModal}
                  className="text-left group flex items-center gap-1"
                  title="Switch or view connected Google Sheet"
                >
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-700 truncate max-w-[140px]">
                    {connectedSheet.title}
                  </span>
                </button>
                <a
                  href={connectedSheet.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 text-slate-400 hover:text-slate-700 rounded transition inline-flex"
                  title="Open live Google Sheet in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Clearly visible Sync Email Button immediately after login (tablet/desktop) */}
            {user && onSyncEmailDuration && (
              <div className="hidden sm:block shrink-0">
                <EmailSyncButton
                  onSync={onSyncEmailDuration}
                  isSyncing={isSyncingEmail || isAutoSyncingEmail}
                  variant="navbar"
                />
              </div>
            )}

            {/* Upload Statement Primary CTA (Visible on tablet/desktop) */}
            <button
              onClick={onOpenUploadModal}
              className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-300 px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer shrink-0"
              title="Upload Statement PDF or CSV"
            >
              <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600 shrink-0" />
              <span>Upload Statement</span>
            </button>

            {/* Rules button (Visible on desktop) */}
            <button
              onClick={onOpenRulesModal}
              className="hidden md:flex p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition border border-slate-200 text-xs items-center gap-1.5 cursor-pointer shrink-0"
              title="Category Rules & Automation"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Rules</span>
            </button>

            {/* SINGLE GOOGLE ACCOUNT BUTTON / USER PROFILE */}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2 sm:pl-2 sm:border-l sm:border-slate-200 shrink-0">
                <div className="flex items-center gap-2">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-1 ring-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold">
                      {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                      {user.displayName || 'Connected'}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight truncate max-w-[120px]">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  title="Disconnect Google Account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                disabled={isLoggingIn}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 sm:py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold rounded-xl text-xs transition shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                title="Connect your Google Account to automatically sync Sheet and bank email alerts"
              >
                <div className="w-4 h-4 shrink-0">
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <span>{isLoggingIn ? 'Connecting...' : 'Connect Google Account'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Status Bar (Only shown on small screens when syncing or sheet connected) */}
        {(isAutoSyncingEmail || isRefreshing || !connectedSheet) && (
          <div className="flex sm:hidden items-center justify-between py-1.5 px-1 border-t border-slate-100 text-[11px] text-slate-600">
            {isAutoSyncingEmail ? (
              <span className="flex items-center gap-1.5 text-teal-700 font-medium">
                <RefreshCw className="w-3 h-3 animate-spin text-teal-600" />
                Auto-syncing Gmail alerts...
              </span>
            ) : isRefreshing ? (
              <span className="flex items-center gap-1.5 text-teal-700 font-medium">
                <RefreshCw className="w-3 h-3 animate-spin text-teal-600" />
                Syncing Google Sheet...
              </span>
            ) : !connectedSheet ? (
              <span className="text-slate-500">Google Sheet not connected yet</span>
            ) : (
              <span className="text-slate-500">Synced</span>
            )}
            {!connectedSheet && user && (
              <button
                onClick={onOpenSheetModal}
                className="text-teal-700 font-semibold underline text-[11px]"
              >
                Connect Sheet
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

