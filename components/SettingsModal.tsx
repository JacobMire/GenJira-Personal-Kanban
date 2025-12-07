import React from 'react';
import { X } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    isCondensed: boolean;
    onToggleCondensed: (value: boolean) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    isCondensed,
    onToggleCondensed,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
                    <h2 className="text-lg font-semibold text-white">Board Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    {/* Condensed View Toggle */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-slate-200">Condensed View</h3>
                            <p className="text-xs text-slate-400 mt-1">
                                Show only task titles with priority colors.
                            </p>
                        </div>

                        <button
                            onClick={() => onToggleCondensed(!isCondensed)}
                            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900
                ${isCondensed ? 'bg-primary' : 'bg-slate-700'}
              `}
                        >
                            <span
                                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${isCondensed ? 'translate-x-6' : 'translate-x-1'}
                `}
                            />
                        </button>
                    </div>

                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-950/50 border-t border-white/5 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors"
                    >
                        Done
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SettingsModal;
