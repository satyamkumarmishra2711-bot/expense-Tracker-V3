import React, { useState, useRef, useEffect } from 'react';
import { Mail, RefreshCw, ChevronDown, Check } from 'lucide-react';
import { TimeRangeOption } from '../services/gmailSync';

export interface EmailSyncButtonProps {
  onSync: (duration: '30_days' | '45_days' | '60_days') => Promise<void>;
  isSyncing: boolean;
  className?: string;
  variant?: 'navbar' | 'mobile' | 'compact';
}

const DURATION_OPTIONS: Array<{ id: '30_days' | '45_days' | '60_days'; label: string; description: string }> = [
  { id: '30_days', label: 'Last 30 Days', description: 'Scan emails from the past 30 days' },
  { id: '45_days', label: 'Last 45 Days', description: 'Scan emails from the past 45 days' },
  { id: '60_days', label: 'Last 60 Days', description: 'Scan emails from the past 60 days' }
];

export const EmailSyncButton: React.FC<EmailSyncButtonProps> = ({
  onSync,
  isSyncing,
  className = '',
  variant = 'navbar'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<'30_days' | '45_days' | '60_days'>('30_days');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleStartSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    await onSync(selectedDuration);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Primary Trigger Button */}
      {variant === 'mobile' ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isSyncing}
          className="w-full flex items-center justify-between gap-2 py-2.5 px-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-xs transition disabled:opacity-50 cursor-pointer"
          title="Sync bank transaction alert emails from Gmail"
        >
          <div className="flex items-center gap-2">
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Mail className="w-3.5 h-3.5" />
            )}
            <span>{isSyncing ? 'Syncing...' : 'Sync Email'}</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50 shrink-0 border border-teal-700/20"
          title="Sync transaction emails from Gmail"
        >
          {isSyncing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
          ) : (
            <Mail className="w-3.5 h-3.5 text-white" />
          )}
          <span>{isSyncing ? 'Syncing...' : 'Sync Email'}</span>
          <ChevronDown className={`w-3 h-3 text-teal-100 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150"
          role="menu"
        >
          <div className="px-2.5 py-1.5 pb-2 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-900">Sync Duration</h4>
            <p className="text-[11px] text-slate-500">Choose period to scan Gmail bank alerts</p>
          </div>

          {/* Options */}
          <div className="py-1.5 space-y-1">
            {DURATION_OPTIONS.map((opt) => {
              const isSelected = selectedDuration === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedDuration(opt.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50 text-teal-900 font-semibold border border-teal-200'
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">{opt.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">{opt.description}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Sync CTA Button */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleStartSync}
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                Sync ({DURATION_OPTIONS.find((d) => d.id === selectedDuration)?.label || 'Selected'})
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
