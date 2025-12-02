import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Zap, FileText } from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (text: string, useAi: boolean) => Promise<void>;
  columnTitle: string;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onImport, columnTitle }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [useAi, setUseAi] = useState(true);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isOpen) return;
        
        if (e.key === 'Escape') {
            onClose();
        }
        
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, text, useAi]); // Dependencies required for handleSubmit closure if defined outside, but handleSubmit uses state so we can depend on it if we wrap it, or just state

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await onImport(text, useAi);
      setText('');
      onClose();
    } catch (error) {
      alert("Failed to generate tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-lg rounded-xl shadow-2xl border border-white/10 overflow-hidden flex flex-col">
        
        <div className="p-4 border-b border-white/5 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-100">
            {useAi ? <Sparkles size={18} className="text-primary" /> : <FileText size={18} className="text-slate-400" />}
            <h3 className="font-semibold">Import to "{columnTitle}"</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
               <p className="text-sm text-slate-400">
                  Paste your list below. {useAi ? 'AI will analyze and structure it.' : 'Each line will become a new task.'}
               </p>
               
               {/* AI Toggle */}
               <button 
                  onClick={() => setUseAi(!useAi)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900 ${useAi ? 'bg-primary' : 'bg-slate-700'}`}
               >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useAi ? 'translate-x-6' : 'translate-x-1'}`} />
               </button>
            </div>

            <div className={`relative rounded-lg border transition-colors ${useAi ? 'border-primary/30' : 'border-slate-700'}`}>
                {useAi && (
                    <div className="absolute right-3 top-3 pointer-events-none">
                        <Sparkles size={14} className="text-primary opacity-50" />
                    </div>
                )}
                <textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-64 bg-slate-900/50 rounded-lg p-4 text-slate-300 text-sm focus:outline-none resize-none custom-scrollbar placeholder-slate-600 bg-transparent"
                    placeholder={useAi 
                        ? "- Fix the login bug on safari\n- Update the landing page hero image\n- Research new DB architecture..." 
                        : "Task 1\nTask 2\nTask 3..."}
                    autoFocus
                />
            </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-slate-900/50 flex justify-end gap-3">
             <button 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                title="Esc"
             >
                 Cancel
             </button>
             <button 
                onClick={handleSubmit}
                disabled={loading || !text.trim()}
                className={`px-4 py-2 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-all shadow-lg ${
                    useAi 
                    ? 'bg-primary hover:bg-blue-600 shadow-blue-500/20' 
                    : 'bg-slate-700 hover:bg-slate-600 shadow-slate-900/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Ctrl+Enter"
             >
                 {loading ? <Loader2 className="animate-spin" size={16} /> : (useAi ? <Zap size={16} /> : <FileText size={16} />)}
                 {loading ? 'Processing...' : (useAi ? 'Generate with AI' : 'Import Items')}
             </button>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;