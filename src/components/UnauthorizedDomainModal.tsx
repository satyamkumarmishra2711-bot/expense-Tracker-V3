import React, { useState } from 'react';
import { ShieldAlert, ExternalLink, Copy, Check, X, Settings2, KeyRound } from 'lucide-react';
import { setCustomFirebaseConfig, getCustomFirebaseConfig } from '../services/auth';

interface UnauthorizedDomainModalProps {
  onClose: () => void;
  currentDomain?: string;
  projectId?: string;
}

export const UnauthorizedDomainModal: React.FC<UnauthorizedDomainModalProps> = ({
  onClose,
  currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'expense.bascart.in',
  projectId = 'gen-lang-client-0056967119'
}) => {
  const [copied, setCopied] = useState(false);
  const [showCustomConfig, setShowCustomConfig] = useState(false);
  const [customConfigText, setCustomConfigText] = useState(() => {
    const existing = getCustomFirebaseConfig();
    return existing ? JSON.stringify(existing, null, 2) : '';
  });
  const [configError, setConfigError] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDomain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveCustomConfig = () => {
    setConfigError(null);
    if (!customConfigText.trim()) {
      setCustomFirebaseConfig(null);
      window.location.reload();
      return;
    }
    try {
      const parsed = JSON.parse(customConfigText);
      if (!parsed.apiKey || (!parsed.projectId && !parsed.authDomain)) {
        setConfigError('Config JSON must contain at least apiKey and projectId/authDomain.');
        return;
      }
      setCustomFirebaseConfig(parsed);
      window.location.reload();
    } catch {
      setConfigError('Invalid JSON format. Please paste valid Firebase web config JSON.');
    }
  };

  const firebaseAuthConsoleUrl = `https://console.firebase.google.com/project/${projectId}/authentication/settings`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-amber-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Firebase Auth: Unauthorized Domain
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Google blocks authentication popups from domains that are not yet on your Firebase Authorized list.
            </p>
          </div>
        </div>

        <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 space-y-3 mb-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-900/80 block mb-1.5">
              Domain that needs authorization:
            </span>
            <div className="flex items-center justify-between gap-2 bg-white border border-amber-300 rounded-lg px-3 py-2 text-xs font-mono text-amber-950 font-bold shadow-xs">
              <span className="truncate select-all">{currentDomain}</span>
              <button
                onClick={handleCopy}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-[11px] font-sans font-medium transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-700 space-y-2 pt-2 border-t border-amber-200/70">
            <p className="font-semibold text-slate-900">Quick 1-Minute Fix in Firebase Console:</p>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-xs">
              <li>
                Open the <strong className="text-slate-900">Firebase Console</strong> for your project (<code className="text-indigo-600 font-semibold text-[11px] bg-indigo-50 px-1 py-0.5 rounded">{projectId}</code>).
              </li>
              <li>
                Go to <strong className="text-slate-900">Authentication</strong> &rarr; <strong className="text-slate-900">Settings</strong> tab &rarr; <strong className="text-slate-900">Authorized domains</strong>.
              </li>
              <li>
                Click <strong className="text-indigo-600">Add domain</strong> and paste <code className="text-amber-900 font-mono text-[11px] bg-amber-100/70 px-1 py-0.5 rounded">{currentDomain}</code>.
              </li>
              <li>
                Click <strong className="text-slate-900">Save</strong> and refresh this tab.
              </li>
            </ol>
          </div>
        </div>

        {/* Custom Firebase Config Toggle */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowCustomConfig(!showCustomConfig)}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{showCustomConfig ? 'Hide custom Firebase config' : 'Using your own Firebase project? Click here'}</span>
          </button>

          {showCustomConfig && (
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <p className="text-slate-600">
                If you host on your own domain and created your own Firebase project, paste your Web App config JSON below:
              </p>
              <textarea
                value={customConfigText}
                onChange={e => setCustomConfigText(e.target.value)}
                placeholder='{ "apiKey": "AIza...", "authDomain": "...", "projectId": "..." }'
                className="w-full h-24 p-2 bg-white border border-slate-300 rounded-lg font-mono text-[11px] text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              {configError && (
                <p className="text-rose-600 font-medium text-[11px]">{configError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveCustomConfig}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs cursor-pointer"
                >
                  Save &amp; Reload
                </button>
                {getCustomFirebaseConfig() && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomFirebaseConfig(null);
                      window.location.reload();
                    }}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg text-xs cursor-pointer"
                  >
                    Reset to Default
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition cursor-pointer"
          >
            Dismiss
          </button>

          <a
            href={firebaseAuthConsoleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-sm cursor-pointer"
          >
            <span>Open Firebase Settings</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

