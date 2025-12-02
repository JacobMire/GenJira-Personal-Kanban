import React, { useState, useEffect } from 'react';
import { Task, Priority } from '../types';
import { X, Sparkles, Save, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { enhanceTaskWithAI } from '../services/geminiService';

interface ModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
  columnTitle?: string;
}

const Modal: React.FC<ModalProps> = ({ task, isOpen, onClose, onSave, onDelete, columnTitle }) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isOpen) return;
        
        if (e.key === 'Escape') {
            onClose();
        }
        
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            if (editedTask) onSave(editedTask);
        }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, editedTask, onClose, onSave]);

  if (!isOpen || !editedTask) return null;

  const handleEnhance = async () => {
    setIsEnhancing(true);
    try {
      const enhanced = await enhanceTaskWithAI(editedTask.title, editedTask.description);
      setEditedTask({
        ...editedTask,
        title: enhanced.improvedTitle,
        description: enhanced.improvedDescription,
        acceptanceCriteria: enhanced.acceptanceCriteria,
        tags: [...new Set([...editedTask.tags, ...enhanced.suggestedTags])],
        storyPoints: enhanced.estimatedStoryPoints
      });
    } catch (e) {
      alert("Failed to enhance task via AI. Check your API Key.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleChange = (field: keyof Task, value: any) => {
    setEditedTask(prev => prev ? { ...prev, [field]: value } : null);
  };

  const toggleAcceptance = (index: number) => {
      // In a real app we'd track completion state of criteria. 
      // For now, this is visual only or could remove it.
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-2xl rounded-xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-900/50">
           <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-500 uppercase">{editedTask.id}</span>
              <span className="text-slate-600">/</span>
              <span className="text-xs text-slate-400">{columnTitle || 'Board'}</span>
           </div>
           <div className="flex items-center gap-2">
              <button 
                onClick={() => onDelete(editedTask.id)}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                <X size={18} />
              </button>
           </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          {/* Title */}
          <input 
            type="text" 
            autoFocus
            value={editedTask.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full bg-transparent text-2xl font-bold text-slate-100 placeholder-slate-600 border-none focus:ring-0 p-0 mb-6"
            placeholder="Issue Summary"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Main Column */}
            <div className="md:col-span-2 space-y-6">
              
              <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</label>
                    <button 
                        onClick={handleEnhance}
                        disabled={isEnhancing}
                        className="flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors disabled:opacity-50"
                    >
                        <Sparkles size={12} />
                        {isEnhancing ? 'Gemini Thinking...' : 'Enhance with Gemini'}
                    </button>
                </div>
                <textarea 
                    value={editedTask.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="w-full h-40 bg-slate-900/50 rounded-lg border border-slate-700 p-3 text-slate-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary resize-y"
                    placeholder="Add a detailed description..."
                />
              </div>

              {editedTask.acceptanceCriteria && editedTask.acceptanceCriteria.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">Acceptance Criteria</label>
                    <div className="space-y-2">
                        {editedTask.acceptanceCriteria.map((criteria, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-2 rounded hover:bg-slate-800/50">
                                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                                <span className="text-sm text-slate-300">{criteria}</span>
                            </div>
                        ))}
                    </div>
                  </div>
              )}

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                
                {/* Status/Priority Group */}
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Priority</label>
                        <select 
                            value={editedTask.priority}
                            onChange={(e) => handleChange('priority', e.target.value)}
                            className="w-full bg-slate-800 text-slate-200 text-sm rounded border border-slate-700 p-2 focus:border-primary focus:ring-primary"
                        >
                            {Object.values(Priority).map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Story Points</label>
                        <input 
                            type="number"
                            value={editedTask.storyPoints || ''}
                            onChange={(e) => handleChange('storyPoints', parseInt(e.target.value) || 0)}
                            className="w-full bg-slate-800 text-slate-200 text-sm rounded border border-slate-700 p-2 focus:border-primary focus:ring-primary"
                            placeholder="Estimation"
                        />
                    </div>

                     <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Tags</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {editedTask.tags.map(tag => (
                                <span key={tag} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded flex items-center gap-1 group">
                                    {tag}
                                    <button onClick={() => handleChange('tags', editedTask.tags.filter(t => t !== tag))} className="hidden group-hover:block hover:text-red-400"><X size={10}/></button>
                                </span>
                            ))}
                        </div>
                        <input 
                            type="text" 
                            className="w-full bg-slate-800 text-slate-200 text-xs rounded border border-slate-700 p-2 focus:border-primary focus:ring-primary placeholder-slate-500"
                            placeholder="Add tag (Press Enter)"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const val = e.currentTarget.value.trim();
                                    if (val && !editedTask.tags.includes(val)) {
                                        handleChange('tags', [...editedTask.tags, val]);
                                        e.currentTarget.value = '';
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-slate-900/50 flex justify-end gap-3">
             <button 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                title="Esc"
             >
                 Cancel
             </button>
             <button 
                onClick={() => onSave(editedTask)}
                className="px-4 py-2 bg-primary hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                title="Ctrl+Enter"
             >
                 <Save size={16} />
                 Save Changes
             </button>
        </div>

      </div>
    </div>
  );
};

export default Modal;