import React, { useState, useEffect, useRef } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Column as ColumnType, Task } from '../types';
import TaskCard from './TaskCard';
import { MoreHorizontal, Plus, Trash2, Pencil, Check, X, Sparkles, CheckSquare, ChevronsRight, ChevronsLeft, Layout } from 'lucide-react';

interface ColumnProps {
    column: ColumnType;
    tasks: Task[];
    onTaskClick: (task: Task) => void;
    onAddTask: (columnId: string) => void;
    onBulkImport: (columnId: string) => void;
    isLayoutMode: boolean;
    onResize: (columnId: string, width: number) => void;
    onRename: (columnId: string, title: string) => void;
    onDelete: (columnId: string) => void;
    onDeleteMultiple: (taskIds: string[]) => void;
    isCondensed?: boolean;
}

const Column: React.FC<ColumnProps> = ({
    column,
    tasks,
    onTaskClick,
    onAddTask,
    onBulkImport,
    isLayoutMode,
    onResize,
    onRename,
    onDelete,
    onDeleteMultiple,
    isCondensed = false
}) => {
    const [width, setWidth] = useState(column.width || 320);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [titleInput, setTitleInput] = useState(column.title);

    // Selection Mode State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

    const menuRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync with prop if it changes externally
    useEffect(() => {
        if (column.width) {
            setWidth(column.width);
        }
    }, [column.width]);

    useEffect(() => {
        setTitleInput(column.title);
    }, [column.title]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isRenaming && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isRenaming]);

    // Reset selection when closing mode
    useEffect(() => {
        if (!isSelectionMode) {
            setSelectedTaskIds(new Set());
        }
    }, [isSelectionMode]);

    const handleRenameSubmit = () => {
        if (titleInput.trim()) {
            onRename(column.id, titleInput);
        } else {
            setTitleInput(column.title); // Revert if empty
        }
        setIsRenaming(false);
    };

    // Ref-based resize implementation
    const resizeHandler = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startWidth = width;
        let currentWidth = startWidth;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const delta = moveEvent.clientX - startX;
            currentWidth = Math.min(Math.max(250, startWidth + delta), 800);
            setWidth(currentWidth);
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            onResize(column.id, currentWidth);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    const handleToggleSelection = (taskId: string) => {
        const newSelected = new Set(selectedTaskIds);
        if (newSelected.has(taskId)) {
            newSelected.delete(taskId);
        } else {
            newSelected.add(taskId);
        }
        setSelectedTaskIds(newSelected);
    };

    const handleExecuteDeleteMultiple = () => {
        if (selectedTaskIds.size > 0) {
            // Pass directly to parent; App.tsx handles the modal logic now
            onDeleteMultiple(Array.from(selectedTaskIds));
        }
        setIsSelectionMode(false);
    };

    // The actual width rendered in DOM
    const currentRenderWidth = isCollapsed ? 64 : width;

    return (
        <div
            className={`flex flex-col h-full mx-2 shrink-0 relative transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] ${isLayoutMode ? 'border border-dashed border-primary/30 rounded-xl bg-primary/5' : ''}`}
            style={{ width: `${currentRenderWidth}px` }}
        >
            {/* --- COLLAPSED STATE --- */}
            {isCollapsed && (
                <div className="flex flex-col items-center h-full pt-2 animate-in fade-in duration-300">
                    {/* The Pill */}
                    <div
                        onClick={() => setIsCollapsed(false)}
                        className="
                    relative flex flex-col items-center py-4 px-3 gap-4 
                    bg-slate-900 border border-white/10 rounded-full 
                    hover:border-primary/50 hover:bg-slate-800 hover:shadow-lg hover:shadow-primary/5 
                    cursor-pointer transition-all group select-none
                "
                    >
                        {/* Counter Badge */}
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:text-primary group-hover:border-primary/30 transition-colors">
                            {tasks.length > 99 ? '99+' : tasks.length}
                        </div>

                        {/* Vertical Text */}
                        <div className="[writing-mode:vertical-rl] rotate-180 flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-400 tracking-wide whitespace-nowrap group-hover:text-slate-200 transition-colors">
                                {column.title}
                            </span>
                        </div>
                    </div>

                    {/* The Faint Line */}
                    <div className="w-px flex-1 bg-gradient-to-b from-white/10 to-transparent my-4"></div>

                    {/* Expand Action */}
                    <button
                        onClick={() => setIsCollapsed(false)}
                        className="mb-4 p-2 text-slate-500 hover:text-primary transition-colors hover:bg-slate-800 rounded-full"
                        title="Expand Column"
                    >
                        <ChevronsRight size={20} />
                    </button>
                </div>
            )}

            {/* --- EXPANDED STATE --- */}
            {!isCollapsed && (
                <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3 px-1 mt-1 h-8 shrink-0">
                        {isRenaming ? (
                            <div className="flex items-center gap-1 w-full">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={titleInput}
                                    onChange={(e) => setTitleInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
                                    onBlur={handleRenameSubmit}
                                    className="flex-1 bg-slate-800 text-sm font-bold text-white px-2 py-1 rounded border border-primary outline-none"
                                />
                            </div>
                        ) : isSelectionMode ? (
                            <div className="flex items-center justify-between w-full bg-slate-800 rounded px-2 py-1">
                                <span className="text-xs text-slate-300 font-medium">{selectedTaskIds.size} Selected</span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={handleExecuteDeleteMultiple}
                                        className="p-1 text-red-400 hover:text-white hover:bg-red-500 rounded transition-colors"
                                        title="Delete Selected"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => setIsSelectionMode(false)}
                                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                                        title="Cancel"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 overflow-hidden">
                                {/* Collapse Button */}
                                <button
                                    onClick={() => setIsCollapsed(true)}
                                    className="text-slate-500 hover:text-slate-300 transition-colors"
                                    title="Collapse"
                                >
                                    <Layout size={14} className="rotate-90" />
                                </button>

                                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 truncate cursor-default select-none" title={column.title}>
                                    {column.title}
                                </h2>
                                <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full shrink-0">
                                    {tasks.length}
                                </span>
                            </div>
                        )}

                        {!isLayoutMode && !isRenaming && !isSelectionMode && (
                            <div className="flex gap-1 relative shrink-0">
                                <button
                                    onClick={() => onBulkImport(column.id)}
                                    className="p-1 text-slate-400 hover:text-accent hover:bg-slate-700 rounded transition-colors"
                                    title="Magic Import Tasks"
                                >
                                    <Sparkles size={16} />
                                </button>
                                <button
                                    onClick={() => onAddTask(column.id)}
                                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                                    title="Create Task"
                                >
                                    <Plus size={16} />
                                </button>

                                <div ref={menuRef}>
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className={`p-1 rounded transition-colors ${isMenuOpen ? 'text-white bg-slate-700' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                    >
                                        <MoreHorizontal size={16} />
                                    </button>

                                    {isMenuOpen && (
                                        <div className="absolute right-0 top-8 w-44 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsRenaming(true);
                                                    setIsMenuOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 flex items-center gap-2"
                                            >
                                                <Pencil size={14} /> Rename
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsSelectionMode(true);
                                                    setIsMenuOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 flex items-center gap-2"
                                            >
                                                <CheckSquare size={14} /> Delete Multiple
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsCollapsed(true);
                                                    setIsMenuOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 flex items-center gap-2"
                                            >
                                                <ChevronsLeft size={14} /> Collapse
                                            </button>
                                            <div className="h-px bg-slate-700 my-1 mx-2"></div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(column.id); // Passed to parent, App handles confirmation modal
                                                    setIsMenuOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/30 flex items-center gap-2"
                                            >
                                                <Trash2 size={14} /> Delete Column
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Droppable Area */}
                    <div className="flex-1 bg-slate-900/50 rounded-xl border border-white/5 p-2 flex flex-col overflow-hidden">
                        <Droppable droppableId={column.id}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`flex-1 overflow-y-auto custom-scrollbar transition-colors duration-200 px-1 py-1 ${snapshot.isDraggingOver && !isSelectionMode ? 'bg-slate-800/30' : ''
                                        }`}
                                >
                                    {tasks.map((task, index) => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            index={index}
                                            onClick={onTaskClick}
                                            isSelectionMode={isSelectionMode}
                                            isSelected={selectedTaskIds.has(task.id)}
                                            onToggleSelection={handleToggleSelection}
                                            isCondensed={isCondensed}
                                        />
                                    ))}
                                    {provided.placeholder}

                                    {!isSelectionMode && (
                                        <button
                                            onClick={() => onAddTask(column.id)}
                                            className="w-full py-2 mt-2 flex items-center justify-center gap-2 text-slate-500 hover:text-primary hover:bg-slate-800/50 rounded-lg border border-dashed border-slate-700 hover:border-primary/50 transition-all text-sm group"
                                        >
                                            <Plus size={14} className="group-hover:scale-110 transition-transform" />
                                            Create issue
                                        </button>
                                    )}
                                </div>
                            )}
                        </Droppable>
                    </div>
                </div>
            )}

            {/* Resize Handle */}
            {isLayoutMode && !isCollapsed && (
                <div
                    onMouseDown={resizeHandler}
                    className="absolute -right-3 top-0 bottom-0 w-4 cursor-col-resize z-20 flex items-center justify-center group hover:bg-primary/10 rounded"
                    title="Drag to resize"
                >
                    <div className="w-1 h-8 bg-slate-600 rounded-full group-hover:bg-primary transition-colors" />
                </div>
            )}
        </div>
    );
};

export default Column;