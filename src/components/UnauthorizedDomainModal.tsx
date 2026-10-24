import React from 'react';
import { ShieldAlert, ExternalLink, Copy, Check, X } from 'lucide-react';

interface UnauthorizedDomainModalProps {
  onClose: () => void;
  currentDomain?: string;
  projectId?: string;
}

export const UnauthorizedDomainModal: React.FC<UnauthorizedDomainModalProps> = ({
  onClose,
  currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'satyamkumarmishra2711-bot.github.io',
  projectId = 'gen-lang-client-0056967119'
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDomain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const firebaseAuthConsoleUrl = `https://console.firebase.google.com/project/${projectId}/authentication/settings`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Firebase Auth: Unauthorized Domain
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Firebase blocks Google Sign-In popups from domains that aren't on the Authorized Domains list.
            </p>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3 mb-5">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Domain that needs authorization:
            </span>
            <div className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-mono text-amber-300">
              <span className="truncate select-all">{currentDomain}</span>
              <button
                onClick={handleCopy}
                className="shrink-0 flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-sans transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
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

          <div className="text-xs text-slate-300 space-y-2 pt-1 border-t border-slate-800/80">
            <p className="font-medium text-slate-200">How to fix in 1 minute:</p>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-xs">
              <li>
                Open the <strong className="text-slate-200">Firebase Console</strong> for your project (<code className="text-teal-300 text-[11px]">{projectId}</code>).
              </li>
              <li>
                Go to <strong className="text-slate-200">Authentication</strong> &rarr; <strong className="text-slate-200">Settings</strong> tab &rarr; <strong className="text-slate-200">Authorized domains</strong>.
              </li>
              <li>
                Click <strong className="text-teal-400">Add domain</strong> and paste <code className="text-amber-300 font-mono text-[11px] bg-slate-900 px-1 py-0.5 rounded">{currentDomain}</code>.
              </li>
              <li>
                Click <strong className="text-slate-200">Save</strong> and refresh your GitHub Pages tab.
              </li>
            </ol>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition cursor-pointer"
          >
            Dismiss
          </button>

          <a
            href={firebaseAuthConsoleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-teal-500 hover:from-amber-400 hover:to-teal-400 text-slate-950 font-semibold rounded-xl text-xs transition shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <span>Open Firebase Settings</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
